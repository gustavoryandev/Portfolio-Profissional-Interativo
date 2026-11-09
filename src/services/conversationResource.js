// Resource requests are deliberately separate: a game is not a Chess.com rating.
export function conversationResource(text) {
  const query = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (/\b(?:nao|not|don.t)\b/.test(query)) return null;
  const chess = /xadrez|chess/.test(query);
  if (chess && /rating|\belo\b|estatistica|stats|statistics|historico|history/.test(query)) return 'chess';
  if (chess && /(?:quero|vamos|bora|podemos|pode|gostaria).*(?:jogar|partida)|(?:jogue|joga) comigo|(?:want to|let.s|can we|play|start).*(?:play|game|match)|^play chess|abr[ai].*tabuleiro|open.*board/.test(query)) return 'play';
  if (/proficiencia|proficiency|nivel.*(?:habilidade|tecnologia)|skill levels?|(?:tecnologias|ferramentas|habilidades).*(?:domina|gustavo|dele)|(?:gustavo|ele).*(?:domina|habilidades)|(?:technologies|tools|skills).*(?:he|gustavo)|(?:his|gustavo.s) skills/.test(query)) return 'skills';
  return null;
}
