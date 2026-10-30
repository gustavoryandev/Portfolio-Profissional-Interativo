import { useId } from 'react';
import { FolderGit2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import perfil from '../data/perfil.json';
import ProjectCard from './ProjectCard';

export default function ProjectsCard() {
  const { t } = useTranslation();
  const headingId = useId();
  return (
    <section className="portfolio-card projects-card my-2 w-full" aria-labelledby={headingId}>
      <header className="card-title-row">
        <FolderGit2 size={20} aria-hidden="true" />
        <div><h3 id={headingId}>{t('projetos.heading')}</h3><p>{t('projetos.subtitle')}</p></div>
      </header>
      <div className="projects-grid">
        {perfil.projetos.slice(0, 4).map(project => <ProjectCard key={project.id} project={project} />)}
      </div>
    </section>
  );
}
