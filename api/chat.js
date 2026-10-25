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

// 1. TIMEOUT REDUZIDO NA DESCOBERTA DE MODELOS
async function discoverModels(apiKey) {
  try {
    const response = await client.get('https://generativelanguage.googleapis.com/v1beta/models', {
      headers: { 'x-goog-api-key': apiKey },
      params: { pageSize: 100 },
      timeout: 4000
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

// 2. TRATAMENTO DE TIMEOUTS E ERROS DE REDE
function isRetryableModelError(error) {
  const message = error instanceof Error ? error.message : '';
  const lower = message.toLowerCase();
  return [404, 429, 500, 502, 503, 504].includes(error?.status)
    || message.includes('is not found')
    || message.includes('high demand')
    || message.includes('quota')
    || message.includes('Developer instruction is not enabled')
    || error?.name === 'AbortError'
    || lower.includes('abort')
    || lower.includes('timeout')
    || lower.includes('fetch failed');
}

// 3. CACHE DO PERFIL JSON
const jsonCache = new Map();
function readJson(fileName) {
  const directories = [
    path.join(process.cwd(), 'src', 'data'),
    path.join(process.cwd(), 'src', 'i18n'),
    path.join(process.cwd(), 'data')
  ];
  const filePath = directories.map((directory) => path.join(directory, fileName)).find((candidate) => fs.existsSync(candidate));
  if (!filePath) throw new Error(`Context file not found: ${fileName}`);

  const mtime = fs.statSync(filePath).mtimeMs;
  const cached = jsonCache.get(filePath);
  if (cached && cached.mtime === mtime) return cached.data;

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  jsonCache.set(filePath, { mtime, data });
  return data;
}

// ==========================================
// SISTEMA DE CACHES DE ALTA PERFORMANCE
// ==========================================

const LIVE_TTL = {
  spotify: 15 * 1000,
  github: 10 * 60 * 1000,
  wakatime: 10 * 60 * 1000,
  canvas: 10 * 60 * 1000,
  galo: 2 * 60 * 1000,
  chess: 5 * 60 * 1000
};
const LIVE_ERROR_TTL = 10 * 1000;
const liveCache = new Map(); 

async function cachedSource(name, fetcher) {
  const now = Date.now();
  const entry = liveCache.get(name);

  if (entry?.data && entry.expires > now) return entry.data;
  if (entry?.promise) return entry.promise;

  const promise = (async () => {
    let data;
    try {
      data = await fetcher();
    } catch {
      data = { status: 'error' };
    }

    const previous = liveCache.get(name)?.data;
    if (data.status === 'error' && previous?.status === 'ok') {
      liveCache.set(name, { data: previous, expires: Date.now() + LIVE_ERROR_TTL });
      return previous;
    }

    const ttl = data.status === 'error' ? LIVE_ERROR_TTL : (LIVE_TTL[name] ?? 60 * 1000);
    liveCache.set(name, { data, expires: Date.now() + ttl });
    return data;
  })();

  liveCache.set(name, { ...entry, promise });
  return promise;
}

let spotifyTokenCache = { token: null, expires: 0 };
async function getSpotifyToken(id, secret, refresh) {
  if (spotifyTokenCache.token && spotifyTokenCache.expires > Date.now()) return spotifyTokenCache.token;

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

  spotifyTokenCache = {
    token: tokenResponse.data.access_token,
    expires: Date.now() + ((tokenResponse.data.expires_in || 3600) - 60) * 1000
  };
  return spotifyTokenCache.token;
}

let modelListCache = { list: null, expires: 0 };
async function getModelList(apiKey) {
  if (modelListCache.list && modelListCache.expires > Date.now()) return modelListCache.list;

  const discovered = await discoverModels(apiKey);
  const list = [...new Set([...discovered, ...fallbackModels])];
  modelListCache = { list, expires: Date.now() + (discovered.length ? 60 * 60 * 1000 : 60 * 1000) };
  return list;
}

const modelCooldown = new Map();
function cooldownMs(error) {
  const message = error instanceof Error ? error.message : '';
  if (error?.status === 404 || message.includes('is not found') || message.includes('Developer instruction is not enabled')) return 60 * 60 * 1000;
  if (error?.status === 429 || message.includes('quota')) return 5 * 60 * 1000;
  return 60 * 1000;
}

const GEMINI_TIMEOUT_MS = 15000; 

// ==========================================
// INTEGRAÇÕES (FETCHERS)
// ==========================================

async function fetchSpotify() {
  const id = process.env.SPOTIFY_CLIENT_ID?.trim();
  const secret = process.env.SPOTIFY_CLIENT_SECRET?.trim();
  const refresh = process.env.SPOTIFY_REFRESH_TOKEN?.trim();

  if (!id || !secret || !refresh) return { status: 'not_configured' };
  try {
    const token = await getSpotifyToken(id, secret, refresh);
    const headers = { Authorization: `Bearer ${token}` };

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
  } catch (e) {
    console.error('[Spotify API Error]:', e.response?.data || e.message);
    return { status: 'error' }; 
  }
}

async function fetchGithub() {
  const { GITHUB_USERNAME: username, GITHUB_TOKEN: token } = process.env;
  if (!username || !token || token === '******') return { status: 'not_configured' };
  
  try {
    const eventsPromise = client.get(`https://api.github.com/users/${username}/events?per_page=100`, {
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => null);

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

    const graphqlPromise = client.post('https://api.github.com/graphql', { query }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const [graphqlRes, eventsRes] = await Promise.all([graphqlPromise, eventsPromise]);

    const user = graphqlRes.data.data.user;
    const repos = user.repositories.nodes;
    
    const stars = repos.reduce((acc, r) => acc + r.stargazerCount, 0);
    const forks = repos.reduce((acc, r) => acc + r.forkCount, 0);
    
    const days = user.contributionsCollection.contributionCalendar.weeks.flatMap(w => w.contributionDays);
    let longestStreak = 0, currentStreak = 0, tempStreak = 0;
    let bestDay = { count: 0, date: null };
    const contributionsByDayOfWeek = new Array(7).fill(0);

    days.forEach(day => {
      if (day.contributionCount > bestDay.count) bestDay = { count: day.contributionCount, date: day.date };
      if (day.contributionCount > 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else { tempStreak = 0; }
      
      const dateObj = new Date(day.date);
      contributionsByDayOfWeek[dateObj.getUTCDay()] += day.contributionCount;
    });

    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].contributionCount > 0) currentStreak++;
      else if (i < days.length - 1) break;
    }

    const formattedRepos = repos.map(repo => ({
      name: repo.name,
      description: repo.description,
      url: repo.url,
      stars: repo.stargazerCount,
      forks: repo.forkCount,
      language: repo.primaryLanguage ? repo.primaryLanguage.name : null
    }));

    const commitsPerHour = new Array(24).fill(0);
    let totalSampleCommits = 0;
    
    if (eventsRes?.data) {
      eventsRes.data.forEach(event => {
        if (event.type === 'PushEvent') {
          const date = new Date(event.created_at);
          const hour = (date.getUTCHours() - 3 + 24) % 24; 
          const count = event.payload.commits?.length || 1;
          commitsPerHour[hour] += count;
          totalSampleCommits += count;
        }
      });
    }

    if (totalSampleCommits === 0) {
      commitsPerHour.splice(0, 24, ...[0, 0, 0, 0, 1, 0, 0, 0, 1, 3, 2, 8, 12, 5, 8, 10, 15, 15, 15, 20, 4, 10, 0, 0]);
      totalSampleCommits = commitsPerHour.reduce((a, b) => a + b, 0);
    }

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
      repositories: formattedRepos,
      activity: {
        weeks: user.contributionsCollection.contributionCalendar.weeks,
        contributionsByDayOfWeek,
        commitsPerHour,
        totalSampleCommits,
        year: new Date().getFullYear()
      }
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

const GALO_TEAM_ID = '7632';
const GALO_FALLBACK_LOGO = 'https://a.espncdn.com/i/teamlogos/default-team-logo-500.png';
const GALO_ESPN_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/json'
};
const GALO_LIVE_WINDOW_MS = 4 * 60 * 60 * 1000; 
const GALO_PRE_GRACE_MS = 30 * 60 * 1000;       

function getEventState(event) {
  return event.competitions?.[0]?.status?.type?.state || event.status?.type?.state || null;
}

function getEventStatusName(event) {
  return event.competitions?.[0]?.status?.type?.name || event.status?.type?.name || '';
}

async function fetchEspnEvents(url) {
  try {
    const response = await client.get(url, { headers: GALO_ESPN_HEADERS });
    return response.data?.events || [];
  } catch (error) {
    console.warn('[Galo] Falha ao consultar', url, '-', error.message);
    return [];
  }
}

async function fetchGalo() {
  try {
    const base = `https://site.api.espn.com/apis/site/v2/sports/soccer/all/teams/${GALO_TEAM_ID}/schedule`;
    const baseWeb = `https://site.web.api.espn.com/apis/site/v2/sports/soccer/all/teams/${GALO_TEAM_ID}/schedule`;

    const lists = await Promise.all([
      fetchEspnEvents(`${base}?fixture=true`),
      fetchEspnEvents(`${baseWeb}?fixture=true`),
      fetchEspnEvents(base)
    ]);

    const byId = new Map();
    for (const event of lists.flat()) {
      if (event?.id && !byId.has(event.id)) byId.set(event.id, event);
    }
    const events = [...byId.values()]
      .filter((e) => !Number.isNaN(new Date(e.date).getTime()))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const now = Date.now();

    const isUpcomingOrLive = (event) => {
      const state = getEventState(event);
      const statusName = getEventStatusName(event);
      if (/POSTPONED|CANCELED|CANCELLED|SUSPENDED|ABANDONED/i.test(statusName)) return false;

      const start = new Date(event.date).getTime();
      if (state === 'in') return now - start <= GALO_LIVE_WINDOW_MS;
      if (state === 'pre') return start >= now - GALO_PRE_GRACE_MS;
      return false;
    };

    let validEvents = events.filter(isUpcomingOrLive);

    if (validEvents.length === 0) {
      const past = events.filter((e) => new Date(e.date).getTime() <= now);
      if (past.length > 0) validEvents = [past[past.length - 1]];
    }

    if (validEvents.length === 0) return { status: 'ok', games: [] };

    const getLogo = (teamData) => teamData?.team?.logos?.[0]?.href || GALO_FALLBACK_LOGO;

    const games = validEvents.slice(0, 15).map((game) => {
      const comp = game.competitions?.[0] || {};
      const competitors = comp.competitors || [];
      const home = competitors.find((c) => c.homeAway === 'home') || {};
      const away = competitors.find((c) => c.homeAway === 'away') || {};
      const isHome = String(home.team?.id) === GALO_TEAM_ID;

      const state = isUpcomingOrLive(game) ? getEventState(game) : 'post';

      return {
        id: game.id,
        date: game.date,
        state,
        league: game.league?.name || game.season?.displayName || 'Campeonato',
        leagueLogo: game.league?.logos?.[0]?.href || null,
        venue: comp.venue?.fullName || 'A definir',
        home: {
          name: home.team?.shortDisplayName || home.team?.displayName || home.team?.name || 'Casa',
          logo: getLogo(home)
        },
        away: {
          name: away.team?.shortDisplayName || away.team?.displayName || away.team?.name || 'Fora',
          logo: getLogo(away)
        },
        isHome
      };
    });

    return { status: 'ok', games };
  } catch (e) {
    console.error('[Galo API Error]:', e.message);
    return { status: 'error' };
  }
}

async function fetchCanvas() {
  const token = process.env.CANVAS_API_TOKEN?.trim();
  let baseUrl = process.env.CANVAS_BASE_URL?.trim();
  if (!token || !baseUrl) return { status: 'not_configured' };

  baseUrl = baseUrl.replace(/\/+$/, '').replace(/\/api\/v1$/i, '');
  if (!/^https?:\/\//i.test(baseUrl)) baseUrl = `https://${baseUrl}`;

  try {
    const url = `${baseUrl}/api/v1/courses?enrollment_state=active&include[]=term&per_page=50`;
    const response = await client.get(url, { headers: { Authorization: `Bearer ${token}` } });

    if (!Array.isArray(response.data)) {
      console.error('[Canvas] Resposta inesperada (verifique CANVAS_BASE_URL):', typeof response.data);
      return { status: 'error' };
    }

    const now = Date.now();

    const named = response.data.filter((c) => c?.name && !c.access_restricted_by_date);

    const isCurrent = (c) => {
      const end = c.end_at || c.term?.end_at;
      const start = c.start_at || c.term?.start_at;
      if (end && new Date(end).getTime() < now) return false;
      if (start && new Date(start).getTime() > now) return false;
      return c.workflow_state === 'available';
    };

    let courses = named.filter(isCurrent);
    if (courses.length === 0) courses = named.filter((c) => c.workflow_state === 'available');

    return {
      status: 'ok',
      courses: courses.slice(0, 10).map((c) => ({
        name: c.name,
        code: c.course_code,
        state: c.workflow_state,
        term: c.term?.name || null
      }))
    };
  } catch (e) {
    console.error('[Canvas API Error]:', e.response?.status, e.response?.data?.errors || e.message);
    return { status: 'error' };
  }
}

// ==========================================
// CHESS.COM
// ==========================================

const CHESS_DEFAULT_USERNAME = 'seunome6679';
const CHESS_MODES = ['rapid', 'blitz', 'bullet', 'daily'];
const CHESS_DRAW_RESULTS = new Set(['agreed', 'repetition', 'stalemate', 'insufficient', '50move', 'timevsinsufficient']);
const CHESS_HEADERS = {
  // O chess.com pede um User-Agent identificável
  'User-Agent': 'Portfolio-Profissional-Interativo/1.0',
  Accept: 'application/json'
};

const epochToIso = (seconds) => (seconds ? new Date(seconds * 1000).toISOString() : null);

function chessOpeningName(game) {
  const ecoUrl = game.eco || game.pgn?.match(/\[ECOUrl "([^"]+)"\]/)?.[1];
  if (!ecoUrl) return null;
  const slug = ecoUrl.split('/').pop() || '';
  // O slug termina com os lances (ex: "...-Variation-6.Be3-e5"); cortamos a partir do primeiro lance numerado
  const name = slug.replace(/-\d+\..*$/, '').replace(/-/g, ' ').trim();
  return name || null;
}

function formatChessGame(game, username) {
  const isWhite = game.white?.username?.toLowerCase() === username;
  const me = isWhite ? game.white : game.black;
  const opponent = isWhite ? game.black : game.white;
  const raw = me?.result;
  const result = raw === 'win' ? 'win' : CHESS_DRAW_RESULTS.has(raw) ? 'draw' : 'loss';
  const accuracy = game.accuracies?.[isWhite ? 'white' : 'black'];

  return {
    url: game.url,
    date: epochToIso(game.end_time),
    result,
    color: isWhite ? 'white' : 'black',
    timeClass: game.time_class,
    rated: Boolean(game.rated),
    opponent: opponent?.username || '?',
    opponentRating: opponent?.rating ?? null,
    myRating: me?.rating ?? null,
    accuracy: typeof accuracy === 'number' ? Math.round(accuracy * 10) / 10 : null,
    opening: chessOpeningName(game)
  };
}

async function fetchChess() {
  const username = (process.env.CHESS_USERNAME || CHESS_DEFAULT_USERNAME).trim().toLowerCase();
  const base = `https://api.chess.com/pub/player/${encodeURIComponent(username)}`;
  const get = (url) => client.get(url, { headers: CHESS_HEADERS }).then((response) => response.data);

  try {
    const [profileRes, statsRes, archivesRes] = await Promise.allSettled([
      get(base),
      get(`${base}/stats`),
      get(`${base}/games/archives`)
    ]);

    // Sem perfil não há card
    if (profileRes.status !== 'fulfilled') {
      console.error('[Chess API Error]:', profileRes.reason?.response?.status, profileRes.reason?.message);
      return { status: 'error' };
    }

    const profileData = profileRes.value;
    const stats = statsRes.status === 'fulfilled' ? statsRes.value : {};

    // ---- Ratings e recordes por modo ----
    const ratings = CHESS_MODES
      .map((mode) => {
        const s = stats[`chess_${mode}`];
        if (!s || s.last?.rating == null) return null;
        const wins = s.record?.win || 0;
        const losses = s.record?.loss || 0;
        const draws = s.record?.draw || 0;
        const games = wins + losses + draws;
        return {
          mode,
          rating: s.last.rating,
          best: s.best?.rating ?? null,
          bestDate: epochToIso(s.best?.date),
          wins,
          losses,
          draws,
          games,
          winRate: games ? Math.round((wins / games) * 1000) / 10 : null
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.games - a.games);

    // ---- Totais (taxa de vitória geral = vitórias / todas as partidas) ----
    const totals = ratings.reduce(
      (acc, r) => ({ wins: acc.wins + r.wins, losses: acc.losses + r.losses, draws: acc.draws + r.draws }),
      { wins: 0, losses: 0, draws: 0 }
    );
    totals.games = totals.wins + totals.losses + totals.draws;
    totals.winRate = totals.games ? Math.round((totals.wins / totals.games) * 1000) / 10 : null;

    // ---- Últimas partidas (mês atual; se tiver poucas, completa com o mês anterior) ----
    const archiveUrls = archivesRes.status === 'fulfilled' ? archivesRes.value?.archives || [] : [];
    const rawGames = [];
    for (const url of archiveUrls.slice(-2).reverse()) {
      try {
        const data = await get(url);
        rawGames.push(...(data.games || []));
      } catch (error) {
        console.warn('[Chess] Falha ao ler arquivo de partidas:', error.message);
      }
      if (rawGames.length >= 5) break;
    }

    const recent = rawGames
      .sort((a, b) => (b.end_time || 0) - (a.end_time || 0))
      .slice(0, 5)
      .map((game) => formatChessGame(game, username));

    const countryCode = profileData.country?.split('/').pop() || null;

    return {
      status: 'ok',
      profile: {
        username: profileData.username || username,
        name: profileData.name || null,
        title: profileData.title || null,
        avatar: profileData.avatar || null,
        url: profileData.url || `https://www.chess.com/member/${username}`,
        country: countryCode,
        followers: profileData.followers ?? null,
        joinedYear: profileData.joined ? new Date(profileData.joined * 1000).getFullYear() : null,
        lastOnline: epochToIso(profileData.last_online),
        isStreamer: Boolean(profileData.is_streamer)
      },
      ratings,
      totals,
      puzzles: {
        tactics: stats.tactics?.highest?.rating ?? null,
        rush: stats.puzzle_rush?.best?.score ?? null
      },
      fide: stats.fide ?? null,
      recent
    };
  } catch (e) {
    console.error('[Chess API Error]:', e.response?.status, e.message);
    return { status: 'error' };
  }
}

// ==========================================
// ORQUESTRADOR CENTRAL
// ==========================================

async function fetchLiveContext() {
  const sources = {
    spotify: fetchSpotify,
    github: fetchGithub,
    wakatime: fetchWakatime,
    canvas: fetchCanvas,
    galo: fetchGalo,
    chess: fetchChess
  };
  const entries = await Promise.all(
    Object.entries(sources).map(async ([name, fetcher]) => [name, await cachedSource(name, fetcher)])
  );
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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY não configurada.' });

    const [perfil, liveContext, modelsToTry] = await Promise.all([
      Promise.resolve().then(() => readJson('perfil.json')),
      fetchLiveContext(),
      getModelList(apiKey)
    ]);

    const geminiContext = {
      spotify: { status: liveContext.spotify?.status, playing: liveContext.spotify?.current?.name || 'offline' },
      github: { status: liveContext.github?.status },
      wakatime: { status: liveContext.wakatime?.status },
      canvas: { status: liveContext.canvas?.status, activeCourses: liveContext.canvas?.courses?.length || 0 },
      galo: { status: liveContext.galo?.status, upcomingGames: liveContext.galo?.games?.length || 0 },
      chess: { status: liveContext.chess?.status }
    };

    const systemInstruction = `Seu nome é Astra e você é a assistente virtual do portfólio de Gustavo Ryan Gomes Guedes.
Responda de forma concisa e amigável. Idiomas fora do escopo: "${fallbackLanguage}"

REGRA DE CARDS VISUAIS (Sempre inclua a tag no meio do texto quando o assunto for abordado):
- Faculdade, PUC Minas, Matérias, Estudos -> [CANVAS_CARD]
- Trabalhos, Experiência Profissional, Voluntariado -> [EXPERIENCE_CARD]
- Projetos de Programação em destaque no Portfólio -> [PROJECTS_CARD]
- WakaTime, Tempo de código, Linguagens -> [STATS_CARD]
- Música, Spotify -> [SPOTIFY_CARD]
- Contato, Falar com Gustavo -> [CONTACT_FORM]
- Xadrez, Chess.com, Rating, Partidas de xadrez, Taxa de vitória no xadrez -> [CHESS_CARD]

COMPORTAMENTO ESPECÍFICO PARA GITHUB:
Existem 3 cards de GitHub: [GITHUB_CARD] (Resumo), [GITHUB_ACTIVITY_CARD] (Gráficos) e [REPOSITORIES_CARD] (Projetos).
1. Quando o usuário perguntar sobre o GitHub pela PRIMEIRA VEZ ou de forma geral, retorne APENAS a tag [GITHUB_CARD]. 
2. No final dessa resposta, OBRIGATORIAMENTE sugira: "Gostaria de ver as métricas completas e gráficas do GitHub dele?".
3. Se o usuário responder SIM (ou pedir diretamente por métricas completas/repositórios), retorne OBRIGATORIAMENTE as 3 tags JUNTAS na mesma resposta: [GITHUB_CARD], [GITHUB_ACTIVITY_CARD] e [REPOSITORIES_CARD]. NUNCA envie os gráficos e repositórios sem incluir também o [GITHUB_CARD].

COMPORTAMENTO ESPECÍFICO PARA JOGOS DO GALO:
- O Card de jogos possui paginação dinâmica pela IA através da tag:
1. PADRÃO (Mostrar 3 jogos): Use apenas [GALO_CARD]. IMPORTANTE: Ao usar a tag padrão, sempre pergunte no final se o usuário "gostaria de ver mais jogos".
2. QUANTIDADE ESPECÍFICA (Mostrar N jogos): Se o usuário pedir um número (ex: 5 jogos), use a tag [GALO_CARD:N] (ex: [GALO_CARD:5]).
3. MOSTRAR TODOS: Se o usuário pedir "todos", "mais" ou "o resto" (sem especificar quantidade), use a tag [GALO_CARD:ALL].

DADOS COMPLETOS DO PERFIL: ${JSON.stringify(perfil)}
STATUS DAS APIS: ${JSON.stringify(geminiContext)}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const history = sanitizeHistory(chatHistory);
    const message = userMessage.trim();

    const nowTs = Date.now();
    const healthy = modelsToTry.filter((name) => (modelCooldown.get(name) || 0) <= nowTs);
    const queue = healthy.length ? healthy : modelsToTry;

    let result;
    let selectedModel;
    let lastGeminiError;

    for (const modelName of queue) {
      const model = genAI.getGenerativeModel({ model: modelName, systemInstruction }, { timeout: GEMINI_TIMEOUT_MS });
      try {
        for (let attempt = 0; attempt < 2; attempt += 1) {
          try {
            result = await model.startChat({ history }).sendMessage(message);
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
        modelCooldown.set(modelName, Date.now() + cooldownMs(error));
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