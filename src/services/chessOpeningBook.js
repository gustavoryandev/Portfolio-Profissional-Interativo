// Generated from lichess-org/chess-openings (CC0), see data/chess-openings.
import book from './chessOpeningData.json' with { type: 'json' };
export function openingBookMove(move) {
  return book[move.before.split(' ').slice(0, 4).join(' ')]?.[move.lan] ?? null;
}
export function openingBookLength({ moves }) {
  const first = moves.findIndex(move => !openingBookMove(move));
  return first === -1 ? moves.length : first;
}
