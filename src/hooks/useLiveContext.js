import { useCallback, useEffect, useRef, useState } from 'react';
import { refreshLiveContext } from '../services/api';
import { mergeLiveContext, needsRefresh } from '../services/liveContext';

export default function useLiveContext() {
  const [context, setContext] = useState({});
  const [refreshing, setRefreshing] = useState([]);
  const latest = useRef({});
  const busy = useRef(new Set());
  const controllers = useRef(new Set());

  useEffect(() => () => {
    controllers.current.forEach(controller => controller.abort());
  }, []);

  const absorb = useCallback(incoming => {
    latest.current = mergeLiveContext(latest.current, incoming);
    setContext(latest.current);
  }, []);

  const refresh = useCallback(async (sources, force = false) => {
    const selected = [...new Set(sources)].filter(source => !busy.current.has(source)
      && (force || needsRefresh(source, latest.current[source])));
    if (!selected.length) return;
    selected.forEach(source => busy.current.add(source));
    setRefreshing([...busy.current]);
    const controller = new AbortController();
    controllers.current.add(controller);
    let pending = selected;
    try {
      for (let attempt = 0; attempt < 3 && pending.length; attempt++) {
        if (controller.signal.aborted) return;
        try {
          const data = await refreshLiveContext(pending, controller.signal);
          if (controller.signal.aborted) return;
          absorb(data.liveContext);
        } catch {
          if (controller.signal.aborted) return;
          absorb(Object.fromEntries(pending.map(source => [source, { status: 'error', reason: 'unavailable' }])));
        }
        pending = pending.filter(source => needsRefresh(source, latest.current[source]));
        // Bounded automatic recovery, with an explicit retry button after exhaustion.
        if (pending.length && attempt < 2) {
          await new Promise(resolve => {
            const finish = () => { clearTimeout(timer); controller.signal.removeEventListener('abort', finish); resolve(); };
            const timer = setTimeout(finish, 1000 * (attempt + 1));
            controller.signal.addEventListener('abort', finish, { once: true });
          });
        }
      }
    } finally {
      selected.forEach(source => busy.current.delete(source));
      controllers.current.delete(controller);
      if (!controller.signal.aborted) setRefreshing([...busy.current]);
    }
  }, [absorb]);

  return { context, refreshing, absorb, refresh };
}
