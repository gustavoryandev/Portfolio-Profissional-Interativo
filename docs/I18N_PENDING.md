# Levantamento de internacionalização pendente

## Atualização da Fase 01

- **I18N-02 resolvido.** O tratamento compartilhado de erro usa o idioma capturado e a chave `chat.erro` para apresentar o texto no idioma atual sem pedir tradução ao provedor. O teste atrasado de HTTP 503 troca o idioma antes da falha e verifica texto e autor.
- **Saudação temática após trocar idioma e interface.** O navegador exibiu a saudação antiga da Cidadela na compacta. A saudação já chega localizada e agora informa à bolha o próprio idioma. O teste verifica a saudação atual e a ausência de chamadas de tradução para esse texto. A demonstração final exibiu a saudação Squanchy na completa e a resposta anterior de Meeseeks em inglês.
- **Pendências de produto.** I18N-H01 permanece para fallbacks de provedor e fragmentos cancelados. I18N-H02 descreve a diferença atual entre os onboardings.

O levantamento a seguir registra o estado em 26 de novembro. [Resultados da fase](ASTRA_REGRESSION_REPORT.md)

26 de novembro de 2026 · Revisão estática focada na Astra compacta e completa, seguida de correções pontuais em I18N-01 e I18N-03. Nenhum prompt, persona, modelo, streaming, autoria de resposta ou histórico foi alterado. O teste isolado de mudança de idioma durante streaming, já registrado como aprovado em `ASTRA_REGRESSION_REPORT.md`, não foi repetido.

## Inconsistência pendente

| Ref. | Arquivo e linha | Comportamento atual | Comportamento esperado | Sugestão mínima |
| --- | --- | --- | --- | --- |
| I18N-02 · Erro local da Astra | `src/pages/ChatPage.jsx:195-208` | O pedido guarda `requestLanguage`, mas, se `answerArcade` falhar, `t('chat.erro')` usa o idioma ativo no momento da falha. A mensagem é marcada com `lang: requestLanguage`. Se o idioma mudou enquanto a operação aguardava, texto e metadado divergem; a tradução posterior do histórico pode então ser ignorada ou aplicada na direção errada. | Texto e `lang` da mensagem de erro devem descrever o mesmo idioma. | Usar `t('chat.erro', { lng: requestLanguage })`, como no tratamento de erro do caminho normal em `src/pages/ChatPage.jsx:295`. |

I18N-02 não foi alterado nem reproduzido nesta etapa.

## Correções aplicadas e verificadas

| Ref. | Alteração | Verificação |
| --- | --- | --- |
| I18N-01 · Copiar código | `MessageBubble.jsx:175-203` usa `useTranslation` e chaves `chat.copyCodeLabel`, `chat.copyCodeAction`, `chat.codeCopiedLabel` e `chat.codeCopiedAction`; valores PT/EN em `pt.json` e `en.json:41-44`. Labels acessíveis e texto visível são localizados. | `tests/metrics-ui.jsx:53-75` verifica os quatro estados/idiomas, a chamada à área de transferência e a troca de idioma enquanto a confirmação está visível. |
| I18N-03 · Chave de espera | `chat.digitando` foi adicionada a `pt.json:40` (“Gerando resposta”) e `en.json:40` (“Generating reply”). A chamada existente em `ChatPage.jsx:413` e seu fallback foram preservados. | `tests/metrics-ui.jsx:36-38` verifica os dois valores resolvidos pelo i18next. |

Comando executado: `node --test tests/metrics-ui.test.mjs` — **1 teste passou, 0 falharam**. A cobertura nova é incluída no teste de UI existente; não houve execução da suíte completa.

## Comportamentos confirmados cuja expectativa precisa de decisão

| Ref. | Arquivo e linha | Comportamento atual | Comportamento esperado a confirmar | Sugestão mínima |
| --- | --- | --- | --- | --- |
| I18N-H01 · Histórico degradado | `src/components/MessageBubble.jsx:231-246`; `src/pages/ChatPage.jsx:263-281`; fallback de servidor em `api/chat.js:1373-1378` | Mensagens normais de assistente podem ser traduzidas para o idioma atual. Mensagens com `degraded` são excluídas de `needsTranslation`; fallback de provedor, erro de transporte e cancelamento permanecem no idioma do turno, mesmo depois de trocar o idioma da interface. | Se o histórico deve acompanhar o idioma selecionado, esses fallbacks também precisam de apresentação localizada. A política para texto parcial de um turno cancelado não está definida. | Confirmar a política. Se for traduzir, separar a frase fixa do fallback do fragmento parcial antes de ampliar a tradução para mensagens degradadas. |
| I18N-H02 · Onboarding compacto/completo | `src/pages/ChatPage.jsx:75, 313-314, 387-389, 420-421`; `src/components/AstraHero.jsx:25-52` | A compacta usa `chat.quickWelcome` e não monta o hero nem os chips com as seis sugestões. A completa usa `chat.boasVindas` (ou boas-vindas de Galo/persona) e mostra as sugestões no hero e, após a primeira mensagem, junto ao compositor. O menu Recursos da compacta fornece atalhos próprios. | Não há requisito confirmado de que as duas superfícies tenham as mesmas mensagens de entrada ou sugestões. | Não unificar sem decisão de produto. Se a compacta também precisar de perguntas sugeridas, reaproveitar `chat.sugestoes` em uma apresentação própria para essa superfície. |

## Verificações sem inconsistência encontrada

- **Paridade dos locales:** `pt.json` e `en.json` têm o mesmo conjunto de chaves, sem divergências de tipo ou de placeholders. Nenhuma chave aparece em apenas um idioma. A antiga ausência de `chat.digitando` foi corrigida nos dois locales.
- **Mensagens iniciais/personas:** `name`, `intro`, `welcome`, `identity` e estados `surface.compact/full` das três personas existem nos dois idiomas. `AssistantAppearanceContext` resolve esses textos por chave; não há uma saudação de persona hardcoded no componente.
- **Sugestões:** os seis itens de `chat.sugestoes` têm versões PT/EN correspondentes. A ausência visual na compacta é uma diferença de superfície, não uma chave ausente.
- **Erros/fallbacks regulares:** `chat.erro` está traduzida nos dois locales. O `catch` do pedido normal fixa `lng` em `requestLanguage`; os fallbacks do servidor e as mensagens `unavailable` de Meeseeks, Squanchy e Sr. Bunda Cagada também têm textos PT/EN. A exceção identificada é o caminho local de erro da Astra em I18N-02.
- **Resposta após troca de idioma:** o relatório anterior registra aprovação do caso isolado: o pedido mantém o idioma capturado no início e a resposta concluída é traduzida para o idioma atual. Esse resultado não foi reexecutado nesta revisão.
- **Histórico normal:** `MessageBubble` conserva o texto original e solicita tradução quando o idioma-fonte difere do idioma atual; mensagens com `translationKey` são reavaliadas diretamente pelo i18next. Mensagens do usuário permanecem no idioma em que foram escritas. O tratamento distinto de `degraded` está registrado em I18N-H01.
- **Textos fixos examinados:** cabeçalho, descrições, controles, estados e ações da Astra usam chaves ou pares PT/EN. O controle de copiar código antes fixo em português foi localizado em I18N-01. Instruções internas em inglês destinadas ao modelo não são texto de UI e não foram avaliadas como falha de idioma.

## Limites

Este levantamento não é uma auditoria geral de internacionalização. Foi executado apenas o teste focado acima; não houve chamadas a provedores nem repetição do teste de idioma durante streaming. I18N-02 e I18N-H01 não foram alterados nem reproduzidos em runtime. A diferença entre compacta e completa fica como hipótese de produto, não como defeito confirmado.
