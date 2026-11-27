import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';
import AstraAvatar from './AstraAvatar';
import { useAssistantPersona } from '../context/AssistantAppearanceContext';
import AssistantPortrait from './rick/AssistantPortrait';
import { BEYOND_CURVE } from '../data/rickDimensions.js';

export default function DimensionAstraSignal({ performance }) {
  const { theme, dimension, eggMessage } = useContext(ThemeContext) ?? {};
  const { t } = useTranslation();
  const persona = useAssistantPersona();
  const signal = dimension === BEYOND_CURVE ? 'rick.beyond.signal' : dimension === 'corrupted' ? 'rick.citadelSignal' : 'rick.garageSignal';
  if (theme !== 'rick-morty') return null;
  return <div className="dimension-astra-signal" role="status" aria-live="polite">
    {performance && persona ? <AssistantPortrait key={persona.id} persona={persona} {...performance} /> : <AstraAvatar width="36" height="36" />}
    <p><strong>{persona?.name ?? 'Astra'}</strong><span>{t(eggMessage || signal)}</span></p>
  </div>;
}
