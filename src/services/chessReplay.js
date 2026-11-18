import { Chess } from 'chess.js';

export const MAX_PGN_LENGTH = 100_000;

export function parseChessReplay(text) {
  if (text.length > MAX_PGN_LENGTH) throw new Error('PGN too large');
  const game = new Chess();
  const pgn = text.replace(/^\uFEFF/, '').trim();
  const fenced = /^```(?:pgn)?\s*\n([\s\S]*?)\n```$/i.exec(pgn);
  game.loadPgn(fenced?.[1] ?? pgn);
  const moves = game.history({ verbose: true });
  if (!moves.length) throw new Error('PGN has no moves');
  return { initial: moves[0].before, moves };
}

export function isChessReplayRequest(text) {
  return /^\/pgn(?:\s|$)|^```pgn\s|^(?:\uFEFF)?\s*\[\w+\s+"|^\d+\.(?:\.\.)?\s*(?:[KQRBN]?[a-h][1-8]|O-O|[KQRBN][a-h1-8]?x?[a-h][1-8]|[a-h]x[a-h][1-8])/i.test(text)
    || /^(?:(?:astra[, ]+)?(?:analise|analisa|analisar|análise de) (?:uma |a |minha )?partida(?: de xadrez)?|analyze (?:a |my |this )?(?:chess )?game)[.!?]?$/i.test(text);
}
