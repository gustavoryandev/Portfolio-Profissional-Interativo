import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isChessReplayRequest, parseChessReplay } from '../src/services/chessReplay.js';

test('imports pasted PGN with tags, comments and variations', () => {
  const pgn = '[Event "Test"]\n\n1. e4 {comment} e5 (1... c5) 2. Nf3 Nc6 *';
  assert.equal(isChessReplayRequest(pgn), true);
  const replay = parseChessReplay(pgn);
  assert.deepEqual(replay.moves.map(move => move.san), ['e4', 'e5', 'Nf3', 'Nc6']);
  assert.equal(replay.initial, replay.moves[0].before);
  assert.equal(replay.moves[0].after, replay.moves[1].before);
});

test('honors a custom starting position and rejects illegal moves', () => {
  const fen = '7k/8/8/8/8/8/p7/7K b - - 0 42';
  const replay = parseChessReplay(`[SetUp "1"]\n[FEN "${fen}"]\n\n42... a1=Q+ *`);
  assert.equal(replay.initial, fen);
  assert.equal(replay.moves[0].promotion, 'q');
  assert.throws(() => parseChessReplay('1. e5'));
  assert.throws(() => parseChessReplay('*'));
  assert.equal(isChessReplayRequest('1. e4 e5'), true);
  assert.equal(isChessReplayRequest('1. um exemplo de código'), false);
});
