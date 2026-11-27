import DimensionalPortal from './portal/DimensionalPortal';
import useMobileLayout from '../../hooks/useMobileLayout';
import { BEYOND_CURVE } from '../../data/rickDimensions';
import './portal/profile-photo.css';

export default function PortraitPortal({ children, variant, effectsPaused }) {
  const mobile = useMobileLayout();
  return <div className="portrait-portal-stage">
    <DimensionalPortal className="profile-portal" isOpen variant={variant} effectsPaused={effectsPaused}
      quality={mobile && variant === BEYOND_CURVE ? 'low' : 'auto'}
      glowIntensity={variant === BEYOND_CURVE ? .8 : undefined} size="100%" aspectRatio={5/6}>
      {children}
    </DimensionalPortal>
  </div>;
}
