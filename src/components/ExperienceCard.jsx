import { BriefcaseBusiness } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import perfil from '../data/perfil.json';
import { CardShell, CardHeader } from './ui/CardShell';

export default function ExperienceCard() {
  const { t } = useTranslation();

  return (
    <CardShell size="md">
      <CardHeader icon={BriefcaseBusiness} title={t('cards.experiencia.titulo')} />
      <ol className="relative ml-2 m-0 list-none border-l border-brand-500/40 p-0">
        {perfil.experiencias.map((experience) => (
          <li key={experience.id} className="relative pb-5 pl-6 last:pb-0">
            <span aria-hidden="true" className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-accent bg-panel" />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-ink">{experience.empresa}</h4>
                <p className="mt-1 text-xs tracking-wide text-muted">{t(experience.cargoI18n)}</p>
                {experience.descricaoI18n && (
                  <p className="mt-2 text-xs text-muted">{t(experience.descricaoI18n)}</p>
                )}
              </div>
              <span className="chip chip--accent shrink-0">{experience.periodo}</span>
            </div>
          </li>
        ))}
      </ol>
    </CardShell>
  );
}
