import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';
import AstraAvatar from './AstraAvatar';
import { useAssistantPersona } from '../context/AssistantAppearanceContext';

export default function DimensionAstraSignal() {
  const { theme, dimension, eggMessage } = useContext(ThemeContext) ?? {};
  const { t } = useTranslation();
  const persona = useAssistantPersona();
  const corrupted = dimension === 'corrupted';
  if (theme !== 'rick-morty') return null;
  return <div className="dimension-astra-signal" role="status" aria-live="polite">
    <AstraAvatar width="36" height="36" />
    <p><strong>{persona?.name ?? 'Astra'}</strong><span>{t(eggMessage || (corrupted ? 'rick.citadelSignal' : 'rick.garageSignal'))}</span></p>
  </div>;
}
