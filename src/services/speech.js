// src/services/speech.js
// Reconhecimento nativo e reprodução neural via /api/tts.
// - Reconhecimento: SpeechRecognition / webkitSpeechRecognition (hook em hooks/useVoice.js)
// - Síntese: Edge TTS no servidor; um player compartilhado por todas as mensagens

export const SpeechRecognitionCtor =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition || null
    : null;

export const isRecognitionSupported = Boolean(SpeechRecognitionCtor);

const hasBrowserSpeech = () => typeof window !== 'undefined' &&
  typeof window.speechSynthesis?.speak === 'function' &&
  typeof window.SpeechSynthesisUtterance === 'function';
const hasServerSpeech =
  typeof window !== 'undefined' &&
  typeof window.Audio === 'function' && typeof window.fetch === 'function';
export const isSynthesisSupported = hasServerSpeech || hasBrowserSpeech();

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

// Shared player: cancellation also invalidates pending requests and playback callbacks.
let activeId = null;
let sessionId = 0;
let controller = null;
let player = null;
let audioUrl = null;
let utterance = null;
let browserStartTimer = null;
let preferBrowserUntil = 0;
let state = { id: null, status: 'idle' };
const listeners = new Set();
function notify(id, status) {
  activeId = status === 'loading' || status === 'playing' ? id : null;
  state = { id, status };
  listeners.forEach(listener => listener());
}
export function getActiveSpeechId() { return activeId; }
export function getSpeechState() { return state; }
export function subscribeSpeech(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function stopSpeaking() {
  sessionId += 1;
  clearTimeout(browserStartTimer);
  if (utterance) {
    utterance.onstart = utterance.onend = utterance.onerror = null;
    utterance = null;
    window.speechSynthesis.cancel();
  }
  controller?.abort();
  controller = null;
  if (player) {
    player.onended = null;
    player.onerror = null;
    player.pause();
    player.removeAttribute('src');
    player.load();
    player = null;
  }
  if (audioUrl) URL.revokeObjectURL(audioUrl);
  audioUrl = null;
  notify(null, 'idle');
}

function speakInBrowser(id, text, lang) {
  stopSpeaking();
  if (!hasBrowserSpeech()) {
    notify(id, 'error');
    return false;
  }
  const session = sessionId;
  try {
    utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = toSpeechLocale(lang);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang === utterance.lang) ||
      voices.find(v => v.lang?.split('-')[0] === utterance.lang.split('-')[0]);
    if (voice) utterance.voice = voice;
    const fail = () => {
      if (session !== sessionId) return;
      stopSpeaking();
      notify(id, 'error');
    };
    utterance.onstart = () => {
      if (session !== sessionId) return;
      clearTimeout(browserStartTimer);
      notify(id, 'playing');
    };
    utterance.onend = () => { if (session === sessionId) stopSpeaking(); };
    utterance.onerror = fail;
    notify(id, 'loading');
    browserStartTimer = setTimeout(fail, 10000);
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    stopSpeaking();
    notify(id, 'error');
    return false;
  }
}

export async function speak(id, markdown, lang) {
  if (!isSynthesisSupported) return false;
  const text = toSpeechText(markdown);
  if (!text) return false;
  // After a server failure, subsequent clicks start speech directly in the
  // user gesture (also allowing recovery from browser autoplay restrictions).
  if (hasBrowserSpeech() && (!hasServerSpeech || Date.now() < preferBrowserUntil)) {
    return speakInBrowser(id, text, lang);
  }
  stopSpeaking();
  const session = sessionId;
  const abort = new AbortController();
  controller = abort;
  notify(id, 'loading');
  const timeout = setTimeout(() => abort.abort(), 25000);
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang: String(lang).startsWith('en') ? 'en' : 'pt' }),
      signal: abort.signal,
    });
    if (!response.ok || !response.headers.get('content-type')?.includes('audio/mpeg')) throw new Error('TTS unavailable');
    const blob = await response.blob();
    if (session !== sessionId) return false;
    if (!blob.size) throw new Error('Empty audio');
    audioUrl = URL.createObjectURL(blob);
    player = new Audio(audioUrl);
    player.onended = () => { if (session === sessionId) stopSpeaking(); };
    player.onerror = () => {
      if (session !== sessionId) return;
      preferBrowserUntil = Date.now() + 5 * 60 * 1000;
      speakInBrowser(id, text, lang);
    };
    await player.play();
    if (session !== sessionId) return false;
    notify(id, 'playing');
    return true;
  } catch {
    if (session === sessionId) {
      preferBrowserUntil = Date.now() + 5 * 60 * 1000;
      return speakInBrowser(id, text, lang);
    }
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
