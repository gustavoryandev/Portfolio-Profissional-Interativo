# Revisão de xadrez da Astra — metodologia v1

A Astra usa o Stockfish 19 lite single local, em Web Worker. Todas as explicações e classificações são locais. O botão que chamava /api/chat foi removido; importar PGN, selecionar lances e trocar PT-BR/EN não chama a IA. O xeque-mate recebe uma explicação curta imediatamente, mesmo antes de a revisão completa terminar. As notas não pretendem reproduzir o CAPS2, metodologia do Chess.com: https://support.chess.com/en/articles/8708970-how-is-accuracy-in-analysis-determined.

## Motor e comparação

- Profundo (padrão): `depth 24 nodes 2000000 movetime 12000` por busca.
- Rápido: `depth 16 nodes 200000 movetime 1200` por busca.
- Os limites são simultâneos: alcançar um deles encerra a busca. Não ampliamos o orçamento; não há ganho medido que justifique o custo adicional nesta entrega.
- Cada posição usa MultiPV 2 para comparar alternativas. Só usamos variantes da mesma profundidade efetivamente reportada; resultados `lowerbound`/`upperbound` são descartados. Se a jogada não estiver nas variantes, uma busca `searchmoves` a restringe, partindo da mesma FEN e com o mesmo orçamento total. A busca restrita pode alcançar mais profundidade por ter menos opções; igualdade de orçamento não implica igualdade de profundidade ou confiança.
- As avaliações UCI são relativas ao lado a jogar. Normalizamos para brancas na barra e para quem jogou ao calcular perda. O mate forçado permanece uma unidade separada, não um valor artificial em centipeões. Xeque-mate e empate têm estados terminais explícitos; repetição considera o histórico da partida.
- Profundidades do melhor lance e da jogada aparecem separadamente. Zero corresponde a resultado terminal sem busca. A linha aceita é validada com chess.js (até 16 meios-lances), sempre numa cópia da posição.
- Pausar cancela o Worker atual. Retomar começa após o último lance concluído e reutiliza a posição final anterior; uma busca interrompida pode ser refeita. Trocar modo ou PGN reinicia o cache para não misturar orçamentos.
- O motor permanece fora da thread da interface. Não há enfraquecimento pelo Elo. Tags de Elo, presentes ou ausentes, não mudam avaliação, selos ou notas nesta versão.

## Precisão da Astra

Para avaliações em centipeões, `P(cp) = 100 / (1 + exp(-0.00368208 × cp))` aproxima chances, usando a curva pública de Lichess (https://lichess.org/page/accuracy). Esta curva é apenas uma componente, não a metodologia de precisão Lichess.

Para cada lance, `L = max(0, P(melhor) − P(jogado), (cp_melhor − cp_jogado)/10)`. A componente linear evita que uma perda de peça seja ignorada quando as chances já saturaram perto de 0 ou 100. O melhor lance encontrado recebe perda zero. Uma perda de 300 cp custa pelo menos 30 unidades mesmo em posição já perdida.

Mate: chances 100/0 conforme o vencedor; escapar de um mate forçado favorável para avaliação não-mate custa pelo menos 30 unidades; entrar em mate contra si quando havia alternativa sem derrota forçada custa 100. Mate forçado que permanece favorável não é penalizado por demorar mais. Uma posição já em mate contra si não recebe punição extra só por encurtá-lo. Valores de mate não entram na subtração de centipeões.

Nota por lance: `A = 100 × exp(−L/25)`, limitada a [0,100]. Nota de cada jogador: média de `média aritmética(A)` e `n / soma(1/(A+5)) − 5`. A média harmônica suavizada dá peso às perdas graves sem fazer um único zero zerar toda a partida. Livro fica fora do cálculo; zero lances avaliados aparece como “—”. A interface mostra contagens e notas parciais; o relatório usa todos os lances.

Os parâmetros foram definidos por perdas de avaliação, não ajustados às porcentagens da partida de referência. Não são uma probabilidade empírica de vitória nem um rating.

## Classificação (ordem de prioridade)

1. **Livro:** aresta posição+jogada confirmada na base local; não significa que a abertura seja objetivamente boa.
2. **Brilhante:** melhor lance, a resposta legal da PV captura a peça oferecida na casa de destino (valor ≥3), investimento líquido ≥2 pontos em relação ao material anterior, compensação de pelo menos igualdade segundo o motor. O investimento deve persistir por pelo menos quatro meios-lances da resposta, ou resultar em mate confirmado no fim da variante. Trocas comuns e capturas inventadas não bastam. É um detector conservador: não cobre todos os sacrifícios posicionais, ofertas recusadas ou combinações além da PV.
3. **Ótimo:** melhor lance, segunda opção disponível na mesma profundidade, diferença de pelo menos 15 unidades de perda, e situação crítica: melhor ≥+150 cp e segunda <+50; ou melhor ≥−50 e segunda ≤−150; ou só a melhor preserva mate favorável. Um único lance legal não recebe este selo por ser forçado.
4. **Melhor:** primeira opção do Stockfish sem os requisitos dos selos anteriores.
5. **Capivarada:** perda ≥30 (inclui perdas graves em posições desequilibradas).
6. **Chance Perdida:** perda >6 e oportunidade concreta de ganhar (melhor ≥+150, jogado <+50) ou salvar (melhor ≥−50, jogado ≤−150) escapou. Perdas ≥30 mantêm prioridade como Capivarada. Um mate abandonado recebe a explicação específica de mate perdido.
7. **Excelente:** perda ≤2; **Bom:** ≤6; **Imprecisão:** ≤12; **Erro:** demais perdas abaixo de 30.

Justificativas citam diferença de avaliação, melhor alternativa e primeira resposta legal quando disponíveis. Não afirmamos garfo ou peça pendurada sem um detector específico que prove isso. Livro e mate têm justificativas próprias. Variantes são evidências finitas de uma busca, não prova de toda a árvore de jogo.

## Base local

Fonte: https://github.com/lichess-org/chess-openings — cinco TSVs e `COPYING.txt` em `data/chess-openings/`, CC0. Snapshot baixado durante esta tarefa; os arquivos versionados fixam o conteúdo usado. Gerador: `node scripts/build-chess-book.mjs`. Resultado: 5.579 posições.

A chave é a FEN normalizada de chess.js sem relógios (mantém lado a jogar, roques e en passant legal). A jogada UCI precisa existir nessa posição. Isso permite transposições confirmadas e evita reconhecer Livro por semelhança de SAN ou somente pelo número do lance. Não há rede durante a revisão.

## Reproduzir a validação

- `node --test tests/*.test.mjs`
- `npm run build`
- `node scripts/validate-chess-review.mjs deep` — PGN completo fornecido pelo usuário, 47 meios-lances; grava avaliações/PVs/profundidades/notas em `docs/chess-validation-deep.json`.
- `node scripts/validate-chess-smoke.mjs` — mesmo WASM, Mate do Louco completo, sacrifício Qb8+ da Partida da Ópera, posição de lance único; grava `docs/chess-validation-smoke.json`.

O harness Node usa Worker Threads para executar o arquivo WASM distribuído no site; a aplicação usa Web Workers nativos. Tempos e profundidades variam por CPU, carga concorrente e limite de tempo. Os testes unitários adicionais cobrem transposições, sacrifício rejeitado sem evidência, chance perdida, perdas em posições desequilibradas, cancelamento, retomada, empate, mate e parsing MultiPV.

## Velocidade sem reduzir o orçamento

Cache LRU em memória de até 256 buscas concluídas, identificado por FEN completa (incluindo relógio de 50 lances), modo, MultiPV e restrição de jogada. Reimportar um PGN já revisado ou reencontrar a mesma posição/orçamento reaproveita o resultado exato, sem outra busca. Não guarda falhas ou buscas interrompidas, nem mistura Rápido e Profundo. Não persiste dados do usuário em servidor. O cache é descartado ao recarregar a página. A primeira análise de uma posição inédita conserva o custo integral; não prometemos precisão idêntica com limites menores.
