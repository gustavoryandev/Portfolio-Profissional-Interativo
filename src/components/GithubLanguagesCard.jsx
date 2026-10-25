import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

/* =====================================================================
   Traduções
   ===================================================================== */
const TRANSLATIONS = {
  pt: {
    languages: 'linguagens',
    languagesCount: 'linguagens em repositórios públicos',
    languageCountOne: 'linguagem em repositórios públicos',
    note: 'Bytes de código somados em todos os repositórios públicos próprios (sem forks)',
    others: (count) => `+ ${count} outras`,
    noData: 'Ainda não há linguagens nos repositórios públicos.',
    unavailable: 'Métricas de linguagens do GitHub indisponíveis ou não configuradas.'
  },
  en: {
    languages: 'languages',
    languagesCount: 'languages across public repositories',
    languageCountOne: 'language across public repositories',
    note: 'Code bytes summed across all owned public repositories (forks excluded)',
    others: (count) => `+ ${count} more`,
    noData: 'No languages in public repositories yet.',
    unavailable: 'GitHub language metrics are unavailable or not configured.'
  }
};

const LIMIT = 6;             // linguagens mostradas antes de "+ N outras"
const FALLBACK_COLOR = '#8b949e';
const UNITS = ['B', 'KB', 'MB', 'GB'];

/* =====================================================================
   Helpers
   ===================================================================== */
// Mesma ideia do Columns/Activity: agrupa o resto num item só
function groupRest(items, limit, othersLabel) {
  const top = items.slice(0, limit);
  const rest = items.slice(limit);
  if (rest.length === 0) return top;
  return [
    ...top,
    {
      name: othersLabel(rest.length),
      color: null,
      value: rest.reduce((sum, item) => sum + item.value, 0),
      percent: rest.reduce((sum, item) => sum + item.percent, 0),
      isRest: true
    }
  ];
}

/* =====================================================================
   Componente principal
   ===================================================================== */
export default function GithubLanguagesCard({ context, lang = 'pt' }) {
  const { darkMode } = useContext(ThemeContext);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.pt;
  const locale = lang === 'en' ? 'en-US' : 'pt-BR';
  const number = (value) => new Intl.NumberFormat(locale).format(Math.round(value));
  const percent = (value) => `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)}%`;
  const bytes = (value) => {
    let amount = value;
    let unit = 0;
    while (amount >= 1000 && unit < UNITS.length - 1) {
      amount /= 1000;
      unit++;
    }
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(amount)} ${UNITS[unit]}`;
  };

  const github = context?.github;
  const languages = github?.languages;

  const muted = darkMode ? 'text-zinc-500' : 'text-gray-400';
  const label = darkMode ? 'text-gray-400' : 'text-gray-500';
  const surface = darkMode ? 'bg-[#141414] border-[#2a2a2a]' : 'bg-gray-50 border-gray-100';
  const track = darkMode ? 'bg-[#161b22]' : 'bg-gray-200';
  const sectionTitle = `mb-6 flex items-center gap-2 text-[0.85rem] font-semibold uppercase tracking-[0.05em] ${darkMode ? 'text-gray-300' : 'text-gray-600'}`;
  const wrapper = `mx-auto my-6 w-full max-w-[850px] rounded-xl border p-6 shadow-lg transition-colors duration-300 ${darkMode ? 'border-[#2a2a2a] bg-[#0f0f0f] text-gray-200' : 'border-gray-200 bg-white text-gray-800'}`;

  /* ---------- Sem dados do GitHub ---------- */
  if (github?.status !== 'ok' || !languages) {
    return (
      <div className={wrapper}>
        <div className={`rounded-xl border border-dashed py-12 text-center text-sm font-medium ${darkMode ? 'border-zinc-800 text-zinc-500' : 'border-gray-300 text-zinc-400'}`}>
          {t.unavailable}
        </div>
      </div>
    );
  }

  const items = Array.isArray(languages.items) ? languages.items : [];
  if (items.length === 0) {
    return (
      <div className={wrapper}>
        <h3 className={sectionTitle}>
          <span className="font-bold text-emerald-500">#</span> {t.languages}
        </h3>
        <div className={`rounded-xl border border-dashed py-10 text-center text-sm font-medium ${darkMode ? 'border-zinc-800 text-zinc-500' : 'border-gray-300 text-zinc-400'}`}>
          {t.noData}
        </div>
      </div>
    );
  }

  const groups = groupRest(items, LIMIT, t.others);
  const colorOf = (item) => (item.isRest ? FALLBACK_COLOR : item.color || FALLBACK_COLOR);

  return (
    <div className={wrapper}>
      <div className="mb-8">
        <h3 className={sectionTitle}>
          <span className="font-bold text-emerald-500">#</span> {t.languages}
        </h3>

        <p className={`mb-4 text-sm ${label}`}>
          <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{number(items.length)}</span>{' '}
          {items.length === 1 ? t.languageCountOne : t.languagesCount}
        </p>

        {/* Barra única dividida por linguagem; a lista abaixo traz os mesmos valores */}
        <div className={`mb-6 flex h-3 w-full overflow-hidden rounded-full ${track}`} aria-hidden="true">
          {groups.map((item) => (
            <span
              key={item.name}
              className="h-full"
              style={{ width: `${item.percent}%`, backgroundColor: colorOf(item) }}
              title={`${item.name} · ${percent(item.percent)} · ${bytes(item.value)}`}
            />
          ))}
        </div>

        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {groups.map((item) => (
            <li
              key={item.name}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-[0.8rem] transition-all duration-200 hover:-translate-y-0.5 ${surface}`}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: colorOf(item) }}
                aria-hidden="true"
              />
              <span className="w-28 shrink-0 truncate font-medium sm:w-36" title={item.name}>
                {item.name}
              </span>
              <div className={`h-[8px] flex-1 overflow-hidden rounded ${track}`}>
                <div
                  className="h-full rounded"
                  style={{ width: `${item.percent}%`, backgroundColor: colorOf(item) }}
                />
              </div>
              <span className="w-12 shrink-0 text-right font-bold">{percent(item.percent)}</span>
              <span className={`hidden w-16 shrink-0 text-right text-[0.7rem] sm:block ${muted}`}>{bytes(item.value)}</span>
            </li>
          ))}
        </ul>

        <p className={`mt-8 text-center text-[0.7rem] font-medium ${muted}`}>{t.note}</p>
      </div>
    </div>
  );
}
