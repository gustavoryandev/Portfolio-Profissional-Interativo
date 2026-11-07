import { useId, useState } from 'react';
import { Info, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import perfil from '../data/perfil.json';
import LanguageIcon from './LanguageIcon';
import { proficiencyValue, proficiencyLevel } from '../data/skillProficiency';

const categories = {
  Backend: ['Back-end', 'Back-end'], Frontend: ['Front-end', 'Front-end'],
  'Banco de dados': ['Bancos de dados', 'Databases'], Ferramentas: ['Ferramentas', 'Tools'],
  Design: ['Design', 'Design'], 'Formato de dados': ['Dados', 'Data'],
};
export default function SkillsProficiencyCard({ lang, skills: allSkills = perfil.skills }) {
  const { i18n } = useTranslation();
  const en = (lang || i18n.language).startsWith('en');
  const heading = useId();
  const [category, setCategory] = useState('all');
  const skills = allSkills.filter(skill => category === 'all' || skill.categoria === category);
  return <section className="my-2 min-w-0 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 text-[var(--ink)] sm:p-5" aria-labelledby={heading}>
    <header className="mb-5 flex items-start justify-between gap-3 border-b border-[var(--line)] pb-4">
      <div className="flex min-w-0 items-start gap-3"><span className="rounded-lg border border-[var(--line)] bg-[var(--panel-soft)] p-2 text-[var(--accent)]"><TrendingUp size={20} aria-hidden="true" /></span><div><h3 id={heading} className="!m-0 text-base font-semibold">{en ? 'Proficiency by tool' : 'Proficiência por ferramenta'}</h3><p className="!mb-0 mt-1 text-xs leading-relaxed text-[var(--muted)]">{en ? 'My knowledge, always evolving.' : 'Meus conhecimentos, em constante evolução.'}</p></div></div>
      <span className="shrink-0 rounded-full border border-[var(--line)] px-2 py-1 text-xs text-[var(--accent)]">{allSkills.length} {en ? 'skills' : 'habilidades'}</span>
    </header>
    <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label={en ? 'Filter skills' : 'Filtrar habilidades'}>
      {['all', ...new Set(allSkills.map(skill => skill.categoria))].map(value => <button key={value} type="button" aria-pressed={category === value} onClick={() => setCategory(value)} className={`rounded-full border px-3 py-1.5 text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${category === value ? 'border-[var(--accent)] bg-[var(--panel-soft)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--ink)]'}`}>{value === 'all' ? (en ? 'All' : 'Todas') : categories[value]?.[en ? 1 : 0] || value}</button>)}
    </div>
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {skills.map(skill => {
        const percent = proficiencyValue(skill);
        const level = proficiencyLevel(percent, en ? 'en' : 'pt');
        const percentage = percent === null ? (en ? 'To be defined' : 'A definir') : `${new Intl.NumberFormat(en ? 'en' : 'pt-BR', { maximumFractionDigits: 1 }).format(percent)}%`;
        return <article key={skill.nome} className="min-w-0 rounded-lg border border-[var(--line)] bg-[var(--panel-soft)] p-4 transition-colors hover:border-[var(--accent)]">
          <div className="mb-4 flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--panel)]"><LanguageIcon name={skill.nome} size={24} className={skill.nome === 'GitHub' ? 'dark:invert' : ''} /></span><div className="min-w-0 flex-1"><h4 className="m-0 text-sm font-semibold">{skill.nome}</h4><p className="!mb-0 mt-1 text-xs text-[var(--muted)]">{categories[skill.categoria]?.[en ? 1 : 0] || skill.categoria}</p></div><span className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-2 py-1 text-xs text-[var(--accent)]">{level}</span></div>
          <div className="mb-2 flex items-center justify-between gap-2 text-xs"><span className="text-[var(--muted)]">{en ? 'Declared proficiency' : 'Proficiência declarada'}</span><span className="font-semibold tabular-nums text-[var(--ink)]">{percentage}</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--line)]" role={percent === null ? undefined : 'progressbar'} aria-label={`${skill.nome}: ${en ? 'proficiency' : 'proficiência'}`} aria-valuemin={percent === null ? undefined : 0} aria-valuemax={percent === null ? undefined : 100} aria-valuenow={percent ?? undefined} aria-valuetext={percent === null ? undefined : `${percentage} · ${level}`}>
            {percent !== null && <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-400" style={{ width: `${percent}%` }} />}
          </div>
          <p className="!mb-0 mt-3 text-xs leading-relaxed text-[var(--muted)]">{percent === null ? (en ? 'Percentage not yet provided; level to be defined.' : 'Percentual ainda não informado; nível a definir.') : (en ? 'Self-assessment · Learning and improving through practice.' : 'Autoavaliação · Aprendizado e evolução com a prática.')}</p>
        </article>;
      })}
    </div>
    <footer className="mt-5 flex items-start gap-2 rounded-lg border border-[var(--line)] bg-[var(--panel-soft)] p-3 text-xs leading-relaxed text-[var(--muted)]"><Info size={15} className="mt-0.5 shrink-0 text-[var(--accent)]" aria-hidden="true" /><p className="!m-0">{en ? 'Proficiency self-assessment: these percentages reflect my current level and evolve with learning and practice. Basic: below 50% · Intermediate: 50–79% · Advanced: 80–100%.' : 'Autoavaliação de proficiência: os percentuais refletem meu nível atual e evoluem com aprendizado e prática. Básico: abaixo de 50% · Intermediário: 50–79% · Avançado: 80–100%.'}</p></footer>
  </section>;
}
