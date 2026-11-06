import { CardShell } from './ui/CardShell';
import LanguageIcon from './LanguageIcon';
// src/components/RepositoriesCard.jsx
import { memo, useMemo } from 'react';
import { ExternalLink, GitFork, Star, Github } from 'lucide-react';

const FONT_MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";
const MAX_VISIBLE = 4;
const FALLBACK_LANG_COLOR = '#8b949e';
const HEX = /^#[0-9a-f]{6}$/i;
const GITHUB_USER = 'gustavoryandev';
const REPOS_URL = `https://github.com/${GITHUB_USER}?tab=repositories`;

const copy = {
  pt: {
    title: 'Repositórios recentes',
    subtitle: 'Sincronizado ao vivo do GitHub',
    empty: 'Nenhum repositório listado no momento.',
    viewOnGithub: 'Ver no GitHub',
    openAll: 'Abrir todos os repositórios no GitHub (nova aba)',
    openRepo: (name) => `Abrir ${name} no GitHub (nova aba)`,
    avatarAlt: (login) => `Foto de perfil de ${login}`,
    stars: 'estrelas',
    forks: 'forks',
  },
  en: {
    title: 'Recent repositories',
    subtitle: 'Synced live from GitHub',
    empty: 'No repositories listed at the moment.',
    viewOnGithub: 'View on GitHub',
    openAll: 'Open all repositories on GitHub (new tab)',
    openRepo: (name) => `Open ${name} on GitHub (new tab)`,
    avatarAlt: (login) => `Profile photo of ${login}`,
    stars: 'stars',
    forks: 'forks',
  },
};

// Tokens do design system Alvinegro + Azul
const ui = {
  panel: '', card: 'border-line bg-panel-soft hover:border-accent',
  title: 'text-ink', sub: 'text-muted', muted: 'text-muted', accent: 'text-accent',
  accentBg: 'border-brand-400/40 bg-brand-400/10 text-accent',
  neutralBadge: 'border-line bg-panel text-ink', iconTile: 'border-line bg-panel text-accent',
  linkButton: 'border-line bg-panel text-muted hover:text-accent',
  avatarRing: 'ring-accent', dashed: 'border-line bg-panel-soft text-muted', divider: 'border-line',
};

// Foto local usada nos cartões do perfil.
function ProfileAvatar({ src, login, ui, size = 'md' }) {
  if (!src) return null;
  const dimension = size === 'sm' ? 'h-7 w-7' : 'h-10 w-10';
  return (
    <img
      src={src}
      alt={copy.pt.avatarAlt(login)}
      loading="lazy"
      decoding="async"
      className={`profile-photo shrink-0 rounded-full object-cover ring-2 ${dimension} ${ui.avatarRing}`}
    />
  );
}

// Um repositório: componente próprio e memorizado para não re-renderizar a lista inteira
const RepoItem = memo(function RepoItem({ repo, ui, t, langColor }) {
  const href = repo.url || `https://github.com/${GITHUB_USER}/${repo.name}`;
  const stars = Number(repo.stars) || 0;
  const forks = Number(repo.forks) || 0;

  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.openRepo(repo.name)}
        className={`group block rounded-xl border p-3.5 transition-all duration-200 hover:border-brand-500/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 ${ui.card}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className={`min-w-0 truncate text-[15px] font-bold ${ui.title}`}>{repo.name}</h4>
              {stars > 0 && (
                <span className={`flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs font-bold tabular-nums ${ui.accentBg}`}>
                  <Star size={10} className="fill-current" aria-hidden="true" />
                  <span className="sr-only">{t.stars}:</span>
                  {stars}
                </span>
              )}
              {forks > 0 && (
                <span className={`flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs font-bold tabular-nums ${ui.neutralBadge}`}>
                  <GitFork size={10} aria-hidden="true" />
                  <span className="sr-only">{t.forks}:</span>
                  {forks}
                </span>
              )}
            </div>

            {repo.description && (
              <p className={`mt-1 line-clamp-2 text-[12px] ${ui.muted}`}>{repo.description}</p>
            )}
          </div>
          <ExternalLink
            size={16}
            aria-hidden="true"
            className={`mt-0.5 shrink-0 transition-colors ${ui.muted} group-hover:text-brand-400`}
          />
        </div>

        {repo.language && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold tracking-wide ${ui.neutralBadge}`}
              style={{ fontFamily: FONT_MONO }}
            >
              <LanguageIcon name={repo.language} size={14} color={langColor} />
              {repo.language}
            </span>
          </div>
        )}
      </a>
    </li>
  );
});

export default function RepositoriesCard({ context, lang = 'pt' }) {
  const t = copy[lang] || copy.pt;

  const github = context?.github;
  const profile = github?.profile || {};
  const login = profile.login || GITHUB_USER;
  const avatarSrc = '/perfil-foto.jpeg';

  // Mantém a ordem recebida do backend e limita a quantidade exibida
  const repos = useMemo(
    () => (Array.isArray(github?.repositories) ? github.repositories.slice(0, MAX_VISIBLE) : []),
    [github?.repositories],
  );

  const headingId = 'repos-card-title';

  const headerAvatar = (
    <ProfileAvatar src={avatarSrc} login={login} ui={ui} />
  );

  return (
    <CardShell as="section" className="my-3" aria-labelledby={headingId}>
      <header className="mb-5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {headerAvatar ?? (
            <div className={`shrink-0 rounded-lg border p-2 ${ui.iconTile}`} aria-hidden="true">
              <Github className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0">
            <h3 id={headingId} className={`truncate text-[17px] font-bold leading-tight ${ui.title}`}>
              {t.title}
            </h3>
            <p className={`truncate text-[12px] font-medium ${ui.sub}`}>{t.subtitle}</p>
          </div>
        </div>
        <a
          href={REPOS_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.openAll}
          title={t.openAll}
          className={`hidden rounded-lg border p-2 transition-colors sm:flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 ${ui.linkButton}`}
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </header>

      {repos.length > 0 ? (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {repos.map((repo, index) => (
            <RepoItem
              key={repo.id ?? repo.name ?? index}
              repo={repo}
              ui={ui}
              t={t}
              langColor={HEX.test(repo.languageColor) ? repo.languageColor : FALLBACK_LANG_COLOR}
            />
          ))}
        </ul>
      ) : (
        <div className={`flex flex-col items-center gap-2 rounded-xl border border-dashed py-6 text-center text-sm ${ui.dashed}`}>
          <p>{t.empty}</p>
          <a
            href={REPOS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`font-bold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 ${ui.accent}`}
          >
            {t.viewOnGithub}
          </a>
        </div>
      )}
    </CardShell>
  );
}
