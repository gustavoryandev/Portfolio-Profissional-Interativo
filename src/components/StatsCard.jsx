import { Clock, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function StatsCard() {
  const { t } = useTranslation();
  return (
    <article className="card-surface w-full max-w-sm p-5">
      <div className="mb-4 flex items-center gap-3"><Clock className="text-amber-400" size={22} /><h3 className="card-heading">{t('cards.wakatime.titulo')}</h3></div>
      <div className="space-y-4">
        <div><div className="mb-1 flex justify-between text-xs"><span>JavaScript / TypeScript</span><span className="text-amber-400">32h 15m</span></div><div className="h-2 rounded-full bg-zinc-800"><div className="h-2 w-3/4 rounded-full bg-amber-500" /></div></div>
        <div><div className="mb-1 flex justify-between text-xs"><span>React / CSS</span><span className="text-amber-400">18h 40m</span></div><div className="h-2 rounded-full bg-zinc-800"><div className="h-2 w-[45%] rounded-full bg-amber-500/70" /></div></div>
      </div>
      <footer className="mt-4 flex items-center gap-2 border-t border-zinc-800 pt-3 text-xs tracking-wide text-zinc-500"><TrendingUp size={14} className="text-amber-400" />Últimos 7 dias</footer>
    </article>
  );
}
