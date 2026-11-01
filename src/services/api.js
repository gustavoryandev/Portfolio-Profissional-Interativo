import axios from "axios";

const sendMessage = async (userMessage, lang, chatHistory = [], chatContext = null) => {
  try {
    const response = await axios.post("/api/chat", {
      userMessage,
      lang,
      chatHistory,
      chatContext,
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