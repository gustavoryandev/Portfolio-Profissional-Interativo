import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = axios.create({ timeout: 8000 });
const fallbackLanguage = 'I can only communicate in Portuguese or English. Please choose one of these languages.';
const fallbackModels = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.1-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash'
];

function modelPriority(name) {
  const normalized = name.toLowerCase();
  const familyScore = normalized.includes('flash') ? 0 : 100;
  const version = normalized.match(/gemini-(\d+)(?:\.(\d+))?/);
  const versionScore = version ? Number(version[1]) * 10 + Number(version[2] || 0) : 0;
  const previewPenalty = normalized.includes('preview') ? 10 : 0;
  return familyScore - versionScore + previewPenalty;
}

async function discoverModels(apiKey) {
  try {
    const response = await client.get('https://generativelanguage.googleapis.com/v1beta/models', {
      headers: { 'x-goog-api-key': apiKey },
      params: { pageSize: 100 }
    });
    const models = response.data.models
      ?.filter((model) => model.supportedGenerationMethods?.includes('generateContent'))
      .map((model) => model.name.replace(/^models\//, ''))
      .filter((name) => /^gemini-\d+(?:\.\d+)?-(?:flash|pro)(?:-(?:latest|preview|001))?$/i.test(name));

    if (!models?.length) return [];
    return [...new Set(models)].sort((left, right) => modelPriority(left) - modelPriority(right));
  } catch (error) {
    console.warn('[Gemini] Não foi possível descobrir modelos disponíveis:', error.message);
    return [];
  }
}

function isRetryableModelError(error) {
  const message = error instanceof Error ? error.message : '';
  return [404, 429, 500, 502, 503, 504].includes(error?.status)
    || message.includes('is not found')
    || message.includes('high demand')
    || message.includes('quota')
    || message.includes('Developer instruction is not enabled');
}

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
}

async function fetchGithub() {
  const { GITHUB_USERNAME: username, GITHUB_TOKEN: token } = process.env;
  if (!username) return { status: 'not_configured' };
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
}

async function fetchWakatime() {
  const { WAKATIME_API_KEY: key } = process.env;
  if (!key) return { status: 'not_configured' };
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
}

async function fetchCanvas() {
  const { CANVAS_API_TOKEN: token, CANVAS_BASE_URL: baseUrl } = process.env;
  if (!token || !baseUrl) return { status: 'not_configured' };
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
}

async function fetchLiveContext() {
  const sources = { spotify: fetchSpotify, github: fetchGithub, wakatime: fetchWakatime, canvas: fetchCanvas };
  const entries = await Promise.all(Object.entries(sources).map(async ([name, fetcher]) => {
    try {
      return [name, await fetcher()];
    } catch (error) {
      console.warn(`[Live context] ${name} unavailable:`, error.message);
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
      return res.status(500).json({ error: 'GEMINI_API_KEY não configurada.' });
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
    const availableModels = await discoverModels(process.env.GEMINI_API_KEY);
    const modelsToTry = [...new Set([...availableModels, ...fallbackModels])];
    let result;
    let selectedModel;
    let lastGeminiError;

    for (const modelName of modelsToTry) {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction
      });

      try {
        for (let attempt = 0; attempt < 2; attempt += 1) {
          try {
            result = await model.startChat({ history: sanitizeHistory(chatHistory) })
              .sendMessage(userMessage.trim());
            selectedModel = modelName;
            break;
          } catch (error) {
            lastGeminiError = error;
            if (error?.status === 503 && attempt === 0) {
              await new Promise((resolve) => setTimeout(resolve, 800));
              continue;
            }
            throw error;
          }
        }
        if (result) break;
      } catch (error) {
        lastGeminiError = error;
        if (!isRetryableModelError(error)) throw error;
        console.warn(`[Gemini] Modelo ${modelName} indisponível; tentando o próximo.`);
      }
    }

    if (!result) {
      const error = new Error('Nenhum modelo Gemini disponível para processar a solicitação.');
      error.cause = lastGeminiError;
      error.status = lastGeminiError?.status;
      throw error;
    }

    return res.status(200).json({
      response: result.response.text(),
      liveContext,
      model: selectedModel
    });
  } catch (error) {
    console.error('Erro na Serverless Function /api/chat:', error);
    const errorMessage = error instanceof Error ? error.message : '';
    const causeMessage = error?.cause instanceof Error ? error.cause.message : '';
    const completeErrorMessage = `${errorMessage} ${causeMessage}`;
    const errorStatus = error?.status || error?.cause?.status;
    const isInvalidKey = completeErrorMessage.includes('API_KEY_INVALID') || completeErrorMessage.includes('API key not valid');
    const isModelUnavailable = completeErrorMessage.includes('is not found') || completeErrorMessage.includes('NOT_FOUND');
    const isOverloaded = errorStatus === 503 || completeErrorMessage.includes('high demand');
    const isQuotaExceeded = errorStatus === 429 || completeErrorMessage.includes('quota');

    if (isInvalidKey) {
      return res.status(503).json({ error: 'A chave GEMINI_API_KEY é inválida ou expirou. Gere uma nova chave no Google AI Studio.' });
    }

    if (isModelUnavailable) {
      return res.status(503).json({ error: 'O modelo Gemini configurado não está disponível para esta chave.' });
    }

    if (isOverloaded) {
      return res.status(503).json({ error: 'O Gemini está temporariamente sobrecarregado. Tente novamente em alguns segundos.' });
    }

    if (isQuotaExceeded) {
      return res.status(503).json({ error: 'A cota diária do Gemini foi atingida. Tente novamente mais tarde ou configure um projeto com faturamento.' });
    }

    return res.status(500).json({ error: 'Erro ao gerar resposta.' });
  }
}
