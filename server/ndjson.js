export async function writeEvent(res, payload, signal) {
  if (signal?.aborted || res.destroyed) throw new DOMException('Client disconnected', 'AbortError');
  if (res.write(`${JSON.stringify(payload)}\n`) !== false) return;
  // Respect slow readers instead of buffering every generated token in memory.
  await new Promise((resolve, reject) => {
    const cleanup = () => { res.off('drain', ready); res.off('close', closed); signal?.removeEventListener('abort', closed); };
    const ready = () => { cleanup(); resolve(); };
    const closed = () => { cleanup(); reject(new DOMException('Client disconnected', 'AbortError')); };
    res.once('drain', ready);
    res.once('close', closed);
    signal?.addEventListener('abort', closed, { once: true });
    if (signal?.aborted || res.destroyed) closed();
  });
}
