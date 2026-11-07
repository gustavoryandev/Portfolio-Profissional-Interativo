// Bounded waiting without leaving a timeout alive after fast requests complete.
export function withDeadline(promise, milliseconds, fallback = null) {
  let timer;
  return Promise.race([promise, new Promise(resolve => { timer = setTimeout(() => resolve(fallback), milliseconds); })])
    .finally(() => clearTimeout(timer));
}

export function createModelCache({ discover, fallback, now = Date.now, ttl = 3600000, retryTtl = 60000, wait = 1200 }) {
  const entries = new Map();
  return async function getModels(key) {
    let entry = entries.get(key);
    if (!entry) {
      entry = { list: null, expires: 0, pending: null };
      if (entries.size >= 4) entries.delete(entries.keys().next().value);
      entries.set(key, entry);
    }
    if (entry.list && entry.expires > now()) return entry.list;
    if (!entry.pending) {
      entry.pending = Promise.resolve().then(() => discover(key)).catch(() => []).then(found => {
        entry.list = found.length ? [...new Set([...found, ...fallback])] : entry.list || [...fallback];
        entry.expires = now() + (found.length ? ttl : retryTtl);
        return entry.list;
      }).finally(() => { entry.pending = null; });
    }
    // A stale catalog stays usable while exactly one discovery refreshes it.
    if (entry.list) return entry.list;
    return withDeadline(entry.pending, wait, [...fallback]);
  };
}
