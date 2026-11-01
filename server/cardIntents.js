// Classificação de intenção para cards (server-side, determinística).
// Fonte única de verdade: decide (1) quais cards a IA PODE usar nesta mensagem,
// (2) se o atalho GitHub/WakaTime deve disparar e (3) o que remover da resposta do modelo.
// Regras rodam sobre texto normalizado (minúsculo, sem acentos).

const norm = (text = '') => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// Opinião/teoria nunca é pedido de exibição
const OPINION = /\b(opiniao|acha|achou|pensa|think|opinion|feel about)\b/;
// "sim", "bora"... só valem como pedido se a última resposta da Astra OFERECEU o card
const ACCEPT = /^(sim|s|yes|yeah|yep|sure|ok|okay|claro|quero|pode|pode sim|bora|vamos|topo|manda|mostra|mostre|show me|go ahead)(?:[\s,!.?]|$)/;
const REFUSE = /\b(nao|no|nope|not|don'?t|depois|later)\b/;
const OFFER = /\b(quer|gostaria|posso|deseja|would you like|do you want|want to|shall|should i|vamos|bora|let'?s)\b/;

const CHESS = /xadrez|chess/;

// Cada regra recebe (q = mensagem normalizada, tail = final da resposta anterior normalizada)
const RULES = {
  // Jogar uma partida agora. "Você sabe/gosta de xadrez?" NÃO dispara.
  CHESS_GAME: (q, tail) => {
    const strong = /\b(bora|vamos|partiu|let'?s|lets)\b/.test(q) && /\b(jogar|jogo|partida|play|game|match)\b|xadrez|chess/.test(q);
    const weak = /\b(quero|queria|podemos|posso|topo|topa|can we|can i|i want to|i'd like to|id like to)\b.{0,30}\b(jogar|uma partida|play|a game|a match)\b/.test(q);
    const theory = /\b(sabe|sabia|gosta|gostar|curte|entende|know|knows|like|likes|enjoy|good at|bom em)\b/.test(q);
    return (strong || (weak && !theory)) && (CHESS.test(q) || CHESS.test(tail));
  },
  // Estatísticas do Chess.com (somente dados, sem tabuleiro)
  CHESS_CARD: (q) => CHESS.test(q)
    && /\b(rating|elo|perfil|profile|estatisticas?|stats|historico|history|ultimas partidas|recent games|taxa de vitoria|win rate|ranking|puzzles?|problemas)\b|chess\.com/.test(q),

  // Próximo jogo, agenda, placar ou adversário do Galo
  GALO_CARD: (q) => /\b(galo|atletico(?:[ -]?mg| mineiro)?)\b/.test(q)
    && /\b(proximo|proximos|quando|horario|que horas|agenda|calendario|tabela|placar|resultados?|jogos?|joga|jogam|enfrenta|enfrentar|contra quem|adversario|rival|next|when|schedule|fixtures?|scores?|match|matches|plays?|playing|opponent|facing)\b/.test(q),

  // Grade de projetos
  PROJECTS_CARD: (q) => /\b(projetos?|trampos?|projects?)\b/.test(q)
    && /\b(quais|qual|mostra|mostre|mostrar|ver|veja|lista|listar|conhecer|show|see|list|which|what are|tell me about)\b/.test(q),

  // Horas de código / WakaTime
  STATS_CARD: (q) => /waka\s?-?time|tempo (de codigo|codando|programando)|horas (de )?(codigo|codando|programando)|coding (time|hours)|hours (coded|of cod)/.test(q)
    && /\b(quanto|quantas|quantos|how many|how much|qual|quais|what|which|mostra|mostre|show|ver|see|media|average|total|metricas?|metrics?|estatisticas?|stats)\b/.test(q),

  // O que o Gustavo está ouvindo / Spotify
  SPOTIFY_CARD: (q) => /spotify|\b(ouvindo|escutando|tocando|listening|playing)\b|musicas? (favorit|recent)|top (tracks|artists)|favorite (songs|artists|tracks)/.test(q)
    && /\b(o que|oque|qual|quais|que (musica|banda|artista)|what|which|show|mostra|mostre|ver|see)\b/.test(q),

  // Estatísticas do GitHub
  GITHUB_CARD: (q) => /github/.test(q)
    && /\b(estatisticas?|stats|metricas?|metrics?|numeros?|quantos|quantas|how many|contribu\w*|commits?|seguidores|followers?|stars?|estrelas?|streak|sequencia|perfil|profile|resumo|summary|mostra|mostre|show|ver|see)\b/.test(q),

  // Matérias/tarefas atuais da faculdade
  CANVAS_CARD: (q) => /\b(faculdade|puc|universidade|college|university|materias?|disciplinas?|courses?|classes|tarefas?|assignments|canvas|semestre|semester|estuda|estudando|cursando|studying|curso)\b/.test(q)
    && /\b(quais|qual|que|o que|what|which|como|how|mostra|mostre|show|ver|see|lista|list|tarefas?|atividades?|estuda|estudando|cursando|studying|taking|andamento|atual|atuais|current)\b/.test(q),
};

// Tema de cada card, usado para reconhecer "sim" a uma oferta da Astra
const TOPIC = {
  CHESS_GAME: /xadrez|chess/,
  CHESS_CARD: /xadrez|chess/,
  GALO_CARD: /galo|atletico|jogos|matches|games/,
  PROJECTS_CARD: /projet|project/,
  STATS_CARD: /waka|horas|hours|coding time|tempo de codigo/,
  SPOTIFY_CARD: /spotify|musica|music|ouvindo|listening/,
  GITHUB_CARD: /github/,
  CANVAS_CARD: /faculdade|puc|materia|course|disciplina/,
};

export const GUARDED_CARDS = Object.keys(RULES);

const stripTags = (text) => text.replace(/\[[A-Z_]+(?::(?:\d+|ALL))?\]/g, ' ');

/** Cards que a IA pode usar nesta rodada. */
export function allowedCards(message, lastAssistant = '') {
  const q = norm(message);
  const tail = norm(stripTags(lastAssistant)).slice(-220);
  const accepts = ACCEPT.test(q.trim()) && !REFUSE.test(q) && OFFER.test(tail);
  const allowed = new Set();
  for (const [name, rule] of Object.entries(RULES)) {
    const asked = !OPINION.test(q) && rule(q, tail);
    const accepted = accepts && TOPIC[name].test(tail);
    if (asked || accepted) allowed.add(name);
  }
  // Jogo e estatísticas de xadrez nunca juntos, a menos que o visitante peça as duas coisas
  if (allowed.has('CHESS_GAME') && !RULES.CHESS_CARD(norm(message))) allowed.delete('CHESS_CARD');
  return allowed;
}

/** Bloco colocado no fim do system prompt: a IA recebe a lista pronta, sem precisar adivinhar. */
export function cardsPromptBlock(allowed) {
  if (!allowed.size) {
    return 'CARDS AUTORIZADOS NESTA MENSAGEM: nenhum. Não use as tags [CHESS_GAME], [CHESS_CARD], [GALO_CARD], [PROJECTS_CARD], [STATS_CARD], [SPOTIFY_CARD], [GITHUB_CARD] nem [CANVAS_CARD]. Responda só em texto e não diga "aqui está o card". Se fizer sentido, ofereça em UMA frase mostrar o card e espere o visitante aceitar.';
  }
  const list = [...allowed].map((name) => `[${name}]`).join(', ');
  return `CARDS AUTORIZADOS NESTA MENSAGEM (calculado pelo sistema a partir do pedido do visitante): ${list}. Entre as tags de GitHub, Spotify, Canvas, Galo, Projetos, WakaTime e Xadrez, use SOMENTE estas, cada uma uma única vez. As demais estão proibidas nesta resposta.`;
}

/** Rede de segurança: remove tags guardadas que o modelo emitiu sem autorização (ou repetidas). */
export function guardCards(text, allowed) {
  const seen = new Set();
  const removed = [];
  const pattern = new RegExp(`\\[(${GUARDED_CARDS.join('|')})(?::(?:\\d+|ALL))?\\]`, 'g');
  const clean = String(text)
    .replace(pattern, (tag, name) => {
      if (allowed.has(name) && !seen.has(name)) { seen.add(name); return tag; }
      removed.push(name);
      return '';
    })
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { text: clean, removed };
}