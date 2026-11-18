import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Chess } from 'chess.js';
import { parseChessReplay } from '../src/services/chessReplay.js';
import { openingBookLength } from '../src/services/chessOpeningBook.js';
import { chessAccuracy, gradeChessMove, reviewChessGame, reviewPosition } from '../src/services/chessReview.js';

const score = (whiteValue, line = []) => ({ unit: 'cp', whiteValue, line });

test('grades preferred moves, strong alternatives, and major errors from the moving side', () => {
  const white = { color: 'w', lan: 'e2e4', to: 'e4' };
  const black = { color: 'b', lan: 'e7e5', to: 'e5' };
  assert.equal(gradeChessMove(white, score(20, [white]), score(0)).grade, 'best');
  assert.equal(gradeChessMove(white, score(20), score(12)).grade, 'excellent');
  assert.equal(gradeChessMove(black, score(0), score(400)).grade, 'blunder');
  assert.equal(gradeChessMove(white, score(20, [white]), score(30, [{ to: 'e4', captured: 'n' }])).grade, 'best');
});

test('reviews every half-move and aggregates each player separately', async () => {
  const replay = parseChessReplay('1. a3 a6 2. h3');
  const evaluations = [score(20, [replay.moves[0]]), score(20), score(600, [replay.moves[2]]), score(610)];
  const grades = [];
  await reviewChessGame(replay, {
    signal: new AbortController().signal,
    evaluate: async (_position, { candidate }) => candidate ? score(600) : evaluations.shift(),
    onProgress: (index, before, after, grade) => { grades[index] = grade; },
  });
  assert.deepEqual(grades.map(result => result.grade), ['book', 'blunder', 'best']);
  assert.deepEqual(grades.map(result => result.reason.key), ['book', 'weaker', 'best']);
  const accuracy = chessAccuracy(replay.moves, grades);
  assert.equal(accuracy.w, 100);
  assert.ok(accuracy.b < 50);
  assert.equal(chessAccuracy(replay.moves, grades.slice(0, 1)).b, null);
});

test('a delivered checkmate receives the correct result for either side', async () => {
  const replay = parseChessReplay('1. f3 e5 2. g4 Qh4#');
  const move = replay.moves.at(-1);
  const result = await reviewPosition(new Chess(move.after));
  assert.equal(result.color, 'w');
  assert.equal(result.unit, 'mate');
  assert.equal(gradeChessMove(move, score(0), result).accuracy, 100);
});

test('a serious error weighs more than the simple average suggests', () => {
  const moves = [{ color: 'w' }, { color: 'w' }, { color: 'w' }];
  const grades = [100, 100, 5].map(accuracy => ({ accuracy }));
  assert.ok(chessAccuracy(moves, grades).w < 50);
});

test('deep review compares a suboptimal move from the original position and resumes from cache', async () => {
  const replay = parseChessReplay('1. a3 a6');
  const move = replay.moves[1];
  const calls = [];
  const positions = [score(0), score(0, [{ lan: 'c7c5' }])];
  await reviewChessGame(replay, {
    signal: new AbortController().signal,
    positions,
    start: 1,
    evaluate: async (position, { deep, candidate }) => {
      calls.push([position.fen(), deep, candidate]);
      return candidate ? score(500) : score(15, [{ lan: 'g1f3' }]);
    },
    onProgress(index, before, after, result) {
      assert.equal(index, 1);
      assert.equal(result.grade, 'blunder');
    },
  });
  assert.deepEqual(calls, [[move.after, true, undefined], [move.before, true, move.lan]]);
});

test('book covers the French opening prefix and the black castle is a tactical blunder', () => {
  const replay = parseChessReplay('1. e4 e6 2. Nf3 d5 3. e5 c5 4. d3 c4 5. dxc4 Ne7 6. cxd5 Nxd5 7. c4 Bb4+ 8. Bd2 O-O');
  assert.equal(openingBookLength(replay), 6);
  const castle = replay.moves.at(-1);
  const evaluation = gradeChessMove(castle, score(237, [{ lan: 'b4d2' }]), score(650));
  assert.equal(evaluation.grade, 'blunder');
  assert.equal(chessAccuracy(replay.moves, [{ accuracy: null }, { accuracy: null }]).w, null);
});

test('explains a blunder using the best alternative and reply from the same-root comparison', async () => {
  const replay = parseChessReplay('1. a3 a6');
  await reviewChessGame(replay, {
    signal: new AbortController().signal,
    positions: [score(0), score(210, [{ lan: 'e7e5', san: 'e5' }])],
    start: 1,
    evaluate: async (_position, { candidate }) => candidate
      ? score(610, [{ san: 'a6' }, { san: 'd4' }])
      : score(590, [{ san: 'Nc3' }]),
    onProgress(index, before, after, result) {
      assert.equal(index, 1);
      assert.deepEqual(result.reason, { key: 'dropWithReply', alternative: 'e5', reply: 'd4', drop: 400 });
    },
  });
});


test('large losses remain costly in overwhelmingly won and lost positions', () => {
  const move = { color: 'w', lan: 'a2a3' };
  for (const [best, played] of [[1800, 1200], [-1200, -1800]]) {
    const grade = gradeChessMove(move, score(best), score(played));
    assert.equal(grade.grade, 'blunder');
    assert.ok(grade.accuracy < 10);
  }
});

test('great requires a critical gap; missed opportunities require a lost winning or saving chance', () => {
  const move = { color: 'w', lan: 'a2a3' };
  const best = { ...score(180, [move]), variants: [score(180, [move]), score(0, [{ san: 'h3' }])] };
  assert.equal(gradeChessMove(move, best, score(180), best).grade, 'great');
  assert.equal(gradeChessMove(move, score(180, [move]), score(180)).grade, 'best');
  assert.equal(gradeChessMove(move, score(180), score(40)).grade, 'missed');
  assert.equal(gradeChessMove(move, score(0), score(-180)).grade, 'missed');
  assert.equal(gradeChessMove(move, score(700), score(560)).grade, 'mistake');
});

test('Opera Game queen sacrifice is supported by legal capture and forced mate', () => {
  const game = new Chess();
  game.loadPgn('1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8#');
  const moves = game.history({ verbose: true });
  const line = moves.slice(-3);
  const best = { unit: 'mate', value: 2, whiteValue: 2, color: 'w', line };
  const after = { unit: 'mate', value: -1, whiteValue: 1, color: 'b', line: line.slice(1) };
  assert.equal(gradeChessMove(line[0], best, after, best).grade, 'brilliant');
});

test('terminal draw differs from mate and a forced legal move is not automatically great', async () => {
  const draw = await reviewPosition(new Chess('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1'));
  assert.equal(draw.terminal, 'draw');
  assert.equal(draw.whiteValue, 0);
  const game = new Chess('7k/8/5K2/8/8/8/8/6R1 b - - 0 1');
  const legal = game.moves({ verbose: true });
  assert.equal(legal.length, 1);
  assert.equal(gradeChessMove(legal[0], score(500, legal), score(500)).grade, 'best');
});

test('local book recognizes confirmed transpositions and rejects unlisted continuations', async () => {
  const { openingBookMove } = await import('../src/services/chessOpeningBook.js');
  for (const pgn of ['1. d4 Nf6 2. c4 e6 3. Nf3 d5', '1. d4 d5 2. c4 e6 3. Nf3 Nf6']) {
    const replay = parseChessReplay(pgn);
    assert.ok(openingBookMove(replay.moves.at(-1)));
  }
  const replay = parseChessReplay('1. a3 a6 2. h3');
  assert.equal(openingBookMove(replay.moves.at(-1)), null);
});

test('MultiPV candidate avoids a redundant search; abort/resume preserves completed moves', async () => {
  const replay = parseChessReplay('1. a3 a6 2. h3');
  const controller = new AbortController();
  const positions = [];
  const grades = [];
  let restricted = 0;
  const evaluate = async (position, options) => {
    if (options.candidate) restricted++;
    const next = replay.moves.find(move => move.before === position.fen());
    return { ...score(0, next ? [next] : []), variants: [] };
  };
  await assert.rejects(reviewChessGame(replay, { signal: controller.signal, evaluate, onProgress(i, before, after, grade) {
    positions[i] = before; positions[i+1] = after; grades[i] = grade;
    controller.abort();
  } }), { name: 'AbortError' });
  const resumed = [];
  await reviewChessGame(replay, { positions, start: grades.length, evaluate,
    onProgress: i => resumed.push(i) });
  assert.deepEqual(resumed, [1, 2]);
  assert.equal(restricted, 0);
});
