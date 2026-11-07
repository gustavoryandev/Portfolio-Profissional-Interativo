// Only the active reply subscribes. Batch small deltas to avoid token-rate renders.
export function createStreamBuffer() {
  let text = '';
  let model;
  let snapshot = { text, model };
  let timer;
  const listeners = new Set();
  const flush = () => {
    clearTimeout(timer); timer = null;
    snapshot = { text, model };
    listeners.forEach(listener => listener());
  };
  return {
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    getSnapshot: () => snapshot,
    getText: () => text,
    push(event) {
      if (event.type === 'delta') text += event.text;
      if (event.type === 'meta') model = event.model;
      if (!timer) timer = setTimeout(flush, 40);
    },
    dispose() { clearTimeout(timer); listeners.clear(); },
  };
}
