import { Code2, ArrowUpRight, FolderGit2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import perfil from '../data/perfil.json';

export default function ProjectsCard() {
  const { t, i18n } = useTranslation();
  const en = i18n.language.startsWith('en');
  const displayProjects = perfil.projetos.slice(0, 4);

  return (
    <section className="portfolio-card projects-card my-2 w-full">
      <header className="card-title-row">
        <FolderGit2 size={20} aria-hidden="true" />
        <div>
          <h3>{en ? 'Featured Projects' : 'Projetos em Destaque'}</h3>
          <p>{en ? 'Selected portfolio projects' : 'Projetos selecionados do portfólio'}</p>
        </div>
      </header>
      <div className="card-grid card-grid-wide">
        {displayProjects.map((project, index) => {
          const title = project.chavesI18n ? t(project.chavesI18n.titulo) : project.id;
          const description = project.chavesI18n ? t(project.chavesI18n.descricao) : '';
          return (
            <a key={project.id || index} href={project.githubUrl} target="_blank" rel="noreferrer" className="project-tile group">
              <div className="flex min-w-0 items-start gap-3">
                <span className="project-symbol"><Code2 size={22} aria-hidden="true" /></span>
                <div className="min-w-0">
                  <h4>{title}</h4>
                  {description && <p>{description}</p>}
                </div>
              </div>
              <div className="project-tags">
                {(project.techs || []).map(tech => <span key={tech}>{tech}</span>)}
              </div>
              <span className="project-action">{en ? 'View project' : 'Ver projeto'}<ArrowUpRight size={14} aria-hidden="true" /></span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
