import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeState';
import { yellowPortalIcon } from './rick/sceneAssets';
import { BEYOND_CURVE } from '../data/rickDimensions.js';
export { default as DimensionTransit } from './rick/BeyondCurveTransit';

export function PortalArt({ className = '' }) {
  return <span className={`portal-art ${className}`} aria-hidden="true"><img src="/rick-assets/portal.webp" alt="" draggable="false" decoding="async" /></span>;
}

function PortalButton({ gold, onClick, label, hint, crossing }) {
  return <button type="button" className={`dimension-portal${gold ? ' dimension-portal-gold' : ''}`} data-rick-motion onClick={onClick} aria-label={label}
      onPointerDown={event => {
        if (document.activeElement === event.currentTarget) event.currentTarget.setAttribute('data-quiet-focus', '');
      }}
      onBlur={event => event.currentTarget.removeAttribute('data-quiet-focus')}
      onKeyDown={event => event.currentTarget.removeAttribute('data-quiet-focus')}
      data-crossing={crossing} aria-busy={crossing} aria-disabled={crossing} title={label}>
      {gold
        ? <span className="portal-art" aria-hidden="true"><img src={yellowPortalIcon} alt="" decoding="async" draggable="false"
          onError={event => { event.currentTarget.hidden = true; }} /></span>
        : <PortalArt />}
      <span className="portal-hint">{hint}</span>
    </button>;
}

export default function DimensionPortal() {
  const { dimension, crossDimension, crossing, beyondUnlocked } = useContext(ThemeContext);
  const { t } = useTranslation();
  const citadel = dimension === 'corrupted';
  const beyond = dimension === BEYOND_CURVE;
  return <div className="dimension-portals">
    <PortalButton onClick={crossDimension} crossing={crossing}
      label={t(citadel || beyond ? 'rick.portal.return' : 'rick.portal.cross')}
      hint={t(citadel || beyond ? 'rick.portal.back' : 'rick.portal.enter')} />
    {beyondUnlocked && <PortalButton gold crossing={crossing}
      onClick={event => crossDimension(event, beyond ? 'corrupted' : BEYOND_CURVE)}
      label={t(beyond ? 'rick.beyond.citadel' : 'rick.beyond.enter')}
      hint={t(beyond ? 'rick.beyond.citadelShort' : 'rick.beyond.short')} />}
    <span className="sr-only" role="status">{t(beyond ? 'rick.beyond.name' : citadel ? 'rick.portal.secret' : 'rick.portal.original')}</span>
  </div>;
}
