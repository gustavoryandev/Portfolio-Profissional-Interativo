import React, { useContext } from 'react';
import { 
  Github, ExternalLink, Zap, GitCommit, GitPullRequest, 
  CircleDot, Star, GitFork, Users, BookOpen, Flame, Trophy, Calendar, Eye 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';

export default function GithubCard({ context, lang = 'pt' }) {
  const { t } = useTranslation();
  const { darkMode } = useContext(ThemeContext);
  
  const github = context?.github;
  const profile = github?.profile || {};
  const stats = github?.stats || {};
  const isConfigured = github?.status === 'ok';

  // Caixa de Métrica alinhada ao visual "Grid" do terminal
  const StatBox = ({ icon, label, value, sub }) => (
    <div className={`flex flex-col rounded-xl p-3.5 transition-colors border ${
      darkMode 
        ? 'bg-[#141414] border-[#222222] hover:border-amber-500/40' 
        : 'bg-white border-gray-200 hover:border-amber-500/50 shadow-sm'
    }`}>
      <div className={`flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase mb-1.5 ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
        {React.cloneElement(icon, { size: 14, className: 'text-amber-500' })}
        {label}
      </div>
      <strong className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {value ?? '--'}
      </strong>
      <p className={`mt-0.5 text-[11px] font-medium leading-tight ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
        {sub}
      </p>
    </div>
  );

  return (
    <article className={`my-3 w-full max-w-[700px] rounded-2xl border p-6 transition-colors duration-300 ${
      darkMode ? 'bg-[#0a0a0a] border-amber-500/20 shadow-lg shadow-black/50' : 'bg-gray-50 border-gray-200 shadow-md'
    }`}>
      
      {/* HEADER ESTILO TERMINAL */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-2.5 bg-black text-amber-500 border border-zinc-800 shadow-md">
            <Github className="h-7 w-7" />
          </div>
          <div>
            <h3 className={`text-[19px] font-black tracking-tight flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('cards.github.titulo')}
            </h3>
            <a 
              href={`https://github.com/${profile.login || 'gustavoryan-del'}`} 
              target="_blank" 
              rel="noreferrer"
              className={`text-[12px] font-mono font-medium hover:text-amber-500 transition-colors ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}
            >
              github.com/{profile.login || 'gustavoryan-del'}
            </a>
          </div>
        </div>
        
        {isConfigured && profile.avatarUrl && (
          <div className={`hidden sm:flex items-center gap-2.5 rounded-full border px-3 py-1.5 ${darkMode ? 'bg-[#141414] border-[#222]' : 'bg-white border-gray-300'}`}>
            <img src={profile.avatarUrl} alt="Avatar" className="w-6 h-6 rounded-full border border-amber-500/30" />
            <span className={`text-[11px] font-bold tracking-wide uppercase ${darkMode ? 'text-zinc-400' : 'text-gray-600'}`}>
              {t('cards.github.noGitHubDesde', { year: profile.joinedYear || '2024' })}
            </span>
          </div>
        )}
      </div>

      {isConfigured ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox icon={<Zap />} label={t('cards.github.contribuicoes')} value={stats.contributions} sub={t('cards.github.ultimos12Meses')} />
          <StatBox icon={<GitCommit />} label={t('cards.github.commits')} value={stats.commits} sub={t('cards.github.ultimos12Meses')} />
          <StatBox icon={<GitPullRequest />} label={t('cards.github.pullRequests')} value={stats.prs} sub={t('cards.github.noTotal')} />
          <StatBox icon={<CircleDot />} label={t('cards.github.issues')} value={stats.issues} sub={t('cards.github.noTotal')} />
          <StatBox icon={<Star />} label={t('cards.github.estrelas')} value={stats.stars} sub={t('cards.github.emRepositorios', { count: stats.repos })} />
          <StatBox icon={<GitFork />} label={t('cards.github.forks')} value={stats.forks} sub={t('cards.github.emRepositorios', { count: stats.repos })} />
          <StatBox icon={<Users />} label={t('cards.github.seguidores')} value={stats.followers} sub={t('cards.github.seguindo', { count: stats.following })} />
          <StatBox icon={<BookOpen />} label={t('cards.github.repositorios')} value={stats.repos} sub={t('cards.github.publicos')} />
          <StatBox icon={<Flame />} label={t('cards.github.sequenciaAtual')} value={stats.currentStreak !== null ? t('cards.github.dias', { count: stats.currentStreak }) : null} sub={t('cards.github.ativoHoje')} />
          <StatBox icon={<Trophy />} label={t('cards.github.maiorSequencia')} value={stats.longestStreak !== null ? t('cards.github.dias', { count: stats.longestStreak }) : null} sub={t('cards.github.recordePessoal')} />
          <StatBox icon={<Calendar />} label={t('cards.github.melhorDia')} value={stats.bestDay?.count} sub={t('cards.github.nesteAno')} />
          <StatBox icon={<Eye />} label={t('cards.github.visitas')} value={null} sub={t('cards.github.aoPerfil')} />
        </div>
      ) : (
        <div className={`py-12 text-center text-sm font-medium rounded-xl border border-dashed ${darkMode ? 'text-zinc-500 border-zinc-800' : 'text-zinc-400 border-gray-300'}`}>
          {t('cards.github.indisponivel')}
        </div>
      )}
      
      <div className={`mt-6 flex items-center justify-between border-t pt-4 ${darkMode ? 'border-[#222]' : 'border-gray-200'}`}>
        <span className={`text-[11px] font-bold tracking-widest uppercase flex items-center gap-2 ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
          {t('cards.github.sincronizado')}
        </span>
        <a 
          href={`https://github.com/${profile.login || 'gustavoryan-del'}`} 
          target="_blank" 
          rel="noreferrer" 
          className="flex items-center gap-1.5 text-[12px] font-bold text-amber-500 transition-colors hover:text-amber-400"
        >
          {t('cards.github.verPerfil')} <ExternalLink size={14} />
        </a>
      </div>
    </article>
  );
}