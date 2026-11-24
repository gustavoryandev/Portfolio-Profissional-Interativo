import { useContext, useId, useState } from 'react';
import { BookOpen, ChevronDown, CircuitBoard, Clapperboard, Database, IdCard, Terminal, Tv, Wrench } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../../context/ThemeState';
import { discoveries } from '../../hooks/useRickExploration';
import { RICK_THEME_TRACK } from '../../services/rickThemeMusic';
import { resumeUrl } from '../../data/resume';
import { projectContent } from '../../data/projectContent';
import perfil from '../../data/perfil.json';
import SceneBackdrop from './SceneBackdrop';
import { useReducedSceneMotion } from './sceneAssets';
import './rick-portfolio-extras.css';

function Fold({ icon: Icon, label, children, className = '', ...props }) {
  return <details className={`rick-fold ${className}`} {...props}>
    <summary>{Icon && <Icon size={16} aria-hidden="true" />}<span>{label}</span><ChevronDown className="rick-fold-arrow" size={15} aria-hidden="true" /></summary>
    <div className="rick-fold-body" data-rick-motion>{children}</div>
  </details>;
}

export function RickObjects({ onSectionLink }) {
  const { t } = useTranslation();
  return <Fold icon={Wrench} label={t('rick.extras.inspect')} className="rick-objects">
    <Fold icon={Database} label={t('rick.extras.objects.migration')}>
      <p>{t('rick.extras.objects.migrationInfo')} <a href="/?project=car-rental#projetos" onClick={onSectionLink}>ROTA</a></p>
    </Fold>
    <Fold icon={Terminal} label={t('rick.extras.objects.runner')}>
      <p>{t('rick.extras.objects.runnerInfo')} <a href="#laboratorio" onClick={onSectionLink}>{t('rick.extras.objects.lab')}</a></p>
    </Fold>
  </Fold>;
}

export function CitadelCredential() {
  const { t, i18n } = useTranslation();
  return <Fold icon={IdCard} label={t('rick.extras.credential')} className="citadel-credential">
    <strong className="citadel-credential-name">{perfil.nome}</strong>
    <p>{t('rick.extras.credentialFocus')}</p>
    <div className="rick-extra-links">
      <a href={`https://github.com/${perfil.github}`} target="_blank" rel="noopener noreferrer">GitHub</a>
      <a href={perfil.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
      <a href={resumeUrl(i18n.language)} download>{t('navbar.baixarCv')}</a>
    </div>
  </Fold>;
}

const demonstrationIds = ['portfolio', 'geosolar'];
const demonstrations = demonstrationIds.map(id => perfil.projetos.find(project => project.id === id && project.image?.src)).filter(Boolean);

export function InterdimensionalTV({ onSectionLink }) {
  const { t, i18n } = useTranslation();
  const selectId = useId();
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState(demonstrations[0]?.id);
  const selected = demonstrations.find(project => project.id === channel) ?? demonstrations[0];
  if (!selected) return null;
  const title = projectContent(selected, 'titulo', i18n.language, t);
  return <Fold icon={Tv} label={t('rick.extras.tv.title')} className="rick-tv" onToggle={event => setOpen(event.currentTarget.open)}>
    <div className="rick-tv-controls">
      <label htmlFor={selectId}>{t('rick.extras.tv.channel')}</label>
      <select id={selectId} value={channel} onChange={event => setChannel(event.currentTarget.value)}>
        {demonstrations.map(project => <option value={project.id} key={project.id}>{projectContent(project, 'titulo', i18n.language, t)}</option>)}
      </select>
    </div>
    {open && <figure key={channel} className="rick-tv-screen" data-rick-motion>
      <img src={selected.image.src} alt={selected.image.altKey ? t(selected.image.altKey) : t('projetos.previewAlt', { title })} decoding="async" />
      <figcaption>{t('rick.extras.tv.capture', { title })}</figcaption>
    </figure>}
    <div className="rick-extra-links">
      <a href={`/?project=${selected.id}#projetos`} onClick={onSectionLink}>{t('rick.extras.tv.project')}</a>
      {selected.demoUrl && <a href={selected.demoUrl}>{t('projetos.viewDemo')}</a>}
      {selected.githubUrl && <a href={selected.githubUrl} target="_blank" rel="noopener noreferrer">{t('projetos.viewProject')}</a>}
    </div>
  </Fold>;
}
