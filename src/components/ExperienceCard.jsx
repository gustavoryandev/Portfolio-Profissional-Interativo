import { BriefcaseBusiness } from 'lucide-react';
import perfil from '../data/perfil.json';

export default function ExperienceCard() {
  return (
    <article className="card-surface w-full max-w-lg p-5">
      <header className="mb-5 flex items-center gap-3">
        <BriefcaseBusiness className="text-amber-400" size={20} />
        <h3 className="card-heading">EXPERIENCE / TIMELINE</h3>
      </header>
      <ol className="relative ml-2 border-l border-amber-500/40">
        {perfil.experiencias.map((experience) => (
          <li key={experience.id} className="relative pb-5 pl-6 last:pb-0">
            <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full border-2 border-amber-400 bg-[var(--surface)]" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white">{experience.empresa}</h4>
                <p className="mt-1 text-xs tracking-wide text-zinc-400">{experience.cargoI18n}</p>
              </div>
              <span className="rounded-full border border-amber-500/40 px-2 py-0.5 text-[10px] tracking-wider text-amber-400">{experience.periodo}</span>
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}
