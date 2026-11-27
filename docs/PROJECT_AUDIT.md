# Auditoria do portfólio profissional interativo

**26 de novembro de 2026 · Windows · árvore de trabalho local em `main`.** A Astra acertou a amostra de programação e uma pergunta sobre ROTA. O problema de autoria foi reproduzido no navegador. Há também uma falha independente que impede um processo novo de carregar a API local. A prioridade é recuperar a entrada do chat e preservar a identidade de cada turno. A amostra não justifica refatorar a inteligência.

| Pergunta | Resultado desta sessão |
| --- | --- |
| O checkout funciona como está? | O build do cliente e a verificação TypeScript do portal passam. A importação de `api/chat.js` lança `ReferenceError`. |
| O que explica a troca de voz? | Uma resposta pendente conserva a aparência do envio. A bolha e o avatar usam a aparência corrente, inclusive para mensagens concluídas. Três transições reproduzidas. |
| O contato precisa de nova implementação? | O fluxo v3 já existe. Três atribuições vazias no final do ambiente local prevalecem sobre valores anteriores. |
| A Astra conhece os dossiês? | Conhece o catálogo sem abrir cards. Os campos editoriais dos 15 dossiês só são importados pela apresentação. |
| Onde aparece a perda de fluidez? | Na montagem do portfólio ao sair da abertura. A medição identificou trabalho síncrono de layout no cabeçalho e na galeria, também com cache quente. |

## Baseline e alterações anteriores à auditoria

Diretório `C:\Users\Diego\Desktop\Portfolio-Profissional-Interativo`. HEAD `ee6d6a52538495bea709cb039bc4cc65d64a5186`, com 245 commits alcançáveis. A referência local `origin/main` apontava para o mesmo commit. O remoto cadastrado é `gustavoryan-del/Portfolio-Profissional-Interativo`. A comparação usou as referências locais. O GitHub só foi consultado para a referência visual e projetos externos específicos.

| Commit local | Data local | Mudança relevante |
| --- | --- | --- |
| `ee6d6a5` | 24/11/2026 | Padroniza o seletor da TV interdimensional |
| `74706d7` | 24/11/2026 | Corrige o recorte móvel da foto no portal |
| `0b71bfa` | 24/11/2026 | Corrige nome na apresentação |
| `dae0dce` | 24/11/2026 | Consolida integrações e remove imagens substituídas por WebP |
| `1547495`, `3fd071b` | 24/11/2026 | Terminal de contato e diário de experiência/formação |
| `eace390`, `415af98` | 24/11/2026 | Reprises, retorno de foco, descobertas e créditos |

No início, nada em staging. Três arquivos rastreados modificados, total de 62 inserções e 21 remoções. `api/chat.js` tinha 25 linhas acrescentadas, entre elas a atribuição solta de configuração e um resolvedor de perfil. `src/components/rick/MeeseeksRig.jsx` já definia o atributo inicial `d` da boca e do recorte, além da animação. `docs/rick-morty-assets.md` já continha revisão de proveniência. Os arquivos `docs/portal-dimensional.md`, `docs/rick-morty-experience.md` e `scripts/__pycache__/fetch-rick-assets.cpython-314.pyc` já estavam sem rastreamento. Esses itens fazem parte da baseline.

## Arquitetura e dependências

| Local | Responsabilidade e fronteira |
| --- | --- |
| `index.html`, `src/main.jsx`, `src/App.jsx` | SPA React, configuração visual antes da pintura, providers e navegação com History API. `/`, `/chat`, âncoras de seção e links `?project=<id>#projetos`. A conversa e o Laboratório vivem no app. |
| `src/pages`, `components`, `context`, `hooks` | Portfólio por rolagem, chat carregado sob demanda, cards, diálogos, música e dimensões. CSS, SVG, animações declarativas e Web Animations API coexistem. |
| `src/services`, `src/arcade` | Transporte, interpretação de ações, revisão e execução do Laboratório, caches do cliente, xadrez e cinco jogos do Arcade. |
| `src/data`, `src/i18n` | Perfil, projetos, fichas bilíngues, exemplos do editor e traduções PT/EN. Os dados do catálogo são versionados. |
| `api`, `server` | Funções da Vercel e serviços Node para modelo, fontes ao vivo, ferramentas, persona e NDJSON. Em desenvolvimento o middleware Vite encaminha `/api/chat` e `/api/contact` aos handlers reais e limita o corpo a 1 MiB. `api/spotify-card.js` gera SVG para o README, fora desse middleware. |
| `portal.html`, `src/examples/portal` | Segunda entrada do Vite, demonstração interativa do portal TSX. `vercel.json` reescreve `/chat` para a SPA e dá 60 s à função de chat. |
| `public`, `data/chess-openings`, `email-templates` | Mídia, currículos, ícones, workers JS, Stockfish/WASM, fontes TSV de aberturas e modelos de e-mail. |
| `supabase/migrations`, `scripts`, `tests`, `docs` | Migração preparatória do Arcade, scripts de OAuth/mídia/xadrez, testes Node e fixtures JSX, documentação histórica. O Arcade registra partidas localmente. Não há sincronização Supabase ativa. |
| `dist`, `.cache`, `.vite`, `.vercel`, `node_modules` | Saídas, amostras antigas, metadados e dependências. O build desta auditoria usou diretório temporário próprio. |

Node 24.16.0. `package-lock.json` e `npm ls --depth=0` confirmaram React/DOM 19.3.1, Vite 6.4.5, plugin React 4.7.0, TypeScript 5.9.3, Tailwind 3.4.19, PostCSS 8.5.31 e Autoprefixer 10.6.1. Componentes usam Framer Motion e Motion 12.43.0, Lucide React 0.511.0, i18next 24.2.3 e react-i18next 15.7.4. Integração usa Axios 1.20.0, dotenv 18.0.8 e Google Generative AI 0.24.1. EmailJS Browser 4.4.1 consta no manifesto, embora o envio efetivo use REST no servidor. PDF.js 6.4.299, chess.js 1.4.0, react-chessboard 5.12.1, jsdom 30.1.3 e tipos de React completam as dependências diretas. Os scripts npm iniciam Vite, compilam o projeto, servem a prévia e executam o OAuth do WakaTime. Os testes rodam com o executor nativo do Node. [Manifesto](../package.json) · [Build](../vite.config.js)

## Integrações e contratos de dados

| Fonte | Transporte e comportamento |
| --- | --- |
| Gemini | SDK no servidor. Lista permitida de três modelos Flash em `server/aiUsagePolicy.js`. Até três tentativas, 18 s por modelo, orçamento compartilhado de 30 s, troca após 8 s sem saída no stream com alternativa. Erros de cota ou cobrança encerram a fila. |
| GitHub | REST e GraphQL para perfil, repositórios, linguagens e atividade. Até seis READMEs recentes, até 2.000 caracteres cada. Trechos externos entram como dados. A consulta ao vivo não cobre todos os dossiês. |
| WakaTime | Credenciais de API/OAuth, períodos e atividade por rotas de ação próprias do chat. Renovação de token concorrente deduplicada. |
| Spotify | Refresh token no servidor para reprodução e histórico. Card SVG adicional tem cache de token/imagens próprio. |
| Canvas LMS | `CANVAS_BASE_URL` e `CANVAS_API_TOKEN` alimentam Bearer no servidor. Consulta cursos ativos, filtra período/estado e limita a dez. A UI recebe dados de curso e estado da fonte. Em leitura real pelo handler em processo isolado, a fonte retornou HTTP 200, estado `ok` e dez cursos. Nomes e dados acadêmicos individuais foram omitidos do registro. |
| ESPN e Chess.com | Agenda e resultados do Atlético Mineiro, perfil e estatísticas públicas de xadrez. Análise de partidas no cliente usa Stockfish local. |
| Laboratório | Workers separados para JavaScript, Python com Pyodide via CDN e Java com compilação remota no Wandbox. O servidor recebe o trecho do editor somente quando a ação pede sua leitura. |
| Contato | reCAPTCHA Google e EmailJS via `/api/contact`. Os dois envios têm referências compartilhadas, tokens distintos e recibo local para falha parcial. |

O endpoint do chat também atende `models`, `translate`, `refreshContext`, detalhes e atividade WakaTime. Uma falha de importação afeta essas entradas, mesmo quando o recurso dispensaria Gemini. O formulário e o gerador SVG de Spotify são handlers separados. [API local](../server/devApi.js) · [API da Astra](../api/chat.js) · [Contato](../api/contact.js)

## Astra, do envio à exibição

1. `App` conserva uma instância de `ChatPage` após a primeira abertura. A rota e o diálogo alteram `modal` e `visible`. Mensagens, resumo e última seleção de modelo ficam em memória. Fechar o diálogo compacto não desmonta a conversa. O Laboratório e o motor de ações são criados uma vez por montagem do app.
2. `handleSend` trava o envio concorrente com `sendingRef`, captura idioma, superfície e aparência e cria um `AbortController` por turno. Hoje só serializa `appearance` para Rick. Exclui mensagens degradadas e reconstrói a saudação com a persona corrente. O histórico enviado omite a identidade do personagem. Cada item contém remetente, texto e, quando aplicável, a chave de tradução.
3. O servidor normaliza mensagens, retira o último pedido duplicado e usa janela recente com limite estimado de 8.000 tokens. Ao ultrapassá-lo reduz a janela à metade e preserva ao menos quatro mensagens. Resumo local de até 2.400 caracteres, com excertos de até 240 por mensagem. O cliente guarda `summary`, `covered` e `anchor`. A âncora é um hash do **texto da primeira mensagem**. Mudar a saudação pode invalidar o resumo e fazê-lo ser reconstruído a partir do histórico disponível. Não foi medida perda de fatos causada por isso.
4. Identidade, comandos e alguns pedidos de cards seguem caminhos determinísticos. Para uma resposta livre, o servidor monta o perfil, resumo, fontes selecionadas, política de ferramentas, superfície e direção narrativa da persona. A instrução atual já manda priorizar a identidade deste turno e preservar fatos e marcadores. Nomes e prompts enviados arbitrariamente pelo cliente não selecionam a persona. A identidade padrão volta quando o mapeamento não reconhece a combinação.
5. O cliente aceita JSON e NDJSON (`meta`, `delta`, `reset`, `context`, `actions`, `done` e erro). O parser lida com UTF-8 fragmentado. O buffer alimenta a apresentação incremental. Reset descarta uma tentativa incompleta. Parar e desmontar abortam a leitura, o timeout do cliente é 36 s e desconectar a resposta aborta o servidor. Trocar de tema, dimensão ou superfície não invalida o turno. O segundo pedido do Laboratório reutiliza as opções originais.
6. Ao concluir, a mensagem guarda texto, idioma, modelo, contexto ao vivo e possível revisão, sem identidade de origem. `MessageBubble` resolve o nome e o avatar **no momento da renderização**. A mesma troca que altera a saudação reatribui também respostas antigas. Ações tardias ainda podem chegar a `actions.execute`. Esse último risco foi localizado em código, sem demonstração de ação indevida no teste.

[Envio e aplicação de resultados](../src/pages/ChatPage.jsx) · [Parser](../src/services/chatStream.js) · [Autoria na interface](../src/components/MessageBubble.jsx) · [Instrução do servidor](../server/assistantPersona.js)

**Reprodução controlada.** Chrome headless 158, build local, stream artificial em dois fragmentos e movimento reduzido. Enviar o primeiro fragmento, operar o controle real da UI, então liberar o segundo e `done`. O texto e os rótulos foram lidos do DOM.

| Requisição na partida | Ação durante a resposta | Autoria exibida ao concluir |
| --- | --- | --- |
| Compacta, Garagem, Meeseeks | Abrir a completa pelo link do diálogo | Squanchy sobre o texto enviado para Meeseeks |
| Completa, Garagem, Squanchy | Atravessar o portal do cabeçalho | Sr. Bunda Cagada sobre o turno da Garagem |
| Completa, Cidadela, Sr. Bunda Cagada | Selecionar Escuro no menu de aparência | Astra sobre o turno da Cidadela |

Esses resultados demonstram uma corrida entre apresentação e recebimento. Uma possível influência do tom antigo sobre o texto **gerado** em históricos longos continua sendo hipótese. A amostra ao vivo com dois turnos respondeu no tom atual.

**Diferenças entre superfícies.** A compacta pede concisão e a completa permite detalhar. A compacta renderiza Design System, GitHub e WakaTime na conversa, tem apresentações próprias de projetos e proficiências e encaminha outros cards à completa. A rota completa também hospeda o Arcade. Abrir a completa conserva a conversa e o Laboratório. Ler fatos do portfólio, propor uma edição e confirmar uma revisão passam pelo mesmo contrato nas duas. [Apresentação dos cards](../src/components/MessageBubble.jsx) · [Ferramentas compartilhadas](../server/portfolioTools.js)

**Cache.** Perfil e dicionários são lidos por caminho e mtime. Texto do perfil e instrução estática usam WeakMap. A instrução dinâmica da persona é acrescentada por pedido. O catálogo de modelos tem cache de uma hora e retentativa em um minuto. A tradução no cliente usa texto e idioma, com até 100 entradas. O cache ao vivo deduplica consultas e marca dados parciais ou antigos. O TTL nominal é de 15 s para Spotify, 2 min para GitHub e Galo, 5 min para xadrez e 10 min para WakaTime e Canvas. Não se identificou cache de respostas livres por personagem. Limpar caches não resolve a autoria reproduzida. [Cache das fontes](../server/liveCache.js) · [Cache de modelos](../server/modelCache.js) · [Transporte do cliente](../src/services/api.js)

## Projetos, dossiês e código real

O catálogo de 15 IDs em `perfil.json` alimenta a vitrine, o card da Astra, links e validação de ações. Todos os 15 têm título e descrição bilíngues e correspondência em `projectDossiers.js`. A função de apresentação prefere o conteúdo direto e usa a chave i18n como alternativa. Os dossiês contêm problema, decisão e diagrama. Dez têm resultado e cinco têm estado. Três declaram contribuição individual, duas com link explícito de commit. As ausências são editoriais. [Catálogo](../src/data/perfil.json) · [Dossiês](../src/data/projectDossiers.js) · [Revisão histórica dos projetos](github-projects.md)

| IDs | Conteúdo e limites a preservar |
| --- | --- |
| `portfolio`, `github-profile`, `terminal-portfolio` | Aplicação corrente com galeria e Laboratório, README de perfil e outro portfólio em terminal são três entradas distintas. |
| `pokedex`, `snakepy`, `votacao-fazenda`, `mini-commerce` | Consulta/captura de Pokémon, jogo em equipe com ranking, simulador de votação e catálogo com filtros. |
| `geosolar`, `secure-login`, `meddesk` | Telas MVC e e-mail, estudo Spring Security e protótipo acadêmico hospitalar têm níveis distintos de implementação. |
| `carrinho-cli`, `academia`, `oficina-java` | Exercícios de terminal e modelagem Java. São as três fichas que substituem a imagem genérica de catálogo por diagrama quando o dossiê está habilitado. |
| `car-rental`, `clima-api` | Fundação de locadora e estudo meteorológico em construção. Os exemplos do editor são identificados como adaptações. |

A verificação por amostra cruzou a migração SQL de ROTA (contas, veículos, solicitações e contratos), a alteração em `src/jogo.py` de SnakePy (desenho dos ícones), o controlador de GEOSOLAR que retorna as views de login, registro e recuperação e o controlador de ClimaAPI com rotas delegadas ao serviço. A existência de um `@GetMapping` não certifica execução do serviço. O restante conserva a proveniência da revisão anterior, sem nova execução dos projetos externos. [Migração ROTA](https://github.com/gustavoryandev/LABORATORIO-2-DIAW/commit/db93029f205310d8a69366660ad767949a9c1aee) · [Commit SnakePy](https://github.com/warlleyz/SnakePy/commit/a3dac33b84a9f591242f48f101395edde4671b91) · [Controlador GEOSOLAR](https://github.com/gustavoryandev/LoginPucDiaw/blob/2cbe238cd1f7cfbb9e474fefa9bca7b259af99da/src/main/java/com/example/LoginPUC/controller/SecureLoginController.java) · [Controlador ClimaAPI](https://github.com/gustavoryandev/RestAPI-Clima/blob/18c240de7f7bd9b3a54adc9e5ed341f54ebea3de/ClimaAPI/src/main/java/com/example/ClimaAPI/controller/Controller.java)

`ProjectCard` condiciona a ficha ao tema dimensional. `<details>` apenas controla a exibição. “Perguntar à Astra” prepara um rascunho com o título. O servidor serializa o perfil independentemente do DOM e não importa os dossiês. As instruções já permitem explicar um projeto específico sem emitir `[PROJECTS_CARD]`. Esse marcador é reservado ao pedido de lista ou grade. O resolvedor pendente `resolveProfile` nunca é chamado. Ligá-lo diretamente sobrescreveria título e descrição com valores nulos nos **12 projetos sem `chavesI18n`**. O catálogo já tem esses textos. [Renderizador](../src/components/ProjectCard.jsx) · [Precedência do conteúdo](../src/data/projectContent.js) · [Proposta de fonte compartilhada](IMPLEMENTATION_PLAN.md)

## reCAPTCHA v3 e contato

O formulário carrega o script sob demanda, executa `grecaptcha.execute(siteKey, {action: 'contact'})` e pede token novo para cada perna, `notification` e `confirmation`. Antes do EmailJS, o servidor verifica `success`, ação exata, hostname da lista, score finito acima ou igual ao mínimo e idade entre −10 s de tolerância e 120 s. Falha de verificação recebe 403. Falta de configuração recebe 503. Há validação de campos, honeypot, espaçamento e recibos de entrega parcial. [Cliente](../src/services/contactCaptcha.js) · [Envios](../src/services/contact.js) · [Verificador](../api/contact.js) · [Contrato v3 do Google](https://developers.google.com/recaptcha/docs/v3)

**Diagnóstico local verificado sem imprimir valores.** `dotenv.parse` e `vite.loadEnv` leram o arquivo real. As primeiras definições de `VITE_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY` e `EMAILJS_PRIVATE_KEY` estão preenchidas nas linhas 2, 4 e 11. As linhas 29, 30 e 37 redefinem essas mesmas chaves como vazias. O ambiente herdado do processo não as substituía. O build recebe site key vazia e uma chamada local ao handler retornou **503 unavailable** antes de qualquer transporte. Hostnames, score, IDs e chave pública do EmailJS também se repetem, com valores iguais entre as ocorrências.

A ativação mínima é consolidar as três definições efetivas e reiniciar o servidor/reconstruir o cliente para incorporar a chave pública. Conferir a correspondência do hostname de uso com o cadastro do par v3 e a lista do servidor. Produção tem ambiente próprio, que não foi inspecionado. As configurações Canvas estão em linhas separadas e o CAPTCHA pertence exclusivamente ao contato. Os testes de validação do servidor e fluxo de contato passaram com transporte simulado. Nenhum e-mail foi enviado.

## Fluidez de primeiro acesso

A abertura padrão ocupa 2.200 ms nos desktops elegíveis. Enquanto ela está ativa, `PortfolioIntro` retorna apenas a abertura. Na saída monta o portfólio inteiro. `PortfolioPage` mede o cabeçalho, e `ProjectsScrollSection` mede trilha e seção em efeitos de layout. O observador de revelação descobre os novos nós e o IntersectionObserver dispara as entradas de opacidade e transformação. A UI usa 550 ou 660 ms de animação conforme a regra CSS. [Abertura](../src/components/PortfolioIntro.jsx) · [Galeria](../src/components/ProjectsScrollSection.jsx) · [Observadores](../src/glassFx.js) · [Revelações](../src/scroll.css)

Medição no Chrome 158 headless, janela interna 1350 × 805, rota `/`, tema padrão, perfil temporário, build de produção por HTTP local. HTTPS externo bloqueado para isolar o cliente. Três pares alternaram limpeza e reutilização do cache HTTP. Na janela de montagem, as tarefas longas principais foram **2.218, 153 e 146 ms a frio**, e **128, 157 e 124 ms a quente**. A primeira amostra é um valor extremo. Nos dois pares seguintes, o maior intervalo entre quadros nessa janela foi 183 ms a frio e 183/150 ms a quente. Houve 34 transferências locais nas visitas frias e zero nas quentes.

Noutra passagem instrumentada, a leitura de `offsetHeight` do cabeçalho consumiu 47 ms a frio e 40 ms a quente. `getBoundingClientRect` na seção de projetos consumiu 16/15 ms e na faixa fixada 6/5 ms. O callback principal reportou 285/88 ms de estilo/layout forçado, respectivamente. Essas leituras incluem o custo de atualizar o layout pendente. O ensaio de rolagem direta até Habilidades revelou cinco itens nos dois casos. A visita fria não registrou long animation frames nessa rolagem e a quente registrou alguns sem script longo atribuído.

**Interpretação.** Há contenção mensurável entre a montagem, as leituras síncronas e a primeira apresentação dos elementos. Transferência fria pode contribuir, mas houve picos também com ativos em cache. O ensaio não atribui a totalidade do pico a um arquivo de imagem, GPU, blur ou seletor CSS. As medições históricas da nave e do portal descrevem outra interação. O próximo experimento é limitado à montagem inicial. [Plano de medição](IMPLEMENTATION_PLAN.md)

## Resultados dos testes iniciais

| Ensaio | Condição | Resultado |
| --- | --- | --- |
| `node --test tests/*.test.mjs` | Árvore original desta sessão | **96 contabilizados, 92 passaram, 4 falharam**, zero ignorados. Uma suíte conta como arquivo com falha de importação antes de registrar seus casos. |
| Importação de `api/chat.js` e rota dev | Novo processo Node | `ReferenceError: GENERATION_CONFIG is not defined`, linha 33. A rota devolve 500 onde o teste espera 405 para método inválido. |
| Build em diretório temporário e `tsc --noEmit -p tsconfig.portal.json` | Fontes locais intactas | Ambos passaram. Vite transformou 2.271 módulos e avisou sobre chunk maior que 500 kB. O build estático não carrega a função de chat. |
| Casos de endpoint | Processo diagnóstico com o nome global predefinido e provedores simulados | **25/25 passaram**, incluindo identidade, PT/EN, ferramentas em ambas as superfícies, retry/reset de stream, respostas degradadas e pedidos de dados independentes. O comando está no [handoff](SESSION_HANDOFF.md). |
| Programação e mudança de cenário | Handler em processo diagnóstico, descoberta de modelos controlada pela lista local, geração real Gemini, sem card aberto | Meeseeks devolveu `const dobro = n => n * 2`, distinguiu soma de multiplicação e acertou 5 e 6 para entrada 3. A completa da Cidadela identificou ROTA e a finalidade das migrações. Duas respostas finais via Flash-Lite. A segunda teve duas tentativas HTTP 503 antes do 200. |
| Ferramentas e Laboratório | Casos locais de ações e workers, mais endpoint simulado em dois turnos | Validação de planos, leitura de snapshot, proposta de substituição e revisão por versão. A compacta e a completa usam as mesmas declarações. No Chrome, o worker real executou a função recebida, exibiu 6 e preservou rascunho e saída após compacta → completa → portfólio. Python tem casos de sucesso/falha de carga. Java/Wandbox ao vivo fora da amostra. |
| Integração JSX e roteamento | Harness esbuild padrão | Dois testes não empacotam a URL CSS absoluta `/perfil-foto.jpeg`. O arquivo existe e o Vite o serve. Em harness temporário tratando a URL como externa, o teste de rotas passou. A integração da Astra então encontrou `SVGElement is not defined` em jsdom/Motion. Expor globais adicionais em outra sondagem atingiu o timeout de 40 s. |
| Autoria em troca rápida | Cliente real de produção, resposta NDJSON controlada | Falha reproduzida nas três transições descritas acima. |
| Catálogo, temas, mídia, contato | Casos locais e leitura de arquivos | Testes de catálogo bilíngue, primeira pintura e aliases, estado do áudio e validação de contato passaram. 85 arquivos de imagem/áudio de origem medidos. |

O teste real de dois pedidos verifica capacidade básica e continuidade curta. A confiança em históricos extensos, na taxa de alucinação e na fluidez de aparelhos físicos requer outra amostra. [Problemas e riscos](KNOWN_ISSUES.md) · [Inventário de temas](CURRENT_THEME_INVENTORY.md) · [Inventário de assets](ASSET_INVENTORY.md) · [Plano](IMPLEMENTATION_PLAN.md) · [Handoff](SESSION_HANDOFF.md)
