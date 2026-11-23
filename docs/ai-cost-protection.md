# IA preservada, prevenção de cobranças

O usuário confirmou que o projeto da chave Gemini está no **Free Tier, sem faturamento**. Não inspecionamos o painel da conta; a confirmação é do usuário. Não alteramos a chave, a conta, o plano nem o faturamento.

## Controles implementados

- IA livre do chat mantida, incluindo ferramentas da Astra, tradução e resumo de histórico.
- Lista explícita de modelos de texto com faixa gratuita documentada: Gemini 3.8 Flash, 3.6 Flash e 3.5 Flash-Lite. A descoberta de modelos não pode introduzir modelos não aprovados, Pro, previews, aliases mutáveis ou modelos novos automaticamente.
- A lista é filtrada novamente antes de executar qualquer geração.
- Cada geração tem até três tentativas sequenciais. O histórico de conversas longas é resumido localmente.
- Perguntas curtas sem dependência de dados ao vivo, pedidos detalhados ou ações começam no Gemini 3.5 Flash-Lite, assim como a tradução. Nas demais solicitações, a ordem é Gemini 3.8 Flash, 3.6 Flash e 3.5 Flash-Lite. Em streaming, o chat troca de modelo após 8 segundos sem texto ou chamada de ferramenta, se houver alternativa. Cada tentativa dura até 18 segundos dentro de um limite compartilhado de 30 segundos de geração. O limite da função de hospedagem é de 60 segundos e também cobre o carregamento de contexto.
- Erros de cota, HTTP 429, pagamento ou faturamento encerram a geração imediatamente. A interface ainda recebe uma resposta de contingência.
- Nenhum upgrade de conta, compra de créditos ou ativação de faturamento é feito pelo código.
- A revisão de xadrez usa somente Stockfish/WASM, base local e explicações determinísticas. Foi removida a chamada de explicação a /api/chat. Os arquivos do motor são servidos pela própria hospedagem; não há serviço de análise pago.

## Limite da garantia

A lista de modelos não converte um projeto pago em gratuito. O requisito para impedir cobranças da Gemini API é manter o projeto da chave no Free Tier e sem faturamento. Ao esgotar a cota, a IA pode ficar temporariamente indisponível. Se o faturamento for ativado fora deste código, o mesmo modelo pode ser cobrado. Não existe uma opção `free=true` usada aqui que substitua a configuração da conta.

Esta proteção não certifica custo zero de hospedagem, domínio, e-mail ou outros serviços do portfólio. Nenhum painel desses provedores foi auditado. Mudanças futuras de preços e elegibilidade exigem nova conferência da lista.

Fontes oficiais consultadas:
- https://ai.google.dev/gemini-api/docs/billing/
- https://ai.google.dev/gemini-api/docs/pricing

## Verificação

Testes com respostas simuladas, sem consumir a chave real: modelos não aprovados são excluídos; quota encerra após uma única chamada; respostas incompletas ainda podem usar fallback aprovado. Integração da revisão verifica importação, seleção de mate e troca PT-BR/EN sem pedido de IA, sem FEN e sem Markdown cru. Para reproduzir: `node --test tests/*.test.mjs` e `npm run build`.
