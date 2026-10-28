import LanguageIcon from './LanguageIcon';
// src/components/GithubLanguages.jsx
import { useContext, useMemo } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const FONT_SANS = "Inter, 'Geist Sans', Roboto, system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";
const FALLBACK_COLOR = '#8b949e';
const MAX_ITEMS = 6;
const UNITS = ['B', 'KB', 'MB', 'GB'];
const HEX = /^#[0-9a-f]{6}$/i;

const copy = {
  pt: {
    title: 'Linguagens',
    count: (n) => `${n} linguagens em repositórios públicos`,
    countOne: '1 linguagem em repositórios públicos',
    others: (n) => `+ ${n} outras`,
    barLabel: 'Distribuição de linguagens',
    note: 'Bytes de código somados em repositórios públicos próprios (sem forks).',
    unavailable: 'Dados de linguagens indisponíveis no momento.',
    empty: 'Ainda não há linguagens nos repositórios públicos.',
  },
  en: {
    title: 'Languages',
    count: (n) => `${n} languages across public repositories`,
    countOne: '1 language across public repositories',
    others: (n) => `+ ${n} more`,
    barLabel: 'Language distribution',
    note: 'Code bytes summed across owned public repositories (forks excluded).',
    unavailable: 'Language data is unavailable at the moment.',
    empty: 'No languages in public repositories yet.',
  },
};

// Tokens do design system Alvinegro + Azul
const UI = {
  dark: {
    panel: 'border-[var(--line)] bg-[#050E17] text-white shadow-sm',
    card: 'border-[var(--line)] bg-[#0B192B]',
    track: 'bg-neutral-800',
    text: 'text-white',
    sub: 'text-[#A5BDDF]',
    accentRule: 'bg-[#38BDF8]',
    dashed: 'border-[var(--line)] text-[#A5BDDF]',
  },
  light: {
    panel: 'border-[#E5E7EB] bg-[#F4F4F5] text-[#121212] shadow-md',
    card: 'border-[#E5E7EB] bg-[#FFFFFF]',
    track: 'bg-[#E5E7EB]',
    text: 'text-[#121212]',
    sub: 'text-gray-600',
    accentRule: 'bg-[#0D6EFD]',
    dashed: 'border-[#E5E7EB] text-gray-500',
  },
};

// Lê só o que existe; ignora itens inválidos e ordena do maior para o menor
function normalize(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item) => item && typeof item.name === 'string' && Number.isFinite(Number(item.percent)))
    .map((item) => ({
      name: item.name,
      color: HEX.test(item.color) ? item.color : FALLBACK_COLOR,
      percent: Math.max(0, Math.min(100, Number(item.percent))),
      bytes: Number.isFinite(Number(item.value)) ? Number(item.value) : null,
    }))
    .sort((a, b) => b.percent - a.percent);
}

// Agrupa o restante num item só, para a barra e a lista não ficarem longas demais
function groupRest(items, limit, othersLabel) {
  if (items.length <= limit) return items;
  const top = items.slice(0, limit);
  const rest = items.slice(limit);
  const bytes = rest.every((r) => r.bytes !== null)
    ? rest.reduce((sum, r) => sum + r.bytes, 0)
    : null;
  return [
    ...top,
    {
      name: othersLabel(rest.length),
      color: FALLBACK_COLOR,
      percent: rest.reduce((sum, r) => sum + r.percent, 0),
      bytes,
    },
  ];
}

export default function GithubLanguages({ context, lang = 'pt' }) {
  const { darkMode } = useContext(ThemeContext);
  const ui = darkMode ? UI.dark : UI.light;
  const t = copy[lang] || copy.pt;
  const locale = lang === 'en' ? 'en-US' : 'pt-BR';

  const fmtCount = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const fmtPercent = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 }),
    [locale],
  );
  const fmtBytes = useMemo(() => {
    const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
    return (value) => {
      if (value === null) return null;
      let amount = value;
      let unit = 0;
      while (amount >= 1000 && unit < UNITS.length - 1) {
        amount /= 1000;
        unit++;
      }
      return `${number.format(amount)} ${UNITS[unit]}`;
    };
  }, [locale]);

  const github = context?.github;
  const items = useMemo(() => normalize(github?.languages?.items), [github?.languages?.items]);
  const groups = useMemo(() => groupRest(items, MAX_ITEMS, t.others), [items, t]);

  const sectionClass = `portfolio-card mx-auto my-6 w-full max-w-[850px] rounded-xl border p-6 transition-colors duration-300 ${ui.panel}`;
  const headingId = 'gh-languages-title';

  if (github?.status !== 'ok' || github.languages == null) {
    return (
      <section className={sectionClass} style={{ fontFamily: FONT_SANS }}>
        <div className={`rounded-xl border border-dashed py-12 text-center text-sm font-medium ${ui.dashed}`}>
          {t.unavailable}
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className={sectionClass} style={{ fontFamily: FONT_SANS }}>
        <h3 className={`mb-4 text-[0.85rem] font-semibold uppercase tracking-[0.05em] ${ui.sub}`}>{t.title}</h3>
        <div className={`rounded-xl border border-dashed py-10 text-center text-sm font-medium ${ui.dashed}`}>
          {t.empty}
        </div>
      </section>
    );
  }

  const barSummary = groups.map((g) => `${g.name} ${fmtPercent.format(g.percent)}%`).join(', ');

  return (
    <section aria-labelledby={headingId} className={sectionClass} style={{ fontFamily: FONT_SANS }}>
      <header className="mb-6">
        <h3
          id={headingId}
          className={`flex items-center gap-3 text-[0.85rem] font-semibold uppercase tracking-[0.05em] ${ui.sub}`}
        >
          <span aria-hidden="true" className={`h-4 w-[3px] rounded-full ${ui.accentRule}`} />
          {t.title}
        </h3>
        <p className={`mt-2 text-sm ${ui.sub}`}>
          {items.length === 1 ? t.countOne : t.count(fmtCount.format(items.length))}
        </p>
      </header>

      {/* Barra agregada: segmentos proporcionais, com descrição para leitores de tela */}
      <div
        role="img"
        aria-label={`${t.barLabel}: ${barSummary}`}
        className={`mb-6 flex h-3 w-full overflow-hidden rounded-full ${ui.track}`}
      >
        {groups.map((g) => (
          <span
            key={g.name}
            aria-hidden="true"
            className="h-full transition-[width] duration-700 ease-out"
            style={{ width: `${g.percent}%`, backgroundColor: g.color }}
          />
        ))}
      </div>

      <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2">
        {groups.map((g) => (
          <li
            key={g.name}
            className={`rounded-xl border p-4 transition-colors duration-300 ${ui.card}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <LanguageIcon name={g.name} size={18} color={g.color} />
                <span className={`truncate text-[0.9rem] font-bold ${ui.text}`}>{g.name}</span>
              </div>
              <span
                className={`shrink-0 text-[0.85rem] font-semibold tabular-nums ${ui.text}`}
                style={{ fontFamily: FONT_MONO }}
              >
                {fmtPercent.format(g.percent)}%
              </span>
            </div>

            <div
              role="progressbar"
              aria-label={g.name}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(g.percent)}
              className={`mt-3 h-2 w-full overflow-hidden rounded-full ${ui.track}`}
            >
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-out"
                style={{ width: `${g.percent}%`, backgroundColor: g.color }}
              />
            </div>

            {g.bytes !== null && (
              <p className={`mt-2 text-[0.7rem] tabular-nums ${ui.sub}`} style={{ fontFamily: FONT_MONO }}>
                {fmtBytes(g.bytes)}
              </p>
            )}
          </li>
        ))}
      </ul>

      <p className={`mt-6 text-center text-[0.7rem] font-medium ${ui.sub}`}>{t.note}</p>
    </section>
  );
}
