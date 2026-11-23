import axios from "axios";
import { requestChatStream } from './chatStream.js';

const sendMessage = async (userMessage, lang, chatHistory = [], chatContext = null, predefinedSuggestion = false, options) => {
  if (options?.onEvent) return requestChatStream({
    userMessage, lang, chatHistory, chatContext, predefinedSuggestion, surface: options.surface, labSnapshot: options.labSnapshot, appearance: options.appearance,
  }, options);
  try {
    const response = await axios.post("/api/chat", {
      userMessage,
      lang,
      chatHistory,
      chatContext,
      predefinedSuggestion,
      surface: options?.surface,
      appearance: options?.appearance,
      labSnapshot: options?.labSnapshot,
    });
    return response.data;
  } catch (error) {
    console.error("Erro na requisição para /api/chat:", error);
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
};

export default sendMessage;

// Uses the existing backend route but never invokes the model or sends chat text.
export async function refreshLiveContext(sources, signal, force = false) {
  const response = await axios.post('/api/chat', { action: 'refreshContext', sources, force }, {
    signal, timeout: 45000,
  });
  return response.data;
}

export async function readWakaTime(range, signal) {
  const body = range ? { action: 'wakatimeDetails', range } : { action: 'wakatimeActivity' };
  const response = await fetch('/api/chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal,
  });
  if (!response.ok) throw new Error('WakaTime request failed');
  return response.json();
}

// Share pending and completed translations across toggles and message instances.
const translationCache = new Map();
export function translateMessage(text, lang) {
  const key = JSON.stringify([text, lang]);
  if (translationCache.has(key)) return translationCache.get(key);
  const pending = axios.post('/api/chat', { action: 'translate', text, lang }, { timeout: 90000 })
    .then(response => {
      if (typeof response.data.text !== 'string' || !response.data.text.trim()) throw new Error('Empty translation');
      return response.data.text;
    }).catch(error => { translationCache.delete(key); throw error; });
  translationCache.set(key, pending);
  if (translationCache.size > 100) translationCache.delete(translationCache.keys().next().value);
  return pending;
}
