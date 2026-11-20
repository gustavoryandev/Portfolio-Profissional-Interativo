import { useId } from 'react';
import { ExternalLink, GitFork, Star, FolderGit2, Clock3 } from 'lucide-react';
import { CardShell, CardHeader } from './ui/CardShell';
import LanguageIcon from './LanguageIcon';
import './GithubDetails.css';

const MAX_VISIBLE = 4;
const GITHUB_USER = 'gustavoryandev';
const HEX = /^#[0-9a-f]{6}$/i;
const copy = {
  pt: {
    title: 'Repositórios recentes', subtitle: 'Últimas atualizações em projetos públicos',
    empty: 'Nenhum repositório listado no momento.', unavailable: 'Repositórios indisponíveis no momento.',
    all: 'Ver todos no GitHub', openRepo: name => `Abrir ${name} no GitHub (nova aba)`,
    stars: 'estrelas', forks: 'forks', archived: 'Arquivado', pushed: 'Último push',
    noDescription: 'Sem descrição no GitHub.', count: (shown, total) => `${shown} de ${total} repositórios`,
  },
  en: {
    title: 'Recent repositories', subtitle: 'Latest updates across public projects',
    empty: 'No repositories listed at the moment.', unavailable: 'Repositories are unavailable at the moment.',
    all: 'View all on GitHub', openRepo: name => `Open ${name} on GitHub (new tab)`,
    stars: 'stars', forks: 'forks', archived: 'Archived', pushed: 'Last push',
    noDescription: 'No description on GitHub.', count: (shown, total) => `${shown} of ${total} repositories`,
  },
};

export default function RepositoriesCard({ context, lang = 'pt' }) {
  const t = copy[lang] || copy.pt;
  const headingId = useId();
  const github = context?.github;
  const login = github?.profile?.login || GITHUB_USER;
  const reposUrl = `https://github.com/${encodeURIComponent(login)}?tab=repositories`;
  const repositories = Array.isArray(github?.repositories) ? github.repositories.filter(repo => repo?.name) : [];
  // The server orders public repositories by their latest push.
  const repos = repositories.slice(0, MAX_VISIBLE);
  const dateFormat = new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'pt-BR', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Sao_Paulo',
  });

  return (
    <CardShell as="section" className="my-3 github-detail" aria-labelledby={headingId}>
      <CardHeader icon={FolderGit2} titleId={headingId} title={t.title} subtitle={t.subtitle} />
      {github?.status === 'ok' && repos.length ? (
        <ul className="github-repo-grid">
          {repos.map(repo => {
            const date = repo.pushedAt ? new Date(repo.pushedAt) : null;
            const validDate = date && Number.isFinite(date.getTime());
            const color = HEX.test(repo.languageColor) ? repo.languageColor : '#8b949e';
            return (
              <li key={repo.id ?? repo.name}>
                <a className="github-repo" href={repo.url || `https://github.com/${encodeURIComponent(login)}/${encodeURIComponent(repo.name)}`}
                  target="_blank" rel="noopener noreferrer" aria-label={t.openRepo(repo.name)}>
                  <div className="github-repo-heading">
                    <FolderGit2 size={18} aria-hidden="true" />
                    <h4>{repo.name}</h4>
                    <ExternalLink size={15} aria-hidden="true" />
                  </div>
                  <p className="github-repo-description">{repo.description || t.noDescription}</p>
                  <div className="github-repo-meta">
                    {repo.language && <span className="github-repo-language">
                      <LanguageIcon name={repo.language} size={16} color={color} />{repo.language}
                    </span>}
                    {Number(repo.stars) > 0 && <span><Star size={14} aria-hidden="true" /><span className="sr-only">{t.stars}: </span>{repo.stars}</span>}
                    {Number(repo.forks) > 0 && <span><GitFork size={14} aria-hidden="true" /><span className="sr-only">{t.forks}: </span>{repo.forks}</span>}
                    {repo.archived && <span className="github-repo-archived">{t.archived}</span>}
                  </div>
                  {validDate && <span className="github-repo-date"><Clock3 size={13} aria-hidden="true" />
                    {t.pushed} <time dateTime={date.toISOString()}>{dateFormat.format(date)}</time>
                  </span>}
                </a>
              </li>
            );
          })}
        </ul>
      ) : <p className="github-detail-empty">{github?.status === 'ok' ? t.empty : t.unavailable}</p>}
      <footer className="github-detail-footer">
        {github?.status === 'ok' && repos.length > 0 && <span>{t.count(repos.length, repositories.length)}</span>}
        <a href={reposUrl} target="_blank" rel="noopener noreferrer">
          {t.all}<ExternalLink size={14} aria-hidden="true" />
        </a>
      </footer>
    </CardShell>
  );
}
