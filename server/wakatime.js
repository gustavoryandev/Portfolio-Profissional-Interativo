import { createLiveCache } from './liveCache.js';

export const WAKATIME_RANGES = ['last_7_days', 'last_30_days', 'last_6_months', 'last_year', 'all_time'];
const API = 'https://api.wakatime.com/api/v1/users';
const ACTIVE_SECONDS = 10 * 60;
const BREAK_SECONDS = 15 * 60;
const csv = value => (value || '').toLowerCase().split(',').map(item => item.trim()).filter(Boolean);

export function formatCodingTime(seconds) {
  return Number.isFinite(seconds) ? `${Math.floor(seconds / 3600)}h ${Math.floor(seconds % 3600 / 60)}m` : null;
}

export function codingBreakdown(items) {
  return (Array.isArray(items) ? items : []).map(item => ({
    name: item.name, seconds: item.total_seconds, formatted: formatCodingTime(item.total_seconds),
    percent: Number.isFinite(item.percent) ? item.percent.toFixed(1) : null,
  }));
}

function visibleLibraries(items, hidden) {
  const visible = codingBreakdown(items).filter(({ name, seconds }) => typeof name === 'string' && seconds >= 60
    && !hidden.some(rule => rule.endsWith('*') ? name.toLowerCase().startsWith(rule.slice(0, -1)) : name.toLowerCase() === rule));
  const total = visible.reduce((sum, item) => sum + item.seconds, 0);
  return visible.sort((a, b) => b.seconds - a.seconds).slice(0, 10).map(item => ({
    ...item, percent: (item.seconds * 100 / total).toFixed(1),
  }));
}

function activitySeconds(signals) {
  return signals.reduce((total, signal, index) => {
    const gap = index ? signal.time - signals[index - 1].time : 0;
    return total + (gap < BREAK_SECONDS ? gap : 0);
  }, 0);
}

export function createWakaTime(client, env = process.env, now = Date.now) {
  let accessToken = env.WAKATIME_ACCESS_TOKEN?.trim();
  let refreshToken = env.WAKATIME_REFRESH_TOKEN?.trim();
  let renewing;
  const username = env.WAKATIME_USERNAME?.trim();
  const apiKey = env.WAKATIME_API_KEY?.trim();
  const user = accessToken || !username ? 'current' : encodeURIComponent(username);
  const publicProjects = csv(env.WAKATIME_PUBLIC_PROJECTS);
  const hiddenLibraries = csv(env.WAKATIME_HIDDEN_DEPENDENCIES);
  const showProject = name => typeof name === 'string' && name.length > 0 && publicProjects.includes(name.toLowerCase());
  const cache = createLiveCache({
    ...Object.fromEntries(WAKATIME_RANGES.map(range => [range, 600_000])),
    today: 60_000, activity: 60_000, editors: 3_600_000,
  }, now);

  async function renew() {
    const { data } = await client.post('https://wakatime.com/oauth/token', new URLSearchParams({
      client_id: env.WAKATIME_APP_ID,
      client_secret: env.WAKATIME_APP_SECRET,
      redirect_uri: env.WAKATIME_REDIRECT_URI || 'http://localhost:8787/callback',
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }));
    const credentials = typeof data === 'string' ? Object.fromEntries(new URLSearchParams(data)) : data;
    if (!credentials?.access_token) throw new Error('WakaTime OAuth response missing access token');
    accessToken = credentials.access_token;
    refreshToken = credentials.refresh_token || refreshToken;
  }

  async function get(path) {
    const token = accessToken;
    const request = () => client.get(`${API}/${user}/${path}`, accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : username ? {} : { auth: { username: apiKey, password: '' } });
    try {
      return await request();
    } catch (error) {
      if (error.response?.status !== 401 || !token || !refreshToken || !env.WAKATIME_APP_ID || !env.WAKATIME_APP_SECRET) throw error;
      if (token === accessToken) {
        renewing ??= renew().finally(() => { renewing = null; });
        try { await renewing; } catch { throw error; }
      }
      return request();
    }
  }

  const configured = Boolean(accessToken || username || apiKey);
  const hasPrivateAccess = user === 'current' && Boolean(accessToken || apiKey);

  async function stats(range) {
    if (!configured) return { status: 'not_configured' };
    return cache.get(range, async () => {
      const response = await get(`stats/${range}`);
      const data = response.data?.data;
      const total = data?.total_seconds_including_other_language ?? data?.total_seconds;
      if (!Number.isFinite(total)) {
        return { status: 'error', reason: response.status === 202 || data?.status === 'pending_update' ? 'processing' : 'unavailable' };
      }
      const editors = codingBreakdown(data.editors);
      return {
        status: 'ok', stale: response.status === 202 || data.is_up_to_date === false || data.status === 'pending_update',
        range: { start: data.start, end: data.end, includingToday: data.is_including_today },
        summary: {
          totalFormatted: formatCodingTime(total),
          dailyAverageFormatted: formatCodingTime(data.daily_average_including_other_language ?? data.daily_average),
          activeDays: data.days_minus_holidays, totalDays: data.days_including_holidays,
          topEditorName: editors[0]?.name, topEditorPercent: editors[0]?.percent,
          bestDay: Number.isFinite(Date.parse(data.best_day?.date)) && Number.isFinite(data.best_day.total_seconds)
            ? { date: data.best_day.date, formatted: formatCodingTime(data.best_day.total_seconds) } : null,
        },
        languages: codingBreakdown(data.languages), editors,
        operatingSystems: codingBreakdown(data.operating_systems), categories: codingBreakdown(data.categories),
        projects: codingBreakdown(data.projects).filter(item => showProject(item.name))
          .sort((a, b) => b.seconds - a.seconds).slice(0, 10),
        libraries: visibleLibraries(data.dependencies, hiddenLibraries),
      };
    });
  }

  async function readToday() {
    const { data } = await get('status_bar/today');
    const seconds = data?.data?.grand_total?.total_seconds;
    return Number.isFinite(seconds) ? { status: 'ok', formatted: formatCodingTime(seconds) } : { status: 'error' };
  }

  async function readEditors() {
    const { data } = await get('user_agents');
    const agents = Array.isArray(data?.data) ? data.data : data?.data?.id ? [data.data] : [];
    return { status: 'ok', names: new Map(agents.filter(agent => agent?.id).map(agent => [agent.id, agent.editor])) };
  }

  async function readActivity() {
    const time = now();
    const formatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone: env.WAKATIME_TIMEZONE || 'America/Sao_Paulo',
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    });
    const date = Object.fromEntries(formatter.formatToParts(time).map(part => [part.type, part.value]));
    const day = `${date.year}-${date.month}-${date.day}`;
    const yesterday = new Date(Date.parse(day) - 86_400_000).toISOString().slice(0, 10);
    const signalsForDay = async date => {
      const { data } = await get(`heartbeats?date=${date}`);
      return (Array.isArray(data?.data) ? data.data : []).filter(signal => signal.type === 'file' && Number.isFinite(signal.time));
    };
    const [today, previous, editors] = await Promise.all([
      signalsForDay(day),
      Number(date.hour) * 60 + Number(date.minute) < (ACTIVE_SECONDS + BREAK_SECONDS) / 60
        ? signalsForDay(yesterday) : [],
      cache.get('editors', readEditors),
    ]);
    today.sort((a, b) => a.time - b.time);
    const signals = [...previous, ...today].sort((a, b) => a.time - b.time);
    const last = signals.at(-1);
    if (!last) return { status: 'ok', active: false, last: null };
    let start = signals.length - 1;
    while (start > 0 && signals[start].time - signals[start - 1].time < BREAK_SECONDS) start--;
    const isPublic = showProject(last.project);
    return {
      status: 'ok', active: time / 1000 - last.time <= ACTIVE_SECONDS,
      last: {
        at: last.time * 1000, language: last.language, editor: editors.names?.get(last.user_agent_id),
        project: isPublic ? last.project : null, branch: isPublic ? last.branch : null,
        sessionStart: signals[start].time * 1000, sessionSeconds: last.time - signals[start].time,
        projectTodaySeconds: typeof last.project === 'string' && last.project
          ? activitySeconds(today.filter(signal => signal.project === last.project)) : null,
      },
    };
  }

  async function activity() {
    if (!accessToken) return {};
    const [today, codingNow] = await Promise.all([cache.get('today', readToday), cache.get('activity', readActivity)]);
    return { today, codingNow };
  }

  return { get, configured, hasPrivateAccess, stats, activity };
}
