import { Worker } from 'node:worker_threads';
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { evaluateStockfishPosition } from '../src/services/stockfish.js';
import { parseChessReplay } from '../src/services/chessReplay.js';
let workers = 0;
globalThis.Worker = class {
 constructor() {
  workers++;
  this.worker = new Worker(new URL('./chess-engine-worker.cjs', import.meta.url));
  this.worker.on('message', data => this.onmessage?.({ data }));
  this.worker.on('error', error => this.onerror?.(error));
 }
 postMessage(data) { this.worker.postMessage(data); }
 terminate() { this.worker.terminate(); }
};
const replay = parseChessReplay(readFileSync('tests/fixtures/seunome6679-otche_nazs.pgn', 'utf8'));
const fen = replay.moves[15].before;
const start = performance.now();
const first = await evaluateStockfishPosition(fen, { mode: 'deep', multiPV: 2 });
const middle = performance.now();
const second = await evaluateStockfishPosition(fen, { mode: 'deep', multiPV: 2 });
const end = performance.now();
assert.deepEqual(first, second);
assert.equal(workers, 1);
const result = { firstMs: middle-start, cachedMs: end-middle, workers, depth: first.depth, identical: true };
writeFileSync('docs/chess-cache-benchmark.json', JSON.stringify(result,null,2));
console.log(result);
