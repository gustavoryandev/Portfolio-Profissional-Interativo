# Relatório de regressão isolada da Astra

Preparação local com mocks determinísticos. Não houve chamadas a provedores reais, alteração de código de produção, prompt, configuração da Astra, dependência ou teste existente.

## Resultados

| Cenário | Cobertura | Resultado verificado |
| --- | --- | --- |
| Troca de persona durante streaming | Novo caso isolado: atravessar Garagem → Cidadela depois do primeiro fragmento | **Reproduzido.** A bolha de streaming permanece como Squanchy, mas a mensagem final aparece como Mr. Poopybutthole. O teste falha intencionalmente. |
| Troca de tema durante streaming | Novo caso isolado: trocar Rick por Escuro depois do primeiro fragmento | **Reproduzido.** A bolha de streaming permanece como Squanchy, mas a mensagem final aparece como Astra. O teste falha intencionalmente. |
| Atribuição correta das respostas | Os dois casos acima verificam nome inicial, nome durante o fluxo e autoria final | **Falha conhecida confirmada** nos dois resultados finais; não foi corrigida nesta tarefa. |
| Mudança de idioma | Novo caso isolado durante um fluxo pendente; mock determinístico para tradução | **Passou.** O pedido conserva `lang: en`; a resposta concluída recebe a tradução portuguesa da interface atual. |
| Arcade somente na versão completa | `tests/arcade.test.mjs`: “arcade actions load and run only in Full Astra and stale async loads are discarded”; integração verifica o contexto completo | Cobertura existente; não duplicada nem reexecutada nesta tarefa. |
| Pergunta sobre projeto sem abrir card | Novo teste isolado com o handler real e Gemini simulado; pergunta direta sobre ROTA, sem histórico de conversa | **Passou.** O perfil e a regra sobre não emitir card para pergunta específica chegam ao prompt. O texto final usa uma resposta fixa do mock; qualidade semântica de geração não é medida. |
| Exemplo simples de programação | Novo caso isolado de renderização de resposta JavaScript simulada; a integração existente também verifica que marcador dentro de código não abre card | **Passou.** O bloco de código é exibido e não cria card de projeto/xadrez. Não avalia a correção de código produzido por um modelo real. |
| Provedor de IA indisponível | `tests/live-endpoint.test.mjs`: “identity replies survive a provider outage while model-dependent requests stay degraded” e “when no completion is available the browser gets a themed reply and no partial text or actions” | Cobertura determinística existente; não duplicada nem reexecutada nesta tarefa. |

Os testes existentes de parser NDJSON, fallback, persona, catálogo e integração estão em `tests/chat-stream.test.mjs`, `tests/assistant-persona.test.mjs`, `tests/projects-catalog.test.mjs` e `tests/astra-integration.test.mjs`. A amostra real de programação e a pergunta sobre ROTA descritas na auditoria anterior são verificações manuais; não equivalem a testes automatizados determinísticos.

## Execução

Na raiz do repositório, com as dependências já instaladas:

```powershell
node --test tests/isolated/astra-streaming.test.mjs tests/isolated/project-question.test.mjs
```

Resultado nesta execução: **5 testes; 3 passaram e 2 falharam**. As duas falhas são os resultados esperados que reproduzem a autoria final incorreta. O código de saída é diferente de zero enquanto o defeito existir. Os testes ficam em `tests/isolated/` e não entram no comando principal existente:

```powershell
node --test tests/*.test.mjs
```

Para executar só os casos sem falha conhecida:

```powershell
node --test --test-name-pattern "language change|simple programming|typed project question" tests/isolated/astra-streaming.test.mjs tests/isolated/project-question.test.mjs
```

## Limitações e próximos passos

- Os mocks validam o contrato de streaming, a captura do idioma, o encaminhamento dos fatos de perfil e a renderização. Não certificam qualidade ou factualidade de respostas de Gemini.
- A autoria incorreta observada ocorre na mensagem final; nos dois casos isolados, o rótulo da prévia durante o streaming permaneceu Squanchy.
- Os testes de indisponibilidade, Arcade e demais integrações existentes foram identificados por inspeção e não repetidos.
- A correção futura deve preservar a identidade do turno desde o envio e usar esse snapshot na bolha final, conforme o contrato e os critérios de aceite em `IMPLEMENTATION_PLAN.md`.
