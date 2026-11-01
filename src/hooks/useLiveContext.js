import { useCallback, useEffect, useRef, useState } from 'react';
import { refreshLiveContext } from '../services/api';
import { mergeLiveContext, needsRefresh } from '../services/liveContext';

// Intervalo da atualização automática dos cards visíveis. O servidor ainda limita a frequência por fonte.
const POLL_MS = 60 * 1000;

export default function useLiveContext() {
  const [context, setContext] = useState({});
  const [refreshing, setRefreshing] = useState([]);
  const latest = useRef({});
  const busy = useRef(new Set());     // fontes em atualização (visível ou silenciosa)
  const visible = useRef(new Set());  // fontes cujo carregamento aparece na interface
  const watched = useRef(new Set());  // fontes com card na conversa: atualizadas em segundo plano
  const controllers = useRef(new Set());

  useEffect(() => () => {
    controllers.current.forEach(controller => controller.abort());
  }, []);

  const absorb = useCallback(incoming => {
    latest.current = mergeLiveContext(latest.current, incoming);
    setContext(latest.current);
  }, []);

  const watch = useCallback(sources => {
    sources.forEach(source => watched.current.add(source));
  }, []);

  // force: ignora o filtro local de "precisa atualizar". silent: sem aviso de carregamento.
  // serverForce: pede ao servidor para ignorar o cache (respeitando o intervalo mínimo por fonte).
  const refresh = useCallback(async (sources, force = false, { silent = false, serverForce = false } = {}) => {
    const selected = [...new Set(sources)].filter(source => !busy.current.has(source)
      && (force || needsRefresh(source, latest.current[source])));
    if (!selected.length) return;
    selected.forEach(source => {
      busy.current.add(source);
      if (!silent) visible.current.add(source);
    });
    if (!silent) setRefreshing([...visible.current]);
    const controller = new AbortController();
    controllers.current.add(controller);
    let pending = selected;
    try {
      for (let attempt = 0; attempt < 3 && pending.length; attempt++) {
        if (controller.signal.aborted) return;
        try {
          const data = await refreshLiveContext(pending, controller.signal, serverForce && attempt === 0);
          if (controller.signal.aborted) return;
          absorb(data.liveContext);
        } catch {
          if (controller.signal.aborted) return;
          // Falha de rede numa atualização em segundo plano não deve marcar como falho um dado que está bom
          if (!silent) absorb(Object.fromEntries(pending.map(source => [source, { status: 'error', reason: 'unavailable' }])));
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
      selected.forEach(source => {
        busy.current.delete(source);
        visible.current.delete(source);
      });
      controllers.current.delete(controller);
      if (!controller.signal.aborted) setRefreshing([...visible.current]);
    }
  }, [absorb]);

  // Atualização automática: a cada minuto e ao voltar para a aba, só enquanto ela estiver visível
  useEffect(() => {
    const poll = () => {
      if (document.visibilityState === 'hidden' || !watched.current.size) return;
      void refresh([...watched.current], true, { silent: true, serverForce: true });
    };
    const timer = setInterval(poll, POLL_MS);
    document.addEventListener('visibilitychange', poll);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', poll);
    };
  }, [refresh]);

  return { context, refreshing, absorb, refresh, watch };
}