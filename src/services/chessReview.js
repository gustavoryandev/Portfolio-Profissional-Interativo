import { Chess } from 'chess.js';
import { evaluateStockfishPosition } from './stockfish.js';
import { openingBookMove } from './chessOpeningBook.js';

const PIECE_VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

function legalLine(fen, moves) {
  const position = new Chess(fen);
  const line = [];
  for (const uci of moves) {
    // Reject unsupported evidence rather than fabricating tactical explanations.
    try {
      line.push(position.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] }));
    } catch { throw new Error(`Illegal engine variation: ${uci}`); }
    if (line.length === 16) break;
  }
  return line;
}

export async function reviewPosition(position, options) {
  const fen = position.fen();
  const color = position.turn();
  const terminal = position.isCheckmate() ? 'checkmate' : position.isDraw() ? 'draw' : null;
  const result = terminal ? { unit: terminal === 'checkmate' ? 'mate' : 'cp', value: 0, line: [], depth: 0, terminal }
    : await evaluateStockfishPosition(fen, options);
  const convert = item => ({ ...item, line: legalLine(fen, item.line), color,
    whiteValue: item.value === 0 ? 0 : color === 'w' ? item.value : -item.value });
  return { ...convert(result), variants: (result.variants ?? []).map(convert) };
}

function cp(score, color) {
  return score.whiteValue * (color === 'w' ? 1 : -1);
}
function winningChances(score, color) {
  if (score.unit === 'mate') {
    const winner = score.value === 0 ? (score.color === 'w' ? 'b' : 'w')
      : score.whiteValue > 0 ? 'w' : 'b';
    return color === winner ? 100 : 0;
  }
  return 100 / (1 + Math.exp(-0.00368208 * cp(score, color)));
}
export function moveLoss(best, played, color) {
  const probability = Math.max(0, winningChances(best, color) - winningChances(played, color));
  if (best.unit === 'cp' && played.unit === 'cp') {
    return Math.max(probability, Math.max(0, cp(best, color) - cp(played, color)) / 10);
  }
  // Losing a forced win is meaningful even if the fallback position is favourable.
  if (best.unit === 'mate' && winningChances(best, color) === 100
      && !(played.unit === 'mate' && winningChances(played, color) === 100)) return Math.max(30, probability);
  if (played.unit === 'mate' && winningChances(played, color) === 0
      && winningChances(best, color) > 0) return 100;
  return probability;
}
function material(fen, color) {
  return new Chess(fen).board().flat().filter(Boolean).reduce((sum, piece) =>
    sum + PIECE_VALUE[piece.type] * (piece.color === color ? 1 : -1), 0);
}
function validatedSacrifice(move, before, played, after) {
  const line = played.line[0]?.lan === move.lan ? played.line.slice(1) : after.line;
  const reply = line[0];
  const ending = line.at(-1);
  const mating = ending?.after && new Chess(ending.after).isCheckmate();
  // Require an actual legal capture of the offered piece and sustained material investment.
  if (!move.before || !reply?.after || reply.to !== move.to || PIECE_VALUE[reply.captured] < 3
      || (line.length < 4 && !mating) || winningChances(played, move.color) < 50) return false;
  const baseline = material(move.before, move.color);
  return material(reply.after, move.color) <= baseline - 2
    && (material(ending.after, move.color) <= baseline - 2 || mating)
    && before.line[0]?.lan === move.lan;
}
export function gradeChessMove(move, before, after, played = after) {
  const isBest = move.lan === before.line[0]?.lan;
  const loss = isBest ? 0 : moveLoss(before, played, move.color);
  const accuracy = Math.max(0, Math.min(100, 100 * Math.exp(-loss / 25)));
  const result = grade => ({ grade, accuracy, loss });
  if (isBest && validatedSacrifice(move, before, played, after)) return result('brilliant');
  const second = before.variants?.[1];
  const critical = second && moveLoss(before, second, move.color) >= 15
    && ((cp(before, move.color) >= 150 && cp(second, move.color) < 50)
      || (cp(before, move.color) >= -50 && cp(second, move.color) <= -150)
      || (before.unit === 'mate' && before.value > 0 && second.unit !== 'mate'));
  if (isBest && critical) return result('great');
  if (isBest) return result('best');
  if (loss >= 30) return result('blunder');
  const missed = before.unit === 'mate' && winningChances(before, move.color) === 100 && played.unit !== 'mate'
    || before.unit === 'cp' && played.unit === 'cp' && (
      cp(before, move.color) >= 150 && cp(played, move.color) < 50
      || cp(before, move.color) >= -50 && cp(played, move.color) <= -150);
  if (missed && loss > 6) return result('missed');
  if (loss <= 2) return result('excellent');
  if (loss <= 6) return result('good');
  if (loss <= 12) return result('inaccuracy');
  return result('mistake');
}

export function explainMoveGrade(move, grade, before, after, played) {
  if (grade === 'book') return { key: 'book' };
  if (after.terminal === 'checkmate' || after.unit === 'mate' && after.value === 0) return { key: 'checkmate', move: move.san };
  const reply = (played === after ? after.line[0] : played.line[1])?.san;
  const alternative = before.line[0]?.san;
  if (grade === 'brilliant') return { key: 'sacrifice', reply };
  if (grade === 'great') return { key: 'great', alternative: before.variants[1].line[0]?.san };
  if (grade === 'best') return { key: 'best' };
  if (before.unit === 'mate' && winningChances(before, move.color) === 100 && played.unit !== 'mate') return { key: 'missedMate', alternative };
  if (grade === 'excellent') return { key: alternative ? 'excellentWithAlternative' : 'excellent', alternative };
  if (grade === 'good') return { key: grade };
  if (played.unit === 'mate' && winningChances(played, move.color) === 0 && winningChances(before, move.color) > 0)
    return { key: reply ? 'allowsMateWithReply' : 'allowsMate', reply };
  if (before.unit === 'cp' && played.unit === 'cp' && alternative) {
    const drop = cp(before, move.color) - cp(played, move.color);
    if (drop > 0) return { key: reply ? 'dropWithReply' : 'drop', alternative, reply, drop };
  }
  return { key: alternative ? 'weakerThan' : 'weaker', alternative };
}

export async function reviewChessGame(replay, {
  signal, onProgress, positions = [], start = 0, evaluate = reviewPosition, mode = 'deep',
}) {
  const game = new Chess(replay.initial);
  const options = { signal, deep: mode === 'deep', mode, multiPV: 2 };
  for (const move of replay.moves.slice(0, start)) game.move(move.san);
  let before = positions[start] ?? await evaluate(new Chess(game.fen()), options);
  for (let index = start; index < replay.moves.length; index++) {
    signal?.throwIfAborted();
    const move = replay.moves[index];
    game.move(move.san);
    const repeated = game.isThreefoldRepetition();
    const after = positions[index + 1] ?? (repeated
      ? { unit: 'cp', value: 0, whiteValue: 0, color: game.turn(), line: [], depth: 0, terminal: 'draw' }
      : await evaluate(new Chess(move.after), options));
    const book = openingBookMove(move);
    const variant = before.variants?.find(item => item.line[0]?.lan === move.lan);
    const played = repeated || after.terminal ? after
      : before.line[0]?.lan === move.lan ? before
        : variant ?? (!book ? await evaluate(new Chess(move.before), { ...options, multiPV: 1, candidate: move.lan }) : after);
    signal?.throwIfAborted();
    const result = book ? { grade: 'book', accuracy: null } : gradeChessMove(move, before, after, played);
    const reason = explainMoveGrade(move, result.grade, before, after, played);
    onProgress(index, before, after, { ...result, reason, book,
      depth: before.depth, playedDepth: played.depth, best: before, played });
    before = after;
  }
}
export function chessAccuracy(moves, grades) {
  const totals = { w: { sum: 0, inverses: 0, count: 0 }, b: { sum: 0, inverses: 0, count: 0 } };
  grades.forEach(({ accuracy }, index) => {
    if (accuracy == null) return;
    const total = totals[moves[index].color];
    total.sum += accuracy;
    total.inverses += 1 / (accuracy + 5);
    total.count++;
  });
  return Object.fromEntries(Object.entries(totals).map(([color, { sum, inverses, count }]) => [
    color, count ? Math.max(0, Math.min(100, (sum / count + count / inverses - 5) / 2)) : null,
  ]));
}
