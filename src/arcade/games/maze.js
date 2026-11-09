import { directions, dot, key, move, rect, same, stateFor, tile } from './shared.js';

const unit = 24;
const layouts = [
  [
    '###############',
    '#o....#.#....o#',
    '#.##..#.#..##.#',
    '#.............#',
    '###.#.###.#.###',
    '#...#..G..#...#',
    '#.#...#.#...#.#',
    '#...#.....#...#',
    '###.#.###.#.###',
    '#.............#',
    '#.##..#.#..##.#',
    '#o....P......o#',
    '###############',
  ],
  [
    '###############',
    '#o....#.#....o#',
    '#.#.#.....#.#.#',
    '#.#.###.###.#.#',
    '#.............#',
    '##.##..G..##.##',
    '#.....#.#.....#',
    '#.###.....###.#',
    '#.....###.....#',
    '###.#.....#.###',
    '#...#.###.#...#',
    '#o....P......o#',
    '###############',
  ],
  [
    '###############',
    '#o....#.#....o#',
    '#.###.#.#.###.#',
    '#.............#',
    '#.##.#####.##.#',
    '#....#.G.#....#',
    '###.........###',
    '#...###.###...#',
    '#.#.........#.#',
    '#.#.###.###.#.#',
    '#.............#',
    '#o.##.P...##.o#',
    '###############',
  ],
];
const steps = Object.entries(directions);
const corners = [{ x: 1, y: 1 }, { x: 13, y: 1 }, { x: 13, y: 11 }];
const colors = ['#ff7990', '#7ae9ee', '#bf9dfc'];

export default function createMaze(difficulty) {
  const state = { ...stateFor({ pellets: 0, sentinels: 0 }, 3), pellets: new Map(), ghosts: [], player: null, power: 0 };
  let maze, base, start, direction, desired, elapsed, playerClock, ghostClock, chain;
  const open = ({ x, y }) => Boolean(maze[y]?.[x] && maze[y][x] !== '#');

  function resetActors(delay) {
    state.player = start;
    state.ghosts = corners.map((_, i) => ({ at: { x: base.x + i - 1, y: base.y }, previous: null, recovering: false, mode: 'scatter' }));
    state.power = 0;
    chain = 0;
    direction = desired = null;
    elapsed = 0;
    playerClock = ghostClock = -delay;
  }

  function load(delay) {
    maze = layouts[state.level - 1];
    state.pellets = new Map();
    maze.forEach((row, y) => [...row].forEach((char, x) => {
      const point = { x, y };
      if (char === 'G') base = point;
      if (char === 'P') start = point;
      if (char === '.' || char === 'o') state.pellets.set(key(point), { ...point, power: char === 'o' });
    }));
    resetActors(delay);
  }
  load(0.5);

  function distances(target) {
    const found = new Map([[key(target), 0]]);
    const queue = [target];
    for (let i = 0; i < queue.length; i++) {
      const at = queue[i];
      const distance = found.get(key(at));
      for (const [, delta] of steps) {
        const next = move(at, delta);
        const id = key(next);
        if (!open(next) || found.has(id)) continue;
        found.set(id, distance + 1);
        queue.push(next);
      }
    }
    return found;
  }

  function ghostsMove() {
    for (const [index, ghost] of state.ghosts.entries()) {
      if (ghost.recovering && same(ghost.at, base)) ghost.recovering = false;
      ghost.mode = ghost.recovering ? 'recovery' : state.power > 0 ? 'frightened' : elapsed % 23 < 5 ? 'scatter' : 'chase';
      if (ghost.mode === 'frightened' && Math.floor(elapsed * 10 + index) % 3 === 0) continue;
      let target = state.player;
      if (ghost.mode === 'recovery') target = base;
      else if (ghost.mode === 'scatter' || (ghost.mode === 'chase' && index === 2 && Math.abs(ghost.at.x - target.x) + Math.abs(ghost.at.y - target.y) < 4)) target = corners[index];
      else if (ghost.mode === 'chase' && index === 1 && direction) {
        const ahead = move(move(target, directions[direction]), directions[direction]);
        if (open(ahead)) target = ahead;
      }
      const choices = steps.map(([, delta]) => move(ghost.at, delta)).filter(open);
      const forward = choices.filter(point => !ghost.previous || !same(point, ghost.previous));
      const distance = distances(target);
      const rank = point => (distance.get(key(point)) ?? 999) * (ghost.mode === 'frightened' ? -1 : 1);
      const route = ghost.recovering || forward.length === 0 ? choices : forward;
      ghost.previous = ghost.at;
      ghost.at = route.reduce((best, point) => rank(point) < rank(best) ? point : best);
    }
  }

  function collide() {
    for (const ghost of state.ghosts) {
      if (ghost.recovering || !same(state.player, ghost.at)) continue;
      if (state.power > 0) {
        ghost.recovering = true;
        ghost.mode = 'recovery';
        state.metrics.sentinels++;
        state.score += 100 * ++chain;
      } else {
        state.lives--;
        if (state.lives === 0) state.result = 'loss';
        else resetActors(0.85);
        return true;
      }
    }
    return false;
  }

  return {
    width: layouts[0][0].length * unit, height: layouts[0].length * unit, state,
    press(action) { if (Object.hasOwn(directions, action)) desired = action; },
    step(dt) {
      if (state.result) return;
      elapsed += dt;
      state.power = Math.max(0, state.power - dt);
      playerClock += dt;
      ghostClock += dt;
      const speed = [0.19, 0.17, 0.145][difficulty] - (state.level - 1) * 0.012;
      if (playerClock >= speed) {
        playerClock -= speed;
        if (desired && open(move(state.player, directions[desired]))) direction = desired;
        if (direction) {
          const next = move(state.player, directions[direction]);
          if (open(next)) state.player = next;
        }
        const pellet = state.pellets.get(key(state.player));
        if (pellet) {
          state.pellets.delete(key(state.player));
          state.metrics.pellets++;
          state.score += pellet.power ? 50 : 10;
          if (pellet.power) { state.power = [8, 6.5, 5][difficulty]; chain = 0; }
        }
        if (collide()) return;
        if (state.pellets.size === 0) {
          if (state.level === layouts.length) state.result = 'win';
          else { state.level++; load(0.8); }
          return;
        }
      }
      const interval = speed * [1.48, 1.28, 1.07][difficulty];
      if (ghostClock >= interval) {
        ghostClock -= interval;
        ghostsMove();
        collide();
      }
    },
    render(ctx) {
      rect(ctx, '#101529', 0, 0, this.width, this.height);
      maze.forEach((row, y) => [...row].forEach((char, x) => {
        if (char === '#') tile(ctx, '#374a89', x, y, unit, 1);
      }));
      const center = n => (n + 0.5) * unit;
      for (const { x, y, power } of state.pellets.values()) dot(ctx, power ? '#f6d0ff' : '#b8c5ef', center(x), center(y), power ? 5 : 2);
      state.ghosts.forEach(({ at, recovering }, i) => {
        const x = center(at.x), y = center(at.y);
        dot(ctx, recovering ? '#596683' : state.power > 0 ? '#77a5ff' : colors[i], x, y, 8);
        rect(ctx, '#151b36', x - 4, y - 2, 2, 3);
        rect(ctx, '#151b36', x + 2, y - 2, 2, 3);
      });
      const x = center(state.player.x), y = center(state.player.y);
      ctx.fillStyle = '#ffd470';
      ctx.beginPath();
      ctx.moveTo(x - 9, y);
      ctx.lineTo(x, y - 9);
      ctx.lineTo(x + 9, y);
      ctx.lineTo(x, y + 9);
      ctx.fill();
    },
  };
}
