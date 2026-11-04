import { useId, useState } from 'react';
import { ArrowUpRight, ImageOff } from 'lucide-react';
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

export default function ProjectCard({ project }) {
  const { t, i18n } = useTranslation();
  const titleId = useId();
  const title = projectContent(project, 'titulo', i18n.language, t);
  const description = projectContent(project, 'descricao', i18n.language, t);
  return (
    <article className="project-tile flex min-w-0 flex-col overflow-hidden" aria-labelledby={titleId}>
      <ProjectPreview key={project.image?.src || 'empty'} image={project.image} title={title} />
      <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
        {project.tipo && <span className="w-fit rounded-full border border-[var(--line)] bg-[var(--panel-soft)] px-2.5 py-1 text-[10px] font-medium text-[var(--accent)]">{t(`projetos.kind.${project.tipo}`)}</span>}
        <div><h4 id={titleId}>{title}</h4>{description && <p className="mt-3">{description}</p>}</div>
        <ul className="flex list-none flex-wrap gap-2 p-0" aria-label={t('projetos.technologies')}>
          {(project.techs || []).map(name => <li key={name}><TechnologyLink name={name} /></li>)}
        </ul>
        <div className="mt-auto border-t border-[var(--line)] pt-5">
          {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
            className="project-action" aria-label={t('projetos.openProject', { title })}>
            {t('projetos.viewProject')}<ArrowUpRight size={17} aria-hidden="true" />
          </a>}
          {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="project-action" aria-label={t('projetos.openDemo', { title })}>{t('projetos.viewDemo')}<ArrowUpRight size={17} aria-hidden="true" /></a>}
        </div>
      </div>
    </article>
  );
}
