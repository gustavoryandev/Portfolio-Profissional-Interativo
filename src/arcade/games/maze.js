import { clamp, directions, dot, key, move, rect, same, stateFor, tile } from './shared.js';

const unit = 24;
const layouts = [
  [
    '###############',
    '#o....#.#....o#',
    '#.##..#.#..##.#',
    '#.............#',
    '###.#.###.#.###',
    '#...#.HGH.#...#',
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
    '##.##.HGH.##.##',
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
    '#....#HGH#....#',
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
const corners = [{ x: 13, y: 1 }, { x: 1, y: 1 }, { x: 13, y: 11 }, { x: 1, y: 11 }];
const colors = ['#ff4359', '#ff9ecf', '#51e8ff', '#ffab46'];
const distanceBetween = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export default function createMaze(difficulty) {
  const state = { ...stateFor({ pellets: 0, sentinels: 0 }, 3), pellets: new Map(), ghosts: [], player: null, power: 0 };
  let maze, base, door, start, direction, desired, elapsed, playerClock, ghostClock, chain, playerFrom;
  const house = ({ x, y }) => ['G', 'H'].includes(maze[y]?.[x]);
  const open = ({ x, y }) => Boolean(maze[y]?.[x] && maze[y][x] !== '#');
  const corridor = point => open(point) && !house(point);
  const walk = (from, to, access) => {
    if (!access) return corridor(to);
    if (!open(to)) return false;
    return house(from) === house(to) || (same(from, door) && same(to, base)) || (same(from, base) && same(to, door));
  };

  function resetActors(delay) {
    state.player = start;
    playerFrom = start;
    state.ghosts = corners.map((_, i) => {
      const at = i === 0 ? door : { x: base.x + i - 2, y: base.y };
      return { at, drawFrom: at, previous: null, recovering: false, releaseAt: delay + i * 1.9, mode: i ? 'house' : 'scatter' };
    });
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
      if (char === 'G') {
        base = point;
        door = { x, y: y + 1 };
      }
      if (char === 'P') start = point;
      if (char === '.' || char === 'o') state.pellets.set(key(point), { ...point, power: char === 'o' });
    }));
    resetActors(delay);
  }
  load(0.5);

  function distances(target, access) {
    const found = new Map([[key(target), 0]]);
    const queue = [target];
    for (let i = 0; i < queue.length; i++) {
      const at = queue[i];
      const distance = found.get(key(at));
      for (const [, delta] of steps) {
        const next = move(at, delta);
        const id = key(next);
        if (!walk(at, next, access) || found.has(id)) continue;
        found.set(id, distance + 1);
        queue.push(next);
      }
    }
    return found;
  }

  function ghostsMove() {
    for (const [index, ghost] of state.ghosts.entries()) {
      ghost.drawFrom = ghost.at;
      if (ghost.recovering && same(ghost.at, base)) {
        ghost.recovering = false;
        ghost.releaseAt = elapsed + 1;
      }
      const inside = house(ghost.at);
      const access = inside || ghost.recovering;
      ghost.mode = ghost.recovering ? 'recovery' : inside ? 'house' : state.power > 0 ? 'frightened' : elapsed % 23 < 5 ? 'scatter' : 'chase';
      if (inside && !ghost.recovering && elapsed < ghost.releaseAt) continue;
      if (ghost.mode === 'frightened' && Math.floor(elapsed * 10 + index) % 3 === 0) continue;
      let target = state.player;
      if (ghost.mode === 'recovery') target = base;
      else if (inside) target = door;
      else if (ghost.mode === 'scatter' || (ghost.mode === 'chase' && index === 3 && distanceBetween(ghost.at, target) < 6)) target = corners[index];
      else if (ghost.mode === 'chase' && (index === 1 || index === 2) && direction) {
        const [dx, dy] = directions[direction];
        const ahead = { x: target.x + 2 * dx, y: target.y + 2 * dy };
        if (index === 1) target = { x: target.x + 4 * dx, y: target.y + 4 * dy };
        else {
          const red = state.ghosts[0].at;
          target = { x: 2 * ahead.x - red.x, y: 2 * ahead.y - red.y };
        }
      }
      const choices = steps.map(([, delta]) => move(ghost.at, delta)).filter(point => walk(ghost.at, point, access));
      const forward = choices.filter(point => !ghost.previous || !same(point, ghost.previous));
      const distance = distances(target, access);
      const rank = point => (distance.get(key(point)) ?? distanceBetween(point, target)) * (ghost.mode === 'frightened' ? -1 : 1);
      const route = access || forward.length === 0 ? choices : forward;
      ghost.previous = ghost.at;
      ghost.at = route.reduce((best, point) => rank(point) < rank(best) ? point : best);
    }
  }

  function collide() {
    for (const ghost of state.ghosts) {
      if (ghost.recovering || house(ghost.at) || !same(state.player, ghost.at)) continue;
      if (state.power > 0) {
        ghost.recovering = true;
        ghost.mode = 'recovery';
        state.metrics.sentinels++;
        state.score += 200 * 2 ** chain++;
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
        playerFrom = state.player;
        if (desired && corridor(move(state.player, directions[desired]))) direction = desired;
        if (direction) {
          const next = move(state.player, directions[direction]);
          if (corridor(next)) state.player = next;
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
    render(ctx, _en, palette) {
      rect(ctx, palette?.background ?? '#090913', 0, 0, this.width, this.height);
      maze.forEach((row, y) => [...row].forEach((char, x) => {
        if (char === '#') {
          tile(ctx, palette?.accent ?? '#394cff', x, y, unit, 1);
          tile(ctx, palette?.surface ?? '#10194e', x, y, unit, 3);
        }
        if (char === 'G' || char === 'H') tile(ctx, palette?.surface ?? '#2a2240', x, y, unit, 1);
      }));
      const center = n => (n + 0.5) * unit;
      rect(ctx, '#edacd6', door.x * unit + 3, door.y * unit - 1, unit - 6, 2);
      const drawPoint = (from, to, clock) => {
        const fraction = clamp(clock / 0.08, 0, 1);
        return [center(from.x + (to.x - from.x) * fraction), center(from.y + (to.y - from.y) * fraction)];
      };
      for (const { x, y, power } of state.pellets.values()) dot(ctx, power ? '#ffb9ca' : palette?.ink ?? '#ffe4bd', center(x), center(y), power ? 5 : 2);
      state.ghosts.forEach(({ at, drawFrom, recovering }, i) => {
        const [x, y] = drawPoint(drawFrom, at, ghostClock);
        if (!recovering) {
          const color = state.power > 0 ? '#5364f9' : colors[i];
          dot(ctx, color, x, y - 2, 8);
          rect(ctx, color, x - 8, y - 1, 16, 7);
          for (let foot = -8; foot < 8; foot += 6) rect(ctx, color, x + foot, y + 6, 4, 3);
        }
        for (const side of [-1, 1]) {
          rect(ctx, '#fff', x + side * 3 - 2, y - 4, 4, 5);
          rect(ctx, '#17233f', x + side * 3 - 1, y - 3, 2, 3);
        }
      });
      const [x, y] = drawPoint(playerFrom, state.player, playerClock);
      const angle = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 }[direction ?? 'right'];
      const mouth = playerClock < 0.08 ? 0.38 : 0.15;
      ctx.fillStyle = '#ffdb28';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, 9, angle + mouth, angle + 2 * Math.PI - mouth);
      ctx.fill();
    },
  };
}
