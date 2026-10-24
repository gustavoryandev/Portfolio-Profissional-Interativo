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
  'gemini-2.0-flash',
  'gemini-1.5-flash'
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
    
    const token = tokenResponse.data.access_token;
    const headers = { Authorization: `Bearer ${token}` };

    // Dispara as 4 consultas simultaneamente para carregar o novo layout
    const [currentRes, recentRes, tracksRes, artistsRes] = await Promise.allSettled([
      client.get('https://api.spotify.com/v1/me/player/currently-playing', { headers }),
      client.get('https://api.spotify.com/v1/me/player/recently-played?limit=15', { headers }),
      client.get('https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=short_term', { headers }),
      client.get('https://api.spotify.com/v1/me/top/artists?limit=5&time_range=short_term', { headers })
    ]);

    const formatTrack = (t) => ({
      name: t.name,
      artists: t.artists.map(a => a.name).join(', '),
      image: t.album.images[2]?.url || t.album.images[0]?.url,
      url: t.external_urls.spotify,
      explicit: t.explicit
    });

    let current = null;
    if (currentRes.status === 'fulfilled' && currentRes.value.status === 200 && currentRes.value.data.item) {
      current = formatTrack(currentRes.value.data.item);
      current.isPlaying = currentRes.value.data.is_playing;
    }

    const recentRaw = recentRes.status === 'fulfilled' && recentRes.value.data.items ? recentRes.value.data.items.map(i => formatTrack(i.track)) : [];
    const recent = recentRaw.filter((t, i, arr) => i === 0 || t.name !== arr[i-1].name).slice(0, 5);
    
    const topTracks = tracksRes.status === 'fulfilled' && tracksRes.value.data.items ? tracksRes.value.data.items.map(formatTrack) : [];
    
    const topArtists = artistsRes.status === 'fulfilled' && artistsRes.value.data.items ? artistsRes.value.data.items.map(a => ({
      name: a.name,
      image: a.images[2]?.url || a.images[0]?.url,
      url: a.external_urls.spotify
    })) : [];

    return { status: 'ok', current, recent, topTracks, topArtists };
  } catch (e) { return { status: 'error' }; }
}

// FETCH GITHUB SUPER RÁPIDO VIA GRAPHQL (Agora trazendo dados para o RepositoriesCard)
async function fetchGithub() {
  const { GITHUB_USERNAME: username, GITHUB_TOKEN: token } = process.env;
  if (!username || !token || token === '******') return { status: 'not_configured' };
  
  try {
    const query = `
      query {
        user(login: "${username}") {
          name login avatarUrl createdAt
          followers { totalCount }
          following { totalCount }
          repositories(first: 10, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC, orderBy: {field: STARGAZERS, direction: DESC}) {
            totalCount
            nodes { 
              name 
              description 
              url 
              stargazerCount 
              forkCount 
              primaryLanguage { name }
            }
          }
          pullRequests { totalCount }
          issues { totalCount }
          contributionsCollection {
            totalCommitContributions
            contributionCalendar {
              totalContributions
              weeks { contributionDays { contributionCount date } }
            }
          }
        }
      }
    `;

    const response = await client.post('https://api.github.com/graphql', { query }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const user = response.data.data.user;
    const repos = user.repositories.nodes;
    
    const stars = repos.reduce((acc, r) => acc + r.stargazerCount, 0);
    const forks = repos.reduce((acc, r) => acc + r.forkCount, 0);
    
    // Processando as Ofensivas (Streaks) localmente bem rápido
    const days = user.contributionsCollection.contributionCalendar.weeks.flatMap(w => w.contributionDays);
    let longestStreak = 0, currentStreak = 0, tempStreak = 0;
    let bestDay = { count: 0, date: null };

    days.forEach(day => {
      if (day.contributionCount > bestDay.count) bestDay = { count: day.contributionCount, date: day.date };
      if (day.contributionCount > 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else { tempStreak = 0; }
    });

    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].contributionCount > 0) currentStreak++;
      else if (i < days.length - 1) break;
    }

    // Formatando os repositórios para enviar ao frontend
    const formattedRepos = repos.map(repo => ({
      name: repo.name,
      description: repo.description,
      url: repo.url,
      stars: repo.stargazerCount,
      forks: repo.forkCount,
      language: repo.primaryLanguage ? repo.primaryLanguage.name : null
    }));

    return {
      status: 'ok',
      profile: { login: user.login, name: user.name, avatarUrl: user.avatarUrl, joinedYear: new Date(user.createdAt).getFullYear() },
      stats: {
        followers: user.followers.totalCount, following: user.following.totalCount, repos: user.repositories.totalCount,
        stars, forks, commits: user.contributionsCollection.totalCommitContributions,
        contributions: user.contributionsCollection.contributionCalendar.totalContributions,
        prs: user.pullRequests.totalCount, issues: user.issues.totalCount,
        currentStreak, longestStreak, bestDay
      },
      // A mágica acontece aqui: enviando a lista de repositórios ao frontend!
      repositories: formattedRepos 
    };
  } catch (e) { return { status: 'error' }; }
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

    const data = response.data.data || [];
    let totalSeconds = 0;
    let activeDays = 0;
    const langMap = {};
    const editorMap = {};

    data.forEach(day => {
      const secs = day.grand_total?.total_seconds || 0;
      if (secs > 0) activeDays++;
      totalSeconds += secs;

      day.languages?.forEach(l => { langMap[l.name] = (langMap[l.name] || 0) + l.total_seconds; });
      day.editors?.forEach(e => { editorMap[e.name] = (editorMap[e.name] || 0) + e.total_seconds; });
    });

    const formatTime = (secs) => `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`;
    const sortedLangs = Object.entries(langMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, secs]) => ({
      name, seconds: secs, percent: ((secs / totalSeconds) * 100).toFixed(1), formatted: formatTime(secs)
    }));
    const topEditor = Object.entries(editorMap).sort((a, b) => b[1] - a[1])[0];

    return {
      status: 'ok',
      summary: {
        totalFormatted: formatTime(totalSeconds),
        dailyAverageFormatted: formatTime(activeDays > 0 ? totalSeconds / activeDays : 0),
        activeDays,
        totalDays: data.length,
        topEditorName: topEditor ? topEditor[0] : '--',
        topEditorPercent: topEditor ? ((topEditor[1] / totalSeconds) * 100).toFixed(1) : 0
      },
      languages: sortedLangs
    };
  } catch (e) { return { status: 'error' }; }
}

async function fetchCanvas() {
  const { CANVAS_API_TOKEN: token, CANVAS_BASE_URL: baseUrl } = process.env;
  if (!token || !baseUrl) return { status: 'not_configured' };
  try {
    const response = await client.get(`${baseUrl.replace(/\/$/, '')}/api/v1/courses`, {
      params: { enrollment_state: 'active', per_page: 5 },
      headers: { Authorization: `Bearer ${token}` }
    });
    return { status: 'ok', courses: response.data.map(({ name, course_code: code, workflow_state: state }) => ({ name, code, state })) };
  } catch (e) { return { status: 'error' }; }
}

async function fetchLiveContext() {
  const sources = { spotify: fetchSpotify, github: fetchGithub, wakatime: fetchWakatime, canvas: fetchCanvas };
  const entries = await Promise.all(Object.entries(sources).map(async ([name, fetcher]) => [name, await fetcher()]));
  return Object.fromEntries(entries);
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  const grouped = [];
  for (const message of history.slice(-6)) {
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

    if (typeof userMessage !== 'string' || !userMessage.trim()) return res.status(400).json({ error: 'Mensagem inválida.' });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY não configurada.' });

    const perfil = readJson('perfil.json');
    const liveContext = await fetchLiveContext();

    // A MÁGICA DOS TOKENS: IA lê só esse resuminho, então nunca vai dar 429 Too Many Requests
    const geminiContext = {
      spotify: { status: liveContext.spotify?.status, playing: liveContext.spotify?.current?.name || 'offline' },
      github: { status: liveContext.github?.status },
      wakatime: { status: liveContext.wakatime?.status },
      canvas: { status: liveContext.canvas?.status, activeCourses: liveContext.canvas?.courses?.length || 0 }
    };

    const systemInstruction = `Você é o assistente virtual do portfólio de Gustavo Ryan Gomes Guedes.
Responda de forma concisa e amigável. Idiomas fora do escopo: "${fallbackLanguage}"

REGRA DE CARDS VISUAIS (Sempre inclua a tag no meio do texto quando o assunto for abordado):
- Faculdade, PUC Minas, Matérias, Estudos -> [CANVAS_CARD]
- Trabalhos, Experiência Profissional, Voluntariado -> [EXPERIENCE_CARD]
- Projetos de Programação em destaque no Portfólio -> [PROJECTS_CARD]
- Lista de Repositórios do GitHub (projetos ao vivo na nuvem) -> [REPOSITORIES_CARD]
- Perfil do GitHub (Estatísticas, Followers) -> [GITHUB_CARD]
- WakaTime, Tempo de código, Linguagens -> [STATS_CARD]
- Música, Spotify -> [SPOTIFY_CARD]
- Futebol, Galo -> [GALO_CARD]
- Contato, Falar com Gustavo -> [CONTACT_FORM]

DICA: Use [PROJECTS_CARD] para falar dos projetos consolidados do portfólio, e [REPOSITORIES_CARD] para listar os repositórios reais do GitHub sincronizados pela API.

ATENÇÃO CRÍTICA SOBRE A FACULDADE:
1. Se perguntarem sobre os estudos, liste TODAS as matérias do 2º período de Engenharia de Software da PUC Minas que o Gustavo cursa. Use os dados do perfil completo!
2. Esclareça brevemente no texto que o card abaixo exibe apenas as salas virtuais que estão ativamente sincronizadas na plataforma Canvas no momento.
3. OBRIGATORIAMENTE inclua a tag [CANVAS_CARD].

DADOS COMPLETOS DO PERFIL: ${JSON.stringify(perfil)}
STATUS DAS APIS: ${JSON.stringify(geminiContext)}`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const availableModels = await discoverModels(process.env.GEMINI_API_KEY);
    const modelsToTry = [...new Set([...availableModels, ...fallbackModels])];

    let result;
    let selectedModel;
    let lastGeminiError;

    for (const modelName of modelsToTry) {
      const model = genAI.getGenerativeModel({ model: modelName, systemInstruction });
      try {
        for (let attempt = 0; attempt < 2; attempt += 1) {
          try {
            result = await model.startChat({ history: sanitizeHistory(chatHistory) }).sendMessage(userMessage.trim());
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
      throw lastGeminiError || new Error('Nenhum modelo Gemini disponível.');
    }

    return res.status(200).json({
      response: result.response.text(),
      liveContext,
      model: selectedModel
    });
  } catch (error) {
    console.error('Erro na Serverless /api/chat:', error.message);
    const errStr = error.message + ' ' + (error?.cause?.message || '');
    if (errStr.includes('API_KEY_INVALID')) return res.status(503).json({ error: 'Chave Gemini inválida.' });
    if (error?.status === 503 || errStr.includes('high demand')) return res.status(503).json({ error: 'O Gemini está temporariamente sobrecarregado.' });
    if (error?.status === 429 || errStr.includes('quota')) return res.status(503).json({ error: 'A cota diária do Gemini foi atingida.' });
    return res.status(500).json({ error: 'Erro ao gerar resposta. Tente novamente em instantes.' });
  }

}
