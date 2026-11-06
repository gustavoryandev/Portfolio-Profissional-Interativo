import { CardShell } from './ui/CardShell';
import { useId, useState } from 'react';
import { FolderGit2, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import perfil from '../data/perfil.json';
import ProjectCard from './ProjectCard';
import ScrollReveal from './ui/ScrollReveal';
import { projectContent } from '../data/projectContent';

const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export default function ProjectsCard({ reveal = false }) {
  const { t, i18n } = useTranslation();
  const headingId = useId();
  const searchId = useId();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const categories = [...new Set(perfil.projetos.map(project => project.categoria).filter(Boolean))];
  const projects = perfil.projetos.filter(project => {
    const text = [projectContent(project, 'titulo', i18n.language, t), projectContent(project, 'descricao', i18n.language, t), ...(project.techs || [])].join(' ');
    return (category === 'all' || project.categoria === category) && normalize(text).includes(normalize(query.trim()));
  });
  return (
    <CardShell as="section" className="projects-card my-2" aria-labelledby={headingId}>
      <header className="card-title-row">
        <FolderGit2 size={20} aria-hidden="true" />
        <div><h3 id={headingId}>{t('projetos.heading')}</h3><p>{t('projetos.subtitle')}</p></div>
      </header>
      <div className="mb-5 space-y-3">
        <label htmlFor={searchId} className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--panel-soft)] px-3 text-[var(--muted)] focus-within:border-[var(--accent)]"><Search size={16} aria-hidden="true" /><span className="sr-only">{t('projetos.searchLabel')}</span><input id={searchId} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={t('projetos.searchPlaceholder')} className="min-w-0 flex-1 bg-transparent py-3 text-xs text-[var(--ink)] outline-none placeholder:text-[var(--muted)]" /></label>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t('projetos.filterLabel')}>{['all', ...categories].map(value => <button key={value} type="button" aria-pressed={category === value} onClick={() => setCategory(value)} className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${category === value ? 'border-[var(--accent)] bg-[var(--panel-soft)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--muted)] hover:border-[var(--accent)]'}`}>{t(`projetos.category.${value}`)}</button>)}</div>
        <p role="status" aria-live="polite" className="!m-0 text-xs text-[var(--muted)]">{t('projetos.results', { count: projects.length, total: perfil.projetos.length })}</p>
      </div>
      <div className="projects-grid">
        {projects.map(project => reveal ? <ScrollReveal key={project.id}><ProjectCard project={project} /></ScrollReveal> : <ProjectCard key={project.id} project={project} />)}
      </div>
      {!projects.length && <p className="py-8 text-center text-sm text-[var(--muted)]">{t('projetos.noResults')}</p>}
    </CardShell>
  );
}
