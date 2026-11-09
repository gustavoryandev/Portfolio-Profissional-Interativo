import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Chess } from 'chess.js';
import { findStockfishMove, STOCKFISH_LEVELS } from '../src/services/stockfish.js';

function fakeWorker() {
  return {
    commands: [],
    terminated: 0,
    postMessage(command) { this.commands.push(command); },
    emit(data) { this.onmessage?.({ data }); },
    terminate() { this.terminated++; },
  };
}

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
