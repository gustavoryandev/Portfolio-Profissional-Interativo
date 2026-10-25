import React, { useContext, useMemo, useState } from 'react';
import { Flame, Moon, Sun, Sunrise, Sunset } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

/* =====================================================================
   Traduções
   ===================================================================== */
const TRANSLATIONS = {
  pt: {
    activity: 'atividade',
    totalContributions: 'Total de contribuições',
    lastYear: 'No último ano',
    since: 'Desde',
    today: 'hoje',
    currentStreak: 'Sequência atual',
    daysInRow: 'Dias seguidos',
    longestStreak: 'Maior sequência',
    record: 'Recorde',
    noStreak: 'Sem sequência ativa',
    day: 'dia',
    days: 'dias',
    contrib12months: 'contribuições nos últimos 12 meses',
    less: 'Menos',
    more: 'Mais',
    bestDay: 'Melhor dia:',
    contribution: 'contribuição',
    contributions: 'contribuições',
    contributionIn: 'contribuição em',
    contributionsIn: 'contribuições em',
    noContributionsIn: 'Nenhuma contribuição em',
    untilToday: 'até hoje',
    contribByYear: 'Contribuições por ano',
    windowNote: 'Contagem dentro dos últimos 12 meses',
    byDayOfWeek: 'Por dia da semana',
    commitTimes: 'horários dos commits',
    peakAt: 'Pico às',
    peak: 'Pico',
    commitsAreFrom: 'dos commits são de',
    commits: 'commits',
    estimation: 'Estimativa com amostra de commits do GitHub • Horário de Brasília',
    sample: 'amostra',
    noCommits: 'Ainda não há commits suficientes na amostra para montar este gráfico.',
    unavailable: 'Métricas de atividade do GitHub indisponíveis ou não configuradas.',
    calendarLabel: 'Calendário de contribuições dos últimos 12 meses',
    madrugada: 'Madrugada',
    manha: 'Manhã',
    tarde: 'Tarde',
    noite: 'Noite',
    weekDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
  },
  en: {
    activity: 'activity',
    totalContributions: 'Total contributions',
    lastYear: 'Last year',
    since: 'Since',
    today: 'today',
    currentStreak: 'Current streak',
    daysInRow: 'Days in a row',
    longestStreak: 'Longest streak',
    record: 'Record',
    noStreak: 'No active streak',
    day: 'day',
    days: 'days',
    contrib12months: 'contributions in the last 12 months',
    less: 'Less',
    more: 'More',
    bestDay: 'Best day:',
    contribution: 'contribution',
    contributions: 'contributions',
    contributionIn: 'contribution on',
    contributionsIn: 'contributions on',
    noContributionsIn: 'No contributions on',
    untilToday: 'so far',
    contribByYear: 'Contributions by year',
    windowNote: 'Counted within the last 12 months',
    byDayOfWeek: 'By day of week',
    commitTimes: 'commit times',
    peakAt: 'Peak at',
    peak: 'Peak',
    commitsAreFrom: 'of commits are from',
    commits: 'commits',
    estimation: 'Estimate from a sample of GitHub commits • Brasília Time',
    sample: 'sample',
    noCommits: 'Not enough commits in the sample to build this chart yet.',
    unavailable: 'GitHub activity metrics are unavailable or not configured.',
    calendarLabel: 'Contribution calendar for the last 12 months',
    madrugada: 'Late Night',
    manha: 'Morning',
    tarde: 'Afternoon',
    noite: 'Evening',
    weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  }
};

const PERIODS = [
  { key: 'madrugada', from: 0, to: 5, icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-500' },
  { key: 'manha', from: 6, to: 11, icon: Sunrise, color: 'text-amber-500', bg: 'bg-amber-500' },
  { key: 'tarde', from: 12, to: 17, icon: Sun, color: 'text-orange-500', bg: 'bg-orange-500' },
  { key: 'noite', from: 18, to: 23, icon: Sunset, color: 'text-emerald-500', bg: 'bg-emerald-500' }
];

const TIME_ZONE = 'America/Sao_Paulo';
const CELL = 11; // px
const GAP = 3;   // px
const PITCH = CELL + GAP;

/* =====================================================================
   Datas (no fuso de Brasília, como no GitHubStats)
   ===================================================================== */
const dateKey = (date = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);

const noon = (key) => new Date(`${key}T12:00:00Z`);

function addDays(key, days) {
  const date = noon(key);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// 0 = domingo ... 6 = sábado
const weekdayOf = (key) => noon(key).getUTCDay();

const indexOfMax = (values) =>
  values.reduce((best, value, index) => (value > values[best] ? index : best), 0);

function useFormatters(locale) {
  return useMemo(() => {
    const isEn = locale === 'en-US';
    const number = new Intl.NumberFormat(locale);
    const percent = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
    const dayMonth = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' });
    const full = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
    const month = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' });
    const weekdayLong = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' });
    const hour12 = new Intl.DateTimeFormat('en-US', { hour: 'numeric', timeZone: 'UTC' });
    const strip = (text) => text.replace(/\.$/, '');

    return {
      number: (value) => number.format(Math.round(value)),
      percent: (value) => `${percent.format(value)}%`,
      dayMonth: (key) => (key ? strip(dayMonth.format(noon(key))) : ''),
      date: (key) => (key ? strip(full.format(noon(key))) : ''),
      month: (key) => strip(month.format(noon(key))),
      // 4 jan 2026 foi um domingo: índice 0 = domingo
      weekdayLong: (index) => weekdayLong.format(new Date(Date.UTC(2026, 0, 4 + index, 12))),
      // 20 -> "20h" (pt) / "8 PM" (en)
      hour: (h) => (isEn ? hour12.format(new Date(Date.UTC(2000, 0, 1, h % 24))) : `${h % 24}h`)
    };
  }, [locale]);
}

/* =====================================================================
   Resumo do calendário: sequências (com datas), níveis por quartil,
   melhor dia, dias da semana e meses
   ===================================================================== */
const NO_STREAK = { length: 0, start: null, end: null };

function summarizeCalendar(weeks, today) {
  const columns = [];
  weeks.forEach((week) => {
    const real = (week?.contributionDays || [])
      .filter((d) => d?.date && d.date <= today)
      .map((d) => ({ date: d.date, count: d.contributionCount || 0 }))
      .sort((a, b) => (a.date < b.date ? -1 : 1));
    if (!real.length) return;
    // A primeira semana pode vir incompleta: o "pad" mantém cada dia na linha certa
    columns.push({ pad: weekdayOf(real[0].date), days: real });
  });

  // Níveis 1-4 pelos quartis dos dias com contribuição (igual ao GitHub)
  const positives = columns.flatMap((c) => c.days).map((d) => d.count).filter((n) => n > 0).sort((a, b) => a - b);
  const at = (q) => positives[Math.floor((positives.length - 1) * q)] ?? 0;
  const [q1, q2, q3] = [at(0.25), at(0.5), at(0.75)];
  const level = (n) => (n <= 0 ? 0 : n <= q1 ? 1 : n <= q2 ? 2 : n <= q3 ? 3 : 4);

  let index = 0;
  columns.forEach((column) => {
    column.days = column.days.map((d) => ({ ...d, level: level(d.count), index: index++ }));
  });
  const cells = columns.flatMap((c) => c.days);

  let total = 0;
  let best = null;
  let run = null;
  let longest = NO_STREAK;
  const weekdays = new Array(7).fill(0);

  cells.forEach((day) => {
    total += day.count;
    weekdays[weekdayOf(day.date)] += day.count;
    if (day.count <= 0) {
      run = null;
      return;
    }
    if (!best || day.count > best.count) best = day;
    run = run && addDays(run.end, 1) === day.date
      ? { ...run, end: day.date, length: run.length + 1 }
      : { start: day.date, end: day.date, length: 1 };
    if (run.length > longest.length) longest = run;
  });

  // Sequência atual: termina hoje ou ontem (hoje ainda pode ganhar contribuições)
  let current = NO_STREAK;
  let i = cells.length - 1;
  if (cells[i]?.date === today && cells[i].count <= 0) i--;
  if (cells[i] && cells[i].count > 0 && cells[i].date >= addDays(today, -1)) {
    const end = cells[i].date;
    let start = end;
    let length = 0;
    while (i >= 0 && cells[i].count > 0 && addDays(cells[i].date, length) === end) {
      start = cells[i].date;
      length++;
      i--;
    }
    current = { length, start, end };
  }

  // Mês no topo da coluna em que ele começa (some se ficar espremido)
  const starts = [];
  columns.forEach((column, colIndex) => {
    const month = column.days[0].date.slice(0, 7);
    if (colIndex === 0 || month !== columns[colIndex - 1].days[0].date.slice(0, 7)) {
      starts.push({ index: colIndex, date: column.days[0].date });
    }
  });
  const months = starts.filter((m, k) => !starts[k + 1] || starts[k + 1].index - m.index >= 3);

  return { columns, cells, months, total, best, longest, current, weekdays };
}

/* =====================================================================
   Colunas (contribuições por ano, commits por hora)
   O maior valor fica destacado. Mouse, toque ou setas <- -> mostram o
   valor de cada coluna na linha de leitura.
   ===================================================================== */
function Columns({ items, value, readout, axis, cap, caption, colClass = 'flex-1', gap = 2, barClass, peakClass, darkMode }) {
  const [active, setActive] = useState(null);
  const values = items.map(value);
  const max = Math.max(...values, 0) || 1;
  const peak = indexOfMax(values);
  const shown = active ?? peak;

  const onKeyDown = (event) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    setActive((current) => Math.min(items.length - 1, Math.max(0, (current ?? peak) + step)));
  };

  return (
    <figure className="m-0">
      <figcaption aria-hidden="true" className={`mb-2 min-h-[1.25rem] text-center text-xs ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
        {readout(items[shown], shown)}
      </figcaption>

      <div
        role="img"
        aria-label={caption}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onBlur={() => setActive(null)}
        onPointerLeave={() => setActive(null)}
        className={`flex h-[150px] items-end justify-center border-b pt-6 outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/60 ${darkMode ? 'border-[#2a2a2a]' : 'border-gray-200'}`}
        style={{ gap }}
      >
        {items.map((item, index) => {
          const isPeak = index === peak && values[index] > 0;
          const height = values[index] > 0 ? `${(values[index] / max) * 100}%` : '2%';
          return (
            <div
              key={index}
              className={`flex h-full items-end ${colClass}`}
              onPointerEnter={() => setActive(index)}
              onPointerDown={() => setActive(index)}
            >
              <div
                className={`relative min-h-[2px] w-full rounded-t-[2px] transition-opacity duration-200 ${isPeak ? peakClass : barClass} ${index === shown ? 'opacity-100' : 'opacity-60'}`}
                style={{ height }}
              >
                {isPeak && (
                  <span className={`absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded border px-1.5 py-0.5 text-[0.7rem] font-bold ${darkMode ? 'border-[#2a2a2a] bg-[#0f0f0f] text-gray-200' : 'border-gray-200 bg-white text-gray-800'}`}>
                    {cap(item)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div aria-hidden="true" className={`mt-1.5 flex justify-center text-[0.7rem] font-medium ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`} style={{ gap }}>
        {items.map((item, index) => (
          <span key={index} className={`relative h-4 ${colClass}`}>
            <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap">{axis(item, index)}</span>
          </span>
        ))}
      </div>

      <table className="sr-only">
        <caption>{caption}</caption>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}><td>{readout(item, index)}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/* =====================================================================
   Componente principal
   ===================================================================== */
export default function GithubActivityCard({ context, lang = 'pt' }) {
  const { darkMode } = useContext(ThemeContext);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, cell: null });
  const [active, setActive] = useState(null);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.pt;
  const locale = lang === 'en' ? 'en-US' : 'pt-BR';
  const f = useFormatters(locale);

  const github = context?.github;
  const stats = github?.stats || {};
  const activity = github?.activity || {};
  const weeks = activity.weeks || [];

  const today = useMemo(() => dateKey(), []);
  const summary = useMemo(() => summarizeCalendar(weeks, today), [weeks, today]);
  const hasCalendar = summary.cells.length > 0;

  /* ---------- Anos: dados completos do backend, ou o calendário agrupado por ano ---------- */
  const yearsData = useMemo(() => {
    if (Array.isArray(activity.years) && activity.years.length > 0) {
      return { items: activity.years.map(({ year, total }) => ({ year, total })), complete: true };
    }
    const byYear = new Map();
    summary.cells.forEach((cell) => {
      const year = Number(cell.date.slice(0, 4));
      byYear.set(year, (byYear.get(year) || 0) + cell.count);
    });
    return { items: [...byYear].map(([year, total]) => ({ year, total })), complete: false };
  }, [activity.years, summary.cells]);

  /* ---------- Horários dos commits ---------- */
  const commitsPerHour = useMemo(() => {
    const raw = Array.isArray(activity.commitsPerHour) ? activity.commitsPerHour : [];
    return Array.from({ length: 24 }, (_, h) => Number(raw[h]) || 0);
  }, [activity.commitsPerHour]);
  const hoursTotal = commitsPerHour.reduce((sum, n) => sum + n, 0);
  const hourItems = commitsPerHour.map((count) => ({ count, pct: hoursTotal ? (count / hoursTotal) * 100 : 0 }));
  const peakHour = indexOfMax(commitsPerHour);

  const periods = PERIODS.map((p) => {
    const count = commitsPerHour.slice(p.from, p.to + 1).reduce((sum, n) => sum + n, 0);
    return { ...p, label: t[p.key], count, pct: hoursTotal ? (count / hoursTotal) * 100 : 0 };
  });
  const topPeriod = periods[indexOfMax(periods.map((p) => p.pct))];

  /* ---------- Cores (tema escuro oficial do GitHub) ---------- */
  const LEVEL_BG = darkMode
    ? ['bg-[#161b22]', 'bg-[#0e4429]', 'bg-[#006d32]', 'bg-[#26a641]', 'bg-[#39d353]']
    : ['bg-gray-100', 'bg-emerald-200', 'bg-emerald-300', 'bg-emerald-400', 'bg-emerald-500'];
  const chartBarColor = darkMode ? 'bg-[#006d32]' : 'bg-emerald-500';
  const chartPeakColor = darkMode ? 'bg-[#39d353]' : 'bg-emerald-400';

  const muted = darkMode ? 'text-zinc-500' : 'text-gray-400';
  const label = darkMode ? 'text-gray-400' : 'text-gray-500';
  const surface = darkMode ? 'bg-[#141414] border-[#2a2a2a]' : 'bg-gray-50 border-gray-100';

  /* ---------- Textos derivados ---------- */
  const unit = (n) => (n === 1 ? t.day : t.days);
  const describe = (cell) =>
    cell.count > 0
      ? { bold: `${f.number(cell.count)} ${cell.count === 1 ? t.contributionIn : t.contributionsIn}`, rest: f.date(cell.date) }
      : { bold: t.noContributionsIn, rest: f.date(cell.date) };

  const streakRange = (streak, withYear) => {
    if (!streak.length) return t.noStreak;
    const end = streak.end === today ? t.today : withYear ? f.date(streak.end) : f.dayMonth(streak.end);
    return `${f.dayMonth(streak.start)} – ${end}`;
  };

  const currentStreak = hasCalendar ? summary.current : { length: stats.currentStreak || 0 };
  const longestStreak = hasCalendar ? summary.longest : { length: stats.longestStreak || 0 };

  const allTime = yearsData.complete ? yearsData.items.reduce((sum, y) => sum + y.total, 0) : null;
  const calendarTotal = hasCalendar ? summary.total : stats.contributions || 0;
  const totalValue = allTime ?? calendarTotal;
  const totalNote = allTime !== null ? `${t.since} ${yearsData.items[0]?.year} – ${t.today}` : t.lastYear;

  const bestCell = summary.best;
  const readoutCell = active !== null ? summary.cells[active] : null;
  const readout = readoutCell ? describe(readoutCell) : bestCell ? { ...describe(bestCell), prefix: t.bestDay } : null;

  /* ---------- Dias da semana (domingo = 0) ---------- */
  const weekdays = hasCalendar
    ? summary.weekdays
    : (Array.isArray(activity.contributionsByDayOfWeek) ? activity.contributionsByDayOfWeek : new Array(7).fill(0));
  const weekdaysTotal = weekdays.reduce((sum, n) => sum + n, 0);
  const maxDay = Math.max(...weekdays, 1);
  const peakDay = indexOfMax(weekdays);
  const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]; // segunda primeiro

  /* ---------- Interações do calendário ---------- */
  const onCellEnter = (event, cell) => {
    setActive(cell.index);
    if (event.pointerType === 'mouse') {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltip({ visible: true, x: rect.left + rect.width / 2, y: rect.top - 8, cell });
    }
  };

  const hideCalendarHints = () => {
    setActive(null);
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  const onCalendarKeyDown = (event) => {
    const step = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7 }[event.key];
    if (!step) return;
    event.preventDefault();
    setActive((current) => {
      const next = (current ?? summary.cells.length - 1) + step;
      return next < 0 || next >= summary.cells.length ? current ?? summary.cells.length - 1 : next;
    });
  };

  const hourSpan = (from, to) => `${f.hour(from)}–${f.hour(to)}`;

  /* ---------- Sem dados do GitHub ---------- */
  if (github?.status !== 'ok') {
    return (
      <div className={`mx-auto my-6 w-full max-w-[850px] rounded-xl border p-6 shadow-lg transition-colors duration-300 ${darkMode ? 'border-[#2a2a2a] bg-[#0f0f0f]' : 'border-gray-200 bg-white'}`}>
        <div className={`rounded-xl border border-dashed py-12 text-center text-sm font-medium ${darkMode ? 'border-zinc-800 text-zinc-500' : 'border-gray-300 text-zinc-400'}`}>
          {t.unavailable}
        </div>
      </div>
    );
  }

  const sectionTitle = `mb-6 flex items-center gap-2 text-[0.85rem] font-semibold uppercase tracking-[0.05em] ${darkMode ? 'text-gray-300' : 'text-gray-600'}`;
  const blockTitle = `mb-4 block text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`;

  return (
    <div className={`mx-auto my-6 w-full max-w-[850px] rounded-xl border p-6 shadow-lg transition-colors duration-300 ${darkMode ? 'border-[#2a2a2a] bg-[#0f0f0f] text-gray-200' : 'border-gray-200 bg-white text-gray-800'}`}>

      {/* ===================== SEÇÃO 1: Atividade ===================== */}
      <div className="mb-8">
        <h3 className={sectionTitle}>
          <span className="font-bold text-emerald-500">#</span> {t.activity}
        </h3>

        {/* Total | Sequência atual | Maior sequência (com intervalos de datas) */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className={`flex flex-col items-center rounded-xl border px-4 py-5 text-center transition-all duration-200 hover:-translate-y-0.5 ${surface}`}>
            <span className="flex items-baseline gap-1 text-3xl font-bold leading-[1.1] md:text-[2rem]">{f.number(totalValue)}</span>
            <span className={`mt-2 text-xs font-semibold ${label}`}>{t.totalContributions}</span>
            <span className={`mt-1 text-[0.7rem] ${muted}`}>{totalNote}</span>
          </div>

          <div className={`flex flex-col items-center rounded-xl border px-4 py-5 text-center transition-all duration-200 hover:-translate-y-0.5 ${surface}`}>
            <Flame className="mb-1 text-orange-500" size={26} />
            <span className="flex items-baseline gap-1 text-3xl font-bold leading-[1.1] md:text-[2rem]">
              {f.number(currentStreak.length)} <span className="text-[1.2rem]">{unit(currentStreak.length)}</span>
            </span>
            <span className={`mt-2 text-xs font-semibold ${label}`}>{t.currentStreak}</span>
            <span className={`mt-1 text-[0.7rem] ${muted}`}>{hasCalendar ? streakRange(currentStreak, false) : t.daysInRow}</span>
          </div>

          <div className={`flex flex-col items-center rounded-xl border px-4 py-5 text-center transition-all duration-200 hover:-translate-y-0.5 ${surface}`}>
            <div className="flex items-baseline gap-1 text-3xl font-bold leading-[1.1] md:text-[2rem]">
              {f.number(longestStreak.length)} <span className="text-[1.2rem]">{unit(longestStreak.length)}</span>
            </div>
            <span className={`mt-2 text-xs font-semibold ${label}`}>{t.longestStreak}</span>
            <span className={`mt-1 text-[0.7rem] ${muted}`}>{hasCalendar ? streakRange(longestStreak, true) : t.record}</span>
          </div>
        </div>

        {/* Calendário 12 meses, com meses, dias da semana e leitura por toque/teclado */}
        {hasCalendar && (
          <figure className="m-0 mb-10">
            <div className={`mb-3 flex flex-wrap items-center justify-between gap-4 text-sm ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
              <span>{f.number(summary.total)} {t.contrib12months}</span>
              <div aria-hidden="true" className="flex items-center gap-1 text-[0.7rem]">
                {t.less}
                {[0, 1, 2, 3, 4].map((level) => (
                  <div key={level} className={`h-[11px] w-[11px] rounded-[2px] ${LEVEL_BG[level]}`} />
                ))}
                {t.more}
              </div>
            </div>

            <div className={`rounded-lg border p-4 ${surface}`}>
              <div className="custom-scrollbar flex gap-2 overflow-x-auto pb-2">
                {/* Rótulos Seg / Qua / Sex */}
                <div aria-hidden="true" className="shrink-0 pt-5" style={{ width: 28 }}>
                  <div className={`relative text-[10px] leading-[11px] ${muted}`} style={{ height: 7 * PITCH - GAP }}>
                    {[1, 3, 5].map((day) => (
                      <span key={day} className="absolute left-0" style={{ top: day * PITCH }}>{t.weekDays[day - 1]}</span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0">
                  {/* Rótulos dos meses */}
                  <div aria-hidden="true" className={`relative mb-1 h-4 text-[10px] ${muted}`} style={{ width: summary.columns.length * PITCH }}>
                    {summary.months.map((m) => (
                      <span key={m.date} className="absolute top-0" style={{ left: m.index * PITCH }}>{f.month(m.date)}</span>
                    ))}
                  </div>

                  <div
                    role="img"
                    aria-label={`${t.calendarLabel}: ${f.number(summary.total)} ${t.contributions}`}
                    tabIndex={0}
                    onKeyDown={onCalendarKeyDown}
                    onPointerLeave={hideCalendarHints}
                    onBlur={hideCalendarHints}
                    className="flex gap-[3px] outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/60"
                  >
                    {summary.columns.map((column, cIdx) => (
                      <div key={cIdx} className="flex shrink-0 flex-col gap-[3px]">
                        {Array.from({ length: column.pad }, (_, k) => (
                          <div key={`pad-${k}`} className="h-[11px] w-[11px]" style={{ visibility: 'hidden' }} />
                        ))}
                        {column.days.map((cell) => (
                          <div
                            key={cell.date}
                            onPointerEnter={(event) => onCellEnter(event, cell)}
                            onPointerDown={() => setActive(cell.index)}
                            className={`relative z-0 h-[11px] w-[11px] cursor-pointer rounded-[2px] transition-all duration-200 hover:z-10 hover:scale-150 hover:shadow-lg hover:ring-1 hover:ring-white ${LEVEL_BG[cell.level]} ${cell.index === active ? 'z-10 scale-150 ring-1 ring-white' : ''}`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Linha de leitura: melhor dia por padrão, ou o dia tocado/focado */}
            <figcaption aria-live="polite" className={`mt-3 min-h-[1.25rem] text-center text-xs ${muted}`}>
              {readout && (
                <>
                  {readout.prefix && <>{readout.prefix} </>}
                  <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{readout.bold}</span> {readout.rest}
                </>
              )}
            </figcaption>
          </figure>
        )}

        {/* Por ano + por dia da semana */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-8">
          <div>
            <span className={blockTitle}>{t.contribByYear}</span>
            <Columns
              items={yearsData.items}
              value={(item) => item.total}
              readout={(item) =>
                item
                  ? `${item.year} · ${f.number(item.total)} ${item.total === 1 ? t.contribution : t.contributions}${item.year === Number(today.slice(0, 4)) ? ` (${t.untilToday})` : ''}`
                  : ''
              }
              axis={(item) => item.year}
              cap={(item) => f.number(item.total)}
              caption={t.contribByYear}
              colClass="max-w-[60px] flex-1"
              gap={12}
              barClass={chartBarColor}
              peakClass={chartPeakColor}
              darkMode={darkMode}
            />
            {!yearsData.complete && (
              <p className={`mt-2 text-center text-[0.65rem] ${muted}`}>{t.windowNote}</p>
            )}
          </div>

          <div>
            <span className={blockTitle}>{t.byDayOfWeek}</span>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {WEEK_ORDER.map((day, idx) => {
                const count = weekdays[day];
                const isPeak = day === peakDay && count > 0;
                const share = weekdaysTotal ? (count / weekdaysTotal) * 100 : 0;
                return (
                  <li
                    key={day}
                    title={`${f.weekdayLong(day)} · ${f.number(count)} · ${f.percent(share)}`}
                    className="flex items-center gap-3 text-[0.8rem]"
                  >
                    <span className={`w-8 font-medium ${isPeak ? (darkMode ? 'text-gray-200' : 'text-gray-800') : (darkMode ? 'text-zinc-400' : 'text-gray-500')}`}>
                      {t.weekDays[idx]}
                    </span>
                    <div className={`h-[8px] flex-1 overflow-hidden rounded ${darkMode ? 'bg-[#161b22]' : 'bg-gray-200'}`}>
                      <div className={`h-full rounded ${isPeak ? chartPeakColor : chartBarColor}`} style={{ width: `${(count / maxDay) * 100}%` }} />
                    </div>
                    <span className={`w-10 text-right font-semibold ${isPeak ? 'text-emerald-500' : darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {f.number(count)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* ===================== SEÇÃO 2: Horários dos commits ===================== */}
      <div className={`mb-4 mt-12 border-t border-dashed pt-8 ${darkMode ? 'border-[#2a2a2a]' : 'border-gray-200'}`}>
        <h3 className={sectionTitle}>
          <span className="font-bold text-emerald-500">#</span> {t.commitTimes}
        </h3>

        {hoursTotal > 0 ? (
          <>
            <div className="mb-10">
              <div className="mb-6 text-center">
                <p className="text-[1.1rem] font-bold">
                  {t.peakAt} {f.hour(peakHour)} <span className={`font-normal ${darkMode ? 'text-zinc-600' : 'text-gray-300'}`}>•</span> {f.percent(topPeriod.pct)} {t.commitsAreFrom} {topPeriod.label.toLowerCase()}
                </p>
                <p className={`mt-1 text-xs ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>
                  {hourSpan(peakHour, peakHour + 1)} • {f.percent(hourItems[peakHour].pct)} ≈ {f.number(commitsPerHour[peakHour])} {t.commits}
                </p>
              </div>

              <Columns
                items={hourItems}
                value={(item) => item.pct}
                readout={(item, hour) =>
                  item ? `${hourSpan(hour, hour + 1)} • ${f.percent(item.pct)} • ≈ ${f.number(item.count)} ${t.commits}` : ''
                }
                axis={(item, hour) => (hour % 3 === 0 ? f.hour(hour) : '')}
                cap={(item) => f.percent(item.pct)}
                caption={t.commitTimes}
                colClass="flex-1"
                gap={2}
                barClass={chartBarColor}
                peakClass={chartPeakColor}
                darkMode={darkMode}
              />
            </div>

            {/* Períodos do dia, com o mais ativo destacado */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {periods.map((period) => {
                const Icon = period.icon;
                const isTop = period.key === topPeriod.key;
                return (
                  <div
                    key={period.key}
                    className={`flex flex-col rounded-lg border p-4 transition-all duration-200 hover:-translate-y-0.5 ${surface} ${isTop ? 'ring-1 ring-emerald-500/50' : ''}`}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <Icon size={21} className={period.color} />
                      <div className="min-w-0 flex-1">
                        <div className="text-[0.8rem] font-semibold">{period.label}</div>
                        <div className={`mt-[0.1rem] text-[0.7rem] ${muted}`}>{hourSpan(period.from, (period.to + 1) % 24)}</div>
                      </div>
                      {isTop && (
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-500">
                          {t.peak}
                        </span>
                      )}
                    </div>
                    <div className="mb-2 text-[1.3rem] font-bold">{f.percent(period.pct)}</div>
                    <div className={`h-[6px] overflow-hidden rounded-full ${darkMode ? 'bg-zinc-800' : 'bg-gray-200'}`}>
                      <div className={`h-full rounded-full ${period.bg}`} style={{ width: `${period.pct}%` }} />
                    </div>
                    <div className={`mt-2 text-[0.7rem] ${muted}`}>≈ {f.number(period.count)} {t.commits}</div>
                  </div>
                );
              })}
            </div>

            <p className={`mt-8 text-center text-[0.7rem] font-medium ${muted}`}>
              {t.estimation}
              {activity.totalSampleCommits ? ` • ${f.number(activity.totalSampleCommits)} ${t.commits} (${t.sample})` : ''}
            </p>
          </>
        ) : (
          <div className={`rounded-xl border border-dashed py-10 text-center text-sm font-medium ${darkMode ? 'border-zinc-800 text-zinc-500' : 'border-gray-300 text-zinc-400'}`}>
            {t.noCommits}
          </div>
        )}
      </div>

      {/* Tooltip do mouse (toque e teclado usam a linha de leitura) */}
      {tooltip.visible && tooltip.cell && (
        <div
          className="pointer-events-none fixed z-[100] -translate-x-1/2 -translate-y-full whitespace-nowrap rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-[11px] text-gray-100 shadow-2xl"
          style={{ top: tooltip.y, left: tooltip.x }}
        >
          <strong className="text-white">{describe(tooltip.cell).bold}</strong> {describe(tooltip.cell).rest}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-zinc-700"></div>
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-[4px] border-transparent border-t-zinc-900"></div>
        </div>
      )}

      {/* Estilos mínimos para a barra de rolagem */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: ${darkMode ? '#141414' : '#f9fafb'}; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${darkMode ? 'rgba(113, 113, 122, 0.4)' : 'rgba(156, 163, 175, 0.4)'}; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${darkMode ? '#71717a' : '#9ca3af'}; }
      `}</style>
    </div>
  );
}
