import { difficulties, games, isGame } from './catalog.js';

const controls = new Set(['game.pause', 'game.resume', 'game.restart', 'game.exit', 'game.getState']);
export const validArcadeAction = action => {
  if (!action || typeof action !== 'object') return false;
  const { type, game, difficulty, challenge } = action;
  if (type === 'game.start') return isGame(game) && (difficulty === undefined || difficulties.includes(difficulty))
    && (challenge === undefined || typeof challenge === 'boolean');
  if (type === 'game.setDifficulty') return difficulties.includes(difficulty) || difficulty === 'increase' || difficulty === 'decrease';
  return type === 'arcade.open' || controls.has(type);
};

const normalize = value => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ').trim().replace(/^astra\s+/, '');
const shortQuery = query => /^(?:(?:mostr[ae](?: me)?|show(?: me)?|ver|analis[ea]|analisar|analyze) )?(?:(?:os|as|my|meus|minhas|meu|minha) )?(?:recordes?|records?|high scores?|estatisticas?|stats|statistics|desempenho|performance|conquistas?|achievements?)$/.test(query);

export function arcadeIntent(message, activeGame = null, inArcade = false) {
  const query = normalize(message);
  const game = Object.keys(games).find(id => [normalize(games[id].name), ...(games[id].aliases ?? [])]
    .some(name => (' ' + query + ' ').includes(' ' + name + ' ')));
  const arcade = /\b(arcade|fliperama)\b/.test(query);
  const list = /^(?:(?:mostre|liste|list|show(?: me)?)(?: os| the)? (?:available )?(?:games|jogos)(?: disponiveis)?|quais (?:sao os )?jogos(?: estao disponiveis| disponiveis)?|what games (?:can i play|are available))$/.test(query);
  if (list) return { info: 'catalog' };
  if (/\b(recomend[ea]|recomendar|recommend|suger[ei]|suggest)\b/.test(query) && /\b(arcade|jogos?|games?)\b/.test(query)) {
    const preference = [
      ['blocks', /\b(puzzle|strategy|estrategia|quebra cabeca)\b/],
      ['pong', /\b(duel|duelo|opponent|adversario)\b/],
      ['maze', /\b(maze|labirinto|explorar|explore)\b/],
      ['frogger', /\b(crossing|travessia|timing)\b/],
      ['snake', /\b(reflexos?|reflexes|simple|simples|beginner|iniciante)\b/],
    ].find(([, pattern]) => pattern.test(query))?.[0];
    return { info: 'recommend', game: game ?? preference };
  }
  const scoped = game || arcade || inArcade;
  const records = /\b(recordes?|records?|high scores?|pontuacoes?)\b/.test(query);
  const stats = /\b(estatisticas?|statistics|stats|desempenho|performance|conquistas?|achievements?)\b/.test(query);
  if ((records || stats) && (game || arcade || shortQuery(query))) {
    return { info: records ? 'records' : 'stats', game };
  }
  if (scoped && /\b(como (?:se )?joga[r]?|how (?:do i |to )?play|controls?|controles?|rules?|regras?|help|ajuda|tips?|dicas?|coach)\b/.test(query)) return { info: 'help', game: game ?? activeGame };
  if (/\b(abr[ae]|abrir|open|launch|acessar|entrar)\b/.test(query) && arcade && !game) return { type: 'arcade.open' };
  if (game && /\b(desafi[eo]|desafiar|challenge)\b/.test(query)) return { type: 'game.start', game, challenge: true };
  if (game && /\b(restart|reinici[ea]|reiniciar|recomec[ae]|recomecar)\b/.test(query)) return activeGame === game ? { type: 'game.restart' } : { type: 'game.start', game };
  if (game && (query === normalize(games[game].name) || /\b(start|play|jogar|jogue|joga|inici[ae]|iniciar|comec[ae]|comecar|abr[ae]|abrir|open)\b/.test(query))) return { type: 'game.start', game };
  if (scoped || /^(pause|paus[ae]|pausar|resume|retom[ae]|retomar|continuar|continue)( (o jogo|the game|o arcade))?$/.test(query)) {
    if (/\b(pause|paus[ae]|pausar|pausa)\b/.test(query)) return { type: 'game.pause', game };
    if (/\b(resume|retom[ae]|retomar|continuar|continue)\b/.test(query)) return { type: 'game.resume', game };
    if (/\b(restart|reinici[ea]|reiniciar|recomec[ae]|recomecar)\b/.test(query)) return { type: 'game.restart' };
    if (/\b(exit|quit|sair|saia|encerrar|fechar)\b/.test(query)) return { type: 'game.exit' };
    if (/\b(status|estado|score|pontuacao|placar)\b/.test(query)) return { type: 'game.getState' };
  }
  if (scoped || /\b(dificuldade|difficulty)\b/.test(query)) {
    const difficulty = [
      ['easy', /\b(easy|facil)\b/], ['medium', /\b(medium|normal|medio|media)\b/],
      ['hard', /\b(hard|dificil)\b/], ['increase', /\b(increase|aument[ae]|aumentar)\b/],
      ['decrease', /\b(decrease|diminu[ai]|diminuir|reduz[ai]|reduzir)\b/],
    ].find(([, pattern]) => pattern.test(query))?.[0];
    if (difficulty && /\b(difficulty|dificuldade|modo|mode|increase|aument[ae]|aumentar)\b/.test(query)) return { type: 'game.setDifficulty', difficulty };
  }
  if (game) return { info: 'help', game };
  if (arcade) return { info: 'catalog' };
  return null;
}
