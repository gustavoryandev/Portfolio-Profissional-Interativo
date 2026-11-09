export const difficulties = ['easy', 'medium', 'hard'];
export const difficultyName = {
  easy: ['Fácil', 'Easy'], medium: ['Normal', 'Medium'], hard: ['Difícil', 'Hard'],
};

export const games = {
  snake: {
    name: 'Snake', color: '#78e7a3', tag: ['Reflexos', 'Reflexes'], difficulty: 'easy', target: 120,
    description: ['Colete energia e faça a serpente crescer sem tocar nas paredes ou no próprio corpo.', 'Collect energy and grow your snake without hitting walls or your own tail.'],
    controls: ['Setas, WASD ou deslize para virar.', 'Use arrows, WASD or swipe to turn.'],
    tip: ['Faça voltas largas e deixe uma rota de fuga antes de alcançar a próxima energia.', 'Take wide turns and leave an escape route before reaching the next pickup.'],
    metrics: { food: ['Energias', 'Pickups'] },
  },
  pong: {
    name: 'Pong', color: '#72d6ff', tag: ['Duelo', 'Duel'], difficulty: 'easy', target: 7,
    description: ['Rebata a bola e marque sete pontos antes da CPU.', 'Return the ball and score seven points before the CPU.'],
    controls: ['↑/↓, W/S ou mova o ponteiro sobre a quadra.', 'Use ↑/↓, W/S or move your pointer over the court.'],
    tip: ['A ponta da raquete muda o ângulo do rebote. Alterne seus ataques entre os cantos.', 'The paddle tip changes the rebound angle. Alternate your shots between the corners.'],
    metrics: { opponent: ['Pontos da CPU', 'CPU points'], rally: ['Maior troca', 'Longest rally'] },
  },
  frogger: {
    name: 'Frogger', color: '#f6bf72', tag: ['Travessia', 'Crossing'], difficulty: 'medium', target: 900,
    description: ['Atravesse estradas e rios para ocupar cinco abrigos antes que o tempo acabe.', 'Cross roads and rivers to reach five shelters before time runs out.'],
    controls: ['Setas, WASD ou deslize para saltar uma casa.', 'Use arrows, WASD or swipe to hop one tile.'],
    tip: ['Espere na margem por um tronco que vá na direção do abrigo desejado.', 'Wait on the bank for a log heading toward your target shelter.'],
    metrics: { homes: ['Abrigos', 'Shelters'], timeouts: ['Tempos esgotados', 'Timeouts'] },
  },
  maze: {
    name: 'Pulse Maze', color: '#ffc768', aliases: ['pac man', 'pacman'], tag: ['Labirinto', 'Maze'], difficulty: 'hard', target: 900,
    description: ['Limpe três labirintos. Use orbes de energia para virar o jogo contra os guardiões.', 'Clear three mazes. Use energy orbs to turn the tables on the sentinels.'],
    controls: ['Setas, WASD ou deslize para preparar a próxima curva.', 'Use arrows, WASD or swipe to queue your next turn.'],
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
