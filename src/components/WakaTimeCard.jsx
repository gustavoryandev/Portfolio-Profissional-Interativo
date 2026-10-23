import { Clock, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function StatsCard({ context }) {
  const { t } = useTranslation();
  
  // Pegando a contagem de horas codadas de Hoje e Ontem
  const wakatime = context?.wakatime;
  const days = wakatime?.days || [];
  const today = days.at(-1);
  const yesterday = days.at(-2);

  // Calcula a barrinha percentual assumindo uma meta de 8h (28800 segs)
  const calcPercent = (seconds) => Math.min(((seconds || 0) / 28800) * 100, 100);

  return (
    <article className="card-surface w-full max-w-sm p-5">
      <div className="mb-4 flex items-center gap-3"><Clock className="text-amber-400" size={22} /><h3 className="card-heading">{t('cards.wakatime.titulo')}</h3></div>
      
      {wakatime?.status === 'ok' && days.length > 0 ? (
        <div className="space-y-4">
          <div>
            <div className="mb-1 flex justify-between text-xs font-medium">
              <span>{t('cards.wakatime.hoje')}</span><span className="text-amber-400">{today?.readable || '0h 0m'}</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full rounded-full bg-amber-500 transition-all duration-1000" style={{ width: `${calcPercent(today?.totalSeconds)}%` }} />
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs font-medium">
              <span>{t('cards.wakatime.ontem')}</span><span className="text-amber-400">{yesterday?.readable || '0h 0m'}</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full rounded-full bg-amber-500/50 transition-all duration-1000" style={{ width: `${calcPercent(yesterday?.totalSeconds)}%` }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="py-4 text-center text-sm text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
          {t('cards.wakatime.indisponivelHoje')}
        </div>
      )}
      
      <footer className="mt-4 flex items-center gap-2 border-t border-zinc-800 pt-3 text-xs tracking-wide text-zinc-500">
        <TrendingUp size={14} className="text-amber-400" /> {t('cards.wakatime.aoVivo')}
      </footer>
    </article>
  );
}