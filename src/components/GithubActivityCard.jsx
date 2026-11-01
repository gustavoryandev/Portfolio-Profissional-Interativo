import { memo, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
    updatedAt: 'Atualizado às',
    unavailable: 'Métricas de atividade do GitHub indisponíveis ou não configuradas.',
    calendarLabel: 'Calendário de contribuições dos últimos 12 meses',
    madrugada: 'Madrugada',
    manha: 'Manhã',
    tarde: 'Tarde',
    noite: 'Noite',
    weekDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
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
    updatedAt: 'Updated at',
    unavailable: 'GitHub activity metrics are unavailable or not configured.',
    calendarLabel: 'Contribution calendar for the last 12 months',
    madrugada: 'Late Night',
    manha: 'Morning',
    tarde: 'Afternoon',
    noite: 'Evening',
    weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
};

const PERIODS = [
  { key: 'madrugada', from: 0, to: 5, icon: Moon },
  { key: 'manha', from: 6, to: 11, icon: Sunrise },
  { key: 'tarde', from: 12, to: 17, icon: Sun },
  { key: 'noite', from: 18, to: 23, icon: Sunset },
];

const TIME_ZONE = 'America/Sao_Paulo';
const PITCH = 11 + 3; // célula + gap, em px
const EMPTY = [];
const NO_STREAK = { length: 0, start: null, end: null };
const KEY_STEPS = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7 };
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]; // segunda primeiro
const LEVEL_KEYS = [0, 1, 2, 3, 4];

/* =====================================================================
   Tokens de cor por tema (amarelo nos gráficos e atividade)
   ===================================================================== */
const UI = {
  dark: {
    panel: 'border-[#163A59] bg-[#050E17] text-gray-200',
    surface: 'bg-[#0B192B] border-[#163A59]',
    divider: 'border-[#163A59]',
    muted: 'text-[var(--muted)]',
    sub: 'text-[var(--muted)]',
    label: 'text-gray-400',
    caption: 'text-zinc-400',
    heading: 'text-gray-300',
    strong: 'text-gray-300',
    dayLabel: 'text-zinc-400',
    dayLabelActive: 'text-gray-200',
    dot: 'text-[var(--muted)]',
    accentText: 'text-brand-400',
    badge: 'border-brand-400/30 bg-brand-400/10 text-brand-400',
    ringAccent: 'ring-brand-400/50',
    focus: 'focus-visible:ring-brand-400/60',
    track: 'bg-[#161b22]',
    barTrack: 'bg-zinc-800',
    bar: 'bg-[#167AB6]',
    peak: 'bg-brand-400',
    levels: ['bg-[#161b22]', 'bg-[#103454]', 'bg-[#145c91]', 'bg-[#167AB6]', 'bg-brand-400'],
    emptyBox: 'border-[var(--line)] text-[var(--muted)]',
    tooltip: 'border-[#163A59] bg-[#050E17] text-gray-200',
  },
  light: {
    panel: 'border-gray-200 bg-white text-gray-800',
    surface: 'bg-gray-50 border-gray-100',
    divider: 'border-gray-200',
    muted: 'text-gray-400',
    sub: 'text-gray-500',
    label: 'text-gray-500',
    caption: 'text-gray-500',
    heading: 'text-gray-600',
    strong: 'text-gray-600',
    dayLabel: 'text-gray-500',
    dayLabelActive: 'text-gray-800',
    dot: 'text-gray-300',
    accentText: 'text-[#1d4ed8]',
    badge: 'border-[#0D6EFD]/50 bg-[#EFF6FF] text-[#1d4ed8]',
    ringAccent: 'ring-[#0D6EFD]/60',
    focus: 'focus-visible:ring-[#0D6EFD]/60',
    track: 'bg-gray-200',
    barTrack: 'bg-gray-200',
    bar: 'bg-[#60A5FA]',
    peak: 'bg-[#0D6EFD]',
    levels: ['bg-gray-100', 'bg-[#DBEAFE]', 'bg-[#93C5FD]', 'bg-[#3B82F6]', 'bg-[#0D6EFD]'],
    emptyBox: 'border-gray-300 text-zinc-400',
    tooltip: 'border-gray-200 bg-white text-gray-800',
  },
};

/* =====================================================================
   Datas (fuso de Brasília)
   ===================================================================== */
const DATE_KEY = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
});
const todayKey = () => DATE_KEY.format(new Date());

const noon = (key) => new Date(`${key}T12:00:00Z`);

function addDays(key, days) {
  const date = noon(key);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// 0 = domingo ... 6 = sábado
const weekdayOf = (key) => noon(key).getUTCDay();
const indexOfMax = (values) => values.reduce((best, v, i) => (v > values[best] ? i : best), 0);
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

/* =====================================================================
   Formatadores (criados uma vez por idioma)
   ===================================================================== */
const formatterCache = new Map();

function getFormatters(locale) {
  if (formatterCache.has(locale)) return formatterCache.get(locale);

  const isEn = locale === 'en-US';
  const number = new Intl.NumberFormat(locale);
  const percent = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const dayMonth = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' });
  const full = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  const month = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' });
  const weekdayLong = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' });
  const hour12 = new Intl.DateTimeFormat('en-US', { hour: 'numeric', timeZone: 'UTC' });
  const strip = (text) => text.replace(/\.$/, '');

  const formatters = {
    number: (value) => number.format(Math.round(value)),
    percent: (value) => `${percent.format(value)}%`,
    dayMonth: (key) => (key ? strip(dayMonth.format(noon(key))) : ''),
    date: (key) => (key ? strip(full.format(noon(key))) : ''),
    month: (key) => strip(month.format(noon(key))),
    // 4 jan 2026 foi domingo: índice 0 = domingo
    weekdayLong: (index) => weekdayLong.format(new Date(Date.UTC(2026, 0, 4 + index, 12))),
    // 20 -> "20h" (pt) / "8 PM" (en)
    hour: (h) => (isEn ? hour12.format(new Date(Date.UTC(2000, 0, 1, h % 24))) : `${h % 24}h`),
  };

  formatterCache.set(locale, formatters);
  return formatters;
}

/* =====================================================================
   Resumo do calendário: sequências, níveis por quartil, melhor dia,
   dias da semana e meses
   ===================================================================== */
function summarizeCalendar(weeks, today) {
  const columns = [];
  for (const week of weeks) {
    const days = (week?.contributionDays || [])
      .filter((d) => d?.date && d.date <= today)
      .map((d) => ({ date: d.date, count: d.contributionCount || 0 }))
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    // "pad" alinha a primeira semana incompleta na linha certa
    if (days.length) columns.push({ pad: weekdayOf(days[0].date), days });
  }
  columns.sort((a, b) => (a.days[0].date < b.days[0].date ? -1 : 1));

  // Níveis 1-4 pelos quartis dos dias com contribuição (como o GitHub)
  const positives = columns.flatMap((c) => c.days).map((d) => d.count).filter((n) => n > 0).sort((a, b) => a - b);
  const quantile = (q) => positives[Math.floor((positives.length - 1) * q)] ?? 0;
  const [q1, q2, q3] = [quantile(0.25), quantile(0.5), quantile(0.75)];
  const levelOf = (n) => (n <= 0 ? 0 : n <= q1 ? 1 : n <= q2 ? 2 : n <= q3 ? 3 : 4);

  let index = 0;
  for (const column of columns) {
    column.days = column.days.map((d) => ({ ...d, level: levelOf(d.count), index: index++ }));
  }
  const cells = columns.flatMap((c) => c.days);

  let total = 0;
  let best = null;
  let run = null;
  let longest = NO_STREAK;
  const weekdays = new Array(7).fill(0);

  for (const day of cells) {
    total += day.count;
    weekdays[weekdayOf(day.date)] += day.count;
    if (day.count <= 0) {
      run = null;
      continue;
    }
    if (!best || day.count > best.count) best = day;
    run = run && addDays(run.end, 1) === day.date
      ? { ...run, end: day.date, length: run.length + 1 }
      : { start: day.date, end: day.date, length: 1 };
    if (run.length > longest.length) longest = run;
  }

  // Sequência atual: termina hoje ou ontem (hoje ainda pode ganhar contribuições)
  let i = cells.length - 1;
  if (i >= 0 && cells[i].date === today && cells[i].count <= 0) i--;
  let current = NO_STREAK;
  if (i >= 0 && cells[i].count > 0 && cells[i].date >= addDays(today, -1)) {
    const end = cells[i].date;
    let length = 0;
    while (i >= 0 && cells[i].count > 0 && cells[i].date === addDays(end, -length)) {
      length++;
      i--;
    }
    current = { length, start: addDays(end, 1 - length), end };
  }

  // Mês no topo da coluna em que começa (some se ficar espremido)
  const starts = [];
  columns.forEach((column, c) => {
    const month = column.days[0].date.slice(0, 7);
    if (c === 0 || month !== columns[c - 1].days[0].date.slice(0, 7)) {
      starts.push({ index: c, date: column.days[0].date });
    }
  });
  const months = starts.filter((m, k) => !starts[k + 1] || starts[k + 1].index - m.index >= 3);

  return { columns, cells, months, total, best, longest, current, weekdays };
}

const describeCell = (cell, t, f) =>
  cell.count > 0
    ? { bold: `${f.number(cell.count)} ${cell.count === 1 ? t.contributionIn : t.contributionsIn}`, rest: f.date(cell.date) }
    : { bold: t.noContributionsIn, rest: f.date(cell.date) };

const streakRange = (streak, withYear, t, f, today) => {
  if (!streak.length) return t.noStreak;
  const end = streak.end === today ? t.today : withYear ? f.date(streak.end) : f.dayMonth(streak.end);
  return `${f.dayMonth(streak.start)} – ${end}`;
};

/* =====================================================================
   Colunas (contribuições por ano, commits por hora)
   Maior valor destacado. Mouse, toque ou setas <- -> mostram o valor.
   ===================================================================== */
function Columns({ items, value, readout, axis, cap, caption, colClass = 'flex-1', gap = 2, ui }) {
  const [active, setActive] = useState(null);
  const values = items.map(value);
  const max = Math.max(...values, 0) || 1;
  const peak = indexOfMax(values);
  const shown = active ?? peak;

  // Toque: a barra fica selecionada por um instante depois de soltar o dedo e volta ao pico
  const resetTimer = useRef(null);
  useEffect(() => () => clearTimeout(resetTimer.current), []);
  const select = (index) => {
    clearTimeout(resetTimer.current);
    setActive(index);
  };
  const releaseLater = (event) => {
    if (event.pointerType === 'mouse') return;
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setActive(null), 2500);
  };
  // Arrastar o dedo: o toque fica preso à primeira barra, então a barra sob o dedo é achada pela posição
  const onPointerMove = (event) => {
    if (event.pointerType === 'mouse') return;
    const column = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-col]');
    if (column) select(Number(column.dataset.col));
  };

  const onKeyDown = (event) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step || !items.length) return;
    event.preventDefault();
    setActive((current) => clamp((current ?? peak) + step, 0, items.length - 1));
  };

  return (
    <figure className="m-0">
      <figcaption aria-hidden="true" className={`mb-2 min-h-[1.25rem] text-center text-xs ${ui.caption}`}>
        {readout(items[shown], shown)}
      </figcaption>

      <div
        role="img"
        aria-label={caption}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onBlur={() => setActive(null)}
        onPointerLeave={(e) => { if (e.pointerType === 'mouse') setActive(null); }}
        onPointerMove={onPointerMove}
        onPointerUp={releaseLater}
        onPointerCancel={releaseLater}
        className={`flex h-[150px] touch-pan-y items-end justify-center border-b pt-6 outline-none ${ui.focus} ${ui.divider}`}
        style={{ gap }}
      >
        {items.map((item, index) => {
          const isPeak = index === peak && values[index] > 0;
          const height = values[index] > 0 ? `${(values[index] / max) * 100}%` : '2%';
          return (
            <div
              key={index}
              data-col={index}
              className={`flex h-full items-end ${colClass}`}
              onPointerEnter={() => select(index)}
              onPointerDown={() => select(index)}
            >
              <div
                className={`relative min-h-[2px] w-full rounded-t-[2px] transition-opacity duration-200 ${isPeak ? ui.peak : ui.bar} ${index === shown ? 'opacity-100' : 'opacity-60'}`}
                style={{ height }}
              >
                {isPeak && (
                  <span className={`absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded border px-1.5 py-0.5 text-[0.7rem] font-bold ${ui.tooltip}`}>
                    {cap(item)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div aria-hidden="true" className={`mt-1.5 flex justify-center text-[0.7rem] font-medium ${ui.muted}`} style={{ gap }}>
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
   Calendário: estado isolado, para o hover não re-renderizar o card
   inteiro. Um único listener no grid (delegação via data-index).
   ===================================================================== */
const Calendar = memo(function Calendar({ summary, ui, t, f }) {
  const [active, setActive] = useState(null);
  const [tip, setTip] = useState(null); // { i, x, y } só para mouse
  const { cells, columns, months } = summary;

  // Tooltip fixo some ao rolar a página (não acompanha o scroll)
  useEffect(() => {
    if (!tip) return undefined;
    const clear = () => setTip(null);
    window.addEventListener('scroll', clear, { capture: true, passive: true });
    return () => window.removeEventListener('scroll', clear, { capture: true });
  }, [tip]);

  const current = active !== null ? cells[active] : null;
  const readout = current
    ? describeCell(current, t, f)
    : summary.best ? { ...describeCell(summary.best, t, f), prefix: t.bestDay } : null;
  const tipCell = tip ? cells[tip.i] : null;

  const onPointerOver = (event) => {
    const raw = event.target.dataset?.index;
    if (raw === undefined) return;
    const i = Number(raw);
    setActive(i);
    if (event.pointerType === 'mouse') {
      const rect = event.target.getBoundingClientRect();
      setTip({ i, x: rect.left + rect.width / 2, y: rect.top - 8 });
    } else {
      setTip(null);
    }
  };

  const onPointerLeave = (event) => {
    if (event.pointerType === 'mouse') {
      setActive(null);
      setTip(null);
    }
  };

  const reset = () => {
    setActive(null);
    setTip(null);
  };

  const onKeyDown = (event) => {
    const step = KEY_STEPS[event.key];
    if (!step || !cells.length) return;
    event.preventDefault();
    // Sem seleção, parte do melhor dia (ou do último)
    const base = active ?? summary.best?.index ?? cells.length - 1;
    setActive(clamp(base + step, 0, cells.length - 1));
  };

  return (
    <>
      <figure className="m-0 mb-10">
        <div className={`mb-3 flex flex-wrap items-center justify-between gap-4 text-sm ${ui.caption}`}>
          <span>{f.number(summary.total)} {t.contrib12months}</span>
          <div aria-hidden="true" className="flex items-center gap-1 text-[0.7rem]">
            {t.less}
            {LEVEL_KEYS.map((level) => (
              <div key={level} className={`h-[11px] w-[11px] rounded-[2px] ${ui.levels[level]}`} />
            ))}
            {t.more}
          </div>
        </div>

        <div className={`rounded-lg border p-4 ${ui.surface}`}>
          <div className="custom-scrollbar flex gap-2 overflow-x-auto pb-2">
            {/* Rótulos Seg / Qua / Sex */}
            <div aria-hidden="true" className="shrink-0 pt-5" style={{ width: 28 }}>
              <div className={`relative text-[10px] leading-[11px] ${ui.muted}`} style={{ height: 7 * PITCH - 3 }}>
                {[1, 3, 5].map((day) => (
                  <span key={day} className="absolute left-0" style={{ top: day * PITCH }}>{t.weekDays[day - 1]}</span>
                ))}
              </div>
            </div>

            <div className="shrink-0">
              {/* Rótulos dos meses */}
              <div aria-hidden="true" className={`relative mb-1 h-4 text-[10px] ${ui.muted}`} style={{ width: columns.length * PITCH }}>
                {months.map((m) => (
                  <span key={m.date} className="absolute top-0" style={{ left: m.index * PITCH }}>{f.month(m.date)}</span>
                ))}
              </div>

              <div
                role="img"
                aria-label={`${t.calendarLabel}: ${f.number(summary.total)} ${t.contributions}`}
                tabIndex={0}
                onKeyDown={onKeyDown}
                onPointerOver={onPointerOver}
                onPointerLeave={onPointerLeave}
                onBlur={reset}
                className={`flex gap-[3px] outline-none ${ui.focus}`}
              >
                {columns.map((column, c) => (
                  <div key={c} className="flex shrink-0 flex-col gap-[3px]">
                    {Array.from({ length: column.pad }, (_, k) => (
                      <div key={`pad-${k}`} className="invisible h-[11px] w-[11px]" />
                    ))}
                    {column.days.map((cell) => (
                      <div
                        key={cell.date}
                        data-index={cell.index}
                        className={`relative z-0 h-[11px] w-[11px] cursor-pointer rounded-[2px] transition-all duration-200 hover:z-10 hover:scale-150 hover:shadow-lg hover:ring-1 hover:ring-white ${ui.levels[cell.level]} ${cell.index === active ? 'z-10 scale-150 ring-1 ring-white' : ''}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Linha de leitura: melhor dia por padrão, ou o dia tocado/focado */}
        <figcaption aria-live="polite" className={`mt-3 min-h-[1.25rem] text-center text-xs ${ui.muted}`}>
          {readout && (
            <>
              {readout.prefix && <>{readout.prefix} </>}
              <span className={`font-semibold ${ui.strong}`}>{readout.bold}</span> {readout.rest}
            </>
          )}
        </figcaption>
      </figure>

      {tip && tipCell && (
        <div
          className="pointer-events-none fixed z-[100] -translate-x-1/2 -translate-y-full whitespace-nowrap rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-[11px] text-gray-100 shadow-2xl"
          style={{ top: tip.y, left: tip.x }}
        >
          <strong className="text-white">{describeCell(tipCell, t, f).bold}</strong> {describeCell(tipCell, t, f).rest}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-zinc-700" />
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-[4px] border-transparent border-t-zinc-900" />
        </div>
      )}
    </>
  );
});

/* =====================================================================
   Caixa de resumo (total / sequência atual / maior sequência)
   ===================================================================== */
function SummaryStat({ ui, icon, value, unit, label, note }) {
  return (
    <div className={`flex flex-col items-center rounded-xl border px-4 py-5 text-center transition-all duration-200 hover:border-brand-500/60 ${ui.surface}`}>
      {icon}
      <span className="flex items-baseline gap-1 text-3xl font-bold leading-[1.1] md:text-[2rem]">
        {value}
        {unit && <span className="text-[1.2rem]">{unit}</span>}
      </span>
      <span className={`mt-2 text-xs font-semibold ${ui.label}`}>{label}</span>
      <span className={`mt-1 text-[0.7rem] ${ui.muted}`}>{note}</span>
    </div>
  );
}

/* =====================================================================
   Componente principal
   ===================================================================== */
export default function GithubActivityCard({ context, lang = 'pt' }) {
  const { darkMode } = useContext(ThemeContext);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.pt;
  const locale = lang === 'en' ? 'en-US' : 'pt-BR';
  const f = getFormatters(locale);
  const ui = darkMode ? UI.dark : UI.light;

  const github = context?.github;
  const stats = github?.stats || {};
  const activity = github?.activity || {};
  const weeks = activity.weeks || EMPTY;

  const [today] = useState(todayKey);
  const summary = useMemo(() => summarizeCalendar(weeks, today), [weeks, today]);
  const hasCalendar = summary.cells.length > 0;

  /* ---------- Anos ---------- */
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
    const raw = Array.isArray(activity.commitsPerHour) ? activity.commitsPerHour : EMPTY;
    return Array.from({ length: 24 }, (_, h) => Number(raw[h]) || 0);
  }, [activity.commitsPerHour]);

  const hoursTotal = commitsPerHour.reduce((sum, n) => sum + n, 0);
  const hourItems = useMemo(
    () => commitsPerHour.map((count) => ({ count, pct: hoursTotal ? (count / hoursTotal) * 100 : 0 })),
    [commitsPerHour, hoursTotal],
  );
  const peakHour = indexOfMax(commitsPerHour);

  const periods = PERIODS.map((p) => {
    const count = commitsPerHour.slice(p.from, p.to + 1).reduce((sum, n) => sum + n, 0);
    return { ...p, label: t[p.key], count, pct: hoursTotal ? (count / hoursTotal) * 100 : 0 };
  });
  const topPeriod = periods[indexOfMax(periods.map((p) => p.pct))];

  /* ---------- Textos derivados ---------- */
  const unit = (n) => (n === 1 ? t.day : t.days);
  const hourSpan = (from, to) => `${f.hour(from)}–${f.hour(to)}`;

  const currentStreak = hasCalendar ? summary.current : { length: stats.currentStreak || 0 };
  const longestStreak = hasCalendar ? summary.longest : { length: stats.longestStreak || 0 };

  const allTime = yearsData.complete ? yearsData.items.reduce((sum, y) => sum + y.total, 0) : null;
  const calendarTotal = hasCalendar ? summary.total : stats.contributions || 0;
  const totalValue = allTime ?? calendarTotal;
  const totalNote = allTime !== null ? `${t.since} ${yearsData.items[0]?.year} – ${t.today}` : t.lastYear;

  /* ---------- Dias da semana (domingo = 0) ---------- */
  const weekdays = hasCalendar
    ? summary.weekdays
    : (Array.isArray(activity.contributionsByDayOfWeek) ? activity.contributionsByDayOfWeek : new Array(7).fill(0));
  const weekdaysTotal = weekdays.reduce((sum, n) => sum + n, 0);
  const maxDay = Math.max(...weekdays, 1);
  const peakDay = indexOfMax(weekdays);

  /* ---------- Horário da última atualização (fuso de Brasília) ---------- */
  const updatedLabel = Number.isFinite(github?.updatedAt)
    ? new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone: TIME_ZONE }).format(new Date(github.updatedAt))
    : null;

  /* ---------- Sem dados do GitHub ---------- */
  if (github?.status !== 'ok') {
    return (
      <div className={`portfolio-card mx-auto my-6 w-full max-w-[850px] rounded-xl border p-6 shadow-lg transition-colors duration-300 ${ui.panel}`}>
        <div className={`rounded-xl border border-dashed py-12 text-center text-sm font-medium ${ui.emptyBox}`}>
          {t.unavailable}
        </div>
      </div>
    );
  }

  const sectionTitle = `mb-6 flex items-center gap-2 text-[0.85rem] font-semibold uppercase tracking-[0.05em] ${ui.heading}`;
  const blockTitle = `mb-4 block text-xs font-semibold uppercase tracking-wider ${ui.sub}`;

  return (
    <div className={`portfolio-card mx-auto my-6 w-full max-w-[850px] rounded-xl border p-6 shadow-lg transition-colors duration-300 ${ui.panel}`}>

      {/* ===================== SEÇÃO 1: Atividade ===================== */}
      <div className="mb-8">
        <h3 className={sectionTitle}>
          <span className={`font-bold ${ui.accentText}`}>#</span> {t.activity}
        </h3>

        <div className="mb-8 card-grid grid grid-cols-1 gap-4 md:grid-cols-3">
          <SummaryStat
            ui={ui}
            value={f.number(totalValue)}
            label={t.totalContributions}
            note={totalNote}
          />
          <SummaryStat
            ui={ui}
            icon={<Flame className={`mb-1 ${ui.accentText}`} size={26} />}
            value={f.number(currentStreak.length)}
            unit={unit(currentStreak.length)}
            label={t.currentStreak}
            note={hasCalendar ? streakRange(currentStreak, false, t, f, today) : t.daysInRow}
          />
          <SummaryStat
            ui={ui}
            value={f.number(longestStreak.length)}
            unit={unit(longestStreak.length)}
            label={t.longestStreak}
            note={hasCalendar ? streakRange(longestStreak, true, t, f, today) : t.record}
          />
        </div>

        {hasCalendar && <Calendar summary={summary} ui={ui} t={t} f={f} />}

        {/* Por ano + por dia da semana */}
        <div className="card-grid grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-8">
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
              ui={ui}
            />
            {!yearsData.complete && (
              <p className={`mt-2 text-center text-[0.65rem] ${ui.muted}`}>{t.windowNote}</p>
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
                    <span className={`w-8 font-medium ${isPeak ? ui.dayLabelActive : ui.dayLabel}`}>
                      {t.weekDays[idx]}
                    </span>
                    <div className={`h-[8px] flex-1 overflow-hidden rounded ${ui.track}`}>
                      <div className={`h-full rounded ${isPeak ? ui.peak : ui.bar}`} style={{ width: `${(count / maxDay) * 100}%` }} />
                    </div>
                    <span className={`w-10 text-right font-semibold ${isPeak ? ui.accentText : ui.strong}`}>
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
      <div className={`mb-4 mt-12 border-t border-dashed pt-8 ${ui.divider}`}>
        <h3 className={sectionTitle}>
          <span className={`font-bold ${ui.accentText}`}>#</span> {t.commitTimes}
        </h3>

        {hoursTotal > 0 ? (
          <>
            <div className="mb-10">
              <div className="mb-6 text-center">
                <p className="text-[1.1rem] font-bold">
                  {t.peakAt} {f.hour(peakHour)} <span className={`font-normal ${ui.dot}`}>•</span> {f.percent(topPeriod.pct)} {t.commitsAreFrom} {topPeriod.label.toLowerCase()}
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
                ui={ui}
              />
            </div>

            {/* Períodos do dia, com o mais ativo destacado */}
            <div className="card-grid grid grid-cols-2 gap-4 md:grid-cols-4">
              {periods.map((period) => {
                const Icon = period.icon;
                const isTop = period.key === topPeriod.key;
                return (
                  <div
                    key={period.key}
                    className={`flex flex-col rounded-lg border p-4 transition-all duration-200 hover:border-brand-500/60 ${ui.surface} ${isTop ? `ring-1 ${ui.ringAccent}` : ''}`}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <Icon size={21} className={ui.accentText} />
                      <div className="min-w-0 flex-1">
                        <div className="text-[0.8rem] font-semibold">{period.label}</div>
                        <div className={`mt-[0.1rem] text-[0.7rem] ${ui.muted}`}>{hourSpan(period.from, (period.to + 1) % 24)}</div>
                      </div>
                      {isTop && (
                        <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase ${ui.badge}`}>
                          {t.peak}
                        </span>
                      )}
                    </div>
                    <div className="mb-2 text-[1.3rem] font-bold">{f.percent(period.pct)}</div>
                    <div className={`h-[6px] overflow-hidden rounded-full ${ui.barTrack}`}>
                      <div className={`h-full rounded-full ${ui.bar}`} style={{ width: `${period.pct}%` }} />
                    </div>
                    <div className={`mt-2 text-[0.7rem] ${ui.muted}`}>≈ {f.number(period.count)} {t.commits}</div>
                  </div>
                );
              })}
            </div>

            <p className={`mt-8 text-center text-[0.7rem] font-medium ${ui.muted}`}>
              {t.estimation}
              {activity.totalSampleCommits ? ` • ${f.number(activity.totalSampleCommits)} ${t.commits} (${t.sample})` : ''}
            </p>
          </>
        ) : (
          <div className={`rounded-xl border border-dashed py-10 text-center text-sm font-medium ${ui.emptyBox}`}>
            {t.noCommits}
          </div>
        )}
      </div>

      {updatedLabel && (
        <p className={`mt-4 text-center text-[0.7rem] font-medium ${ui.muted}`}>{t.updatedAt} {updatedLabel}</p>
      )}
    </div>
  );
}