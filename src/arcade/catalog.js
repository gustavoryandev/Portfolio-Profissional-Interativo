export const difficulties = ['easy', 'medium', 'hard'];
export const difficultyName = {
  easy: ['Fácil', 'Easy'], medium: ['Normal', 'Medium'], hard: ['Difícil', 'Hard'],
};

export const games = {
  snake: {
    name: 'Snake', color: '#78e7a3', tag: ['Reflexos', 'Reflexes'], difficulty: 'easy', target: 120,
    description: ['Colete energia e faça a serpente crescer sem tocar nas paredes ou no próprio corpo.', 'Collect energy and grow your snake without hitting walls or your own tail.'],
    rules: ['Cada energia vale 10 pontos. A serpente acelera conforme cresce. Você pode virar para os lados, mas não voltar na direção oposta.', 'Each pickup is worth 10 points. The snake speeds up as it grows. You can turn left or right, but you cannot reverse direction.'],
    controls: ['Use as setas ou WASD. No celular, use o direcional ou deslize no tabuleiro.', 'Use arrow keys or WASD. On mobile, use the directional pad or swipe on the board.'],
    tip: ['Faça voltas largas e deixe uma rota de fuga antes de alcançar a próxima energia.', 'Take wide turns and leave an escape route before reaching the next pickup.'],
    metrics: { food: ['Energias', 'Pickups'] },
  },
  pong: {
    name: 'Pong', color: '#72d6ff', tag: ['Duelo', 'Duel'], difficulty: 'easy', target: 7,
    description: ['Rebata a bola e marque sete pontos antes da CPU.', 'Return the ball and score seven points before the CPU.'],
    rules: ['Você controla a raquete da esquerda. A bola acelera a cada rebatida e muda de ângulo conforme o ponto de contato. Cada bola que passa pela raquete adversária vale um ponto.', 'You control the left paddle. The ball speeds up with each return and changes angle depending on where it hits the paddle. Each ball past the opposing paddle earns one point.'],
    controls: ['Use ↑/↓ ou W/S, mova o mouse sobre a quadra ou arraste o dedo nela. Os botões ↑/↓ também movem a raquete.', 'Use ↑/↓ or W/S, move the mouse over the court, or drag your finger on it. The ↑/↓ buttons also move the paddle.'],
    tip: ['A ponta da raquete muda o ângulo do rebote. Alterne seus ataques entre os cantos.', 'The paddle tip changes the rebound angle. Alternate your shots between the corners.'],
    metrics: { opponent: ['Pontos da CPU', 'CPU points'], rally: ['Maior troca', 'Longest rally'] },
  },
  frogger: {
    name: 'Frogger', color: '#f6bf72', tag: ['Travessia', 'Crossing'], difficulty: 'medium', target: 900,
    description: ['Atravesse estradas e rios para ocupar cinco abrigos antes que o tempo acabe.', 'Cross roads and rivers to reach five shelters before time runs out.'],
    rules: ['Desvie dos carros e use os troncos para cruzar o rio. Cada chegada a um abrigo livre reinicia o cronômetro. Preencha os cinco para avançar. Se o tempo acabar, você perde uma vida.', 'Dodge traffic and ride logs across the river. Reaching an empty shelter resets the timer. Fill all five to advance. Running out of time costs a life.'],
    controls: ['Use as setas, WASD, o direcional na tela ou deslize no tabuleiro para saltar uma casa.', 'Use arrow keys, WASD, the on-screen directional pad, or swipe on the board to hop one tile.'],
    tip: ['Espere na margem por um tronco que vá na direção do abrigo desejado.', 'Wait on the bank for a log heading toward your target shelter.'],
    metrics: { homes: ['Abrigos', 'Shelters'], timeouts: ['Tempos esgotados', 'Timeouts'] },
  },
  maze: {
    name: 'Pulse Maze', color: '#ffc768', aliases: ['pac man', 'pacman'], tag: ['Labirinto', 'Maze'], difficulty: 'hard', target: 900,
    description: ['Limpe três labirintos. Use orbes de energia para virar o jogo contra os guardiões.', 'Clear three mazes. Use energy orbs to turn the tables on the sentinels.'],
    rules: ['Recolha todos os pulsos para avançar. Os quatro guardiões saem da base aos poucos. Um orbe grande permite capturá-los por alguns segundos. Fora desse efeito, o contato custa uma vida.', 'Collect every pulse to advance. The four sentinels leave their home in stages. A large orb lets you catch them for a few seconds. Otherwise, contact costs a life.'],
    controls: ['Use as setas, WASD, o direcional na tela ou deslize para preparar a próxima curva.', 'Use arrow keys, WASD, the on-screen directional pad, or swipe to queue the next turn.'],
    tip: ['Guarde um orbe para quando os guardiões fecharem duas saídas. Depois de comê-los, eles voltam à base.', 'Save an orb for when sentinels cut off two exits. After you catch them, they return to base.'],
    metrics: { pellets: ['Pulsos', 'Pulses'], sentinels: ['Guardiões', 'Sentinels'] },
  },
  blocks: {
    name: 'Orbit Blocks', color: '#c7a3ff', aliases: ['tetris'], tag: ['Puzzle', 'Puzzle'], difficulty: 'medium', target: 1500,
    description: ['Encaixe sete tipos de blocos e limpe 40 linhas antes de atingir o topo.', 'Fit seven types of blocks and clear 40 lines before reaching the top.'],
    controls: ['←/→ move, ↓ desce, ↑/X gira, Z gira ao contrário, Espaço solta e C guarda.', '←/→ move, ↓ soft drops, ↑/X rotates, Z reverses, Space drops and C holds.'],
    tip: ['Use a sombra para prever o encaixe. Guarde a peça longa para quando tiver um poço de quatro linhas.', 'Use the ghost to check placement. Hold the long piece until you have a four-line well.'],
    metrics: { lines: ['Linhas', 'Lines'], tetrises: ['Quadras', 'Four-line clears'] },
  },
};

export const gameIds = Object.keys(games);
export const isGame = value => typeof value === 'string' && Object.hasOwn(games, value);
export const arcadeHref = (game, challenge = false) => '/chat?arcade='
  + (isGame(game) ? game + (challenge ? '&challenge=1' : '') : '1');
