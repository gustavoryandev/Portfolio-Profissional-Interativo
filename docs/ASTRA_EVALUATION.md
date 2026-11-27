# Avaliação da Astra na Fase 01

27 de novembro de 2026 · Branch `codex/astra-phase-01` · Demonstração local em [Astra completa](http://127.0.0.1:5174/chat).

## Problemas corrigidos

| Evidência | Causa | Correção |
| --- | --- | --- |
| A resposta iniciada por Squanchy terminava assinada por Mr. Poopybutthole ou Astra após trocar dimensão ou tema. A mudança da compacta para a completa também afetava a autoria. | A bolha final consultava a persona ativa e a mensagem concluída não guardava o autor. | Capturar o autor no envio e reaproveitar o snapshot na espera, no streaming, na resposta final, nas mensagens locais e na continuação do Laboratório. |
| Um pedido antigo podia terminar depois de Parar. Uma abertura atrasada da completa podia remover a rota do Arcade já aberto. | A trava e a limpeza da resposta não distinguiam operações. A abertura consultava a rota capturada no envio. | Vincular eventos, ações e limpeza ao turno ativo. Cancelar a leitura e liberar um novo envio imediatamente. Consultar a rota atual antes de abrir a completa novamente. |
| Uma ação atrasada do Laboratório podia ler o rascunho atual depois de o usuário mudar o editor ou interromper uma execução iniciada após o pedido. | O plano inicial usava o editor disponível ao chegar, sem compará-lo ao estado de origem. | Conferir linguagem, exemplo, revisão e, para Parar, a execução de origem. A revisão continua vinculada à versão lida e depende da aprovação do visitante. |
| Ao trocar dimensão, superfície e idioma, o navegador chegou a exibir a saudação inglesa da Cidadela sob Meeseeks. O tratamento local de erro do Arcade também podia divergir do idioma marcado no turno. | A saudação já localizada chegava à bolha sem idioma-fonte e ativava uma tradução desnecessária. O tratamento de erro do Arcade consultava a seleção de idioma depois da espera. | Identificar a saudação pelo idioma em que já foi renderizada. Resolver o erro no idioma do pedido e usar `chat.erro` para exibir a tradução local no idioma atual. |
| “Quero o código Python” sem referência levou Gemini a selecionar Python e pedir o código do editor. | A política de ferramentas não distinguia um pedido de código por linguagem de uma referência explícita ao editor ou a um exemplo. | Explicitar quando pedir esclarecimento, a ordem dos exemplos do Laboratório e a diferença entre rascunho, adaptação, fonte de repositório e código gerado. |
| Uma pergunta sobre formação, tecnologias, objetivos e experiências retornou somente a apresentação do card de proficiência. | O atalho de proficiência se adiantava à resposta para perguntas profissionais compostas. | Encaminhar a pergunta composta ao fluxo com os fatos de perfil e manter o card para pedidos específicos de proficiência. |

## Avaliação com Gemini real

Foram executadas 13 solicitações ao modelo no ambiente local. Doze retornaram texto ou plano de ferramenta completo. Uma solicitação JSON sobre Python com referência anterior recebeu HTTP 500 após `Gemini response timeout`. A repetição pelo transporte NDJSON usado pelo chat foi concluída. Houve retentativas do provedor registradas como respostas incompletas ou indisponíveis. Os casos de cota, falta de conclusão, substituição de resposta parcial e recuperação têm cobertura controlada no endpoint.

| Cenário | Resultado observado |
| --- | --- |
| ROTA sem abrir card, na compacta de Meeseeks | Identificou o uso de Flyway nas migrações SQL e apresentou o ROTA como projeto em desenvolvimento. |
| Continuação em inglês na Cidadela completa | Resolveu “that tool” como Flyway, informou que não havia certificação confirmada no perfil e gerou uma função JavaScript que duplica um inteiro. Usou a apresentação da Cidadela. |
| Formação, tecnologias, objetivos e experiências | Depois do ajuste, a resposta citou Engenharia de Software na PUC Minas, tecnologias cadastradas, a busca pela primeira oportunidade e o voluntariado documentado. Os percentuais exibidos vieram do cadastro de proficiências. |
| “Quero o código Python”, sem referência | Antes, acionou seleção e leitura do editor. Depois, pediu ao visitante que escolhesse entre os exemplos e código livre, sem ações. |
| “Quero o código Python”, com referência ao Carrinho de Compras | O plano NDJSON pediu abertura do Laboratório, exemplo `cart`, linguagem Python e leitura do código. |
| “Me explica o código do projeto 2 do laboratório” | Com e sem referência anterior, os planos observados selecionaram `cart` e pediram leitura. A segunda chamada com o exemplo público explicou cálculo, validações e estoque a partir do código Python e o identificou como adaptação. |
| Conversão de JavaScript para Python e Java | Gerou implementações curtas para duplicar um inteiro, indicou o resultado esperado `6` para `3` e informou que o Laboratório executa Python, JavaScript e Java. A resposta distinguiu o cálculo esperado de execução e indicou a limitação de TypeScript. |

A preparação de resolução de perfil em `api/chat.js` permanece local. O catálogo atual fornece os fatos de projetos. A universalização dos dossiês segue para a etapa prevista no plano. O teste de ROTA verifica uma pergunta específica. A amostra de dois turnos com troca de idioma, cenário e persona manteve a referência factual e a apresentação esperada. Conversas longas representativas e o comportamento semântico sob combinações mais amplas ficam em aberto. [Catálogo](../src/data/perfil.json) · [Política de ferramentas](../server/portfolioTools.js)

## Demonstração no navegador

- Envio na compacta, abertura da completa por comando da Astra, troca Garagem → Cidadela, idioma PT → EN, fechamento e reabertura da compacta e retorno ao portfólio. As bolhas preservaram os autores e a saudação final acompanhou a interface atual.
- As duas superfícies mantiveram seus compositores utilizáveis em viewport de 390 × 844. O Arcade abriu na completa. A compacta manteve o atalho e os encaminhamentos à completa. O tabuleiro de Xadrez foi aberto pelo chat. A análise de partidas teve cobertura automatizada.
- O JavaScript executado no Laboratório retornou `6`. A saída e o código continuaram disponíveis após navegar entre compacta, completa e portfólio. O worker Python carregou e também retornou `6`. Os casos com edição e confirmação do Laboratório usam mocks de transporte e worker.
- O console do navegador não registrou erros ou avisos nos pontos inspecionados. As verificações responsivas foram realizadas em viewport emulado.
- A atualização real de contexto retornou HTTP 200 e estado `ok` para GitHub, WakaTime, Canvas e Chess.com. WakaTime também indicou `processing`. Foram registrados somente estados das fontes.

O ensaio manual não executou Java no Wandbox, não realizou uma partida longa no Arcade e não submeteu contato. A validação das integrações foi local, com leituras limitadas. A suíte determinística verifica proteções e contratos, enquanto a amostra real registra a qualidade observada das respostas acima. [Matriz de regressão](ASTRA_REGRESSION_REPORT.md)

## Situação para aprovação

A Fase 01 está validada no escopo local. A recomendação é iniciar a terceira dimensão após a aprovação da demonstração pelo responsável pelo portfólio. O aviso conhecido de tamanho de chunk segue no build. As pendências de distribuição de mídia, contato e contextualização editorial constam no plano e nos problemas conhecidos. [Passagem de sessão](SESSION_HANDOFF.md) · [Problemas conhecidos](KNOWN_ISSUES.md)
