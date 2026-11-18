# Relatório de validação — Astra Chess Review

Partida: seunome6679 × otche_nazs, Chess.com 173277414684. PGN integral fornecido pelo usuário, preservado em `tests/fixtures/seunome6679-otche_nazs.pgn`. Todos os 47 meios-lances foram analisados; nenhum limiar depende desta partida, de seu ID, de um número de lance ou de uma FEN específica.

| Jogador | Precisão da Astra | Referência Chess.com | Diferença | Lances no cálculo | Livro excluído |
|---|---:|---:|---:|---:|---:|
| Brancas | 59,09% | 43,8% | +15,29 pontos percentuais | 21 | 3 |
| Pretas | 50,32% | 35,6% | +14,72 pontos percentuais | 20 | 3 |

As referências são as fornecidas pelo usuário e pela imagem. CAPS2 pertence à metodologia do Chess.com; não tentamos inferir seu algoritmo nem recalibrar os pesos para coincidir com esta amostra. Mesmo categorias com nomes semelhantes têm regras diferentes. As notas da Astra medem a perda em relação à melhor opção encontrada dentro de um orçamento finito, não a verdade absoluta da posição.

| Classificação | Brancas | Pretas |
|---|---:|---:|
| Livro | 3 | 3 |
| Brilhante | 0 | 0 |
| Ótimo | 1 | 2 |
| Melhor | 7 | 0 |
| Excelente | 2 | 2 |
| Bom | 3 | 4 |
| Imprecisão | 0 | 3 |
| Erro | 2 | 4 |
| Chance Perdida | 2 | 2 |
| Capivarada | 4 | 3 |

Os primeiros três lances de cada lado, até 3...c5, são Livro por correspondência na base CC0. As demais classificações vieram das regras gerais. A distribuição difere da imagem do Chess.com, como esperado de critérios, motor e buscas diferentes.

## Buscas e evidências

Profundo: alvo 24, 2.000.000 de nós e 12.000 ms por busca. Tempo total medido para a revisão integral no harness: **697,281 s (11 min 37 s)**. Profundidades das posições de referência variaram de **16 a 24**. A contagem é de profundidade completada com avaliação exata, não do alvo configurado. Carga concorrente de testes/build/navegador pode alterar profundidade e tempo; os resultados não são um benchmark isolado da CPU.

Como teste de regressão específico solicitado: **8...O-O → Capivarada**. Melhor alternativa **8...Bxd2+**, avaliação branca +2,56; roque +6,37, diferença 3,81 pontos contra as pretas. Resposta encontrada na busca restrita: **9.cxd5** (não foi a jogada da partida, que continuou com 9.Bd3). Profundidades: **22** para a busca MultiPV do melhor lance e **20** para a busca restrita ao roque. Ambas partiram da mesma FEN e tiveram os mesmos limites. Os dados completos de todos os lances, não apenas do roque, estão em `chess-validation-deep.json`.

## Outros casos

- Mesmo Stockfish WASM: Mate do Louco completo, incluindo estado de xeque-mate.
- Mesmo Stockfish WASM: **16.Qb8+ Nxb8 17.Rd8#**, da Partida da Ópera, reconhecido como Brilhante com sacrifício real e mate legal.
- Mesmo Stockfish WASM: posição de lance único de rei, classificada como Melhor e não Ótimo por automatismo.
- Testes determinísticos: Chance Perdida de ganhar e de salvar, perdas de 600 cp em posição já ganha ou perdida, sacrifício rejeitado sem PV suficiente, transposições, empate, mate, cache, cancelamento e retomada, MultiPV incompleto e busca restrita.

Resultados reproduzíveis em `chess-validation-smoke.json`; comandos em `chess-review-methodology.md`. `node scripts/check-chess-report.mjs` confirma que o classificador atual reproduz as notas e categorias das avaliações armazenadas.

## Velocidade

Adicionado cache LRU de 256 buscas completas com chave de posição e orçamento. Medição real do mesmo WASM em uma posição: **10.782,92 ms na primeira busca; 0,0845 ms no acesso repetido**, resultado idêntico e somente um Worker criado. Esse é o tempo da chamada ao motor/cache, não o tempo de renderizar ou revisar uma partida inteira. Ganho disponível somente para uma chave já analisada na sessão; uma posição inédita mantém seu orçamento. Dados em `chess-cache-benchmark.json`; reprodução: `node scripts/benchmark-chess-cache.mjs`.

## Interface e limitações

Verificados no navegador local: importação pelo chat, tabuleiro temático Galo, modo Profundo/Rápido, seleção de lances, progresso, notas e contagens, justificativa automática e abertura da variante alternativa. Replay e seletores funcionaram durante a busca. A variante foi compactada em uma faixa horizontal para evitar empurrar a explicação para longe do tabuleiro. Navegação manual usa posições imediatas; animação fica no replay automático.

A sessão de prévia foi encerrada antes da conferência visual específica em viewport móvel e da troca visual para EN. O CSS compacto foi preservado e as traduções PT-BR/EN foram incluídas, mas isso não equivale a uma validação visual final nesses dois cenários.

Build aprovado, com aviso de chunk acima de 500 kB: revisão com base local ~978 kB minificada, ~108 kB gzip, carregada sob demanda. A base completa aumenta o download inicial desse recurso. Não foram alterados limites do modo Profundo para compensar esse custo.

Suíte final: **87 testes aprovados, 0 falhas** (inclui integração PGN e atalhos da Astra).
