import { CardShell } from './ui/CardShell';
import { useId, useState } from 'react';
import { FolderGit2, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import perfil from '../data/perfil.json';
import ProjectCard from './ProjectCard';
import ScrollReveal from './ui/ScrollReveal';
import { projectContent } from '../data/projectContent';

const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const FEATURED_IDS = ['portfolio', 'terminal-portfolio', 'pokedex', 'geosolar', 'secure-login', 'github-profile'];

export default function ProjectsCard({ reveal = false, horizontal = false, preview = false, onViewAll }) {
  const { t, i18n } = useTranslation();
  const headingId = useId();
  const searchId = useId();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const categories = [...new Set(perfil.projetos.map(project => project.categoria).filter(Boolean))];
  const catalog = preview ? FEATURED_IDS.map(id => perfil.projetos.find(project => project.id === id)).filter(Boolean) : perfil.projetos;
  const projects = catalog.filter(project => {
    const text = [projectContent(project, 'titulo', i18n.language, t), projectContent(project, 'descricao', i18n.language, t), ...(project.techs || [])].join(' ');
    return (category === 'all' || project.categoria === category) && normalize(text).includes(normalize(query.trim()));
  });
  return (
    <CardShell as="section" className="projects-card my-2" aria-labelledby={headingId}>
      <header className="card-title-row">
        <FolderGit2 size={20} aria-hidden="true" />
        <div><h3 id={headingId}>{t('projetos.heading')}</h3><p>{t('projetos.subtitle')}</p></div>
      </header>
      {!preview && <div className="mb-5 space-y-3">
        <label htmlFor={searchId} className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--panel-soft)] px-3 text-[var(--muted)] focus-within:border-[var(--accent)]"><Search size={16} aria-hidden="true" /><span className="sr-only">{t('projetos.searchLabel')}</span><input id={searchId} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={t('projetos.searchPlaceholder')} className="min-w-0 flex-1 bg-transparent py-3 text-xs text-[var(--ink)] outline-none placeholder:text-[var(--muted)]" /></label>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t('projetos.filterLabel')}>{['all', ...categories].map(value => <button key={value} type="button" aria-pressed={category === value} onClick={() => setCategory(value)} className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${category === value ? 'border-[var(--accent)] bg-[var(--panel-soft)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--muted)] hover:border-[var(--accent)]'}`}>{t(`projetos.category.${value}`)}</button>)}</div>
        <p role="status" aria-live="polite" className="!m-0 text-xs text-[var(--muted)]">{t('projetos.results', { count: projects.length, total: perfil.projetos.length })}</p>
      </div>}
      <div
        data-projects-track={horizontal ? '' : undefined}
        role="region"
        aria-labelledby={headingId}
        tabIndex={horizontal ? 0 : undefined}
        className={horizontal ? 'flex overflow-x-auto gap-6 snap-x snap-mandatory scroll-smooth motion-reduce:scroll-auto px-1 py-3 scroll-px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent' : 'projects-grid'}
      >
        {projects.map(project => (
          <div key={project.id} data-project-slide={horizontal ? '' : undefined} className={horizontal ? 'flex flex-shrink-0 w-80 max-w-full snap-start [&>article]:w-full' : 'flex min-w-0 [&>article]:w-full'}>
            {reveal
              ? <ScrollReveal className="flex w-full [&>article]:w-full"><ProjectCard project={project} /></ScrollReveal>
              : <ProjectCard project={project} />}
          </div>
        ))}
      </div>
      {!projects.length && <p className="py-8 text-center text-sm text-[var(--muted)]">{t('projetos.noResults')}</p>}
      {preview && <button type="button" onClick={onViewAll} className="project-action mt-5 w-full">{i18n.language.startsWith('en') ? 'View more projects' : 'Ver mais projetos'} →</button>}
    </CardShell>
  );
}
