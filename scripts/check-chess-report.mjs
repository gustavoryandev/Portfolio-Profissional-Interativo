import fs from 'node:fs';
import { parseChessReplay } from '../src/services/chessReplay.js';
import { gradeChessMove, chessAccuracy } from '../src/services/chessReview.js';
const report = JSON.parse(fs.readFileSync('docs/chess-validation-deep.json','utf8'));
const replay = parseChessReplay(fs.readFileSync('tests/fixtures/seunome6679-otche_nazs.pgn','utf8'));
for (const [i, result] of report.results.entries()) {
 if (result.grade === 'book') continue;
 const current = gradeChessMove(replay.moves[i], result.best, result.after, result.played);
 if (current.grade !== result.grade || current.accuracy !== result.accuracy) throw new Error(`Changed result at ${i+1}`);
}
const table = Object.fromEntries(['w','b'].map(color=>[color, report.results.reduce((counts,result,i)=>{
 if(replay.moves[i].color===color) counts[result.grade]=(counts[result.grade]??0)+1;
 return counts;
},{})]));
console.log(JSON.stringify({accuracy:chessAccuracy(replay.moves,report.results),table,depths:[Math.min(...report.results.map(r=>r.depth)),Math.max(...report.results.map(r=>r.depth))]},null,2));
