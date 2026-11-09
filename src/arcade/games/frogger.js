import { directions, move, rect, stateFor, wrap } from './shared.js';

const columns = 13;
const rows = 11;
const unit = 30;
// Goal spacing and repeating obstacle patterns adapted from Straker's CC0 Frogger.
// See public/THIRD_PARTY_NOTICES.txt.
const homes = [0, 3, 6, 9, 12];
const lanes = Object.fromEntries(Object.entries({
  1: [1.3, 2.8, [1.6], 0.2], 2: [-1.75, 3, [1, 3], 2], 3: [1, 2.6, [1.8], 1], 4: [-1.4, 3.1, [1.9], 3],
  6: [2.0, 1.4, [3, 3, 7], 1], 7: [-2.8, 1.2, [8], 0.2], 8: [1.75, 2, [3, 8], 3], 9: [-2.2, 1.3, [3.1], 1.5],
}).map(([row, [velocity, length, gaps, phase]]) => {
  const pattern = gaps.reduce((total, gap) => total + length + gap, 0);
  const period = (Math.ceil(columns / pattern) + 1) * pattern;
  const positions = [];
  for (let x = 0, i = 0; x < period - 0.001; i++) {
    positions.push(x + phase);
    x += length + gaps[i % gaps.length];
  }
  return [row, { velocity, length, period, positions }];
}));
const spawn = () => ({ x: 6.5, y: 10 });

export default function createFrogger(difficulty) {
  const limit = [38, 32, 27][difficulty];
  const state = { ...stateFor({ homes: 0, timeouts: 0 }, 3), frog: spawn(), filled: [], travel: 0, timeLeft: limit };
  let furthest = 10;
  let grace = 0;
  const speed = row => lanes[row].velocity * ([0.8, 1, 1.2][difficulty] + (state.level - 1) * 0.22);

  function objects(row) {
    const { length, period, positions } = lanes[row];
    const drift = speed(row) * state.travel;
    return positions.map(x => ({ left: wrap(x + drift + length, period) - length, length }));
  }

  function reset() {
    state.frog = spawn();
    furthest = 10;
    grace = 0.35;
    state.timeLeft = limit - (state.level - 1) * 3;
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
      if (next.y < 0 || next.y >= rows || next.x < 0.26 || next.x > columns - 0.26) return;
      state.frog = next;
      if (next.y === 0) {
        const home = homes.find(x => Math.abs(x + 0.5 - next.x) < 0.55);
        if (home === undefined || state.filled.includes(home)) return loseLife();
        state.filled.push(home);
        state.metrics.homes++;
        state.score += 100 * state.level + Math.ceil(state.timeLeft) * 2;
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
      state.timeLeft = Math.max(0, state.timeLeft - dt);
      if (state.timeLeft === 0) {
        state.metrics.timeouts++;
        loseLife();
        return;
      }
      const row = state.frog.y;
      if (row > 0 && row < 5) state.frog.x += speed(row) * dt;
      if (hazard()) loseLife();
    },
    render(ctx, _en, palette) {
      for (let y = 0; y < rows; y++) {
        const water = y > 0 && y < 5;
        const road = y > 5 && y < 10;
        rect(ctx, water ? '#193c8c' : road ? palette?.background ?? '#20232e' : palette?.surface ?? '#284b2b', 0, y * unit, columns * unit, unit);
        if (y === 0) homes.forEach(x => {
          rect(ctx, palette?.ink ?? '#82c04a', x * unit + 3, 4, unit - 6, unit - 8);
          rect(ctx, state.filled.includes(x) ? '#a8ef43' : palette?.background ?? '#162d22', x * unit + 6, 7, unit - 12, unit - 14);
        });
        if (road) for (let x = 5; x < columns * unit; x += 23) rect(ctx, palette?.muted ?? '#52576a', x, y * unit + 1, 12, 1);
        if (water || road) objects(y).forEach(({ left, length }) => {
          rect(ctx, water ? '#b77850' : y % 2 ? '#fa8581' : '#f7bd73', left * unit, y * unit + 4, length * unit, unit - 8);
          rect(ctx, water ? '#e3aa72' : '#252d3a', left * unit + 7, y * unit + 8, water ? length * unit - 14 : 7, 4);
        });
      }
      const x = state.frog.x * unit;
      const y = (state.frog.y + 0.5) * unit;
      rect(ctx, '#81e93e', x - 7, y - 8, 14, 15);
      rect(ctx, '#adff58', x - 5, y - 11, 10, 9);
      for (const side of [-1, 1]) {
        rect(ctx, '#81e93e', x + side * 9 - 2, y - 6, 4, 4);
        rect(ctx, '#81e93e', x + side * 9 - 2, y + 6, 4, 4);
        rect(ctx, '#22371b', x + side * 3 - 1, y - 8, 2, 2);
      }
    },
  };
}
