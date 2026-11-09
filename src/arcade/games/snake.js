import { directions, dot, move, pick, rect, same, stateFor, tile } from './shared.js';

const size = 18;
const unit = 20;
const extent = size * unit;
const goals = [18, 22, 26];

export default function createSnake(difficulty, random = Math.random) {
  const state = { ...stateFor({ food: 0 }), body: [{ x: 8, y: 9 }, { x: 7, y: 9 }, { x: 6, y: 9 }], food: null };
  let direction = 'right';
  const turns = [];
  let elapsed = -0.55;
  const spawn = () => {
    const free = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const point = { x, y };
        if (!state.body.some(segment => same(segment, point))) free.push(point);
      }
    }
    state.food = free.length ? pick(free, random) : null;
    if (!state.food) state.result = 'win';
  };
  spawn();

  return {
    width: extent, height: extent, state,
    press(action) {
      if (!Object.hasOwn(directions, action) || turns.length >= 2) return;
      const previous = turns.at(-1) ?? direction;
      if (directions[previous][0] === directions[action][0] || directions[previous][1] === directions[action][1]) return;
      turns.push(action);
    },
    step(dt) {
      if (state.result) return;
      elapsed += dt;
      const interval = Math.max(0.068, [0.205, 0.158, 0.121][difficulty] - state.metrics.food * 0.003);
      if (elapsed < interval) return;
      elapsed -= interval;
      direction = turns.shift() ?? direction;
      const head = move(state.body[0], directions[direction]);
      const eating = same(head, state.food);
      const body = eating ? state.body : state.body.slice(0, -1);
      if (head.x < 0 || head.x >= size || head.y < 0 || head.y >= size || body.some(point => same(point, head))) {
        state.result = 'loss';
        return;
      }
      state.body = [head, ...body];
      if (eating) {
        state.metrics.food++;
        state.score += 10;
        state.level = 1 + Math.floor(state.metrics.food / 5);
        if (state.metrics.food >= goals[difficulty]) state.result = 'win';
        else spawn();
      }
    },
    render(ctx) {
      rect(ctx, '#0d1820', 0, 0, extent, extent);
      for (let y = 0; y < size; y++) for (let x = y % 2; x < size; x += 2) tile(ctx, '#14232b', x, y, unit, 0);
      if (state.food) {
        const x = (state.food.x + 0.5) * unit;
        const y = (state.food.y + 0.5) * unit;
        dot(ctx, '#ffb979', x, y, 6);
        dot(ctx, '#fff0c8', x - 1, y - 2, 2);
      }
      state.body.forEach(({ x, y }, index) => tile(ctx, index ? '#4abb85' : '#adffc4', x, y, unit, 2));
    },
  };
}
