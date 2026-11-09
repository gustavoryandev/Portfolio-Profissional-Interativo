import { rect, stateFor, tile } from './shared.js';

const cols = 10;
const rows = 20;
const unit = 16;
const width = 278;
const height = rows * unit;
const shapes = {
  I: ['....', '####', '....', '....'],
  O: ['##', '##'],
  T: ['.#.', '###', '...'],
  S: ['.##', '##.', '...'],
  Z: ['##.', '.##', '...'],
  J: ['#..', '###', '...'],
  L: ['..#', '###', '...'],
};
const colors = { I: '#74def1', O: '#ffdc71', T: '#c2a2ff', S: '#78e5a6', Z: '#ff8396', J: '#829bff', L: '#ffb06d' };
const types = Object.keys(shapes);
// SRS offset tables adapted from Tetr.js (MIT). See public/THIRD_PARTY_NOTICES.txt.
const offsets = [
  [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
  [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
  [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
];
const offsetsI = [
  [[0, 0], [-1, 0], [2, 0], [-1, 0], [2, 0]],
  [[-1, 0], [0, 0], [0, 0], [0, -1], [0, 2]],
  [[-1, -1], [1, -1], [-2, -1], [1, 0], [-2, 0]],
  [[0, -1], [0, -1], [0, -1], [0, 1], [0, -2]],
];
const points = Object.fromEntries(types.map(type => {
  const grid = shapes[type];
  const turns = [grid.flatMap((row, y) => [...row].flatMap((cell, x) => cell === '#' ? [[x, y]] : []))];
  for (let i = 1; i < 4; i++) turns.push(type === 'O' ? turns[0] : turns[i - 1].map(([x, y]) => [grid.length - 1 - y, x]));
  return [type, turns];
}));
const empty = () => Array(cols).fill(null);

export default function createBlocks(difficulty, random = Math.random) {
  const state = { ...stateFor({ lines: 0, tetrises: 0 }), board: Array.from({ length: rows }, empty), active: null, next: null, held: null };
  let bag = [];
  let gravity = 0;
  let grounded = 0;
  let resets = 0;
  let canHold = true;

  function draw() {
    if (!bag.length) {
      bag = [...types];
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
    }
    return bag.pop();
  }

  const cells = ({ type, x, y, turn }) => points[type][turn].map(([dx, dy]) => [x + dx, y + dy]);
  const valid = piece => cells(piece).every(([x, y]) => x >= 0 && x < cols && y < rows && (y < 0 || !state.board[y][x]));
  const down = piece => ({ ...piece, y: piece.y + 1 });
  function spawn(held) {
    const type = held ?? state.next;
    if (!held) state.next = draw();
    state.active = { type, x: type === 'O' ? 4 : 3, y: -1, turn: 0 };
    gravity = grounded = resets = 0;
    if (!valid(state.active)) state.result = 'loss';
  }
  state.next = draw();
  spawn();

  function ghost() {
    let landing = state.active;
    while (valid(down(landing))) landing = down(landing);
    return landing;
  }

  function lock() {
    const placement = cells(state.active);
    if (placement.some(([, y]) => y < 0)) { state.result = 'loss'; return; }
    for (const [x, y] of placement) state.board[y][x] = state.active.type;
    const remaining = state.board.filter(row => row.some(cell => !cell));
    const lines = rows - remaining.length;
    state.board = [...Array.from({ length: lines }, empty), ...remaining];
    state.score += [0, 100, 300, 500, 800][lines] * state.level;
    state.metrics.lines += lines;
    if (lines === 4) state.metrics.tetrises++;
    state.level = 1 + Math.floor(state.metrics.lines / 8);
    if (state.metrics.lines >= 40) { state.result = 'win'; return; }
    canHold = true;
    spawn();
  }

  function shift(piece) {
    if (!valid(piece)) return false;
    if (!valid(down(state.active)) && resets < 12) { grounded = 0; resets++; }
    state.active = piece;
    return true;
  }

  function rotate(delta) {
    const { type, turn } = state.active;
    if (type === 'O') return;
    const piece = { ...state.active, turn: (turn + delta + 4) % 4 };
    const table = type === 'I' ? offsetsI : offsets;
    const from = table[turn];
    const to = table[piece.turn];
    // The local matrices already rotate about the natural pivot, so normalize the origin.
    const originX = from[0][0] - to[0][0];
    const originY = from[0][1] - to[0][1];
    from.some(([x, y], index) => shift({
      ...piece, x: piece.x + x - to[index][0] - originX, y: piece.y + y - to[index][1] - originY,
    }));
  }

  function preview(ctx, type, top, palette) {
    rect(ctx, palette?.surface ?? '#23283f', 174, top, 90, 58);
    if (type) for (const [x, y] of points[type][0]) rect(ctx, colors[type], 190 + x * 13, top + 10 + y * 13, 11, 11);
  }

  return {
    width, height, state,
    press(action) {
      if (state.result) return;
      if (action === 'left' || action === 'right') shift({ ...state.active, x: state.active.x + (action === 'left' ? -1 : 1) });
      if (action === 'up') rotate(1);
      if (action === 'reverse') rotate(-1);
      if (action === 'down' && shift(down(state.active))) { state.score++; gravity = 0; }
      if (action === 'drop') {
        const landing = ghost();
        state.score += (landing.y - state.active.y) * 2;
        state.active = landing;
        lock();
      }
      if (action === 'hold' && canHold) {
        const held = state.held;
        state.held = state.active.type;
        canHold = false;
        if (held) spawn(held);
        else spawn();
      }
    },
    step(dt) {
      if (state.result) return;
      gravity += dt;
      const interval = Math.max(0.07, [0.86, 0.65, 0.43][difficulty] * 0.76 ** (state.level - 1));
      if (gravity >= interval) {
        gravity -= interval;
        if (valid(down(state.active))) state.active = down(state.active);
      }
      if (valid(down(state.active))) grounded = 0;
      else if ((grounded += dt) >= 0.44) lock();
    },
    render(ctx, en, palette) {
      rect(ctx, palette?.background ?? '#141a2b', 0, 0, width, height);
      state.board.forEach((row, y) => row.forEach((type, x) => tile(ctx, colors[type] ?? palette?.surface ?? '#1d263a', x, y, unit)));
      if (!state.result) {
        for (const [x, y] of cells(ghost())) if (y >= 0) tile(ctx, palette?.muted ?? '#51607b', x, y, unit, 3);
        for (const [x, y] of cells(state.active)) if (y >= 0) tile(ctx, colors[state.active.type], x, y, unit);
      }
      ctx.font = '700 11px system-ui';
      ctx.fillStyle = palette?.ink ?? '#d2d9ee';
      ctx.fillText(en ? 'NEXT' : 'PRÓXIMA', 174, 23);
      ctx.fillText(en ? 'HOLD' : 'RESERVA', 174, 124);
      preview(ctx, state.next, 31, palette);
      preview(ctx, state.held, 132, palette);
    },
  };
}
