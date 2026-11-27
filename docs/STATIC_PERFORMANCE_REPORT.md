# Relatório de desempenho estático

## Diagnóstico inicial

A auditoria existente identifica a montagem do portfólio após a abertura como o momento de maior trabalho síncrono. A interface monta a página, mede cabeçalho e galeria e inicia observadores de revelação. Uma passagem instrumentada registrou 285 ms de estilo/layout forçado no callback principal a frio e 88 ms a quente; essas leituras incluíram a atualização de layout pendente. Os reveals existentes usam `IntersectionObserver`, com `opacity` e `transform`; `glassFx.js` também observa alterações de DOM. Em mobile, as animações/transições pesadas já são evitadas pela política existente.

Na galeria, `measure()` alternava leituras geométricas e escritas de estilo/dataset e, em medições passivas, chamava `update()`, que voltava a ler a posição da seção. O profiling disponível não demonstrou que os observers fossem um gargalo: as varreduras observadas foram curtas, sem evidência suficiente para modificá-los. A causa compatível com a evidência é o custo de layout síncrono na medição da galeria, não uma falha comprovada dos observers.

## Alteração localizada

| Arquivo | Alteração | Justificativa |
| --- | --- | --- |
| `src/components/ProjectsScrollSection.jsx` | Agrupadas no início de `measure()` as leituras de dimensões usadas naquela passagem. Em atualização passiva, a posição é calculada a partir do `sectionTop` já medido, evitando a leitura geométrica adicional de `update()`. | Reduzir a alternância leitura/escrita e evitar uma nova leitura de layout depois de alterar estilos. A navegação explícita continua usando o caminho existente; CSS, conteúdo e comportamento visual não foram alterados. |

Nenhum mecanismo de animação, tema, funcionalidade do Laboratório, Astra, dimensão ou componente visual foi modificado.

## Comparação antes e depois

Medições pareadas no mesmo Chromium integrado, com navegação local, mesmo fluxo e três amostras por largura. Valores abaixo são medianas em milissegundos; variam com o ambiente e não equivalem a medidas em aparelhos físicos.

| Largura | Maior Long Task — antes → depois | Maior bloqueio de Long Animation Frame — antes → depois | Leitura |
| ---: | ---: | ---: | --- |
| 375 px | 176 → 199 | 8 → 3 | Resultado misto; a soma de Long Tasks caiu de 226 para 200 ms, mas a maior tarefa aumentou. |
| 390 px | 163 → 162 | 3 → 2 | Diferença pequena, sem ganho material demonstrado. |
| 768 px | 233 → 233 | 185 → 185 | Sem diferença detectável. |
| 1024 px | 238 → 248 | 190 → 200 | Piora modesta nesta amostra. |
| 1440 px | 244 → 229 | 196 → 181 | Melhora modesta. |
| 1920 px | 243 → 216 | 194 → 168 | Melhora modesta. |

Os resultados são heterogêneos e sujeitos a ruído. Não há evidência de melhoria geral ou de benefício em todos os dispositivos. A alteração permanece pequena e de baixo alcance, mas seu ganho prático deve ser reavaliado com profiling repetível em dispositivos reais, especialmente em 1024 px.

## Validação funcional e responsiva

- Nos seis viewports pedidos (375, 390, 768, 1024, 1440 e 1920 px), a página manteve os 15 cards de projetos, o Laboratório montado e não apresentou overflow horizontal.
- As 15 paletas existentes foram carregadas individualmente no viewport de 1440 px; a página e o Laboratório permaneceram montados, sem overflow.
- A seção do Laboratório foi observada entrando na viewport, saindo e entrando novamente; a classe de reveal acompanhou os três estados.
- Com `prefers-reduced-motion: reduce`, o navegador confirmou a preferência, manteve o Laboratório presente e não registrou alvos animados. A configuração reduziu a possibilidade de conferir visualmente as transições nessa passagem, sem indicar conteúdo oculto.
- Os testes direcionados de galeria/reveal passaram: 3 testes, 0 falhas (`node --test tests/projects-scroll.test.mjs tests/glass-effects.test.mjs`).
- A suíte completa passou (`node --test --test-reporter=dot tests/*.test.mjs`).
- O build de produção passou, transformando 2.271 módulos. Permaneceu o aviso preexistente de chunks maiores que 500 kB.
- O typecheck passou (`node node_modules/typescript/bin/tsc --noEmit -p tsconfig.portal.json`).
- `git diff --check` passou.

## Limitações e pendências

- A comparação usou o browser integrado, não dispositivos físicos nem throttling representativo de redes/processadores móveis. Não foi possível atribuir a diferença a uma métrica de experiência do usuário real.
- Três amostras por viewport são insuficientes para afirmar ganhos pequenos diante da variabilidade do browser.
- A validação das paletas e larguras verificou renderização, presença de conteúdo e overflow, não uma revisão visual subjetiva de cada combinação.
- O profiling inicial reportou custo de layout forçado compartilhado com o trabalho pendente do browser; os valores não isolam exclusivamente o código da galeria.
- Nenhuma alteração foi feita nos reveals ou no laboratório. Melhorias adicionais exigem novo profiling que identifique custo e não podem ser inferidas destes resultados.

## Reversão

Não houve commit. Para reverter somente a otimização, reverta os hunks desta tarefa em `src/components/ProjectsScrollSection.jsx`: a função `positionFor`, a captura agrupada das dimensões em `measure()` e o bloco passivo que atualiza `expectedLeft`/`showProgress`. Inspecione `git diff -- src/components/ProjectsScrollSection.jsx` e preserve quaisquer alterações preexistentes ou posteriores nesse arquivo; não use uma restauração integral do arquivo.

## Pendências reservadas ao Codex

- Repetir a comparação em hardware real, sobretudo em 1024 px e em aparelhos móveis.
- Decidir, com evidência adicional, se a redução modesta em telas grandes justifica manter esta otimização diante dos resultados neutros/mistos nos demais tamanhos.
- Não ampliar o escopo para observers, CSS, temas ou Laboratório sem profiling específico e validação independente.
