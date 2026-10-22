import { Github, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function GithubCard({ context }) {
  const { t } = useTranslation();
  
  // Calculando totais com base nos repositórios puxados na hora
  const github = context?.github;
  const repos = github?.repositories || [];
  
  const reposCount = repos.length;
  const totalStars = repos.reduce((acc, repo) => acc + (repo.stars || 0), 0);

  return <article className="card-surface w-full max-w-sm p-5">
    <div className="mb-4 flex items-center gap-3"><Github className="text-amber-400" size={22} /><h3 className="card-heading">{t('cards.github.titulo')}</h3></div>
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-center transition-colors hover:border-amber-500/30">
        <strong className="text-2xl">{reposCount > 0 ? reposCount : '--'}</strong>
        <p className="text-xs text-zinc-500">{t('cards.github.repos')}</p>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-center transition-colors hover:border-amber-500/30">
        <strong className="text-2xl text-amber-400">{totalStars > 0 ? totalStars : '--'}</strong>
        <p className="text-xs text-zinc-500">Total de Estrelas</p>
      </div>
    </div>
    <a href="https://github.com/gustavoryan-del" target="_blank" rel="noreferrer" className="mt-4 flex items-center gap-2 text-xs font-medium text-amber-400 hover:text-amber-300">
      Ver perfil GitHub <ExternalLink size={13} />
    </a>
  </article>;
}