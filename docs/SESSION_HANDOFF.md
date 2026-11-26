# Passagem de sessão — auditoria local

## Correção da importação da API da Astra

**26 de novembro de 2026.** Removida de `api/chat.js` a atribuição local sem declaração a `GENERATION_CONFIG`. O handler continua usando `generationConfig(name, 4096, fastReply)` para as respostas da Astra.

A importação direta em um novo processo Node retornou um handler válido. Passaram os 25 testes de `tests/live-endpoint.test.mjs` com provedores simulados e o teste `local route runs the real handler` de `tests/dev-api.test.mjs`. A validação usou a importação normal.

A atribuição existia só na árvore de trabalho. O commit registra esta correção e sua validação. O diff local de resolução de perfil segue fora do commit.
