import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente localmente (em produção a Vercel gerencia isso)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = axios.create({ timeout: 8000 });
const fallbackLanguage = 'I can only communicate in Portuguese or English. Please choose one of these languages.';

// Função para ler arquivos de contexto (JSON)
function readJson(fileName) {
  const candidates = [
    path.join(process.cwd(), 'src', 'data', fileName),
    path.join(process.cwd(), 'src', 'i18n', fileName),
    path.join(process.cwd(), 'data', fileName)
  ];

  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  }

  throw new Error(`Context file not found: ${fileName}`);
}

async function fetchSpotify() {
  const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret, SPOTIFY_REFRESH_TOKEN: refresh } = process.env;
  if (!id || !secret || !refresh) return { status: 'not_configured' };

  try {
    const token = await client.post('https://accounts.spotify.com/api/token', new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refresh
    }).toString(), {
      headers: {
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    const response = await client.get('https://api.spotify.com/v1/me/player', {
      headers: { Authorization: `Bearer ${token.data.access_token}` }
    });
    const item = response.status === 204 ? null : response.data.item;
    return {
      status: 'ok',
      playing: response.status !== 204 && response.data.is_playing,
      track: item?.name,
      artists: item?.artists?.map((artist) => artist.name)
    };
  } catch (error) {
    throw new Error('Falha ao buscar dados do Spotify');
  }
}

async function fetchGithub() {
  const { GITHUB_USERNAME: username, GITHUB_TOKEN: token } = process.env;
  if (!username) return { status: 'not_configured' };
  try {
    const response = await client.get(`https://api.github.com/users/${encodeURIComponent(username)}/repos`, {
      params: { sort: 'updated', per_page: 10 },
      headers: {
        Accept: 'application/vnd.github+json',
        ...(token && token !== '******' ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    return {
      status: 'ok',
      repositories: response.data.map(({ name, description, language, stargazers_count: stars, html_url: url }) => ({
        name, description, language, stars, url
      }))
    };
  } catch (error) {
     throw new Error('Falha ao buscar dados do GitHub');
  }
}

async function fetchWakatime() {
  const { WAKATIME_API_KEY: key } = process.env;
  if (!key) return { status: 'not_configured' };
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 7);
  
  try {
    const response = await client.get('https://wakatime.com/api/v1/users/current/summaries', {
      params: { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) },
      auth: { username: key, password: '' }
    });
    return {
      status: 'ok',
      days: response.data.data?.map((day) => ({
        date: day.range?.date,
        totalSeconds: day.grand_total?.total_seconds,
        readable: day.grand_total?.text
      }))
    };
  } catch (error) {
     throw new Error('Falha ao buscar dados do Wakatime');
  }
}

async function fetchCanvas() {
  const { CANVAS_API_TOKEN: token, CANVAS_BASE_URL: baseUrl } = process.env;
  if (!token || !baseUrl) return { status: 'not_configured' };
  try {
    const response = await client.get(`${baseUrl.replace(/\/$/, '')}/api/v1/courses`, {
      params: { enrollment_state: 'active', per_page: 10 },
      headers: { Authorization: `Bearer ${token}` }
    });
    return {
      status: 'ok',
      courses: response.data.map(({ id, name, course_code: code, workflow_state: state }) => ({
        id, name, code, state
      }))
    };
  } catch (error) {
    throw new Error('Falha ao buscar dados do Canvas');
  }
}

async function fetchLiveContext() {
  const sources = { spotify: fetchSpotify, github: fetchGithub, wakatime: fetchWakatime, canvas: fetchCanvas };
  const entries = await Promise.all(Object.entries(sources).map(async ([name, fetcher]) => {
    try {
      return [name, await fetcher()];
    } catch (error) {
      return [name, { status: 'error', message: error instanceof Error ? error.message : 'Unavailable' }];
    }
  }));
  return Object.fromEntries(entries);
}

// CORREÇÃO APLICADA: Tratamento para evitar loop infinito com grouped.length > 0
function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  const messages = history.slice(-10).map((message) => ({
    role: message.sender === 'user' ? 'user' : 'model',
    text: message.text?.trim()
  })).filter((message) => message.text);
  
  const grouped = [];
  for (const message of messages) {
    const previous = grouped.at(-1);
    if (previous?.role === message.role) previous.text += `\n${message.text}`;
    else grouped.push(message);
  }
  
  // Garantindo que a limpeza não quebre se o array esvaziar
  while (grouped.length > 0 && grouped[0]?.role !== 'user') grouped.shift();
  while (grouped.length > 0 && grouped.at(-1)?.role !== 'model') grouped.pop();
  
  return grouped.map(({ role, text }) => ({ role, parts: [{ text }] }));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { userMessage, lang = 'pt', chatHistory = [] } = typeof req.body === 'string'
      ? JSON.parse(req.body)
      : req.body || {};
      
    if (!userMessage?.trim()) return res.status(400).json({ error: 'Mensagem do usuário é obrigatória.' });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY não configurada.' });

    const pt = readJson('pt.json');
    const en = readJson('en.json');
    const liveContext = await fetchLiveContext();
    
    const systemInstruction = `Você é o assistente virtual do portfólio de Gustavo Ryan Gomes Guedes.
Responda de forma concisa, técnica e formal. Adapte-se para a informalidade SOMENTE se o usuário iniciar usando gírias.
ATENÇÃO: O usuário selecionou o idioma da interface como "${lang === 'pt' ? 'Português' : 'Inglês'}". 
Você DEVE responder EXCLUSIVAMENTE em ${lang === 'pt' ? 'Português' : 'Inglês'}, independente do idioma original da pergunta do usuário.
Para qualquer outro idioma, responda exatamente: "${fallbackLanguage}"
Use somente os dados de contexto abaixo e nunca invente dados de integrações com status error ou not_configured.
Quando o tema corresponder, inclua a tag visual no texto: Spotify/música [SPOTIFY_CARD], GitHub [GITHUB_CARD], experiência profissional [EXPERIENCE_CARD],
WakaTime [STATS_CARD], Canvas/PUC Minas [CANVAS_CARD], Atlético Mineiro/Galo [GALO_CARD],
contato/contratação [CONTACT_FORM]. As tags devem ser literais e podem aparecer no meio da resposta.

PERFIL:
${JSON.stringify(perfil)}

TRADUÇÕES PT:
${JSON.stringify(pt)}

TRADUÇÕES EN:
${JSON.stringify(en)}

DADOS AO VIVO:
${JSON.stringify(liveContext)}`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Lista de modelos priorizados: do mais rápido/recente com cota, até os mais antigos como plano de segurança
    const preferredModels = [
      'gemini-3.8-flash',
      'gemini-3.6-flash',
      'gemini-3.1-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash'
    ];

    let result = null;
    let lastError = null;

    // Sistema de Fallback: Tenta iterar sobre a lista até obter sucesso
    for (const modelName of preferredModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction
        });
        
        result = await model.startChat({ history: sanitizeHistory(chatHistory) })
          .sendMessage(userMessage.trim());
          
        console.log(`[Gemini API] Mensagem processada com sucesso via: ${modelName}`);
        break; // Sai do loop imediatamente assim que a resposta der certo
      } catch (error) {
        console.warn(`[Gemini API] O modelo ${modelName} falhou ou não está disponível. Tentando o próximo...`);
        lastError = error;
      }
    }

    // Se varrer toda a lista e nenhum modelo funcionar, lança o erro para o catch principal
    if (!result) {
      throw new Error(`Todos os modelos de fallback falharam. Último erro: ${lastError?.message}`);
    }

    return res.status(200).json({ 
      response: result.response.text(),
      liveContext // <-- ADICIONADO: Enviando os dados reais para os cards do front-end
    });
  } catch (error) {
    console.error('Erro na Serverless Function /api/chat:', error);
    return res.status(500).json({ error: 'Erro ao gerar resposta.' });
  }
}