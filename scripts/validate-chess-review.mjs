import { Worker } from 'node:worker_threads';
import { readFileSync, writeFileSync } from 'node:fs';
import { parseChessReplay } from '../src/services/chessReplay.js';
import { reviewChessGame, reviewPosition, chessAccuracy } from '../src/services/chessReview.js';
const mode = process.argv[2] ?? 'deep';
const createWorker = () => {
 const worker = new Worker(new URL('./chess-engine-worker.cjs', import.meta.url));
 const adapter = { postMessage: value => worker.postMessage(value), terminate: () => worker.terminate() };
 worker.on('message', data => adapter.onmessage?.({ data }));
 worker.on('error', error => { console.error(error); adapter.onerror?.(error); });
 return adapter;
};
const replay = parseChessReplay(readFileSync('tests/fixtures/seunome6679-otche_nazs.pgn', 'utf8'));
const results = [];
const started = Date.now();
await reviewChessGame(replay, {
 mode, signal: new AbortController().signal,
 evaluate: (position, options) => reviewPosition(position, { ...options, createWorker }),
 onProgress(index, before, after, result) {
  results.push({ move: replay.moves[index].san, ...result, after });
  console.log(`${index + 1}/${replay.moves.length} ${result.grade} depth ${result.depth}/${result.playedDepth}`);
  writeFileSync(`docs/chess-validation-${mode}.json`, JSON.stringify({ mode, seconds: (Date.now()-started)/1000, accuracy: chessAccuracy(replay.moves, results), results }, null, 2));
 }
});
console.log(JSON.stringify(chessAccuracy(replay.moves, results)));
