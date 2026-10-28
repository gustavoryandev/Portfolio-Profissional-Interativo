import { BriefcaseBusiness } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import perfil from '../data/perfil.json';

export default function ExperienceCard() {
  // Inicializando o hook de tradução
  const { t } = useTranslation();

  return (
    <article className="portfolio-card card-surface w-full max-w-lg p-5">
      <header className="mb-5 flex items-center gap-3">
        <BriefcaseBusiness className="text-sky-400" size={20} />
        <h3 className="card-heading">{t('cards.experiencia.titulo')}</h3>
      </header>
      <ol className="relative ml-2 border-l border-sky-500/40">
        {perfil.experiencias.map((experience) => (
          <li key={experience.id} className="relative pb-5 pl-6 last:pb-0">
            <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full border-2 border-sky-400 bg-[var(--surface)]" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold dark:text-white text-zinc-900">
                  {experience.empresa}
                </h4>
                {/* O segredo está aqui: passando a chave para a função t() */}
                <p className="mt-1 text-xs tracking-wide text-[var(--muted)] dark:text-zinc-400">
                  {t(experience.cargoI18n)}
                </p>
                {/* Caso queira exibir a descrição também: */}
                {experience.descricaoI18n && (
                  <p className="mt-2 text-xs text-[var(--muted)] dark:text-zinc-400">
                    {t(experience.descricaoI18n)}
                  </p>
                )}
              </div>
              <span className="shrink-0 rounded-full border border-sky-500/40 px-2 py-0.5 text-[10px] tracking-wider text-sky-500">
                {experience.periodo}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}
