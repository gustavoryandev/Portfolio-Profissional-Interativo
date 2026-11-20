# IA preservada, prevenção de cobranças

O usuário confirmou que o projeto da chave Gemini está no **Free Tier, sem faturamento**. Não inspecionamos o painel da conta; a confirmação é do usuário. Não alteramos a chave, a conta, o plano nem o faturamento.

## Controles implementados

- IA livre do chat mantida, incluindo ferramentas da Astra, tradução e resumo de histórico.
- Lista explícita de modelos de texto com faixa gratuita documentada: Gemini 3.8 Flash, 3.6 Flash e 3.5 Flash-Lite. A descoberta de modelos não pode introduzir modelos não aprovados, Pro, previews, aliases mutáveis ou modelos novos automaticamente.
- A lista é filtrada novamente antes de executar qualquer geração.
- Máximo de três tentativas por operação de geração (o resumo de histórico é uma operação separada).
- O chat prioriza Gemini 3.8 Flash e 3.6 Flash; Flash-Lite fica como última alternativa. Essa ordem também é preservada após descobrir o catálogo. Em streaming, troca de modelo após 8 segundos sem texto nem chamada de ferramenta, quando houver alternativa. Cada tentativa tem limite de 24 segundos e a geração inteira compartilha um limite de 40 segundos. Esses limites são tetos, não tempos de espera obrigatórios: o texto é enviado assim que chega. A função de hospedagem tem limite de 60 segundos para acomodar também o carregamento de contexto.
- Erros de cota, HTTP 429, pagamento ou faturamento encerram a operação imediatamente, sem tentar outro modelo. Erro desse tipo no resumo também impede iniciar a geração seguinte na mesma requisição.
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
