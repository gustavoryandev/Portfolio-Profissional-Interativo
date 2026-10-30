import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { technologyDocs } from '../data/technologyDocs';

export default function TechnologyLink({ name }) {
  const { t } = useTranslation();
  const href = technologyDocs[name];
  // Unknown future labels must never fall back to a repository URL.
  if (!href) return <span className="project-tech">{name}</span>;
  return <a className="project-tech" href={href} target="_blank" rel="noopener noreferrer"
    aria-label={t('projetos.documentation', { name })}>
    {name}<ArrowUpRight size={13} aria-hidden="true" />
  </a>;
}
