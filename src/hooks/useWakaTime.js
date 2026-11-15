import { useEffect, useState } from 'react';
import { readWakaTime } from '../services/api';

export default function useWakaTime(range) {
  const [entries, setEntries] = useState({});
  const [retry, setRetry] = useState(0);
  const key = range || 'activity';

  useEffect(() => {
    const controller = new AbortController();
    let busy = false;
    let watch = true;
    const refresh = async () => {
      if (!watch || busy || controller.signal.aborted) return;
      busy = true;
      let data;
      try {
        data = await readWakaTime(range, controller.signal);
      } catch {
        data = { status: 'error', reason: 'unavailable' };
      } finally {
        busy = false;
      }
      if (controller.signal.aborted) return;
      watch = data.status !== 'not_configured' && Boolean(range || data.status === 'error' || data.today || data.codingNow);
      setEntries(previous => {
        const cached = previous[key];
        const entry = data.status === 'error' && cached?.status === 'ok'
          ? { ...cached, stale: true, reason: data.reason } : data;
        return { ...previous, [key]: entry };
      });
    };
    const refreshVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    void refresh();
    const timer = setInterval(refreshVisible, 60_000);
    document.addEventListener('visibilitychange', refreshVisible);
    return () => {
      controller.abort();
      clearInterval(timer);
      document.removeEventListener('visibilitychange', refreshVisible);
    };
  }, [key, range, retry]);

  return [entries[key], () => setRetry(previous => previous + 1)];
}
