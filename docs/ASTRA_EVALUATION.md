# Avaliação da Astra na Fase 01

## Auditoria das integrações na demonstração oficial · 28 de novembro de 2026

A worktree `codex/release-integration` atende `http://127.0.0.1:5178` em loopback. As demonstrações anteriores das portas 5176, 5177 e 5183 foram encerradas. Antes do encerramento, 5177 e 5183 retornavam `not_configured` para GitHub e WakaTime porque a worktree de La Casa tinha somente a configuração do Gemini. A origem da sessão manual anterior não pôde ser confirmada retroativamente. O mesmo aviso foi reproduzido nos servidores antigos. Na 5178, Astra convencional e Morty Maligno usam a mesma worktree, o mesmo processo Vite, o mesmo `/api/chat` e o mesmo cache das fontes.

Foi comparada a configuração efetiva com a do checkout original. Os dois checkouts ativos tinham o mesmo conteúdo efetivo em `.env.local`, sem `.env` por modo ou variáveis do processo que substituíssem as integrações verificadas. GitHub, WakaTime, Gemini, Spotify e Canvas tinham configuração efetiva. As últimas declarações do reCAPTCHA e da chave privada do EmailJS eram vazias em ambos. Vite injeta a configuração pública no frontend e o middleware local carrega o handler com o ambiente da própria worktree. A verificação registrou presença e equivalência, sem registrar valores. [Demonstração oficial](http://127.0.0.1:5178/chat)

### Perguntas digitadas e equivalência

- Antes do ajuste, “Quanto tempo ele passou programando?” chegava ao Gemini sem WakaTime, tanto na Astra convencional quanto em Morty Maligno. A menção explícita ao WakaTime carregava a fonte e mostrava o mesmo total. O roteamento compartilhado passou a reconhecer pergunta de duração e uso de linguagens em PT/EN e a aguardar a busca fria dentro do limite definido. O prompt distingue integração sem configuração de fonte ausente, em processamento ou temporariamente indisponível.
- Na demonstração oficial, a pergunta reformulada consultou o WakaTime com o histórico vazio e gerou resposta para Astra convencional e Morty Maligno. A amostra inicial de 136 h 47 min era de um snapshot anterior. A primeira verificação após a correção retornou 136 h 59 min, igual para ambos. Na retomada de 28 de novembro, o mesmo fluxo com Morty retornou 137 h 35 min com o Gemini real.
- A pergunta “Quantos commits o Gustavo fez nos últimos 12 meses?” havia devolvido o aviso genérico na compacta. Na retomada, a requisição equivalente completou com Gemini e o GitHub confirmou 560 commits. O motivo específico da falha transitória anterior não foi recuperado. Essa pergunta objetiva passou a usar diretamente o total do GitHub. O reteste manual no navegador mostrou 560 nas duas superfícies, sem card prévio. A proteção de falhas permanece ativa quando o GitHub não retorna um total.
- A matriz real enviou perguntas digitadas com histórico vazio pelas duas superfícies dos temas convencionais, Garagem, Cidadela, Além da Curva, O Assalto e O Plano. Em todas as 12 combinações, o pedido de commits retornou 560 e o pedido de métricas detalhadas recebeu os mesmos snapshots de GitHub e WakaTime, com os dados e os cards correspondentes. A regressão com dados simulados inspecionou o contexto enviado ao Gemini para as 12 combinações e confirmou o mesmo conteúdo profissional e a mesma coleta independente de card.

### Inventário e resultado real

| Integração | Estado na demonstração 5178 | Evidência e limite |
| --- | --- | --- |
| Gemini | Operacional | Respondeu pelo chat a perguntas abertas e de métricas, incluindo Morty. A falha transitória do turno antigo de commits não foi reproduzida na retomada. |
| GitHub | Operacional | `refreshContext` retornou HTTP 200 e `ok`. O navegador exibiu a resposta de 560 commits na conversa das duas superfícies. A matriz de 12 combinações confirmou o mesmo snapshot. |
| WakaTime | Operacional | `refreshContext`, detalhe de sete dias e atividade retornaram `ok`. A pergunta livre consultou o provedor sem card prévio. A matriz de 12 combinações recebeu o mesmo total e timestamp. |
| Chess.com | Operacional | `refreshContext` retornou HTTP 200, `ok` e perfil. |
| Stockfish | Operacional | JavaScript e WASM servidos com HTTP 200. No navegador, o PGN `1. e4` concluiu a análise em modo rápido. O revisor avalia as posições pelo motor antes de classificar o lance como Livro. |
| Spotify | Operacional | `refreshContext` retornou HTTP 200 e `ok` com dados do serviço. |
| Canvas LMS | Operacional | `refreshContext` retornou HTTP 200 e `ok` com o formato de cursos. Nenhum conteúdo, identificador ou dado privado foi registrado. |
| ESPN do Atlético | Operacional | `refreshContext` retornou HTTP 200 e `ok` com a coleção da agenda. |
| Laboratório JavaScript, Python e Java | Operacional | A execução real no navegador retornou `42` em cada linguagem. JavaScript usou o worker local, Python carregou Pyodide e Java usou Wandbox com um programa de teste sem dados do usuário. A primeira tentativa Java com classe pública foi rejeitada porque Wandbox usa `prog.java`. O código com classe sem o modificador público compilou e executou. |
| Tradução | Operacional | `action: translate` retornou HTTP 200, texto em inglês e preservou o trecho de código. |
| EmailJS e reCAPTCHA v3 | Fora da validação de entrega | A consulta sem submissão retornou HTTP 503 `unavailable`. As declarações efetivas estão vazias e a ativação do reCAPTCHA segue reservada. A verificação de CAPTCHA e as chamadas do EmailJS foram cobertas por fixtures, sem envio real. |
| Supabase | Sem integração ativa | A migração do Arcade existe no repositório. A aplicação desta demonstração não chama Supabase. |
| Áudio temático | Arquivos acessíveis | HTTP 200 para o trecho Apple configurado pelo módulo servido na 5178 e para o áudio local da mansão. Reprodução sonora não foi reensaiada nesta rodada. |

Quando uma fonte falha, a resposta de métricas anuncia apenas os dados recebidos, exibe um aviso por causa e diferencia configuração ausente, acesso negado, limite, consulta pendente, serviço indisponível e ausência de dados. Os testes simulam falhas e o caso de zero legítimo. A tabela registra os ensaios reais separadamente. [Matriz de regressão](ASTRA_REGRESSION_REPORT.md)

## Correção das perguntas livres · 27 de novembro de 2026

A causa reproduzida foi a ausência de `GEMINI_API_KEY` no ambiente da worktree de La Casa de Papel. Na porta 5183, o mesmo “fala ai” retornou JSON degradado sem modelo em 4–113 ms para a Astra compacta, o Professor e a Pessoa-Pássaro. Os dois textos de persona eram idênticos aos relatos. Na mesma porta e no mesmo código, a adição exclusiva de `GEMINI_API_KEY` em `.env.local`, ignorado pelo Git, fez a pergunta do Professor completar NDJSON com `gemini-3.5-flash-lite` em cerca de 1,2 s. Berlim também respondeu na porta 5177. A integração e a worktree de Rick já encontravam a configuração no início da investigação. O endpoint lê a variável do processo, com `.env.local` da própria worktree como fonte local.

| Referência | Evidência com o Gemini real |
| --- | --- |
| `main` em `e13942d` | Handler exportado para pasta temporária respondeu “fala ai” por NDJSON com `done` e `gemini-3.5-flash-lite`, usando a configuração via ambiente do processo. |
| Astra Fase 01 em `5637d64` | Mesma comparação confirmou NDJSON, `done` e `gemini-3.5-flash-lite`. As amostras históricas de perfil, Laboratório e contexto continuam registradas abaixo. |
| Rick em `78d1adc`, porta 5176 | Pessoa-Pássaro respondeu “fala ai” em NDJSON com `gemini-3.5-flash-lite`. |
| La Casa de Papel em `64b53d3`, portas 5177/5183 | A configuração local, aplicada sem alterar o código da branch, restabeleceu o streaming de Berlim e do Professor. |
| Integração a partir de `4bff5c9`, porta 5178 | Na comparação inicial, “Fala alguma coisa legal” completou em cerca de 1,2 s e “wakatime” em cerca de 10,6 s. Na revisão corrigida foram verificadas as duas superfícies no navegador. |
| Produção publicada | “Fala alguma coisa legal” completou em cerca de 1,5 s com `gemini-3.5-flash-lite`. “wakatime” completou em cerca de 11,7 s com `gemini-3.6-flash`. O atalho de projetos retornou JSON local. O ensaio não pressupõe o SHA do deploy. [Produção](https://gustavoryan.vercel.app/chat) |

O clique em um atalho sinaliza `predefinedSuggestion`. Várias sugestões têm resposta determinística e os atalhos de recursos podem enviar ações fixas. O texto exato sobre projetos também foi reconhecido quando digitado. A pergunta reformulada sobre Spring Boot foi ao Gemini, que citou o GEOSOLAR como exemplo. Para texto aberto, o servidor fornece perfil, histórico, idioma, persona e ferramentas disponíveis, valida a geração e entrega os eventos NDJSON. A ausência de configuração interrompia esse caminho antes de qualquer chamada ao Gemini, enquanto os cards determinísticos continuavam funcionando. Nenhuma evidência ligou a falha ao merge dos temas. As chamadas reais da amostra concluíram sem indicação de 401, 403 ou 429 ao cliente. O painel de cotas do projeto ficou fora do ensaio. [Limites oficiais do Gemini](https://aistudio.google.com/docs/rate-limits)

Foram confirmadas **14 respostas com modelo no navegador** após a mudança, enviadas pelo campo de texto. A amostra verificou pertinência do conteúdo e autoria exibida, além do status HTTP.

| Tema ou dimensão | Astra compacta | Astra completa |
| --- | --- | --- |
| Convencional | Astra respondeu a um pedido informal de curiosidade sobre programação. | Astra explicou REST, deu um exemplo de GET em continuação e respondeu sobre o tempo de código com o período. |
| Garagem | Sr. Meeseeks apresentou um exemplo Java para somar dois números. | Pessoa-Pássaro respondeu a “fala ai”. |
| Cidadela | Mr. Meeseeks respondeu em inglês sobre ROTA, descreveu os dados conhecidos e delimitou o que não podia confirmar sobre a migração. | Sr. Bunda Cagada explicou o papel do Spring Boot. |
| Além da Curva | Evil Rick explicou em inglês o que faz um endpoint REST com uma analogia. | Morty Maligno descreveu a formação de Gustavo e declarou que a motivação pela escolha do curso não estava documentada. |
| O Assalto | Berlim entendeu a pergunta com erro de digitação sobre a formação de Gustavo. | Professor explicou o escopo conhecido de ROTA e suas migrações SQL. |
| O Plano | Berlim comparou tipagem em Java e Python. | Professor respondeu ao termo “wakatime” e indicou que a fonte estava desconhecida naquele turno. A consulta direta posterior retornou `ok`. |

O clique e a digitação da sugestão de métricas exibiram os cards de GitHub e WakaTime. A reformulação sobre tempo de código gerou texto e apresentou o mesmo total de 136 h 47 min confirmado pela integração. O texto gerado citou a data final no fuso UTC do payload. A faixa da API excluía o dia corrente no fuso configurado. A atualização direta das fontes respondeu HTTP 200 e marcou GitHub e WakaTime como `ok`. Cancelamento, troca de persona, respostas tardias, proteção de ações, cota e recuperação após erro continuam cobertos por simulações. A amostra real foi pontual. [Matriz](ASTRA_REGRESSION_REPORT.md)

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
