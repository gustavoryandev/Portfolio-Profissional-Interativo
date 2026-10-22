import axios from "axios";

const sendMessage = async (userMessage, lang, chatHistory = []) => {
  try {
    const response = await axios.post("/api/chat", {
      userMessage,
      lang,
      chatHistory,
    });
    return response.data;
  } catch (error) {
    console.error("Erro na requisição para /api/chat:", error);
    throw error;
  }
};

export default sendMessage;