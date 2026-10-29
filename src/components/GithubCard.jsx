import React, { useContext } from 'react';
import {
  Github, ExternalLink, Zap, GitCommit, GitPullRequest,
  CircleDot, Star, GitFork, Users, BookOpen, Flame, Trophy, Calendar, Eye
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';

const FONT_SANS = "Inter, 'Geist Sans', Roboto, system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";

// Tokens do design system Alvinegro + Azul
const THEME = {
  dark: {
    page: '#050E17',
    card: '#0B192B',
    border: '#163A59',
    hoverBorder: '#38BDF8',
    text: '#FFFFFF',
    muted: '#A5BDDF',
    accent: '#38BDF8',
    iconBg: '#050E17',
    iconFg: '#38BDF8',
    ring: '#38BDF8',
    shadow: '0 4px 16px -8px rgba(0,0,0,0.3)',
  },
  light: {
    page: '#F4F4F5',
    card: '#FFFFFF',
    border: '#E5E7EB',
    hoverBorder: '#0D6EFD',
    text: '#121212',
    muted: '#52525B',
    accent: '#0D6EFD',
    iconBg: '#050E17',
    iconFg: '#0D6EFD',
    ring: '#121212',
    shadow: '0 4px 16px -8px rgba(18,18,18,0.1)',
  },
};

// Métrica individual: selo com ícone, rótulo, valor e legenda
function StatBox({ icon, label, value, sub, t }) {
  return (
    <div
      className="group flex flex-col rounded-xl p-4 border transition-all duration-300 hover:border-sky-500/60"
      style={{
        background: t.card,
        borderColor: t.border,
        boxShadow: t.shadow,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = t.hoverBorder)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = t.border)}
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full"
          style={{ background: t.iconBg, color: t.iconFg }}
        >
          {React.cloneElement(icon, { size: 13, strokeWidth: 2.5 })}
        </span>
        <span
          className="text-[10px] font-bold tracking-[0.18em] uppercase"
          style={{ color: t.muted, fontFamily: FONT_SANS }}
        >
          {label}
        </span>
      </div>

      <strong
        className="text-xl font-semibold tabular-nums leading-none"
        style={{ color: t.text, fontFamily: FONT_SANS }}
      >
        {value ?? '--'}
      </strong>

      <p
        className="mt-1.5 text-[11px] font-medium leading-tight"
        style={{ color: t.muted, fontFamily: FONT_SANS }}
      >
        {sub}
      </p>
    </div>
  );
}

export default function GithubCard({ context, lang = 'pt' }) {
  const { t: tr } = useTranslation();
  const { darkMode } = useContext(ThemeContext);
  const t = darkMode ? THEME.dark : THEME.light;

  const github = context?.github;
  const profile = github?.profile || {};
  const stats = github?.stats || {};
  const isConfigured = github?.status === 'ok';
  const login = profile.login || 'gustavoryan-del';
  const profileUrl = `https://github.com/${login}`;

  return (
    <article
      className="portfolio-card relative my-3 w-full max-w-[700px] overflow-hidden rounded-xl border p-6 transition-colors duration-300"
      style={{
        background: t.page,
        borderColor: t.border,
        boxShadow: t.shadow,
        fontFamily: FONT_SANS,
      }}
    >
      {/* Faixa de acento no topo */}
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: t.accent }} />

      {/* HEADER */}
      <div className="mb-6 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl shadow-md"
            style={{ background: THEME.dark.iconBg, color: THEME.dark.accent }}
          >
            <Github className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight" style={{ color: t.text }}>
              {tr('cards.github.titulo')}
            </h3>
            <a
              href={profileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[12px] transition-colors"
              style={{ color: t.muted, fontFamily: FONT_MONO }}
            >
              github.com/{login}
            </a>
          </div>
        </div>

        {isConfigured && (
          <div
            className="hidden sm:flex items-center gap-2.5 rounded-full border py-1 pl-1 pr-3.5"
            style={{ background: t.card, borderColor: t.border }}
          >
            <img
              src="/perfil-foto.jpeg"
              alt={login}
              className="profile-photo w-7 h-7 rounded-full ring-2"
              style={{ '--tw-ring-color': t.ring }}
            />
            <span
              className="text-[10px] font-bold tracking-[0.15em] uppercase"
              style={{ color: t.muted }}
            >
              {tr('cards.github.noGitHubDesde', { year: profile.joinedYear || '2024' })}
            </span>
          </div>
        )}
      </div>

      {/* MÉTRICAS */}
      {isConfigured ? (
        <div className="card-grid grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox t={t} icon={<Zap />} label={tr('cards.github.contribuicoes')} value={stats.contributions} sub={tr('cards.github.ultimos12Meses')} />
          <StatBox t={t} icon={<GitCommit />} label={tr('cards.github.commits')} value={stats.commits} sub={tr('cards.github.ultimos12Meses')} />
          <StatBox t={t} icon={<GitPullRequest />} label={tr('cards.github.pullRequests')} value={stats.prs} sub={tr('cards.github.noTotal')} />
          <StatBox t={t} icon={<CircleDot />} label={tr('cards.github.issues')} value={stats.issues} sub={tr('cards.github.noTotal')} />
          <StatBox t={t} icon={<Star />} label={tr('cards.github.estrelas')} value={stats.stars} sub={tr('cards.github.emRepositorios', { count: stats.repos })} />
          <StatBox t={t} icon={<GitFork />} label={tr('cards.github.forks')} value={stats.forks} sub={tr('cards.github.emRepositorios', { count: stats.repos })} />
          <StatBox t={t} icon={<Users />} label={tr('cards.github.seguidores')} value={stats.followers} sub={tr('cards.github.seguindo', { count: stats.following })} />
          <StatBox t={t} icon={<BookOpen />} label={tr('cards.github.repositorios')} value={stats.repos} sub={tr('cards.github.publicos')} />
          <StatBox t={t} icon={<Flame />} label={tr('cards.github.sequenciaAtual')} value={stats.currentStreak !== null ? tr('cards.github.dias', { count: stats.currentStreak }) : null} sub={tr('cards.github.ativoHoje')} />
          <StatBox t={t} icon={<Trophy />} label={tr('cards.github.maiorSequencia')} value={stats.longestStreak !== null ? tr('cards.github.dias', { count: stats.longestStreak }) : null} sub={tr('cards.github.recordePessoal')} />
          <StatBox t={t} icon={<Calendar />} label={tr('cards.github.melhorDia')} value={stats.bestDay?.count} sub={tr('cards.github.nesteAno')} />
          <StatBox t={t} icon={<Eye />} label={tr('cards.github.visitas')} value={null} sub={tr('cards.github.aoPerfil')} />
        </div>
      ) : (
        <div
          className="py-12 text-center text-sm font-medium rounded-xl border border-dashed"
          style={{ color: t.muted, borderColor: t.border }}
        >
          {tr('cards.github.indisponivel')}
        </div>
      )}

      {/* RODAPÉ */}
      <div className="mt-6 flex items-center justify-between border-t pt-4" style={{ borderColor: t.border }}>
        <span
          className="flex items-center gap-2 text-[10px] font-bold tracking-[0.18em] uppercase"
          style={{ color: t.muted }}
        >
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: t.accent }} />
          {tr('cards.github.sincronizado')}
        </span>
        <a
          href={profileUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-[12px] font-bold transition-colors"
          style={{ color: t.text }}
        >
          {tr('cards.github.verPerfil')}
          <ExternalLink size={14} style={{ color: t.accent }} />
        </a>
      </div>
    </article>
  );
}
