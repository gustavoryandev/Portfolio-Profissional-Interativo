import { Trophy, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function GaloCard() {
  const { t } = useTranslation();
  return <article className="card-surface relative w-full max-w-sm overflow-hidden p-5">
    <div className="mb-4 flex items-center gap-3"><Trophy className="text-amber-400" size={22} /><h3 className="card-heading">{t('cards.galo.titulo')}</h3></div>
    <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="text-center"><div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-black font-bold">CAM</div><p className="text-xs text-zinc-400">Galo</p></div>
      <div className="text-center"><strong className="rounded-full bg-amber-500 px-3 py-1 text-sm text-zinc-950">21:30</strong><p className="mt-2 text-xs text-zinc-500">Qua, 28/10</p></div>
      <div className="text-center"><div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-red-600 font-bold">FLA</div><p className="text-xs text-zinc-400">Flamengo</p></div>
    </div>
    <a href="https://www.espn.com.br/futebol/time/_/id/874/atletico-mg" target="_blank" rel="noreferrer" className="mt-4 flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300">Ver calendário <ExternalLink size={13} /></a>
  </article>;
}
