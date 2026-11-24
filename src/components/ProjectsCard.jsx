import { CardShell } from './ui/CardShell';
import { useId, useLayoutEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, FolderGit2, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import perfil from '../data/perfil.json';
import ProjectCard from './ProjectCard';
import ScrollReveal from './ui/ScrollReveal';
import { projectContent } from '../data/projectContent';

const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const FEATURED_IDS = ['portfolio', 'terminal-portfolio', 'pokedex', 'geosolar', 'secure-login', 'github-profile'];
const SHOWCASE_IDS = ['portfolio', 'car-rental', 'geosolar'];

export default function ProjectsCard({ reveal = false, showcase = false, preview = false, onViewAll, projectFocus, onAskAstra, onResultsChange }) {
  const { t, i18n } = useTranslation();
  const headingId = useId();
  const trackId = useId();
  const searchId = useId();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  useLayoutEffect(() => {
    if (projectFocus) { setQuery(projectFocus.technology ? `tech:${projectFocus.technology}` : ''); setCategory('all'); }
  }, [projectFocus]);
  useLayoutEffect(() => {
    onResultsChange?.();
  }, [query, category, i18n.language, onResultsChange]);
  const categories = [...new Set(perfil.projetos.map(project => project.categoria).filter(Boolean))];
  const catalog = preview ? FEATURED_IDS.map(id => perfil.projetos.find(project => project.id === id)).filter(Boolean) : perfil.projetos;
  const projects = catalog.filter(project => {
    const text = [projectContent(project, 'titulo', i18n.language, t), projectContent(project, 'descricao', i18n.language, t), ...(project.techs || [])].join(' ');
    const search = normalize(query.trim());
    const matches = search.startsWith('tech:')
      ? project.techs?.some(name => normalize(name) === search.slice(5).trim())
      : normalize(text).includes(search);
    return (category === 'all' || project.categoria === category) && matches;
  });
  const showFeatured = showcase && category === 'all' && !query.trim();
  const featured = showFeatured ? SHOWCASE_IDS.map(id => projects.find(project => project.id === id)).filter(Boolean) : [];
  const ordered = showFeatured ? [...featured, ...projects.filter(project => !SHOWCASE_IDS.includes(project.id))] : projects;
  return (
    <CardShell as="section" className="projects-card my-2" aria-labelledby={showcase ? 'projects-title' : headingId}>
      {!showcase && <header className="card-title-row">
        <FolderGit2 size={20} aria-hidden="true" />
        <div><h3 id={headingId}>{t('projetos.heading')}</h3><p>{t('projetos.subtitle')}</p></div>
      </header>}
      {!preview && <div className="project-controls mb-5 grid gap-3">
        <label htmlFor={searchId} className="project-search flex items-center gap-2 rounded-lg border bg-[var(--panel-soft)] px-3 text-[var(--muted)]"><Search size={16} aria-hidden="true" /><span className="sr-only">{t('projetos.searchLabel')}</span><input id={searchId} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={t('projetos.searchPlaceholder')} className="min-w-0 flex-1 bg-transparent min-h-12 py-3 text-base text-[var(--ink)] outline-none placeholder:text-[var(--muted)]" /></label>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t('projetos.filterLabel')}>{['all', ...categories].map(value => <button key={value} type="button" aria-pressed={category === value} onClick={() => setCategory(value)} className="project-filter min-h-12 min-w-12 rounded-full border px-3 py-1.5 text-xs transition-colors">{t(`projetos.category.${value}`)}</button>)}</div>
        <p role="status" aria-live="polite" className="!m-0 text-xs text-[var(--muted)]">{t('projetos.results', { count: projects.length, total: perfil.projetos.length })}</p>
      </div>}
      <div id={showcase ? trackId : undefined} className={showcase ? 'projects-track' : 'projects-grid'}
        data-projects-track={showcase ? '' : undefined} role={showcase ? 'region' : undefined}
        aria-label={showcase ? t('projetos.trackLabel') : undefined} tabIndex={showcase && projects.length ? 0 : undefined}>
        {ordered.map(project => {
          const card = <ProjectCard project={project} onAskAstra={onAskAstra} compact={showcase} featured={featured.includes(project)} />;
          return <div key={project.id} data-project-slide={showcase ? '' : undefined} data-project-id={showcase ? project.id : undefined} className="flex min-w-0 [&>article]:w-full">
            {reveal ? <ScrollReveal className="w-full [&_article]:w-full">{card}</ScrollReveal> : card}
          </div>;
        })}
      </div>
      {showcase && <div className="projects-track-controls" role="group" aria-label={t('projetos.trackLabel')}>
        <div className="projects-scroll-progress" aria-hidden="true"><span /></div>
        <button type="button" data-project-step="-1" aria-controls={trackId} aria-label={t('projetos.previous')}><ChevronLeft size={18} aria-hidden="true" /></button>
        <button type="button" data-project-step="1" aria-controls={trackId} aria-label={t('projetos.next')}><ChevronRight size={18} aria-hidden="true" /></button>
      </div>}
      {!projects.length && <p className="py-8 text-center text-sm text-[var(--muted)]">{t('projetos.noResults')}</p>}
      {preview && <button type="button" onClick={onViewAll} className="project-action mt-5 w-full">{i18n.language.startsWith('en') ? 'View more projects' : 'Ver mais projetos'} →</button>}
    </CardShell>
  );
}
