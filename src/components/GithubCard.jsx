import {
  Github, Zap, GitCommit, GitPullRequest, CircleDot, Star, GitFork,
  Users, BookOpen, Flame, Trophy, Calendar,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CardShell, CardHeader, CardFooter } from './ui/CardShell';
import StatTile from './ui/StatTile';

export default function GithubCard({ context }) {
  const { t: tr } = useTranslation();
  const github = context?.github;
  const profile = github?.profile || {};
  const stats = github?.stats || {};
  const isConfigured = github?.status === 'ok';
  const login = profile.login || 'gustavoryandev';
  const profileUrl = `https://github.com/${login}`;
  const days = (n) => (n != null ? tr('cards.github.dias', { count: n }) : null);

  return (
    <CardShell>
      <CardHeader
        icon={Github}
        title={tr('cards.github.titulo')}
        subtitle={<a className="hud" href={profileUrl} target="_blank" rel="noreferrer">github.com/{login}</a>}
        aside={isConfigured && (
          <span className="chip hidden sm:inline-flex">
            <img src="/perfil-foto.jpeg" alt="" className="profile-photo h-5 w-5 rounded-full" />
            {tr('cards.github.noGitHubDesde', { year: profile.joinedYear || '2024' })}
          </span>
        )}
      />

      {isConfigured ? (
        <div className="card-grid github-metrics-grid">
          <StatTile icon={<Zap />} label={tr('cards.github.contribuicoes')} value={stats.contributions} sub={tr('cards.github.ultimos12Meses')} />
          <StatTile icon={<GitCommit />} label={tr('cards.github.commits')} value={stats.commits} sub={tr('cards.github.ultimos12Meses')} />
          <StatTile icon={<GitPullRequest />} label={tr('cards.github.pullRequests')} value={stats.prs} sub={tr('cards.github.noTotal')} />
          <StatTile icon={<CircleDot />} label={tr('cards.github.issues')} value={stats.issues} sub={tr('cards.github.noTotal')} />
          <StatTile icon={<Star />} label={tr('cards.github.estrelas')} value={stats.stars} sub={tr('cards.github.emRepositorios', { count: stats.repos })} />
          <StatTile icon={<GitFork />} label={tr('cards.github.forks')} value={stats.forks} sub={tr('cards.github.emRepositorios', { count: stats.repos })} />
          <StatTile icon={<Users />} label={tr('cards.github.seguidores')} value={stats.followers} sub={tr('cards.github.seguindo', { count: stats.following })} />
          <StatTile icon={<BookOpen />} label={tr('cards.github.repositorios')} value={stats.repos} sub={tr('cards.github.publicos')} />
          {/* A sequência atual pode terminar ontem: o rótulo não afirma "ativo hoje" */}
          <StatTile icon={<Flame />} label={tr('cards.github.sequenciaAtual')} value={days(stats.currentStreak)} sub={tr('cards.github.diasSeguidos')} />
          <StatTile icon={<Trophy />} label={tr('cards.github.maiorSequencia')} value={days(stats.longestStreak)} sub={tr('cards.github.recordePessoal')} />
          <StatTile icon={<Calendar />} label={tr('cards.github.melhorDia')} value={stats.bestDay?.count} sub={tr('cards.github.nesteAno')} />
        </div>
      ) : (
        <div className="empty-box">{tr('cards.github.indisponivel')}</div>
      )}

      <CardFooter status={isConfigured ? tr('cards.github.sincronizado') : undefined} live={isConfigured && !github?.stale} href={profileUrl} label={tr('cards.github.verPerfil')} />
    </CardShell>
  );
}
