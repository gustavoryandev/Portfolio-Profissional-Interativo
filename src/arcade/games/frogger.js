import { directions, dot, move, rect, stateFor, wrap } from './shared.js';

const columns = 13;
const rows = 11;
const unit = 30;
const homes = [2, 6, 10];
const lanes = {
  1: [1.3, 2.8, 4.4, 0.2], 2: [-1.75, 3, 5, 2], 3: [1, 2.6, 4.4, 1], 4: [-1.4, 3.1, 5, 3],
  6: [2.0, 1.4, 4.4, 1], 7: [-2.8, 1.2, 4.4, 0.2], 8: [1.75, 2, 5, 3], 9: [-2.2, 1.3, 4.4, 1.5],
};
const spawn = () => ({ x: 6.5, y: 10 });

export default function createFrogger(difficulty) {
  const state = { ...stateFor({ homes: 0 }, 3), frog: spawn(), filled: [], travel: 0 };
  let furthest = 10;
  let grace = 0;
  const speed = row => lanes[row][0] * ([0.8, 1, 1.2][difficulty] + (state.level - 1) * 0.22);

  function objects(row) {
    const [, length, gap, phase] = lanes[row];
    const count = Math.ceil(columns / gap) + 1;
    const period = count * gap;
    return Array.from({ length: count }, (_, i) => ({
      left: wrap(i * gap + phase + speed(row) * state.travel + length, period) - length,
      length,
    }));
  }

  function reset() {
    state.frog = spawn();
    furthest = 10;
    grace = 0.35;
  }

  function loseLife() {
    state.lives--;
    if (state.lives === 0) state.result = 'loss';
    else reset();
  }

  function hazard() {
    const { x, y } = state.frog;
    if (!lanes[y]) return false;
    const river = y < 5;
    const intersects = objects(y).some(({ left, length }) => river
      ? x > left + 0.08 && x < left + length - 0.08
      : x + 0.26 > left && x - 0.26 < left + length);
    return x < 0.26 || x > columns - 0.26 || (river ? !intersects : intersects);
  }

  return {
    width: columns * unit, height: rows * unit, state,
    press(action) {
      if (!Object.hasOwn(directions, action) || state.result || grace > 0) return;
      const next = move(state.frog, directions[action]);
      if (next.y >= rows || next.x < 0.26 || next.x > columns - 0.26) return;
      state.frog = next;
      if (next.y === 0) {
        const home = homes.find(x => Math.abs(x + 0.5 - next.x) < 0.55);
        if (home === undefined || state.filled.includes(home)) return loseLife();
        state.filled.push(home);
        state.metrics.homes++;
        state.score += 100 * state.level;
        if (state.filled.length === homes.length) {
          if (state.level === 3) { state.result = 'win'; return; }
          state.level++;
          state.filled = [];
          state.travel = 0;
        }
        reset();
      } else if (hazard()) loseLife();
      else if (next.y < furthest) {
        furthest = next.y;
        state.score += 10;
      }
    },
    step(dt) {
      if (state.result) return;
      state.travel += dt;
      grace = Math.max(0, grace - dt);
      const row = state.frog.y;
      if (row > 0 && row < 5) state.frog.x += speed(row) * dt;
      if (hazard()) loseLife();
    },
    render(ctx) {
      for (let y = 0; y < rows; y++) {
        const water = y > 0 && y < 5;
        const road = y > 5 && y < 10;
        rect(ctx, water ? '#183b52' : road ? '#252d3a' : '#254536', 0, y * unit, columns * unit, unit);
        if (y === 0) homes.forEach(x => rect(ctx, state.filled.includes(x) ? '#92efab' : '#4b8761', x * unit - 3, 4, unit + 6, unit - 8));
        if (road) for (let x = 5; x < columns * unit; x += 23) rect(ctx, '#52576a', x, y * unit + 1, 12, 1);
        if (water || road) objects(y).forEach(({ left, length }) => {
          rect(ctx, water ? '#b77850' : y % 2 ? '#fa8581' : '#f7bd73', left * unit, y * unit + 4, length * unit, unit - 8);
          rect(ctx, water ? '#e3aa72' : '#252d3a', left * unit + 7, y * unit + 8, water ? length * unit - 14 : 7, 4);
        });
      }
      const x = state.frog.x * unit;
      const y = (state.frog.y + 0.5) * unit;
      dot(ctx, '#b9ff86', x, y, 10);
      dot(ctx, '#284d38', x - 4, y - 4, 2);
      dot(ctx, '#284d38', x + 4, y - 4, 2);
    },
  };
}
