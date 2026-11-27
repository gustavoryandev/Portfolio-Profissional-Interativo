# Contrato de autoria das personas da Astra

## Identidade do turno

`ChatPage` captura um objeto imutável `author` com `turnId`, `attemptId`, `personaId`, `theme`, `dimension`, `surface` e `language`. O ID `astra` representa explicitamente a assistente padrão. O nome é resolvido pelo ID no idioma da interface. A imagem usa o mesmo ID e, para a Astra padrão, o tema capturado. Assim, o nome de Meeseeks pode ser localizado em PT/EN mantendo a mesma autoria, e um avatar do Galo permanece ligado ao tema em que respondeu.

| Caminho | Contrato |
| --- | --- |
| Resposta conversacional, local ou determinística | Enviar o mesmo autor à espera, à prévia, à bolha final e, quando presente, ao retorno do Laboratório. A saudação e o cabeçalho acompanham a interface atual. |
| Histórico sem autor recuperável | Usar a apresentação genérica da Astra. O ID de uma persona temática nunca é inferido a partir do cenário atual. |
| Continuação do Laboratório | Reutilizar turno, persona, aparência, superfície e idioma de origem. Incrementar `attemptId` para a segunda solicitação. A execução de uma revisão ainda exige confirmar a versão apresentada. |
| Retentativas internas do Gemini | O servidor sinaliza `reset` no mesmo transporte NDJSON. O parser descarta ações da tentativa descartada, e a prévia limpa o texto anterior. O ID de tentativa no cliente identifica a solicitação de transporte. |
| Cancelamento | Liberar o compositor, descartar eventos e ações da tentativa anterior e excluir a resposta cancelada do histórico enviado ao modelo. O fragmento visível, quando presente, retém o autor e o idioma originais. |
| Próximo envio | Resolver um novo autor a partir da aparência atual. A conversa e o estado do Laboratório continuam na mesma sessão entre as superfícies. |

[Envio e histórico](../src/pages/ChatPage.jsx) · [Prévia](../src/components/StreamingReply.jsx) · [Bolha](../src/components/MessageBubble.jsx) · [Parser](../src/services/chatStream.js)

## Como estender o contrato

1. Estender o resolvedor compartilhado `assistantPersonaId` para a combinação aprovada de tema, dimensão e superfície. O servidor resolve a mesma combinação permitida a partir de `appearance` e `surface`. Instruções e nomes arbitrários do cliente seguem fora desse contrato.
2. Cadastrar o perfil permitido no servidor e os textos PT/EN. Para novas famílias, usar o namespace e caminhos de imagem planejados na especificação. Preservar os IDs, chaves e avatares atuais ao migrar o resolvedor. Para representação animada, garantir geometria cadastrada ou usar retrato estático.
3. Limitar a persona à apresentação e à voz. Usar os mesmos fatos de perfil, políticas de ferramentas, limites de modelos, validações de ações e permissões do Laboratório.
4. Rodar os testes de identidade do servidor e a matriz de regressão do cliente. A primeira resposta do cenário novo deve usar o novo ID. As respostas anteriores e as reapresentações em PT/EN devem continuar ligadas ao ID de origem.

[Resolvedor compartilhado](../src/data/assistantPersonas.js) · [Aparência](../src/context/AssistantAppearanceContext.jsx) · [Perfis server-side](../server/assistantPersona.js) · [Especificação futura](NEW_PERSONAS_SPEC.md)
