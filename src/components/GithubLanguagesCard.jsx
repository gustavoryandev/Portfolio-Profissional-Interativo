import { CardShell, CardHeader } from './ui/CardShell';
import LanguageIcon from './LanguageIcon';
import { useId, useMemo } from 'react';
import { Code2 } from 'lucide-react';
import './GithubDetails.css';

const FONT_MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";
const FALLBACK_COLOR = '#8b949e';
const MAX_ITEMS = 6;
const UNITS = ['B', 'KB', 'MB', 'GB'];
const HEX = /^#[0-9a-f]{6}$/i;

const copy = {
  pt: {
    title: 'Linguagens mais usadas',
    count: (n) => `${n} linguagens em repositórios públicos`,
    countOne: '1 linguagem em repositórios públicos',
    others: (n) => `+ ${n} outras`,
    barLabel: 'Distribuição de linguagens',
    note: 'Bytes de código somados em repositórios públicos próprios (sem forks).',
    unavailable: 'Dados de linguagens indisponíveis no momento.',
    empty: 'Ainda não há linguagens nos repositórios públicos.',
  },
  en: {
    title: 'Most used languages',
    count: (n) => `${n} languages across public repositories`,
    countOne: '1 language across public repositories',
    others: (n) => `+ ${n} more`,
    barLabel: 'Language distribution',
    note: 'Code bytes summed across owned public repositories (forks excluded).',
    unavailable: 'Language data is unavailable at the moment.',
    empty: 'No languages in public repositories yet.',
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

  const headingId = useId();

  if (github?.status !== 'ok' || github.languages == null) {
    return (
      <CardShell as="section" className="my-3 github-detail" aria-labelledby={headingId}>
        <CardHeader icon={Code2} titleId={headingId} title={t.title} />
        <div className="github-detail-empty">
          {t.unavailable}
        </div>
      </CardShell>
    );
  }

  if (items.length === 0) {
    return (
      <CardShell as="section" className="my-3 github-detail" aria-labelledby={headingId}>
        <CardHeader icon={Code2} titleId={headingId} title={t.title} />
        <div className="github-detail-empty">
          {t.empty}
        </div>
      </CardShell>
    );
  }

  const barSummary = groups.map((g) => `${g.name} ${fmtPercent.format(g.percent)}%`).join(', ');

  return (
    <CardShell as="section" className="my-3 github-detail" aria-labelledby={headingId}>
      <CardHeader icon={Code2} titleId={headingId} title={t.title}
        subtitle={items.length === 1 ? t.countOne : t.count(fmtCount.format(items.length))} />

      {/* Barra agregada: segmentos proporcionais, com descrição para leitores de tela */}
      <div
        role="img"
        aria-label={`${t.barLabel}: ${barSummary}`}
        className="github-language-distribution"
      >
        {groups.map((g) => (
          <span
            key={g.name}
            aria-hidden="true"
            style={{ flexGrow: g.percent, backgroundColor: g.color }}
          />
        ))}
      </div>

      <ul className="github-language-list">
        {groups.map((g) => (
          <li
            key={g.name}
            className="github-language-row"
          >
              <span aria-hidden="true" className="github-language-icon">
                <LanguageIcon name={g.name} size={20} color={g.color} />
              </span>
              <div className="github-language-name">
                <strong>{g.name}</strong>
                {g.bytes !== null && (
                  <span className="github-language-bytes" style={{ fontFamily: FONT_MONO }}>
                    {fmtBytes(g.bytes)}
                  </span>
                )}
              </div>
              <span
                className="github-language-percent"
                style={{ fontFamily: FONT_MONO }}
              >
                {fmtPercent.format(g.percent)}%
              </span>
            <div
              role="progressbar"
              aria-label={g.name}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={g.percent}
              aria-valuetext={`${fmtPercent.format(g.percent)}%`}
              className="github-language-track"
            >
              <div
                style={{ width: `${g.percent}%`, backgroundColor: g.color }}
              />
            </div>
          </li>
        ))}
      </ul>

      <p className="github-detail-note">{t.note}</p>
    </CardShell>
  );
}
