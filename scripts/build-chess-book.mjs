import { readFileSync, writeFileSync } from 'node:fs';
import { Chess } from 'chess.js';
const book = {};
for (const part of ['a', 'b', 'c', 'd', 'e']) {
  for (const row of readFileSync(`data/chess-openings/${part}.tsv`, 'utf8').trim().split('\n').slice(1)) {
    const [eco, name, pgn] = row.trim().split('\t');
    const game = new Chess();
    game.loadPgn(pgn);
    for (const move of game.history({ verbose: true })) {
      const key = move.before.split(' ').slice(0, 4).join(' ');
      (book[key] ??= {})[move.lan] ??= { eco, name };
    }
  }
}
writeFileSync('src/services/chessOpeningData.json', JSON.stringify(book));
console.log(`${Object.keys(book).length} local opening positions`);
