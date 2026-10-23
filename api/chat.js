import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Timeout super rápido de 3.5s para evitar que as APIs atrasem o chat
const client = axios.create({ timeout: 3500 });

// CACHE GLOBAL: Lembra qual modelo funcionou para não pesquisar de novo!
let cachedWorkingModel = null;

async function getBestAvailableModel(apiKey) {
  if (cachedWorkingModel) return cachedWorkingModel; // Se já sabe qual funciona, usa direto (Instantâneo)

  try {
    // Pergunta pro Google quais modelos a sua chave específica pode usar
    const response = await axios.get('https://generativelanguage.googleapis.com/v1beta/models', {
      headers: { 'x-goog-api-key': apiKey },
      timeout: 5000
    });
    
    const models = response.data.models || [];
    
    // FILTRO RIGOROSO: Pega os modelos flash, mas BLOQUEIA modelos experimentais e "omni" que têm cota zero no plano gratuito!
    const validModels = models
      .map(m => m.name.replace('models/', ''))
      .filter(name => 
        name.includes('flash') && 
        !name.includes('vision') &&
        !name.includes('omni') && 
        !name.includes('preview') && 
        !name.includes('exp')
      );
    
    if (validModels.length > 0) {
      // Ordena decrescente para pegar a versão mais nova oficial (ex: 3.1 antes de 1.5)
      validModels.sort((a, b) => b.localeCompare(a));
      cachedWorkingModel = validModels[0];
      console.log('[Gemini] Modelo Oficial detectado e salvo em cache:', cachedWorkingModel);
      return cachedWorkingModel;
    }
  } catch (error) {
    console.warn('[Gemini] Falha ao descobrir modelos:', error.message);
  }
  
  // Fallback extremo
  return 'gemini-1.5-flash'; 
}

const fallbackLanguage = 'I can only communicate in Portuguese or English. Please choose one of these languages.';

function readJson(fileName) {
  const directories = [
    path.join(process.cwd(), 'src', 'data'),
    path.join(process.cwd(), 'src', 'i18n'),
    path.join(process.cwd(), 'data')
  ];
  const filePath = directories.map((directory) => path.join(directory, fileName)).find((candidate) => fs.existsSync(candidate));
  if (!filePath) throw new Error(`Context file not found: ${fileName}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function fetchSpotify() {
  const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret, SPOTIFY_REFRESH_TOKEN: refresh } = process.env;
  if (!id || !secret || !refresh) return { status: 'not_configured' };

  try {
    const tokenResponse = await client.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh }).toString(),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    const response = await client.get('https://api.spotify.com/v1/me/player', {
      headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
    });
    const item = response.status === 204 ? null : response.data.item;
    return {
      status: 'ok',
      playing: response.status !== 204 && response.data.is_playing,
      track: item?.name,
      artists: item?.artists?.map((artist) => artist.name)
    };
  } catch (error) {
    console.warn('[Spotify] Erro na API:', error.message);
    return { status: 'error', message: 'Spotify indisponível' };
  }
}

async function fetchGithub() {
  const { GITHUB_USERNAME: username, GITHUB_TOKEN: token } = process.env;
  if (!username) return { status: 'not_configured' };
  
  const headers = {
    Accept: 'application/vnd.github+json',
    ...(token && token !== '******' ? { Authorization: `Bearer ${token}` } : {})
  };

  try {
    const [userResponse, reposResponse] = await Promise.all([
      client.get(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers }),
      client.get(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=20`, { headers })
    ]);

    const repos = reposResponse.data;
    const totalStars = repos.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0);

    return {
      status: 'ok',
      profile: {
        avatar: userResponse.data.avatar_url,
        followers: userResponse.data.followers,
        public_repos: userResponse.data.public_repos,
        bio: userResponse.data.bio
      },
      stats: { totalStars },
      repositories: repos
        .filter(repo => !repo.fork)
        .map(({ name, description, language, stargazers_count: stars, html_url: url, homepage }) => ({
          name, description, language, stars, url, homepage
        }))
        .sort((a, b) => b.stars - a.stars)
    };
  } catch (error) {
    console.warn('[GitHub] Erro na API:', error.message);
    return { status: 'error', message: 'GitHub indisponível' };
  }
}

async function fetchWakatime() {
  const { WAKATIME_API_KEY: key } = process.env;
  if (!key) return { status: 'not_configured' };
  
  try {
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - 7);
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
    console.warn('[Wakatime] Erro na API:', error.message);
    return { status: 'error', message: 'Wakatime indisponível' };
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
    console.warn('[Canvas] Erro na API:', error.message);
    return { status: 'error', message: 'Canvas indisponível' };
  }
}

async function fetchLiveContext() {
  const sources = { spotify: fetchSpotify, github: fetchGithub, wakatime: fetchWakatime, canvas: fetchCanvas };
  const entries = await Promise.all(Object.entries(sources).map(async ([name, fetcher]) => {
    try {
      return [name, await fetcher()];
    } catch (error) {
      console.warn(`[Live context] ${name} falhou criticamente:`, error.message);
      return [name, { status: 'error', message: 'Integration unavailable' }];
    }
  }));
  return Object.fromEntries(entries);
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  const grouped = [];
  for (const message of history.slice(-10)) {
    const text = typeof message?.text === 'string' ? message.text.trim() : '';
    if (!text) continue;
    const role = message.sender === 'user' ? 'user' : 'model';
    const previous = grouped.at(-1);
    if (previous?.role === role) previous.text += `\n${text}`;
    else grouped.push({ role, text });
  }
  while (grouped.length && grouped[0].role !== 'user') grouped.shift();
  while (grouped.length && grouped.at(-1).role !== 'model') grouped.pop();
  return grouped.map(({ role, text }) => ({ role, parts: [{ text }] }));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { userMessage, lang = 'pt', chatHistory = [] } = body;
    
    if (typeof userMessage !== 'string' || !userMessage.trim()) {
      return res.status(400).json({ error: 'Mensagem do usuário é obrigatória.' });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY não configurada no servidor.' });
    }

    const perfil = readJson('perfil.json');
    const pt = readJson('pt.json');
    const en = readJson('en.json');
    const liveContext = await fetchLiveContext();

    const systemInstruction = `Você é o assistente virtual do portfólio de Gustavo Ryan Gomes Guedes.
Responda de forma concisa, técnica e amigável no idioma da pergunta.
Para qualquer idioma diferente de português ou inglês, responda exatamente: "${fallbackLanguage}"
Use somente os dados fornecidos e não invente dados de integrações indisponíveis.
Inclua as tags literais [SPOTIFY_CARD], [GITHUB_CARD], [STATS_CARD], [CANVAS_CARD], [GALO_CARD],
[CONTACT_FORM], [PROJECTS_CARD] ou [EXPERIENCE_CARD] quando o assunto correspondente aparecer.

PERFIL:
${JSON.stringify(perfil)}

TRADUÇÕES:
${JSON.stringify({ pt, en })}

DADOS AO VIVO:
${JSON.stringify(liveContext)}`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Descobre dinamicamente qual é o melhor modelo pra sua chave
    const modelName = await getBestAvailableModel(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({ 
      model: modelName, 
      systemInstruction 
    });

    const result = await model.startChat({ history: sanitizeHistory(chatHistory) })
      .sendMessage(userMessage.trim());

    return res.status(200).json({
      response: result.response.text(),
      liveContext,
      model: modelName
    });

  } catch (error) {
    console.error('Erro na API do Gemini:', error);
    
    const errorMessage = error instanceof Error ? error.message : '';
    const status = error?.status;
    
    if (errorMessage.includes('API_KEY_INVALID')) {
      return res.status(503).json({ error: 'Sua chave de API do Gemini expirou ou é inválida.' });
    }
    
    // Tratamento específico para o Erro 429 (Cota Excedida)
    if (status === 429 || errorMessage.includes('quota') || errorMessage.includes('Too Many Requests')) {
      return res.status(503).json({ error: 'LIMITE ATINGIDO: A cota gratuita da IA acabou. Por favor, gere uma nova chave de API ou aguarde 24h.' });
    }
    
    return res.status(503).json({ error: 'Os servidores da IA estão ocupados. Tente novamente em instantes!' });
  }
}