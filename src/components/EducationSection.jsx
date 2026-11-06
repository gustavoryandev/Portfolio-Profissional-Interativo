import { useId } from 'react';
import { CalendarDays, GraduationCap, Trophy } from 'lucide-react';
import perfil from '../data/perfil.json';
import LanguageIcon from './LanguageIcon';

export default function EducationSection({ en = false }) {
  const headingId = useId();
  const lang = en ? 'en' : 'pt';
  return <div className="space-y-5">
    {perfil.formacao.map(education => {
      const technical = education.origemHabilidades === 'skills';
      const Icon = technical ? GraduationCap : Trophy;
      return <article key={education.id} aria-labelledby={`${headingId}-${education.id}`} className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)]">
        <div className="h-1 bg-gradient-to-r from-blue-600 to-sky-400" />
        <div className="p-5 sm:p-6">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--line)] bg-white"><img src={education.logo} alt={en ? `${education.instituicao} logo` : `Logo ${education.instituicao}`} width="96" height="96" className="h-full w-full object-contain" /></div>
            <div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap items-center gap-2"><Icon size={16} className="text-[var(--accent)]" aria-hidden="true" /><span className="rounded-full border border-[var(--line)] bg-[var(--panel-soft)] px-2 py-1 text-xs font-medium text-[var(--accent)]">{education.conclusaoPrevista ? (en ? 'In progress' : 'Em andamento') : (en ? 'Completed' : 'Concluído')}</span></div>
              <h3 id={`${headingId}-${education.id}`} className="!m-0 text-lg font-semibold leading-snug text-[var(--ink)]">{education.instituicao}</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">{education.curso[lang]}</p>
              <p className="mt-3 flex items-center gap-2 text-xs text-[var(--accent)]"><CalendarDays size={14} aria-hidden="true" /><span>{education.inicio} — {education.conclusao}{education.conclusaoPrevista ? (en ? ' · Expected graduation' : ' · Formatura prevista') : (en ? ` · Graduated in ${education.conclusao}` : ` · Formado em ${education.conclusao}`)}</span></p>
            </div>
          </header>
          <p className="my-5 text-sm leading-relaxed text-[var(--muted)]">{education.descricao[lang]}</p>
          <div className="border-t border-[var(--line)] pt-4"><h4 className="mb-3 text-xs font-semibold text-[var(--ink)]">{technical ? (en ? 'Stacks and tools I am developing' : 'Stacks e ferramentas que desenvolvo') : (en ? 'Skills developed at school and through futsal' : 'Competências desenvolvidas na escola e no futsal')}</h4>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">{technical ? perfil.skills.map(skill => <li key={skill.nome} className="flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel-soft)] px-2.5 py-2 text-xs text-[var(--ink)]"><LanguageIcon name={skill.nome} size={15} className={skill.nome === 'GitHub' ? 'dark:invert' : ''} />{skill.nome}</li>) : education.habilidades.map(skill => <li key={skill.pt} className="rounded-lg border border-[var(--line)] bg-[var(--panel-soft)] px-2.5 py-2 text-xs text-[var(--ink)]">{skill[lang]}</li>)}</ul>
          </div>
        </div>
      </article>;
    })}
  </div>;
}
