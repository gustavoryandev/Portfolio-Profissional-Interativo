import { useTranslation } from 'react-i18next';
import { liveDataNoticeKey } from '../services/liveContext.js';

export default function LiveDataNotice({ data, pending, onRetry, lang = 'pt' }) {
  const { t } = useTranslation(undefined, { lng: lang, keyPrefix: 'chat.liveData' });
  const unavailable = !data || data.status !== 'ok';
  if (!pending && !unavailable && !data.stale) return null;
  const status = liveDataNoticeKey(data);
  const text = t(pending ? 'loading' : unavailable ? status : 'stale');
  return <div className="live-data-notice" role="status">
    <span>{text}</span>
    {!pending && onRetry && !['notConfigured', 'unauthorized', 'rateLimited', 'empty'].includes(status)
      && <button type="button" onClick={onRetry}>{t('retry')}</button>}
  </div>;
}
