import {
  Activity, ArrowUpRight, BarChart3, ChevronDown, ClipboardList, Cloud, Code2,
  Database, FileText, FolderOpen, Gamepad2, Grid2X2, List, LockKeyhole,
  Mail, MessageCircle, Monitor, Search, ShoppingCart, Terminal, Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './project-dossier.css';

const blueprintIcons = {
  activity: Activity, cart: ShoppingCart, chart: BarChart3, chat: MessageCircle,
  cloud: Cloud, code: Code2, file: FileText, game: Gamepad2, grid: Grid2X2,
  list: List, lock: LockKeyhole, mail: Mail, screen: Monitor, search: Search,
  storage: Database, terminal: Terminal, users: Users,
};
const fields = ['problem', 'contribution', 'decision', 'status', 'result'];

export function ProjectBlueprint({ nodes }) {
  const { t, i18n } = useTranslation();
  const en = i18n.language.startsWith('en');
  return <figure className="project-blueprint">
    <figcaption>{t('rick.dossier.illustration')}</figcaption>
    <ol>
      {nodes.map(([type, pt, english]) => {
        const Icon = blueprintIcons[type];
        return <li key={type}><Icon aria-hidden="true" /><span>{en ? english : pt}</span></li>;
      })}
    </ol>
  </figure>;
}

export function ProjectDossier({ dossier, citadel, open, onToggle }) {
  const { t, i18n } = useTranslation();
  const language = i18n.language.startsWith('en') ? 'en' : 'pt';
  const Icon = citadel ? ClipboardList : FolderOpen;
  return <details className="dimension-project-details" open={open} onToggle={onToggle}>
    <summary>
      <Icon size={16} aria-hidden="true" />
      <span>{t(citadel ? 'rick.dossier.report' : 'rick.dossier.archive')}</span>
      <ChevronDown size={16} className="dossier-chevron" aria-hidden="true" />
    </summary>
    <div className="dossier-sheet" data-rick-motion>
      <dl>
        {fields.filter(field => dossier[field]).map(field => <div key={field}>
          <dt>{t(`rick.dossier.${field}`)}</dt>
          <dd>
            {dossier[field][language]}
            {field === 'contribution' && dossier.contributionSource &&
              <a href={dossier.contributionSource} target="_blank" rel="noopener noreferrer">
                {t('rick.dossier.evidence')} <ArrowUpRight size={12} aria-hidden="true" />
              </a>}
          </dd>
        </div>)}
      </dl>
    </div>
  </details>;
}
