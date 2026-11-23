import './ProjectCard.css';
import { useAssistantPersona } from '../context/AssistantAppearanceContext';
import { useContext, useId, useRef, useState } from 'react';
import { ArrowUpRight, Expand, ImageOff, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import TechnologyLink from './TechnologyLink';
import { projectContent } from '../data/projectContent';
import { ThemeContext } from '../context/ThemeContext';
import { ProjectMorty } from './RickDimensionExperience';
import ProjectImageModal from './ProjectImageModal';

function ProjectPreview({ image, title }) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  const [opened, setOpened] = useState(false);
  const trigger = useRef(null);
  const alt = image?.altKey ? t(image.altKey) : t('projetos.previewAlt', { title });
  return <div className="project-preview aspect-video overflow-hidden border-b border-[var(--line)]" data-has-image={Boolean(image?.src && !failed)}>
    {image?.src && !failed ? (
      <>
      <button ref={trigger} type="button" className="project-preview-trigger" aria-haspopup="dialog"
        aria-label={t('projetos.enlargePreview', { title })} onClick={() => setOpened(true)}>
      <img src={image.src} alt={alt}
        loading="lazy" decoding="async" width="960" height="540"
        className="h-full w-full object-cover" style={{ objectPosition: image.position ?? 'center' }} onError={() => setFailed(true)} />
      <span className="project-preview-expand" aria-hidden="true"><Expand size={18} /></span>
      </button>
      {opened && <ProjectImageModal image={image} title={title} alt={alt} trigger={trigger} onClose={() => setOpened(false)} />}
      </>
    ) : (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-5 text-center text-[var(--muted)]">
        <span className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
          <ImageOff size={28} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <span className="text-xs font-medium">{t('projetos.previewUnavailable')}</span>
      </div>
    )}
  </div>;
}

export default function ProjectCard({ project, onAskAstra, compact, featured }) {
  const { t, i18n } = useTranslation();
  const titleId = useId();
  const techId = useId();
  const descriptionId = useId();
  const persona = useAssistantPersona('compact');
  const { theme, dimension } = useContext(ThemeContext) ?? {};
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const tech = project.techs || [];
  const canExpand = compact && tech.length > 3;
  const title = projectContent(project, 'titulo', i18n.language, t);
  const description = projectContent(project, 'descricao', i18n.language, t);
  return (
    <article className="project-tile glass-panel flex min-w-0 flex-col overflow-hidden" aria-labelledby={titleId} data-details-open={descriptionOpen} data-dimension-label={theme === 'rick-morty' ? t(dimension === 'corrupted' ? 'rick.archive' : 'rick.research') : undefined}>
      {theme === 'rick-morty' && <ProjectMorty expanded={detailsOpen || showAll} />}
      <ProjectPreview key={project.image?.src || 'empty'} image={project.image} title={title} />
      <div className="project-card-body flex flex-1 flex-col gap-5 p-5 sm:p-6">
        <div className="project-card-details">
        {(project.tipo || featured) && <div className="project-labels">
          {project.tipo && <span className="w-fit rounded-full border border-[var(--line)] bg-[var(--panel-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]">{t(`projetos.kind.${project.tipo}`)}</span>}
          {featured && <span className="project-featured">{t('projetos.featured')}</span>}
        </div>}
        <div className="project-card-copy"><h4 id={titleId}>{title}</h4>{description && <>
          <p id={descriptionId} className="mt-3" data-summary={compact && !descriptionOpen ? 'true' : undefined}>{description}</p>
          {compact && <button type="button" className="project-description-toggle" aria-expanded={descriptionOpen} aria-controls={`${descriptionId} ${techId}`}
            aria-label={t(descriptionOpen ? 'projetos.collapseDetailsLabel' : 'projetos.expandDetailsLabel', { title })}
            onClick={() => setDescriptionOpen(value => !value)}>{t(descriptionOpen ? 'projetos.collapseDetails' : 'projetos.expandDetails')}</button>}
        </>}</div>
        <div className="project-card-technologies">
          <ul id={techId} className="flex list-none flex-wrap gap-2 p-0" aria-label={t('projetos.technologies')}>
            {(canExpand && !showAll ? tech.slice(0, 3) : tech).map(name => <li key={name}><TechnologyLink name={name} /></li>)}
          </ul>
          {canExpand && <button type="button" className="project-tech-toggle" aria-expanded={showAll} aria-controls={techId}
            aria-label={t('projetos.toggleTechLabel', { action: t(showAll ? 'projetos.showLess' : 'projetos.showAll'), title })}
            onClick={() => setShowAll(value => !value)}>{t(showAll ? 'projetos.showLess' : 'projetos.showAll')}</button>}
        </div>
        {theme === 'rick-morty' && <details className="dimension-project-details" open={detailsOpen} onToggle={event => setDetailsOpen(event.currentTarget.open)}>
          <summary>{i18n.language.startsWith('en') ? 'Project details' : 'Detalhes do projeto'}</summary>
          <dl><dt>{i18n.language.startsWith('en') ? 'Technologies' : 'Tecnologias'}</dt><dd>{tech.join(' · ')}</dd><dt>{i18n.language.startsWith('en') ? 'Source' : 'Código-fonte'}</dt><dd>{project.githubUrl ? <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">GitHub</a> : (i18n.language.startsWith('en') ? 'Available in the project links' : 'Disponível nos links do projeto')}</dd></dl>
        </details>}
        </div>
        <div className="project-card-actions mt-auto border-t border-[var(--line)] pt-5">
          {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
            className="project-action" aria-label={t('projetos.openProject', { title })}>
            {t('projetos.viewProject')}<ArrowUpRight size={17} aria-hidden="true" />
          </a>}
          {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="project-action" aria-label={t('projetos.openDemo', { title })}>{t('projetos.viewDemo')}<ArrowUpRight size={17} aria-hidden="true" /></a>}
          {onAskAstra && <button type="button" className="project-ask-astra" aria-haspopup="dialog"
            aria-label={persona ? (i18n.language.startsWith('en') ? `Ask ${persona.name} about ${title}` : `Perguntar ao ${persona.name} sobre ${title}`) : t('projetos.askAstraLabel', { title })} onClick={event => onAskAstra(event, t('projetos.astraPrompt', { title }))}>
            <Sparkles size={16} aria-hidden="true" />{persona ? (i18n.language.startsWith('en') ? `Ask ${persona.name}` : `Perguntar ao ${persona.name}`) : t('projetos.askAstra')}
          </button>}
        </div>
      </div>
    </article>
  );
}
