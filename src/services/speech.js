// src/services/speech.js
// Voz do chat com a Web Speech API nativa (sem chaves e sem serviços extras).
// - Reconhecimento: SpeechRecognition / webkitSpeechRecognition (hook em hooks/useVoice.js)
// - Síntese: speechSynthesis, com um único "player" compartilhado por todas as mensagens

export const SpeechRecognitionCtor =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition || null
    : null;

export const isRecognitionSupported = Boolean(SpeechRecognitionCtor);

export const isSynthesisSupported =
  typeof window !== 'undefined' &&
  'speechSynthesis' in window &&
  typeof window.SpeechSynthesisUtterance === 'function';

// Idioma do app ('pt' | 'en') -> locale BCP-47 usado pelos motores de voz
export function toSpeechLocale(lang = 'pt') {
  return String(lang).startsWith('en') ? 'en-US' : 'pt-BR';
}

// Remove marcadores que não devem ser lidos em voz alta (tags de cards, markdown, código)
export function toSpeechText(markdown = '') {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')                 // blocos de código
    .replace(/\[[A-Z_]+(?::[A-Z0-9]+)?\]/g, ' ')     // tags de card: [SPOTIFY_CARD], [GALO_CARD:5]
    .replace(/^#{1,6}\s+/gm, '')                     // títulos
    .replace(/`([^`]*)`/g, '$1')                     // código inline
    .replace(/\*\*([^*]+)\*\*/g, '$1')               // negrito
    .replace(/^\s*[-*•]\s+/gm, '')                   // marcadores de lista
    .replace(/https?:\/\/\S+/g, ' ')                 // links
    .replace(/\s+/g, ' ')
    .trim();
}

// Chrome interrompe falas longas (~15s); quebramos em trechos curtos, por frase
const MAX_CHUNK = 220;

function wrapWords(text) {
  const out = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if (line && (`${line} ${word}`).length > MAX_CHUNK) {
      out.push(`${line} `);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) out.push(line);
  return out;
}

function chunkText(text) {
  const sentences = text.match(/[^.!?…]+[.!?…]*\s*/g) ?? [text];
  const chunks = [];
  let current = '';
  for (const sentence of sentences) {
    const pieces = sentence.length > MAX_CHUNK ? wrapWords(sentence) : [sentence];
    for (const piece of pieces) {
      if (current && (current + piece).length > MAX_CHUNK) {
        chunks.push(current.trim());
        current = '';
      }
      current += piece;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function pickVoice(locale) {
  const voices = window.speechSynthesis.getVoices?.() ?? [];
  const prefix = locale.slice(0, 2).toLowerCase();
  return (
    voices.find((voice) => voice.lang === locale) ||
    voices.find((voice) => voice.lang?.toLowerCase().startsWith(prefix)) ||
    null
  );
}

// Estado compartilhado: qual mensagem está tocando agora (null se nenhuma)
let activeId = null;
let sessionId = 0; // invalida callbacks de falas antigas
const listeners = new Set();

function setActive(id) {
  if (activeId === id) return;
  activeId = id;
  listeners.forEach((listener) => listener());
}

export function getActiveSpeechId() {
  return activeId;
}

export function subscribeSpeech(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function stopSpeaking() {
  sessionId += 1;
  if (isSynthesisSupported) window.speechSynthesis.cancel();
  setActive(null);
}

// Lê a resposta de uma mensagem. Retorna false se não for possível falar.
export function speak(id, markdown, lang) {
  if (!isSynthesisSupported) return false;
  const text = toSpeechText(markdown);
  if (!text) return false;

  stopSpeaking();
  const session = ++sessionId;

  const synth = window.speechSynthesis;
  if (synth.paused) synth.resume();

  const locale = toSpeechLocale(lang);
  const voice = pickVoice(locale);
  const chunks = chunkText(text);

  const finish = () => {
    sessionId += 1;
    synth.cancel();
    setActive(null);
  };

  setActive(id);

  chunks.forEach((chunk, index) => {
    const utterance = new window.SpeechSynthesisUtterance(chunk);
    utterance.lang = locale;
    if (voice) utterance.voice = voice;
    utterance.onend = () => {
      if (session !== sessionId) return;
      if (index === chunks.length - 1) finish();
    };
    utterance.onerror = () => {
      if (session !== sessionId) return;
      finish();
    };
    synth.speak(utterance);
  });

  return true;
}