import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';
import AstraAvatar from './AstraAvatar';
import { useAssistantPersona } from '../context/AssistantAppearanceContext';
import AssistantPortrait from './rick/AssistantPortrait';

export default function DimensionAstraSignal({ performance }) {
  const { theme, dimension, eggMessage } = useContext(ThemeContext) ?? {};
  const { t } = useTranslation();
  const persona = useAssistantPersona();
  if (theme !== 'rick-morty') return null;
  const fallback = t(dimension === 'corrupted' ? 'rick.citadelSignal' : 'rick.garageSignal');
  const signal = persona ? t(`rick.${persona.id}.signal`, { defaultValue: fallback }) : fallback;
  const message = eggMessage ? t(eggMessage) : !performance && persona
    ? t(`rick.${persona.id}.portfolioSignal`, { defaultValue: signal }) : signal;
  return <div className="dimension-astra-signal" role="status" aria-live="polite">
    {performance && persona ? <AssistantPortrait key={persona.id} persona={persona} {...performance} /> : <AstraAvatar width="36" height="36" />}
    <p><strong>{persona?.name ?? 'Astra'}</strong><span>{message}</span></p>
  </div>;
}
