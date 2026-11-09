import { useTranslation } from 'react-i18next';

export default function FullAstraCardLink({ onOpen }) {
  const { t } = useTranslation();
  return <a className="chip chip--accent self-start" href="/chat" onClick={event => {
    if (!onOpen || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onOpen();
  }}>{t('chat.surface.viewFull')}</a>;
}
