import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Carrega .env.local em ambiente de desenvolvimento local
try {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
} catch (e) {
  // Ignora se estiver em produção onde variáveis de ambiente já são injetadas
}

/**
 * Sanitiza o histórico para cumprir rigorosamente as regras da API Gemini:
 * 1. Mapeia remetentes para 'user' e 'model'.
 * 2. Agrupa mensagens consecutivas do mesmo remetente.
 * 3. Garante que o histórico COMEÇA com 'user'.
 * 4. Garante que o histórico TERMINA com 'model' (pois a mensagem atual será enviada como 'user').
 */
function sanitizeHistory(chatHistory) {
  if (!Array.isArray(chatHistory) || chatHistory.length === 0) {
    return [];
  }

  const items = [];
  chatHistory.slice(-10).forEach((msg) => {
    if (msg && msg.text && typeof msg.text === "string" && msg.text.trim()) {
      const role = msg.sender === "user" || msg.role === "user" ? "user" : "model";
      items.push({ role, text: msg.text.trim() });
    }
  });

  if (items.length === 0) return [];

  // Junta mensagens consecutivas enviadas pelo mesmo autor
  const combined = [];
  for (const item of items) {
    if (combined.length === 0) {
      combined.push(item);
    } else {
      const last = combined[combined.length - 1];
      if (last.role === item.role) {
        last.text += "\n" + item.text;
      } else {
        combined.push(item);
      }
    }
  }

  // O histórico na API Gemini DEVE começar com 'user'
  while (combined.length > 0 && combined[0].role !== "user") {
    combined.shift();
  }

  // O histórico na API Gemini DEVE terminar com 'model' antes da chamada sendMessage
  while (combined.length > 0 && combined[combined.length - 1].role !== "model") {
    combined.pop();
  }

  return combined.map((item) => ({
    role: item.role,
    parts: [{ text: item.text }],
  }));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }

    const { userMessage, lang, chatHistory } = body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        response: "Erro: A variável GEMINI_API_KEY não foi encontrada no seu arquivo .env.local.",
      });
    }

    if (!userMessage || typeof userMessage !== "string" || !userMessage.trim()) {
      return res.status(400).json({ error: "Mensagem do usuário é obrigatória." });
    }

    // Leitura resiliente do perfil.json
    let perfilData = {};
    const possiblePaths = [
      path.join(process.cwd(), "src", "data", "perfil.json"),
      path.join(process.cwd(), "data", "perfil.json"),
      path.join(process.cwd(), "public", "perfil.json"),
    ];

    for (const p of possiblePaths) {
      try {
        if (fs.existsSync(p)) {
          perfilData = JSON.parse(fs.readFileSync(p, "utf-8"));
          break;
        }
      } catch (fsErr) {
        console.warn("Aviso ao carregar perfil.json:", fsErr.message);
      }
    }

    const systemInstructionText = `
Você é o assistente virtual do Gustavo Ryan Gomes Guedes no portfólio interativo dele.
Idioma da interface selecionado: ${lang || "pt"}.

DADOS DO GUSTAVO:
${JSON.stringify(perfilData, null, 2)}

DIRETRIZES DE LINGUAGEM E RECONHECIMENTO:
1. Você entende linguagem natural e gírias do Brasil (ex: "trampos", "facul", "manja de", "Galo", "stack").
2. Responda em tom profissional, amigável e direto.

REGRAS RÍGIDAS DE IDIOMA:
- Português se perguntado em Português.
- Inglês se perguntado em Inglês.
- FALLBACK OBRIGATÓRIO: Se perguntado em QUALQUER OUTRO IDIOMA, responda EXATAMENTE:
"I can only communicate in Portuguese or English. Please choose one of these languages."

MARCADORES VISUAIS DE CARDS:
Inclua os marcadores abaixo quando o assunto for citado:
- Spotify / Música -> [SPOTIFY_CARD]
- Wakatime / Horas de código -> [STATS_CARD]
- GitHub / Repositórios -> [GITHUB_CARD]
- Canvas / PUC Minas -> [CANVAS_CARD]
- Atlético Mineiro / Galo -> [GALO_CARD]
- Contato / Contratar -> [CONTACT_FORM]
`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const formattedHistory = sanitizeHistory(chatHistory);

    // Sistema de cascata (Fallback) baseado EXATAMENTE nos modelos disponíveis nos seus prints.
    // Se o 3.8 der erro 503 (servidor lotado), o código tenta o 3.6 automaticamente, e assim por diante.
    const candidateModels = [
      "gemini-3.8-flash",
      "gemini-3.6-flash",
      "gemini-3.5-flash",
      "gemini-3.1-flash"
    ];
    
    let responseText = null;
    const errorsDetails = [];

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemInstructionText,
        });

        const chat = model.startChat({ history: formattedHistory });
        const result = await chat.sendMessage(userMessage.trim());
        responseText = result.response.text();

        if (responseText) {
          console.log(`[Gemini API] Resposta obtida com sucesso usando: ${modelName}`);
          break;
        }
      } catch (err) {
        console.warn(`[Gemini API] Falha no modelo ${modelName}:`, err.message);
        errorsDetails.push(`${modelName}: ${err.message}`);
      }
    }

    if (!responseText) {
      throw new Error(`Não foi possível conectar. Detalhes dos erros: ${errorsDetails.join(" | ")}`);
    }

    return res.status(200).json({ response: responseText });
  } catch (error) {
    console.error("Erro na Serverless Function /api/chat:", error);
    return res.status(200).json({
      response: `Erro ao conectar com o Gemini: ${error.message || "Erro interno no servidor."}`,
    });
  }
}