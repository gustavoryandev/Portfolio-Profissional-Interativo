import { useAssistantPersona } from '../context/AssistantAppearanceContext';
import { useTranslation } from 'react-i18next';

export default function FullAstraCardLink({ onOpen }) {
  const { t, i18n } = useTranslation();
  const persona = useAssistantPersona('full');
  return <a className="chip chip--accent self-start" href="/chat" onClick={event => {
    if (!onOpen || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onOpen();
  }}>{persona ? (i18n.language.startsWith('en') ? `Open ${persona.name}` : `Abrir ${persona.name}`) : t('chat.surface.viewFull')}</a>;
}
