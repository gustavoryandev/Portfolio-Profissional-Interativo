# Passagem de sessão do portfólio

## Fase 02 em 27 de novembro de 2026

A branch local `codex/rick-morty-phase-02` deriva da Fase 01 aprovada em `5637d64`. A demonstração está em [Portfólio local](http://127.0.0.1:5176/) e [Astra completa](http://127.0.0.1:5176/chat). Selecionar Rick and Morty e enviar **Wubba Lubba Dub-Dub** na Astra. A [especificação da dimensão](DIMENSION_SPEC.md) detalha os estados, o diário, o áudio e as permissões pendentes.

| Commit | Escopo |
| --- | --- |
| `d152fdd` | Primeira pintura, compatibilidade dimensional e reconhecimento local. |
| `e5df22d` | Descoberta nas duas superfícies, persistência e roteamento da travessia. |
| `cd761a5` | Mansão, paleta, portais e interface do portfólio e da Astra. |
| `58fef27` | Sequência cinematográfica, revisitas e recuperação da travessia. |
| `9f34a6b` | Pessoa-Pássaro, Rick Maligno e Evil Morty, com perfis PT/EN e avatares estáticos. |
| `6920d54` | Faixa local, controles de som e conquista de chegada. |
| `31803e8` | Regressões de descoberta, autoria, armazenamento e falhas de mídia. |
| `89c982e` | Ajustes do cabeçalho estreito, contraste e tabuleiro. |
| `1710830` | Regressão de troca de tema e retorno da Astra completa ao portfólio. |

**Validação.** Passaram 128 testes da suíte principal e 16 isolados. A importação normal de `api/chat.js`, o typecheck do portal, `git diff --check` e o build temporário passaram. O build conserva o aviso de chunks acima de 500 kB. No Chrome foram medidas as larguras 375, 390, 768, 1024, 1440 e 1920 em portfólio e Astra completa. A amostra incluiu recarga, arcade, transição no diálogo compacto, teclado e foco, redimensionamento durante a viagem, aba oculta simulada e erros induzidos de áudio e imagens. A duração reconhecida do MP3 no Chrome foi de 30 s. Permanecem fora da verificação dispositivos físicos e respostas abertas do Gemini real. [Regressões](ASTRA_REGRESSION_REPORT.md)

**Checkpoint local.** `%LOCALAPPDATA%/Portfolio-Phase02-1271bfb8177948e09eb55aa254bed0b6` guarda a referência da Fase 01, o status, o patch binário e as preparações não rastreadas. O patch das seis alterações rastreadas preexistentes foi comparado byte a byte após a implementação. O cache Python ficou no checkout. As mídias pendentes e as configurações locais ficaram fora dos commits. A fase ficou na branch local.

**Próxima fase.** Validar a demonstração e registrar as permissões das mídias antes de publicar. La Casa de Papel Dark começa após a aprovação da Fase 02.

## Fase 01 em 27 de novembro de 2026

**Branch local:** `codex/astra-phase-01`, criada no estado de `e13942d`. A demonstração foi aberta em [Astra completa](http://127.0.0.1:5174/chat). A sessão local não fez merge, push nem deploy.

| Commit | Escopo |
| --- | --- |
| `a95b51f` | Preparações anteriores à fase nos arquivos da Astra, incluindo fixtures, traduções e relatórios. |
| `947060d` | Autoria imutável por turno em `ChatPage`, bolhas, avatares e Laboratório. |
| `751babc` | Estado assíncrono, cancelamento do leitor, ações tardias e validação do editor e da execução. |
| `69675fd` | Idioma da saudação e dos erros fixos em `ChatPage`. |
| `77a749d` | Roteamento de perguntas profissionais compostas em `conversationResource.js`. |
| `0305710` | Referências a código, exemplos e linguagem no prompt de ferramentas do Laboratório. |
| `4d5eafb` | Regressões de cliente, transporte, motor de ações e contrato do endpoint. |

**Checkpoint.** A pasta local `%LOCALAPPDATA%/Portfolio-Astra-Phase01-a33d96f698844ef8829d2704fc5358a1` guarda HEAD, inventário, patch binário das alterações rastreadas e cópia dos arquivos não rastreados. O cache Python permaneceu no checkout. Configuração de ambiente e mídia pendente ficaram fora dos commits. As preparações que não cruzavam a fase continuam na árvore de trabalho, incluindo o diff de `api/chat.js`, a foto, os ajustes de acessibilidade e as mídias.

**Aceite técnico.** 11 testes isolados e 125 da suíte principal aprovados, com build temporário, typecheck do portal, importação direta de `api/chat.js` e `git diff --check`. Rodar as duas suítes a cada mudança da Astra. A avaliação distingue simulações, Gemini real, execução no navegador e fatos ainda sem cobertura. A terceira dimensão fica para depois da aprovação desta demonstração. [Matriz](ASTRA_REGRESSION_REPORT.md) · [Avaliação](ASTRA_EVALUATION.md) · [Contrato das personas](ASTRA_PERSONAS_HANDOFF.md)

## Histórico da auditoria em 26 de novembro

**Validação após as correções — 26 de novembro de 2026.** HEAD está em `e13942d` (`main`), dois commits à frente de `origin/main`. Em execução local, a importação normal de `api/chat.js`, a suíte completa (**120 testes**), o build de produção e `tsc --noEmit -p tsconfig.portal.json` passaram. O build transformou 2.271 módulos e emitiu o aviso já conhecido de chunks acima de 500 kB. Foi gerado em diretório temporário fora do repositório. Nenhum arquivo de implementação, credencial, commit, merge, push ou deploy foi alterado nesta validação.

A árvore de trabalho continua contendo alterações preexistentes. Em particular, o diff independente em `api/chat.js` não foi modificado; os testes foram executados com ele presente.

## Correção da importação da API da Astra

**26 de novembro de 2026.** Removida de `api/chat.js` a atribuição local sem declaração a `GENERATION_CONFIG`. O handler continua usando `generationConfig(name, 4096, fastReply)` para as respostas da Astra.

A importação direta em um novo processo Node retornou um handler válido. Passaram os 25 testes de `tests/live-endpoint.test.mjs` com provedores simulados e o teste `local route runs the real handler` de `tests/dev-api.test.mjs`. A validação usou a importação normal.

A atribuição existia só na árvore de trabalho. O commit registra esta correção e sua validação. O diff local de resolução de perfil segue fora do commit.

## Fixtures de integração e roteamento

**26 de novembro de 2026.** O plugin de esbuild usado pelos dois testes conserva as URLs CSS absolutas de arquivos existentes em `public/`, como `/perfil-foto.jpeg`, conforme o Vite. A fixture da Astra expõe ao Motion o `SVGElement` da janela do jsdom.

`node --test tests/astra-integration.test.mjs tests/portfolio-routing.test.mjs` passou nos quatro casos. A integração longa da Astra levou cerca de 51 s e encerrou normalmente. O limite de 40 s da sondagem anterior era curto para esta execução. A suíte completa (`node --test --test-reporter=dot tests/*.test.mjs`) passou nos 120 testes.

## Leitura para retomar

| Documento | Onde encontrar a decisão |
| --- | --- |
| [Auditoria técnica](PROJECT_AUDIT.md) | Git, arquitetura, integrações, dossiês, contexto da Astra, testes e medições de fluidez |
| [Inventário de temas](CURRENT_THEME_INVENTORY.md) | Todos os 15 IDs, aliases, armazenamento, duas dimensões e experiências existentes |
| [Inventário de assets](ASSET_INVENTORY.md) | Caminho, formato, dimensões e bytes de 85 mídias, além das referências externas |
| [Problemas conhecidos](KNOWN_ISSUES.md) | Falhas reproduzidas, alcance, hipóteses e critérios de resolução |
| [Plano de implementação](IMPLEMENTATION_PLAN.md) | Intervenções mínimas, contratos de compatibilidade, expansão visual e licenciamento |
| [Preparação de assets](PREPARACAO_ASSETS.md) | Recursos existentes, lacunas, recomendações de formato/caminho, dependências e permissões |
| [Especificação de paletas futuras](THEME_PREPARATION.md) | Tokens reais, três paletas, contrastes WCAG calculados, migração e limites de integração |
| [Recursos visuais pendentes](ASSETS_PENDENTES.md) | Caminhos de recebimento, disponibilidade local, licenças conhecidas e etapas dependentes |
| [Regressões isoladas da Astra](ASTRA_REGRESSION_REPORT.md) | Matriz dos oito cenários, cinco casos determinísticos isolados, resultados e limitações |
| [Internacionalização pendente](I18N_PENDING.md) | Levantamento focado na Astra, chaves PT/EN, fallback e diferenças compacta/completa |
| [Preparação de contexto dos projetos](PROJECT_CONTEXT_PREPARATION.md) | Fichas dos 15 projetos, dossiês, contexto atual da Astra, evidências e proposta de adaptador compartilhado |
| [Especificação de novas personas](NEW_PERSONAS_SPEC.md) | Matriz de cinco personas, textos originais PT/EN, exemplos factuais e pontos de integração; preparação somente documental |
| [Componente de revelação fotográfica](PHOTO_REVEAL_COMPONENT.md) | API, decisões técnicas, limites, testes isolados e exemplo de integração futura |

**Estado atual e próximos focos.** A indisponibilidade causada pela importação da API e as falhas do harness de integração/roteamento foram corrigidas nos commits `764e90e` e `e13942d`, e a validação atual passou sem predefinir globais. Permanecem como tarefas de implementação a autoria das respostas após troca de cenário e a exposição dos dossiês à Astra. Preservar o diff local independente de `api/chat.js` e não alterar a inteligência da Astra sem autorização. Build e typecheck do portal passaram; o aviso de tamanho de chunks não impediu o build.

**Regressões isoladas da Astra.** Foram preparados cinco casos em `tests/isolated/`, sem modificar testes existentes ou produção. Na execução focada, três passaram (idioma durante o fluxo, exemplo de código e pergunta digitada sobre ROTA sem histórico/card) e dois falharam como esperado, reproduzindo as assinaturas finais Mr. Poopybutthole e Astra para turnos iniciados como Squanchy. As falhas ficam fora da suíte principal até a correção da autoria por turno. Detalhes, coberturas existentes e limitações: [relatório de regressão](ASTRA_REGRESSION_REPORT.md).

**Internacionalização da Astra.** O levantamento e o estado das correções estão em [I18N_PENDING.md](I18N_PENDING.md). I18N-01 localiza os rótulos e a confirmação de copiar código; I18N-03 adiciona `chat.digitando` em PT/EN preservando “Gerando resposta” / “Generating reply”. `node --test tests/metrics-ui.test.mjs` passou (1 teste). I18N-02 permanece pendente e não foi alterado; a política para mensagens degradadas e a diferença de onboarding compacto/completo continuam decisões em aberto. O teste de mudança de idioma durante streaming não foi repetido.

**Contextualização universal dos projetos.** A preparação documental está em [PROJECT_CONTEXT_PREPARATION.md](PROJECT_CONTEXT_PREPARATION.md). Os 15 IDs do catálogo têm descrições PT/EN e correspondência nos dossiês; a Astra recebe o perfil serializado, mas o servidor não importa os dossiês, atualmente apresentados somente no tema Rick. O documento separa sobreposições e conteúdo exclusivo, registra fontes/limites e propõe um adaptador puro compartilhado sem duplicar o catálogo. A função `resolveProfile` presente na árvore local não tem chamada e, como está, não deve ser ligada: perderia os textos diretos de 12 projetos sem chave i18n. Nenhuma suíte ou teste comportamental foi executado; houve apenas checagem estrutural dos registros. Nenhum código, tradução ou dossiê foi alterado.

**Ativação do contato.** Três valores já definidos são sobrescritos por atribuições vazias ao fim de `.env.local`. A proteção v3 já precede os dois envios EmailJS. O relatório registra os nomes e linhas, sem os valores. Uma leitura de Canvas com o handler carregado em isolamento retornou HTTP 200, fonte `ok` e dez cursos. O relatório omite o conteúdo da lista.

## Patrimônio local a preservar

- Já tinham modificações `api/chat.js`, `docs/rick-morty-assets.md`, `src/components/rick/MeeseeksRig.jsx`.
- Já estavam sem rastreamento `docs/portal-dimensional.md`, `docs/rick-morty-experience.md`, `scripts/__pycache__/`.
- `dist/`, `.cache/`, dependências e configurações locais já existiam. O build de auditoria foi gravado fora do repositório. Uma cópia histórica de mídia em cache não comprova que o app a utiliza.
- Os seis relatórios são as entregas desta sessão. Comparar qualquer estado futuro com `git status --short --branch` e `git diff` antes de editar.

## Como repetir os testes

Executar a partir da raiz do checkout em PowerShell. Usar um diretório temporário novo para evitar substituir o build local do usuário.

```powershell
git status --short --branch
git log -5 --oneline --decorate
node -e "import('./api/chat.js')"
node --test tests/*.test.mjs
$auditBuild = Join-Path $env:TEMP ('portfolio-audit-' + [guid]::NewGuid().ToString('N'))
npm run build -- --outDir $auditBuild
node node_modules/typescript/bin/tsc --noEmit -p tsconfig.portal.json
```

A baseline anterior às correções, no commit `ee6d6a5`, era **92 passagens e quatro falhas em 96 testes contabilizados**: importação da API, middleware dev e fixtures de integração/rotas. Após as correções em `764e90e` e `e13942d`, a execução atual da suíte completa passou nos **120 testes**. O typecheck cobre somente o portal e seus exemplos.

Para distinguir um erro de carregamento de um defeito dentro do handler, foi usado o comando diagnóstico a seguir. Ele declara um nome global **apenas no processo filho** e executa a suite de endpoint com provedores simulados. Nesta sessão, **os 25 casos passaram**. Esse comando serve à investigação e não deve substituir o teste normal da aplicação.

```powershell
node --import "data:text/javascript,globalThis.GENERATION_CONFIG%3Dundefined" --test tests/live-endpoint.test.mjs
node --test tests/assistant-persona.test.mjs tests/chat-stream.test.mjs tests/astra-actions.test.mjs tests/projects-catalog.test.mjs
node --test tests/contact-api.test.mjs tests/contact-security.test.mjs
```

Os casos isolados da Astra são executados separadamente. Duas falhas esperadas reproduzem a autoria final incorreta e não devem ser incluídas na suíte principal antes da correção:

```powershell
node --test tests/isolated/astra-streaming.test.mjs tests/isolated/project-question.test.mjs
```

Para verificar a configuração sem mostrar segredos, usar um processo novo e imprimir apenas presença/ausência. Comparar os três nomes com as atribuições efetivas no arquivo, incluindo repetições.

```powershell
node --input-type=module -e "import {loadEnv} from 'vite';import dotenv from 'dotenv';import fs from 'node:fs';const v=loadEnv('development',process.cwd(),'VITE_');const e=dotenv.parse(fs.readFileSync('.env.local'));for(const k of ['VITE_RECAPTCHA_SITE_KEY','RECAPTCHA_SECRET_KEY','EMAILJS_PRIVATE_KEY'])console.log(k,Boolean((k.startsWith('VITE_')?v:e)[k]?.trim()))"
```

## Reprodução determinística da autoria

Usar o build de produção local servido por HTTP, de preferência em perfil de navegador descartável. No DevTools da página local pode-se usar o trecho abaixo como transporte de teste. Ele retém somente mensagens conversacionais do endpoint local. Recarregar a página remove a instrumentação.

```js
const fetchOriginal = window.fetch.bind(window)
window.fetch = async (url, options) => {
  if (url !== '/api/chat' || !options?.body) return fetchOriginal(url, options)
  const pedido = JSON.parse(options.body)
  if (!pedido.userMessage) return fetchOriginal(url, options)
  const encoder = new TextEncoder()
  const fluxo = new ReadableStream({
    start(controller) {
      const enviar = evento => controller.enqueue(encoder.encode(JSON.stringify(evento) + '\n'))
      enviar({ type: 'delta', text: 'Resposta iniciada no cenário anterior. ' })
      window.concluirTurno = () => {
        enviar({ type: 'delta', text: 'Fim do teste de autoria.' })
        enviar({ type: 'done' })
        controller.close()
      }
    }
  })
  console.log('Origem do turno', pedido.surface, pedido.appearance)
  return new Response(fluxo, { headers: { 'Content-Type': 'application/x-ndjson' } })
}
```

1. Selecionar Rick, abrir a compacta na Garagem e enviar “Explique uma função curta”. Após o primeiro fragmento, abrir a completa pelo link do diálogo. Executar `concluirTurno()`. Registrar a origem do pedido e o rótulo sobre a resposta.
2. Na completa da Garagem, enviar outra pergunta livre, atravessar o portal e só então concluir o turno. Repetir na Cidadela, agora mudando o tema para Escuro pelo cabeçalho.
3. Foram observadas as trocas **Meeseeks → Squanchy**, **Squanchy → Sr. Bunda Cagada**, **Sr. Bunda Cagada → Astra**. Os dois nomes em cada par são o autor do pedido e a assinatura exibida. O ensaio original usou o mesmo protocolo com dois fragmentos enviados por um servidor HTTP local.

## Amostras independentes

- **Gemini real.** Em processo isolado com a predefinição descrita acima, catálogo de modelos controlado pela allowlist e sem card aberto, a compacta gerou e explicou a correção de `n + 2` para `n * 2`. Depois a completa da Cidadela respondeu sobre a migração de ROTA. Houve duas respostas bem-sucedidas e duas tentativas intermediárias com HTTP 503. A cota restante da conta não foi consultada.
- **Laboratório real no Chrome.** Escolher JavaScript e Código livre. Executar `const dobro = n => n * 2; console.log(dobro(3))`. O console exibiu 6. Abrir a compacta, subir à completa e voltar ao portfólio. O editor conservou o código e a saída 6.
- **Medição de entrada.** Chrome 158 headless, viewport 1350 × 805, três pares frio/quente por HTTP local, HTTPS externo bloqueado e sem throttling explícito. Observar desde a navegação até após o fim da abertura. Registrar `requestAnimationFrame`, long tasks e long animation frames. Em execução separada, medir leitura de `offsetHeight` do cabeçalho e retângulos da galeria, depois rolar até Habilidades e repetir. A tabela e os valores extremos estão no [relatório](PROJECT_AUDIT.md).
- **Limites.** Não houve teste de entrega real de e-mail, produção, dispositivos físicos ou conversas longas representativas. O site publicado de Lucas retornou 404. A revisão de código externa e a condição da licença estão no [plano](IMPLEMENTATION_PLAN.md).

## Decisões abertas para a etapa artística

As presenças de Rick Maligno e Evil Morty estão definidas pelo pedido. A atribuição de Rick à compacta, de Morty à completa e a ligação da terceira dimensão pela Cidadela são propostas reversíveis. Berlim na compacta, Professor na completa e Pássaro-Pessoa no lugar de Squanchy são requisitos. Os fundos Dark/Light e os avatares La Casa foram recebidos na V11.2, mas seus direitos de uso/distribuição ainda precisam ser confirmados antes da integração. A música também foi recebida; o proprietário informou possuir autorização, sem que documentação comprobatória tenha sido inspecionada. Deixar La Casa Light para quando houver tempo e cota. O endereço exato do rosa escuro é `midnight-pink` e o do claro é `quartzo-framboesa`.

## Especificação de novas personas

**Preparação documental.** [NEW_PERSONAS_SPEC.md](NEW_PERSONAS_SPEC.md) registra a matriz proposta de Rick Maligno e Evil Morty em `beyond-curve`, substituição de Squanchy por Pássaro-Pessoa na Garagem completa, e Berlim/Professor em La Casa. Inclui caracterizações amplas não imitativas, saudações e sugestões originais PT/EN, exemplos limitados aos fatos de projetos documentados, destinos de avatar e pontos de integração cliente/servidor. Nenhuma persona, tradução ou configuração foi registrada no código; nenhum prompt, tema, streaming, componente ou asset foi alterado.

A correção da autoria por turno continua pré-requisito, conforme a etapa 2 do plano e os dois casos isolados que falham intencionalmente. Os arquivos das personas foram recebidos no ZIP V11.2, sem registro no sistema; permissões de imagem continuam pendentes. Os destinos de Berlim e Professor são `public/la-casa-de-papel/`. Nenhuma persona, tradução, tema, prompt, streaming ou componente foi alterado nesta preparação.

## Componente independente de revelação fotográfica

Foi criado `src/components/PhotoReveal.jsx`, sem importá-lo na interface principal. Ele preserva a foto original e desenha a alternativa num canvas com máscara radial apenas durante interação; suporta raio/suavidade configuráveis, DPR limitado a 2, resize, limpeza de listeners/RAF, fallback em erro, pointer coarse e movimento reduzido. O asset `public/la-casa-de-papel/perfil-foto-reveal.webp` continua ausente; os testes usam imagens simuladas, sem gerar arquivos permanentes.

**Testes e compilação.** `node --test tests/photo-reveal.test.mjs` passou (1 teste Node; 0 falhas), compilando o componente e o harness JSX com esbuild e cobrindo renderização, imagem alternativa ausente/erro, cursor, resize, desmontagem e movimento reduzido/mobile. Não foi necessário executar o build geral porque o componente é independente e o teste compila diretamente os arquivos novos. Detalhes, API e limites: [PHOTO_REVEAL_COMPONENT.md](PHOTO_REVEAL_COMPONENT.md). A integração visual, aprovação/licença da fotografia alternativa e validação em dispositivos reais permanecem pendentes.

## Fluidez da parte estática

**Otimização localizada.** [STATIC_PERFORMANCE_REPORT.md](STATIC_PERFORMANCE_REPORT.md) registra a baseline, métricas pareadas, limites e validação. Em `src/components/ProjectsScrollSection.jsx`, a medição da galeria passou a agrupar leituras de layout e a reutilizar a posição já medida na atualização passiva. Não houve alteração de animações, CSS, temas ou funcionalidades protegidas. As medianas melhoraram modestamente em 1440/1920 px, não mudaram em 768 px e foram mistas/regressivas em 375/1024 px; não se deve afirmar ganho geral. A seção do Laboratório entrou, saiu e reentrou no viewport; as 15 paletas e seis larguras foram conferidas quanto a conteúdo montado e overflow. O browser respeitou `prefers-reduced-motion`; testes direcionados (3), suíte completa, build (2.271 módulos), typecheck e `git diff --check` passaram. O aviso conhecido de chunks >500 kB permaneceu. Repetir profiling em dispositivos reais antes de ampliar ou manter a otimização é uma pendência.

## Importacao e preparacao de assets V11.2

Foram importados 20 arquivos do pacote `PORTFOLIO_ASSETS_V11_2.zip`: 16 em `public/` (cinco de La Casa incluindo a candidata mascarada; tres avatares Rick; sete cenas da terceira dimensao; um MP3) e quatro referencias em `references/la-casa-de-papel/`. Os 20 hashes SHA-256 conferem com os membros do ZIP; nenhum destino foi sobrescrito e nenhum hash novo duplicou os 90 arquivos anteriormente existentes em `public/`. Os recursos foram preservados sem recorte/recompressao e nao foram conectados ao codigo.

O MP3 tem 1.151 quadros, 44,1 kHz e duracao calculada de 30,067 s; `evil-morty-portal-15s.mp3` nao existe no checkout e nao possui referencias encontradas. A candidata mascarada (918 x 1713, razao 0,536) nao alinha com a foto atualmente usada (572 x 777, razao 0,736); permanece candidata e nao deve ser ligada ao PhotoReveal. As cenas `yellow-portal*.webp` sao completas e sem alfa, portanto nao foram convertidas em icones improvisados. A mansao (1125 x 603) perde grande parte da largura com `cover` central em retrato; nenhuma variante mobile foi gerada sem layout/foco aprovados. Direitos de distribuicao das imagens ainda precisam ser confirmados; a autorizacao da musica foi informada pelo proprietario, sem documento comprobatório inspecionado.

Suíte completa (`node --test --test-reporter=dot tests/*.test.mjs`), build de producao (2.271 modulos), typecheck e `git diff --check` passaram. O build foi validado em diretorio temporario; permanece o aviso conhecido de chunks maiores que 500 kB. `docs/THEME_PREPARATION.md` nao existia no checkout durante a importacao V11.2; foi criado nesta etapa. Os demais documentos de contexto e as tres notas internas do ZIP foram consultados. Inventario, pendencias, avaliacao visual, caminhos, hashes, audio, direitos e orientacoes de integracao: [ASSET_IMPORT_V11_2_REPORT.md](ASSET_IMPORT_V11_2_REPORT.md). O relatorio esta incluido no exportador de contexto.

## Preparacao tecnica das novas paletas

Criado [THEME_PREPARATION.md](THEME_PREPARATION.md), exclusivamente documental. A analise confirma 15 temas no seletor, tokens compartilhados `--palette-*` → `--page`/`--panel`/`--ink` etc., `darkMode: 'class'` no Tailwind, aliases duplicados no JS e no primeiro paint HTML, e persistencia em `localStorage`. Beyond permanece uma dimensao secreta de `rick-morty`, nao uma quarta opcao de tema; o estado atual ainda restaura e alterna apenas Garagem/Cidadela.

A especificacao preserva sem mudanca as sete cores base aprovadas para Beyond e define cores propostas para La Casa Dark/Light com base nos fundos V11.2. Dark substitui o slot `midnight-pink` e os aliases `obsidian-gold`/`grafite-coral` migram diretamente; Light e opcional, sem dependencia tecnica para Dark. Foram calculadas relacoes WCAG 2.2 para texto, botoes, foco e bordas; `--line` e decorativo e nao atinge 3:1, enquanto `--control-border` atende. Tambem foi registrado que os status claros fixos do Laboratorio falham no fundo Light e requerem alternativas locais caso o tema seja implementado.

Nao foi alterado codigo de producao, tema, portal, Astra, traducao ou asset. `docs/THEME_PREPARATION.md` foi incluido no script de exportacao; a exportacao foi executada e validada. `git diff --check` passou. A paleta nao declara conformidade WCAG completa; direitos das imagens, crop responsivo, icone Dali e autorizacao dos temas continuam pendentes.

## Fase 14 — ícones de header e acessibilidade pontual

**Assets preparados, não integrados.** Os PNGs-fontes foram preservados byte a byte em `references/header-assets/`. O fundo preto opaco original foi removido apenas da região externa conectada às bordas, preservando os detalhes pretos da máscara e os pontos brancos do portal. Versões RGBA e variantes com lado maior de 128 px foram geradas nos destinos definitivos; dimensões, bytes, canal alfa, inspeção entre 24–64 px e pendências de direitos estão em [HEADER_ASSETS_REPORT.md](HEADER_ASSETS_REPORT.md). Nenhum portal de cena existente foi substituído.

**Acessibilidade.** [Navbar.jsx](../src/components/Navbar.jsx) agora expõe o seletor de idioma como grupo nomeado pela tradução existente. Em [MobileNav.jsx](../src/components/MobileNav.jsx), Escape/`cancel` fecham o diálogo e devolvem o foco ao acionador; a falha anterior foi observada no navegador. O seletor de temas recebeu foco por teclado, moveu foco com seta e o devolveu ao acionador ao fechar. A revisão não foi uma auditoria completa de IHC/WCAG; limites e verificações fora do escopo estão em [ACCESSIBILITY_PREPARATION_REPORT.md](ACCESSIBILITY_PREPARATION_REPORT.md).

**Validação desta fase.** O teste direcionado de acessibilidade passou (1/1); a suíte principal `node --test --test-reporter=dot tests/*.test.mjs` terminou com código 0. Build de produção em diretório temporário passou com 2.271 módulos e aviso conhecido de chunks >500 kB. O typecheck `node node_modules/typescript/bin/tsc --noEmit -p tsconfig.portal.json` e `git diff --check` passaram. A página foi conferida em 375, 390, 768, 1024, 1440 e 1920 px, em temas claro/escuro, sem overflow horizontal. A verificação de Escape e retorno do foco passou após a correção. Ainda faltam teste com leitor de tela/avaliação presencial, confirmação de direitos dos PNGs e integração futura dos ícones. O relatório do cabeçalho contém os detalhes de assets e o relatório de acessibilidade registra as limitações.
