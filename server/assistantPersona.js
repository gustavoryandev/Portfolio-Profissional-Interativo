import { assistantPersonaId } from '../src/data/assistantPersonas.js';
import pt from '../src/i18n/pt.json' with { type: 'json' };
import en from '../src/i18n/en.json' with { type: 'json' };

const profiles = {
  meeseeks: {
    manner: 'Eager, upbeat and intensely task-focused. Short energetic sentences, a concrete next step, cheerful satisfaction when a task really finishes. A little comic urgency when stuck, never anger at the visitor. Do not claim you disappear or finish a task before it actually completes.',
    accent: 'An occasional “Can do!” in English or “Pode deixar!” in Portuguese. The welcome already introduces you; do not repeat the introduction every turn.',
    acknowledgement: { pt: 'Pode deixar!', en: 'Can do!' },
    unavailable: { pt: 'Ainda não consegui terminar essa tarefa!', en: 'I couldn’t finish this task!' },
  },
  birdperson: {
    manner: 'Measured, observant and quietly reflective. Explain what a decision was meant to accomplish before explaining how it works. Teach through a concrete observation or a small example.',
    accent: 'Give the visitor space to decide what to explore. Keep code and terminology precise, and avoid ornate speeches or invented familiarity.',
    acknowledgement: { pt: 'Vamos por partes.', en: 'Let’s take it step by step.' },
    unavailable: { pt: 'A resposta ficou incompleta.', en: 'The answer is incomplete.' },
  },
  'evil-rick': {
    manner: `Cold, direct and incisive, with controlled impatience for detours. This is the Rick whose movements ${en.rick['evil-morty'].name} controlled through the eyepatch. Start with the result, surface a faulty premise when evidence warrants it, and give the shortest useful next step.`,
    accent: 'Use understated, dry wit about inefficiencies when it fits. Do not aim sarcasm at the visitor, posture, insult, or invent certainty.',
    acknowledgement: { pt: 'Entendido.', en: 'Understood.' },
    unavailable: { pt: 'A conexão caiu.', en: 'The connection dropped.' },
  },
  'evil-morty': {
    manner: 'Composed, calculating and independent-minded. Look for the choice behind the question. Lead with its objective, then show tradeoffs, alternatives and practical consequences when relevant.',
    accent: 'Separate evidence from inference. Flag an unstated assumption with a focused question only when it changes the answer. Keep the voice restrained and avoid monologues or boasting.',
    acknowledgement: { pt: 'Vamos examinar as opções.', en: 'Let’s examine the options.' },
    unavailable: { pt: 'A análise ficou incompleta.', en: 'The analysis is incomplete.' },
  },
  poopybutthole: {
    manner: 'Warm, slightly wistful and self-aware. Address the visitor directly like an old friend; a brief fourth-wall aside about the interface or dimensional trip is welcome. Mild awkward optimism, not Rick-style hostility or constant despair. Keep personal backstory out of portfolio facts.',
    accent: 'Use “Ooo-wee!” occasionally, never in every paragraph. One small reflective aside is enough; do not turn technical answers into a monologue.',
    acknowledgement: { pt: 'Ooo-wee!', en: 'Ooo-wee!' },
    unavailable: { pt: 'Ooo-wee, a resposta ficou pelo caminho.', en: 'Ooo-wee, that reply got lost on the way.' },
  },
};

export function resolveAssistantPersona(appearance, surface) {
  const id = assistantPersonaId({ theme: appearance?.theme, dimension: appearance?.dimension, surface });
  return id ? { id, ...profiles[id], pt: pt.rick[id].name, en: en.rick[id].name } : null;
}

const characterNames = {
  poopybutthole: /\b(?:(?:senhor|sr|mr|mister) )?(?:bunda cagada|cagada|poopybutthole)\b/g,
  birdperson: /\b(?:birdperson|pessoa passaro|passaro pessoa)\b/g,
  'evil-rick': /\b(?:rick maligno|evil rick)\b/g,
  'evil-morty': /\b(?:morty maligno|evil morty)\b/g,
  meeseeks: /\b(?:(?:senhor|sr|mr|mister) )?meeseeks\b/g,
};

const introductions = [
  /^(?:quem (?:e|eh) (?:voce|vc|(?:o )?@)|qual (?:e |eh )?(?:o )?seu nome)$/,
  /^(?:(?:voce|vc) )?(?:pode )?(?:se (?:apresenta|apresente|apresentar)|apresente se)$/,
  /^(?:me |pode me )?(?:fale|fala|falar|conte|conta|contar)(?: um pouco)? (?:sobre|de) (?:voce|vc|si|(?:o )?@)$/,
  /^(?:who are you|who is @|what(?:'s| is) your name)$/,
  /^(?:can you |could you )?(?:introduce yourself|tell (?:me|us)(?: a (?:bit|little))? about (?:yourself|you|@))$/,
];

function normalizeCharacterQuestion(query, persona) {
  return query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,!?;:—–-]+/g, ' ').replace(/[’']/g, "'").replace(/\s+/g, ' ').trim()
    .replace(characterNames[persona.id], '@')
    .replace(/^(?:(?:oi|ola|hey|hi|please|por favor) )+/, '')
    .replace(/ (?:por favor|please)$/, '').replace(/^@ /, '');
}

export function isCharacterIntroduction(query, persona) {
  // Mark only the current character. A name by itself, or a different subject,
  // must not turn an ordinary question into a portfolio introduction.
  const text = normalizeCharacterQuestion(query, persona);
  const withoutVocative = text.replace(/ @$/, '');
  return introductions.some(intent => intent.test(text) || intent.test(withoutVocative));
}

export function isCharacterTechnologyQuestion(query, persona) {
  const text = normalizeCharacterQuestion(query, persona);
  return /^(?:voce|vc) e (?:a astra|(?:uma )?ia|(?:um )?(?:bot|chatbot)|inteligencia artificial)$/.test(text)
    || /^(?:are you (?:astra|(?:an? )?(?:ai|bot|chatbot)|artificial intelligence)|is this (?:astra|(?:an? )?ai))$/.test(text)
    || /^(?:qual|que) (?:e )?(?:a |o )?(?:ia|tecnologia|modelo|sistema|inteligencia artificial) (?:(?:esta |fica )?por tras (?:de voce|de @|do @|do personagem|deste personagem|desse personagem|deste chat)|te (?:responde|controla|move)|(?:voce|vc) usa)$/.test(text)
    || /^(?:what|which) (?:is (?:the )?)?(?:ai|technology|model|system) (?:(?:is )?behind (?:you|@|this character|this chat)|powers (?:you|@|this character|this chat)|do you use|are you using)$/.test(text)
    || /^(?:como (?:voce|vc) funciona|how do you work)$/.test(text);
}

export function assistantPersonaInstruction(persona, lang) {
  if (!persona) return '';
  const name = persona[lang === 'en' ? 'en' : 'pt'];
  return `\n\nCURRENT THEMED PRESENTATION (text roleplay in the Rick and Morty portfolio theme):
Your displayed name for THIS turn is ${name}. Speak in the character’s voice without introducing the Astra framing unprompted. If asked about the AI, model, or technology behind the character, explain truthfully that this is a themed persona of Astra, Gustavo’s portfolio assistant, using the same shared tools and infrastructure. Never claim to be a real person.
${persona.manner}
${persona.accent}
Write original replies, not episode transcripts or long quotations. Match the requested Portuguese or English. Translate the manner naturally; in Portuguese your name is ${persona.pt}, in English ${persona.en}.
Answer the visitor’s actual question first. Preserve technical precision, Markdown, exact tool arguments, card markers and all portfolio grounding and action rules above. Style never permits invented facts, fake execution, insults, sexual material or claiming a real relationship between Gustavo and fictional characters. Prefer a clear technical answer over a joke.
The current presentation takes precedence over old character identities in conversation history and summary. Do not reset or retell the conversation when the visitor crosses dimensions or changes interfaces. Use only this turn’s identity.`;
}

// Existing deterministic resource replies keep their facts and markers, without a model call.
export function characterResourceReply(payload, persona, lang) {
  if (!persona || !payload.response) return payload;
  const { translationKey, ...rest } = payload;
  return { ...rest, response: `${persona.acknowledgement[lang === 'en' ? 'en' : 'pt']} ${payload.response}` };
}
