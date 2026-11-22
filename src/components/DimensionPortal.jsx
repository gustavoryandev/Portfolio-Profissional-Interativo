import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';

export function PortalArt({ className = '' }) {
  return <span className={`portal-art ${className}`} aria-hidden="true"><img src="/rick-assets/portal.png" alt="" draggable="false" /></span>;
}

export default function DimensionPortal() {
  const { dimension, crossDimension, crossing } = useContext(ThemeContext);
  const { t } = useTranslation();
  const secret = dimension === 'corrupted';
  const label = t(secret ? 'rick.portal.return' : 'rick.portal.cross');
  return <>
    <button type="button" className="dimension-portal" onClick={crossDimension} aria-label={label}
      data-crossing={crossing} aria-pressed={secret} aria-disabled={crossing} title={label}>
      <PortalArt /><span className="portal-hint">{t(secret ? 'rick.portal.back' : 'rick.portal.enter')}</span>
    </button>
    <span className="sr-only" role="status" aria-live="polite">{t(secret ? 'rick.portal.secret' : 'rick.portal.original')}</span>
  </>;
}
