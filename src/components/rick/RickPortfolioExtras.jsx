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
