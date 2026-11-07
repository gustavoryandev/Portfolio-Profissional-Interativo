// NDJSON tolerates arbitrary network chunk boundaries, including split UTF-8.
export async function requestChatStream(payload, { signal, onEvent = () => {} } = {}) {
  const response = await fetch('/api/chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/x-ndjson, application/json' },
    body: JSON.stringify({ ...payload, stream: true }), signal,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Chat request failed (${response.status})`);
  }
  // Deterministic replies and validation branches can still return ordinary JSON.
  if (response.headers.get('content-type')?.includes('application/json')) return response.json();
  if (!response.body || !response.headers.get('content-type')?.includes('application/x-ndjson')) throw new Error('Invalid chat stream');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';
  let done = false;
  const result = {};
  function consume(line) {
    if (!line.trim() || done) return;
    const event = JSON.parse(line);
    if (event.type === 'error') throw new Error(event.error || 'Chat stream failed');
    if (event.type === 'meta') Object.assign(result, { model: event.model, chatContext: event.chatContext, liveContext: event.liveContext });
    if (event.type === 'context') result.liveContext = event.liveContext;
    if (event.type === 'delta') {
      if (typeof event.text !== 'string') throw new Error('Invalid chat delta');
      text += event.text;
    }
    if (event.type === 'done') done = true;
    onEvent(event);
  }
  try {
    while (!done) {
      signal?.throwIfAborted();
      const chunk = await reader.read();
      buffer += decoder.decode(chunk.value, { stream: !chunk.done });
      if (buffer.length > 1024 * 1024) throw new Error('Chat frame too large');
      let newline;
      while ((newline = buffer.indexOf('\n')) !== -1) {
        consume(buffer.slice(0, newline));
        buffer = buffer.slice(newline + 1);
      }
      if (chunk.done) { consume(buffer); break; }
    }
    if (!done) throw new Error('Chat stream interrupted');
    if (!text.trim()) throw new Error('Empty chat response');
    return { ...result, response: text };
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

let models = null;
let expires = 0;
let pending = null;
export function warmModelCatalog() {
  if (Date.now() < expires) return Promise.resolve(models);
  if (pending) return pending;
  pending = fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'models' }), signal: AbortSignal.timeout(6000) })
    .then(async response => {
      if (!response.ok) throw new Error('Catalog unavailable');
      const data = await response.json();
      if (!Array.isArray(data.models) || !data.models.every(model => typeof model === 'string')) throw new Error('Invalid catalog');
      models = data.models;
      expires = Date.now() + 3600000;
      return models;
    }).catch(() => { expires = Date.now() + 60000; return models; })
    .finally(() => { pending = null; });
  return pending;
}
