import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Chess } from 'chess.js';
import { evaluateStockfishPosition, findStockfishMove, STOCKFISH_LEVELS } from '../src/services/stockfish.js';

function fakeWorker() {
  return {
    commands: [],
    terminated: 0,
    postMessage(command) { this.commands.push(command); },
    emit(data) { this.onmessage?.({ data }); },
    terminate() { this.terminated++; },
  };
}

test('position analysis provides the last exact score and principal variation', async () => {
  const worker = fakeWorker();
  const result = evaluateStockfishPosition(new Chess().fen(), { createWorker: () => worker });
  worker.emit('uciok');
  worker.emit('readyok');
  worker.emit('info depth 12 multipv 1 score cp 32 nodes 15000 pv e2e4 e7e5');
  worker.emit('info depth 13 multipv 1 score cp 50 lowerbound nodes 20000 pv d2d4');
  worker.emit('bestmove e2e4 ponder e7e5');
  const evaluation = await result;
  assert.equal(evaluation.depth, 12);
  assert.equal(evaluation.nodes, 15000);
  assert.equal(evaluation.value, 32);
  assert.deepEqual(evaluation.line, ['e2e4', 'e7e5']);
  assert.equal(worker.terminated, 1);
});

test('deep analysis sends the same bounded search with a restricted root move', async () => {
  const worker = fakeWorker();
  const result = evaluateStockfishPosition(new Chess().fen(), {
    deep: true, candidate: 'e2e4', createWorker: () => worker,
  });
  worker.emit('uciok');
  worker.emit('readyok');
  assert.equal(worker.commands.at(-1), 'go depth 24 nodes 2000000 movetime 12000 searchmoves e2e4');
  worker.emit('info depth 16 score cp 19 nodes 220001 pv e2e4 e7e5');
  worker.emit('bestmove e2e4');
  assert.equal((await result).value, 19);
});

test('Stockfish waits for the UCI handshake and applies each skill exactly once', async () => {
  assert.deepEqual(Object.values(STOCKFISH_LEVELS), [0, 4, 9, 15, 20]);
  const game = new Chess();
  game.move('e4');
  const fen = game.fen();

  for (const skill of Object.values(STOCKFISH_LEVELS)) {
    const worker = fakeWorker();
    const result = findStockfishMove(fen, skill, { createWorker: () => worker });
    assert.deepEqual(worker.commands, ['uci']);
    worker.emit('readyok');
    worker.emit('uciok');
    worker.emit('uciok');
    worker.emit('readyok');
    worker.emit('readyok');
    worker.emit('info depth 8');
    worker.emit('bestmove e7e5 ponder g1f3');
    assert.deepEqual(worker.commands, [
      'uci', 'setoption name UCI_LimitStrength value false', `setoption name Skill Level value ${skill}`,
      'isready', `position fen ${fen}`, 'go movetime 500',
    ]);
    assert.equal(new Chess(fen).move(await result).san, 'e5');
    assert.equal(worker.terminated, 1);
  }
});

test('aborting a search discards late output and terminates its worker', async () => {
  const controller = new AbortController();
  const worker = fakeWorker();
  const result = findStockfishMove(new Chess().fen(), 9, {
    signal: controller.signal, createWorker: () => worker,
  });
  worker.emit('uciok');
  worker.emit('readyok');
  controller.abort();
  worker.emit('bestmove e2e4');
  await assert.rejects(result, { name: 'AbortError' });
  assert.equal(worker.terminated, 1);
});

test('Stockfish preserves promotion suffixes and rejects load failures', async () => {
  const game = new Chess('7k/8/8/8/8/8/p7/7K b - - 0 1');
  const worker = fakeWorker();
  const result = findStockfishMove(game.fen(), 20, { createWorker: () => worker });
  worker.emit('uciok');
  worker.emit('readyok');
  worker.emit('bestmove a2a1n');
  assert.equal(game.move(await result).promotion, 'n');
  assert.equal(worker.terminated, 1);

  const failedWorker = fakeWorker();
  const failed = findStockfishMove(game.fen(), 20, { createWorker: () => failedWorker });
  failedWorker.onerror();
  await assert.rejects(failed, /failed to load/);
  assert.equal(failedWorker.terminated, 1);
});

test('MultiPV keeps the primary score and drops incomplete-depth alternatives', async () => {
  const worker = fakeWorker();
  const result = evaluateStockfishPosition(new Chess().fen(), { mode: 'quick', multiPV: 2, createWorker: () => worker });
  worker.emit('uciok'); worker.emit('readyok');
  assert.ok(worker.commands.includes('setoption name MultiPV value 2'));
  assert.equal(worker.commands.at(-1), 'go depth 16 nodes 200000 movetime 1200');
  worker.emit('info depth 14 multipv 1 score cp 40 nodes 100 time 100 pv e2e4');
  worker.emit('info depth 14 multipv 2 score cp 10 nodes 100 time 100 pv d2d4');
  worker.emit('info depth 15 multipv 1 score cp 35 nodes 200 time 200 pv e2e4');
  worker.emit('bestmove e2e4');
  const evaluation = await result;
  assert.equal(evaluation.value, 35);
  assert.equal(evaluation.depth, 15);
  assert.equal(evaluation.variants.length, 1);
});

test('completed default-worker searches are reused only for identical budgets and roots', async () => {
  const original = globalThis.Worker;
  let created = 0;
  globalThis.Worker = class {
    constructor() { created++; }
    terminate() {}
    postMessage(command) {
      queueMicrotask(() => {
        if (command === 'uci') this.onmessage?.({ data: 'uciok' });
        if (command === 'isready') this.onmessage?.({ data: 'readyok' });
        if (command.startsWith('go ')) {
          this.onmessage?.({ data: 'info depth 16 score cp 20 nodes 100 time 10 pv e2e4' });
          this.onmessage?.({ data: 'bestmove e2e4' });
        }
      });
    }
  };
  try {
    const fen = new Chess().fen();
    const first = await evaluateStockfishPosition(fen, { mode: 'quick' });
    const second = await evaluateStockfishPosition(fen, { mode: 'quick' });
    assert.deepEqual(first, second);
    assert.equal(created, 1);
    first.line.push('e7e5');
    assert.equal((await evaluateStockfishPosition(fen, { mode: 'quick' })).line.length, 1);
    await evaluateStockfishPosition(fen, { mode: 'deep' });
    await evaluateStockfishPosition(fen, { mode: 'quick', candidate: 'e2e4' });
    assert.equal(created, 3);
    const signal = AbortSignal.abort();
    await assert.rejects(evaluateStockfishPosition(fen, { mode: 'quick', signal }), { name: 'AbortError' });
  } finally { globalThis.Worker = original; }
});
