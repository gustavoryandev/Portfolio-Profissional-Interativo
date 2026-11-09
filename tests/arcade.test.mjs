import assert from 'node:assert/strict';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { arcadeIntent, validArcadeAction } from '../src/arcade/commands.js';
import { answerArcade } from '../src/arcade/replies.js';
import { getRecords, saveSession } from '../src/arcade/records.js';
import { createArcadeSession, fixedStep } from '../src/arcade/session.js';
import createSnake from '../src/arcade/games/snake.js';
import createPong from '../src/arcade/games/pong.js';
import createFrogger from '../src/arcade/games/frogger.js';
import createMaze from '../src/arcade/games/maze.js';
import createBlocks from '../src/arcade/games/blocks.js';

function advance(game, seconds) {
  for (let i = 0; i < Math.ceil(seconds / fixedStep); i++) game.step(fixedStep);
}

test('Snake grows, chooses an unoccupied cell, rejects a reverse and hits the wall', () => {
  const game = createSnake(1, () => 0);
  game.state.food = { x: 9, y: 9 };
  game.press('left');
  advance(game, 0.72);
  assert.deepEqual(game.state.body[0], { x: 9, y: 9 });
  assert.equal(game.state.body.length, 4);
  assert.equal(game.state.score, 10);
  assert.ok(!game.state.body.some(cell => cell.x === game.state.food.x && cell.y === game.state.food.y));
  advance(game, 2);
  assert.equal(game.state.result, 'loss');
});

test('Snake difficulty changes its speed and a bent snake hits its own body', () => {
  const easy = createSnake(0);
  const hard = createSnake(2);
  advance(easy, 1);
  advance(hard, 1);
  assert.ok(hard.state.body[0].x > easy.state.body[0].x);
  const game = createSnake(1);
  game.state.body = [{ x: 4, y: 4 }, { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 5, y: 4 }, { x: 6, y: 4 }];
  game.state.food = { x: 0, y: 0 };
  advance(game, 0.75);
  assert.equal(game.state.result, 'loss');
});

test('Pong reflects off a paddle, tracks rallies and ends at seven points', () => {
  const game = createPong(1, () => 0.5);
  advance(game, 0.9);
  Object.assign(game.state.ball, { x: 39, y: 150, vx: -300, vy: 0 });
  advance(game, 0.05);
  assert.ok(game.state.ball.vx > 0);
  assert.equal(game.state.metrics.rally, 1);
  game.press('up');
  advance(game, 0.12);
  game.release('up');
  const position = game.state.player;
  assert.ok(position < 150);
  advance(game, 0.12);
  assert.equal(game.state.player, position);
  game.point(10, 215);
  advance(game, 0.01);
  assert.equal(game.state.player, 215);
  game.state.score = 6;
  Object.assign(game.state.ball, { x: 485, vx: 300 });
  advance(game, 0.05);
  assert.equal(game.state.score, 7);
  assert.equal(game.state.result, 'win');
});

test('Pong opponent difficulty changes how quickly it tracks the ball', () => {
  const easy = createPong(0, () => 0.5);
  const hard = createPong(2, () => 0.5);
  for (const game of [easy, hard]) {
    game.state.ball.y = 260;
    advance(game, 0.2);
  }
  assert.ok(hard.state.cpu > easy.state.cpu);
});

test('Frogger detects road and water hazards, carries the frog and progresses through shelters', () => {
  const game = createFrogger(1);
  game.state.frog = { x: 1.7, y: 10 };
  game.press('up');
  assert.equal(game.state.lives, 2);
  game.state.frog = { x: 3.5, y: 1 };
  advance(game, 0.1);
  assert.equal(game.state.lives, 1, 'open water costs a life');
  game.state.frog = { x: 1, y: 1 };
  advance(game, 0.08);
  assert.ok(game.state.frog.x > 1 && game.state.frog.x < 1.2, 'a log carries the frog');
  advance(game, 0.3);
  for (const x of [0.5, 3.5, 6.5, 9.5, 12.5]) {
    game.state.frog = { x, y: 1 };
    game.press('up');
    advance(game, 0.4);
  }
  assert.ok(game.state.score > 500, 'remaining time awards a bonus');
  assert.equal(game.state.level, 2);
  assert.equal(game.state.metrics.homes, 5);
  game.state.level = 3;
  game.state.filled = [0, 3, 6, 9];
  game.state.frog = { x: 12.5, y: 1 };
  game.press('up');
  assert.equal(game.state.result, 'win');
  const timed = createFrogger(1);
  advance(timed, 33);
  assert.equal(timed.state.lives, 2);
  assert.equal(timed.state.metrics.timeouts, 1);
  assert.ok(timed.state.timeLeft > 30 && timed.state.timeLeft < 32);
});

test('Pulse Maze has three connected maps and uses power, chase and recovery states', () => {
  const game = createMaze(0);
  assert.equal(game.state.ghosts.length, 4);
  assert.equal(game.state.ghosts.filter(ghost => ghost.mode === 'house').length, 3);
  game.press('left');
  advance(game, 0.9);
  assert.ok(game.state.score > 0);
  assert.ok(game.state.player.x < 6);
  const powered = createMaze(0);
  powered.state.power = 2;
  powered.state.ghosts[0].at = powered.state.player;
  powered.state.ghosts[1].at = { x: 13, y: 11 };
  advance(powered, 0.8);
  assert.ok(powered.state.ghosts[0].recovering);
  assert.ok(powered.state.metrics.sentinels > 0);
  assert.ok(powered.state.ghosts.some(ghost => ghost.mode === 'frightened'));
  const chase = createMaze(0);
  advance(chase, 5.2);
  assert.ok(chase.state.ghosts.some(ghost => ghost.mode === 'chase'));
  const levels = createMaze(1);
  for (let level = 1; level <= 3; level++) {
    assert.equal(levels.state.level, level);
    assert.equal([...levels.state.pellets.values()].filter(pellet => pellet.power).length, 4);
    const start = levels.state.player;
    const open = new Set([start, ...levels.state.pellets.values()].map(({ x, y }) => x + ',' + y));
    const queue = [start];
    open.delete(start.x + ',' + start.y);
    for (const { x, y } of queue) {
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        if (open.delete((x + dx) + ',' + (y + dy))) queue.push({ x: x + dx, y: y + dy });
      }
    }
    assert.equal(open.size, 0, 'every collectible is reachable');
    levels.state.pellets.clear();
    advance(levels, 1.1);
  }
  assert.equal(levels.state.result, 'win');
  const lost = createMaze(1);
  lost.state.lives = 1;
  lost.state.ghosts[0].at = lost.state.player;
  advance(lost, 0.8);
  assert.equal(lost.state.result, 'loss');
});

test('Orbit Blocks rotates, holds once per piece, drops, clears lines and detects top-out', () => {
  const game = createBlocks(1, () => 0.999);
  const initial = game.state.active.type;
  const next = game.state.next;
  game.press('up');
  assert.equal(game.state.active.turn, 1);
  game.press('hold');
  assert.equal(game.state.held, initial);
  assert.equal(game.state.active.type, next);
  game.press('hold');
  assert.equal(game.state.active.type, next);
  game.state.active = { type: 'I', x: 0, y: 0, turn: 0 };
  game.state.board[19].fill('L', 4);
  game.state.metrics.lines = 7;
  game.press('drop');
  assert.equal(game.state.metrics.lines, 8);
  assert.equal(game.state.level, 2);
  assert.ok(game.state.score > 100);
  assert.ok(game.state.board[19].every(cell => cell === null));
  game.state.active = { type: 'I', x: 0, y: 0, turn: 0 };
  game.state.metrics.lines = 39;
  game.state.board[19].fill('L', 4);
  game.press('drop');
  assert.equal(game.state.result, 'win');
  const blocked = createBlocks(0);
  blocked.state.active = { type: 'I', x: 3, y: -2, turn: 0 };
  blocked.state.board[0].fill('J');
  blocked.press('drop');
  assert.equal(blocked.state.result, 'loss');
  const wall = createBlocks(1);
  wall.state.active = { type: 'I', x: -2, y: 4, turn: 1 };
  wall.press('reverse');
  assert.deepEqual(wall.state.active, { type: 'I', x: 0, y: 4, turn: 0 }, 'SRS applies the I-specific two-cell kick');
});

test('arcade actions load and run only in Full Astra and stale async loads are discarded', async () => {
  let isFull = false;
  let loadCount = 0;
  const saved = [];
  const runtime = createArcadeSession({
    isFull: () => isFull,
    load: async () => { loadCount++; return { default: createSnake }; },
    save: run => saved.push(run),
  });
  assert.equal(await runtime.dispatch({ type: 'game.start', game: 'snake' }), false);
  assert.equal(await runtime.dispatch({ type: 'arcade.open' }), false);
  assert.equal(loadCount, 0);
  isFull = true;
  assert.equal(await runtime.dispatch({ type: 'game.start', game: '__proto__' }), false);
  assert.equal(await runtime.dispatch({ type: 'game.start', game: 'snake' }), true);
  assert.equal(await runtime.dispatch({ type: 'game.pause' }), true);
  advance(runtime, 5);
  runtime.publish();
  assert.equal(runtime.getSnapshot().seconds, 0);
  assert.equal(await runtime.dispatch({ type: 'game.resume' }), true);
  advance(runtime, 4);
  runtime.publish();
  assert.equal(runtime.getSnapshot().result, 'loss');
  assert.equal(saved.length, 1);
  assert.equal(await runtime.dispatch({ type: 'game.setDifficulty', difficulty: 'increase' }), true);
  assert.equal(runtime.getSnapshot().difficulty, 'hard');
  const pending = runtime.dispatch({ type: 'game.restart' });
  isFull = false;
  runtime.destroy();
  assert.equal(await pending, false);
  assert.equal(runtime.getSnapshot().status, 'lobby');
  assert.equal(saved.length, 1, 'exiting or restarting a completed run does not save it twice');
});

test('Portuguese and English arcade requests are recognized without hijacking chess or portfolio statistics', async () => {
  assert.deepEqual(arcadeIntent('Astra, open the arcade.'), { type: 'arcade.open' });
  assert.deepEqual(arcadeIntent('Astra, start Pac-Man.'), { type: 'game.start', game: 'maze' });
  assert.deepEqual(arcadeIntent('Vamos jogar Frogger'), { type: 'game.start', game: 'frogger' });
  assert.deepEqual(arcadeIntent('Astra, pause the game.', 'frogger', true), { type: 'game.pause', game: undefined });
  assert.deepEqual(arcadeIntent('retomar'), { type: 'game.resume', game: undefined });
  assert.deepEqual(arcadeIntent('Aumente a dificuldade'), { type: 'game.setDifficulty', difficulty: 'increase' });
  assert.deepEqual(arcadeIntent('Astra, challenge me to Pong.'), { type: 'game.start', game: 'pong', challenge: true });
  assert.deepEqual(arcadeIntent('Astra, explain how to play.', 'maze', true), { info: 'help', game: 'maze' });
  assert.deepEqual(arcadeIntent('Quais jogos estão disponíveis?'), { info: 'catalog' });
  assert.deepEqual(arcadeIntent('Recomende um jogo de quebra-cabeça'), { info: 'recommend', game: 'blocks' });
  assert.equal(arcadeIntent('Can we play chess?'), null);
  assert.equal(arcadeIntent('Show my GitHub statistics'), null);
  assert.equal(validArcadeAction({ type: 'game.start', game: 'pong', difficulty: 'unknown' }), false);
  const reply = await answerArcade(arcadeIntent('Quero jogar Snake'), {
    en: false, compact: true, session: { dispatch: () => assert.fail('compact cannot dispatch') },
    openArcade: () => assert.fail('compact cannot navigate automatically'),
  });
  assert.match(reply.text, /Astra Completa/);
  assert.equal(reply.arcadeLink, '/chat?arcade=snake');
});

test('records persist per session, deduplicate and surface actual achievements', () => {
  const dom = new JSDOM('', { url: 'http://localhost' });
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: dom.window.localStorage });
  try {
    const run = { id: 'first', game: 'pong', difficulty: 'hard', seconds: 12, score: 7, level: 3, outcome: 'win', challenge: true, endedAt: 1 };
    saveSession(run);
    saveSession({ ...run, score: 100 });
    assert.equal(dom.window.localStorage.length, 1);
    const records = getRecords();
    assert.equal(records.totals.played, 1);
    assert.equal(records.games.pong.best, 7);
    assert.equal(records.favorite, 'pong');
    assert.equal(records.achievements.find(item => item[1] === 'Pong Champion')[2], 1);
    assert.equal(records.totals.seconds, 12);
  } finally {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else delete globalThis.localStorage;
    dom.window.close();
  }
});
