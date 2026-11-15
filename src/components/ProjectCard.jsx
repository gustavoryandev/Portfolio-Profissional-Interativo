import { useId, useState } from 'react';
import { ArrowUpRight, ImageOff, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import TechnologyLink from './TechnologyLink';
import { projectContent } from '../data/projectContent';

function ProjectPreview({ image, title }) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  return <div className="project-preview aspect-video overflow-hidden border-b border-[var(--line)]">
    {image?.src && !failed ? (
      <img src={image.src} alt={image.altKey ? t(image.altKey) : t('projetos.previewAlt', { title })}
        loading="lazy" decoding="async" width="960" height="540"
        className="h-full w-full object-contain" onError={() => setFailed(true)} />
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
  const [showAll, setShowAll] = useState(false);
  const tech = project.techs || [];
  const canExpand = compact && tech.length > 3;
  const title = projectContent(project, 'titulo', i18n.language, t);
  const description = projectContent(project, 'descricao', i18n.language, t);
  return (
    <article className="project-tile glass-panel flex min-w-0 flex-col overflow-hidden" aria-labelledby={titleId}>
      <ProjectPreview key={project.image?.src || 'empty'} image={project.image} title={title} />
      <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
        {(project.tipo || featured) && <div className="project-labels">
          {project.tipo && <span className="w-fit rounded-full border border-[var(--line)] bg-[var(--panel-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]">{t(`projetos.kind.${project.tipo}`)}</span>}
          {featured && <span className="project-featured">{t('projetos.featured')}</span>}
        </div>}
        <div><h4 id={titleId}>{title}</h4>{description && <p className="mt-3">{description}</p>}</div>
        <div>
          {canExpand && <button type="button" className="project-tech-toggle" aria-expanded={showAll} aria-controls={techId}
            aria-label={t('projetos.toggleTechLabel', { action: t(showAll ? 'projetos.showLess' : 'projetos.showAll'), title })}
            onClick={() => setShowAll(value => !value)}>{t(showAll ? 'projetos.showLess' : 'projetos.showAll')}</button>}
          <ul id={techId} className="flex list-none flex-wrap gap-2 p-0" aria-label={t('projetos.technologies')}>
            {(canExpand && !showAll ? tech.slice(0, 3) : tech).map(name => <li key={name}><TechnologyLink name={name} /></li>)}
          </ul>
        </div>
        <div className="mt-auto border-t border-[var(--line)] pt-5">
          {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
            className="project-action" aria-label={t('projetos.openProject', { title })}>
            {t('projetos.viewProject')}<ArrowUpRight size={17} aria-hidden="true" />
          </a>}
          {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="project-action" aria-label={t('projetos.openDemo', { title })}>{t('projetos.viewDemo')}<ArrowUpRight size={17} aria-hidden="true" /></a>}
          {onAskAstra && <button type="button" className="project-ask-astra" aria-haspopup="dialog"
            aria-label={t('projetos.askAstraLabel', { title })} onClick={event => onAskAstra(event, t('projetos.astraPrompt', { title }))}>
            <Sparkles size={16} aria-hidden="true" />{t('projetos.askAstra')}
          </button>}
        </div>
      </div>
    </article>
  );
}
