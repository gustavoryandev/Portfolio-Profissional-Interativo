import { ExternalLink, FolderGit2 } from 'lucide-react';
import perfil from '../data/perfil.json';

export default function ProjectsCard() {
  return (
    <article className="card-surface w-full max-w-lg p-5">
      <header className="mb-4 flex items-center gap-3">
        <FolderGit2 className="text-amber-400" size={20} />
        <h3 className="card-heading">PROJECTS / {perfil.projetos.length}</h3>
      </header>
      <div className="space-y-3">
        {perfil.projetos.map((project) => (
          <a
            key={project.id}
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="group block rounded-lg border border-zinc-800 bg-[var(--surface)] p-3 transition hover:border-amber-500/70"
          >
            <div className="flex items-center justify-between gap-3">
              <strong className="text-sm text-white">{project.id}</strong>
              <ExternalLink size={14} className="text-zinc-500 transition group-hover:text-amber-400" />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {project.techs.map((tech) => <span key={tech} className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] tracking-wide text-zinc-400">{tech}</span>)}
            </div>
          </a>
        ))}
      </div>
    </article>
  );
}
