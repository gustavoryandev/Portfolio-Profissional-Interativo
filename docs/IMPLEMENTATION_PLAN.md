# Plano de implementação posterior

O plano reúne as propostas da auditoria e as entregas futuras. A Fase 03 implementou La Casa de Papel Dark em worktree separada da Fase 02.2. A Fase 04 implementou O Plano após a aprovação de O Assalto e aguarda revisão visual. [Estado da implementação](SESSION_HANDOFF.md)

## 1. Recuperar a baseline executável

- Revisar o diff local de `api/chat.js` com atenção à linha 33. O objeto solto `GENERATION_CONFIG` não é consumido. A chamada efetiva usa `generationConfig(model, 4096, fastReply)`. Retirar a atribuição inválida preserva o comportamento observado. Manter separado o trabalho local de resolução do perfil.
- No harness esbuild de integração e rotas, representar URLs de `public/` como faz o Vite. Reexecutar a fixture da Astra e completar somente a simulação de APIs de navegador que ela exercita. Validar também em Chrome.
- Para aceitar a mudança, importar a API em processo novo, obter 405 no método incorreto, completar os casos de endpoint sem predefinir variáveis globais e executar os testes de rota e integração. O build e o typecheck do portal completam a verificação. [Falhas de partida](KNOWN_ISSUES.md)

## 2. Corrigir a atribuição de personalidade por turno

A correção mais localizada é continuar o turno com o autor capturado no envio. Isso atende à troca de superfície inclusive quando o próprio visitante pede que a Astra abra a versão completa. Abortar automaticamente toda navegação interromperia esse comando legítimo.

| Momento | Contrato proposto |
| --- | --- |
| Início | Capturar `turnId`, idioma, superfície, tema, dimensão e ID de persona resolvido. Usar valor explícito para Astra padrão. O servidor continua resolvendo a identidade de uma combinação permitida. |
| Primeiro fragmento e mensagem final | Renderizar nome, avatar e rótulo a partir da identidade do turno. A saudação e o compositor podem acompanhar o cenário atual. Mensagens anteriores conservam autoria, inclusive nas traduções. |
| Retentativa ou cancelamento | Aceitar `delta/reset/actions/done` somente da tentativa e turno ativos. O botão Parar encerra a tentativa. Uma resposta interrompida não entra no histórico factual. Evitar que o `finally` de uma operação antiga limpe a próxima. |
| Ações pendentes | Uma troca pedida naquele turno continua válida uma vez. Antes de aplicar ação dependente da cena, conferir alvo e estado atual. Manter confirmação de edição/execução do Laboratório, seleção de linguagem/exemplo e revisão da mesma versão. |
| Segundo pedido do Laboratório | Reutilizar identidade e ID do turno que solicitou o snapshot. Preservar guarda de versão e comportamento ao abrir a completa. A saída do editor é dado do usuário. |
| Próximo turno | Resolver a nova persona. Separar fatos e pedidos úteis de indicações de estilo do turno anterior. Usar âncora de conversa estável se o ensaio de histórico longo demonstrar que a saudação traduzida ou substituída causa regressão. |

Antes de alterar o prompt, repetir a pergunta técnica após três mudanças e em PT/EN. Se houver confusão **no conteúdo** com autoria correta na UI, registrar pergunta, identidade esperada, histórico/resumo e resultado. Ajustar apenas a apresentação narrativa que falhou. O contrato de ferramentas, os marcadores, o orçamento, os modelos e a política de fallback já têm cobertura.

**Aceite de regressão.** Repetir as três travessias da auditoria antes do primeiro fragmento, após um fragmento e entre as duas chamadas do Laboratório. Incluir JSON direto, NDJSON com reset, fechamento/reabertura, cancelamento e mudança comandada pela própria Astra. Conferir autor histórico, autor do turno seguinte, ausência de ação duplicada e continuidade de um fato previamente dito. A resposta curta sobre `dobro(3)` e a explicação de uma correção servem de controle.

## 3. Ativar o contato existente

Consolidar em `.env.local` a site key, o segredo v3 e a chave privada do EmailJS, preservando as primeiras definições preenchidas. A versão lida na auditoria tem as três redefinições vazias nas linhas 29, 30 e 37. A chave com prefixo `VITE_` pertence ao cliente. O segredo e a chave privada ficam no servidor. Conferir o hostname registrado para o ambiente utilizado. Reiniciar o processo Vite/Node ou gerar o próximo build do cliente quando a configuração mudar.

Com transporte de e-mail simulado, conferir a chave presente no cliente e um token novo por envio. Esperar 403 para ação, score, validade ou host incompatíveis, 200 para avaliação válida e retomada somente da confirmação após falha parcial. Verificar `refreshContext` de Canvas separadamente. Um envio real para comprovar entrega é uma operação externa posterior. [Contrato implementado](../api/contact.js) · [Testes de contato](../tests/contact-api.test.mjs)

## 4. Universalizar os dossiês

1. Reaproveitar `perfil.json` para identidade, títulos, descrições, tecnologias e links e `projectDossiers.js` para conteúdo editorial. Disponibilizar função pura que receba ID e idioma, junte as duas fontes e aplique a mesma precedência de tradução do card. Módulo de dados deve ser importável por Node e pelo Vite, sem React, leitura do DOM ou import de CSS.
2. Reservar `problem`, `decision`, `contribution`, `contributionSource`, `status`, `result` e `blueprint` para campos realmente preenchidos. Manter a distinção entre equipe, contribuição individual e resultado mensurado. Identificar exemplos de laboratório como adaptações e ligar a afirmação relevante a README, arquivo ou commit quando disponível.
3. Tornar o corpo de `ProjectDossier` neutro quanto ao tema. Reusar um único `<details>` com título, ícones e tokens adequados. Manter o visual de arquivo/relatório para Rick e um título neutro para os demais. Preservar sinopse, teclado, foco, modal de imagem, filtros, deep links, diagrama opcional e estados dos cards compactos.
4. Construir no servidor um índice pequeno de IDs, títulos, aliases e tecnologias. Para um projeto identificado, anexar os campos factuais daquela ficha no idioma do turno. Para comparações, selecionar as fichas citadas. Se o nome for ambíguo, pedir identificação. Os diagramas visuais não precisam integrar o prompt. READMEs ao vivo podem complementar com fonte e data. O botão “Perguntar” pode preencher o ID como dica validada, mas perguntas digitadas devem funcionar por si.
5. Testar bijeção dos 15 IDs nas duas fontes, comparação entre renderização e contexto, fallback de tradução, estado sem imagem e ausência de contribuição sem evidência. Iniciar conversa sem abrir/resolver card algum. Perguntar em ambas as superfícies sobre o escopo da migração ROTA, a contribuição de SnakePy, as telas de GEOSOLAR e o estado de ClimaAPI. Comparar com as fontes do relatório. Em seguida abrir a ficha e repetir. Os fatos devem coincidir. [Evidências](PROJECT_AUDIT.md)

## 5. Tratar só o custo medido da primeira entrada

O primeiro experimento consiste em agrupar as primeiras leituras geométricas do cabeçalho e da galeria, evitando alternar escrita de estilo e leitura no mesmo ciclo. Comparar com a montagem atual usando o mesmo build, tamanho de viewport e tema. Como alternativa isolada, preparar apenas a parte necessária do portfólio antes da saída da abertura. Medir o custo deslocado para o início para evitar trocar uma pausa por outra.

Repetir ao menos cinco pares frio/quente com a abertura normal, depois com acesso direto por âncora e em um aparelho físico. Registrar momento da primeira pintura do conteúdo, maior frame na saída e no primeiro reveal de rolagem, tarefas longas e tempo de layout forçado. Comparar a mediana e os piores casos. Só manter a intervenção que reduza o custo naquela janela e conserve rolagem da galeria, foco, botão de pular e movimento reduzido. A amostra atual não sustenta alterar todas as animações ou trocar bibliotecas.

## 6. Expandir a apresentação sem multiplicar a lógica da Astra

A Fase 02.1 tem cinco personas temáticas ativas em Rick and Morty. O Assalto e O Plano usam os mesmos IDs para Berlim e Professor.

| Cenário | Compacta | Completa | Direção de escrita |
| --- | --- | --- | --- |
| Garagem | Sr. Meeseeks | **Pessoa-Pássaro** no lugar de Squanchy | Frases sóbrias e literais, com humor discreto. Remover os jogos de palavras de Squanchy do turno novo. |
| Cidadela | Sr. Meeseeks | Sr. Bunda Cagada | Conservar a direção atual e as saudações PT/EN. |
| Além da Curva Finita Central | **Rick Maligno** | **Morty Maligno** | Rick breve e incisivo. Morty analítico e contido. Responder primeiro à pergunta técnica e separar ficção de fatos do portfólio. |
| La Casa de Papel Dark | **Berlim** | **Professor** | Berlim conciso, teatral e cortês. Professor metódico, com explicações por etapas quando ajudarem. |
| La Casa de Papel Light | Berlim | Professor | Compartilha as mesmas definições com superfícies claras e realces vermelhos. |

**Contrato de extensão.** O resolvedor compartilhado valida tema, dimensão e superfície. La Casa usa `heistPersonas.<id>` e caminhos explícitos para avatares estáticos. Rick conserva combinações dimensionais e o namespace `rick.<id>`. O Plano está no registro de temas e usa as mesmas personas.

**Terceira dimensão.** `beyond-curve` está implementada dentro de `rick-morty`, com restauração, viagens de ida e volta, travessias em Canvas e chegada à mansão. O modo de movimento reduzido permite troca direta. [Especificação da dimensão](DIMENSION_SPEC.md)

A demonstração local da mansão já usa **For the Damaged Coda**, de Blonde Redhead. A publicação da faixa depende da comprovação da autorização ou de uma alternativa autorizada. [Estado da mídia](DIMENSION_SPEC.md#midia-e-distribuicao) · [Gravadora](https://touchandgorecords.com/products/blonde-redhead-melody-of-certain-damaged-lemons)

**La Casa Dark.** O Assalto ocupa `la-casa-de-papel-dark`. Os três aliases migram em um salto no bootstrap e nas ações da Astra. O fundo indicado `dark-background.webp` está ligado à hero por enquadramento CSS. [Especificação da Fase 03](MONEY_HEIST_SPEC.md)

**La Casa Light.** O Plano ocupa `la-casa-de-papel-light`. O alias `quartzo-framboesa` migra diretamente, com classificação clara desde a primeira pintura. A hero usa a Casa da Moeda diurna e o retrato compartilhado. [Especificação da Fase 04](MONEY_HEIST_SPEC.md#fase-04--o-plano)

## 7. Fotografia interativa e licença da referência

O endereço publicado indicado devolveu HTTP 404 em requisição direta nesta sessão. A análise da interação baseou-se no repositório de Lucas Dias Melo, revisão `f0970bcfa9daf014806762fcff1d06a2c03ac328`. A foto base e a versão cyber são recortes diferentes. O repositório de referência contém também `public/media/fundo.mp4` e `public/media/fundo-poster.jpg`. São o fundo daquele site, sem identificação como o arquivo aprovado para La Casa. O ponteiro inclina a moldura por variáveis CSS. Um canvas 2D constrói uma máscara com pincel radial suave e inércia. A composição apaga o rastro aos poucos e revela a segunda fotografia apenas na área pintada. Toque amplia a região de revelação. O loop cessa quando o rastro termina, limita DPR a 2 e respeita movimento reduzido. [Site indicado](https://lucas-portfolio-eta.vercel.app) · [Componente na revisão consultada](https://github.com/lucasdiasmz/lucas-portfolio/blob/f0970bcfa9daf014806762fcff1d06a2c03ac328/src/components/HeroPortrait.jsx) · [CSS](https://github.com/lucasdiasmz/lucas-portfolio/blob/f0970bcfa9daf014806762fcff1d06a2c03ac328/src/components/HeroPortrait.css)

O README **declara licença MIT**. A árvore consultada não contém arquivo LICENSE independente, o campo de licença da API estava vazio e o endpoint de licença respondeu 404. Uma eventual cópia substancial deve conservar os avisos de copyright e permissão aplicáveis. A declaração do README não esclarece direitos de imagem sobre as fotografias ou de terceiros sobre cada mídia. A Fase 03 estendeu o PhotoReveal já preparado com composição própria e retrato profissional. A versão mascarada definitiva está integrada e é compartilhada pelas duas variantes. Toque, teclado e movimento reduzido têm caminhos de interação. [Recortes e condições para a fotografia final](HEIST_PORTRAIT_HANDOFF.md) [README do autor](https://github.com/lucasdiasmz/lucas-portfolio/blob/f0970bcfa9daf014806762fcff1d06a2c03ac328/README.md) · [Árvore](https://github.com/lucasdiasmz/lucas-portfolio/tree/f0970bcfa9daf014806762fcff1d06a2c03ac328) · [Texto MIT](https://opensource.org/license/mit)

## Critérios para encerrar a implementação futura

- Testes da API, UI e primeira pintura verdes na árvore efetiva. Turnos conservam identidade em PT/EN nas duas superfícies e nas três transições reproduzidas.
- O catálogo entrega os mesmos fatos nos temas regulares e especiais. Os links dos 15 projetos, cards, revisão do Laboratório e Canvas continuam funcionais.
- Cada nova dimensão/tema restaura a seleção, aceita teclado e movimento reduzido e conclui as trocas com falha de mídia. Registrar origem e direitos das novas artes e trilhas. O fundo usado em La Casa Dark corresponde ao original aprovado.
- Repetir a medição do primeiro acesso antes e depois. Validar e registrar as duas entregas de La Casa de Papel, Dark e Light, no handoff.
