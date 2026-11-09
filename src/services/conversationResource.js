const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const acceptGame = /^(?:s{1,3}|sim|claro|bora|vamos|quero|pode|yes|yeah|yep|sure|ok(?:ay)?|let.s play)(?: (?:por favor|please))?[\s,.!?]*$/;
const askToPlay = /^(?:(?:vamos|bora|podemos|quer|topa) jogar|(?:let.s|can we|shall we|want to) play)[\s,.!?]*$/;
const chessOffer = /(?:quer(?:ia)?|gostaria|topa|would you like|do you want)\b[^?\n]*(?:jogar|partida|play|game)[^?\n]*(?:xadrez|chess)[^?\n]*\?/;
const missingBoard = /^(?:kd|cade(?: o tabuleiro)?|where is (?:it|the board))[\s,.!?]*$/;
const startingChess = /(?:comecar|iniciar|start)[^.\n]*(?:xadrez|chess)/;

// Resource requests are deliberately separate: a game is not a Chess.com rating.
export function conversationResource(text, { lastAssistant = '', offeredGame = false } = {}) {
  const query = normalize(text);
  if (/\b(?:nao|not|don.t)\b/.test(query)) return null;
  const last = normalize(lastAssistant);
  if (!last.includes('[chess_game]') && ((acceptGame.test(query) && (offeredGame || chessOffer.test(last)))
    || (missingBoard.test(query) && startingChess.test(last)))) return 'play';
  if (askToPlay.test(query)) return 'offerPlay';
  const chess = /xadrez|chess/.test(query);
  if (chess && /rating|\belo\b|estatistica|stats|statistics|historico|history/.test(query)) return 'chess';
  if (chess && /(?:quero|vamos|bora|podemos|pode|gostaria).*(?:jogar|partida)|(?:jogue|joga) comigo|(?:want to|let.s|can we|play|start).*(?:play|game|match)|^(?:play chess|jogar xadrez|bora xadrez)|abr[aei].*tabuleiro|open.*board/.test(query)) return 'play';
  if (/proficiencia|proficiency|nivel.*(?:habilidade|tecnologia)|skill levels?|(?:tecnologias|ferramentas|habilidades).*(?:domina|gustavo|dele)|(?:gustavo|ele).*(?:domina|habilidades)|(?:technologies|tools|skills).*(?:he|gustavo)|(?:his|gustavo.s) skills/.test(query)) return 'skills';
  return null;
}
