import DimensionalPortal from './portal/DimensionalPortal';
import './portal/profile-photo.css';

export default function PortraitPortal({ children, variant, effectsPaused }) {
  return <div className="portrait-portal-stage">
    <DimensionalPortal className="profile-portal" isOpen variant={variant} effectsPaused={effectsPaused} size="100%" aspectRatio={5/6}>
      {children}
    </DimensionalPortal>
  </div>;
}
