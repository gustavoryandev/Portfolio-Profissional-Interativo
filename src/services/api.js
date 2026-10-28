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
export async function refreshLiveContext(sources, signal) {
  const response = await axios.post('/api/chat', { action: 'refreshContext', sources }, {
    signal, timeout: 45000,
  });
  return response.data;
}
