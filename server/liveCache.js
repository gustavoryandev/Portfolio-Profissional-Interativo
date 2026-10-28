export function sourceFailure(error) {
  const status = error?.response?.status;
  const reason = status === 429 || error?.response?.headers?.['x-ratelimit-remaining'] === '0' ? 'rate_limited'
    : status === 401 || status === 403 ? 'unauthorized'
      : ['ECONNABORTED', 'ETIMEDOUT'].includes(error?.code) ? 'timeout' : 'unavailable';
  return { status: 'error', reason };
}

export function createLiveCache(ttls, now = Date.now) {
  const entries = new Map();
  async function get(name, fetcher, { retryFailed = false } = {}) {
    const entry = entries.get(name);
    if (entry?.promise) return entry.promise;
    const degraded = entry?.data?.status === 'error' || entry?.data?.stale;
    if (entry?.data && entry.expires > now()
      && (!retryFailed || !degraded || entry.data.reason === 'rate_limited')) return entry.data;

    const promise = Promise.resolve().then(fetcher).catch(sourceFailure).then(fresh => {
      const previous = entry?.data;
      const time = now();
      let data = fresh;
      if (fresh.status === 'error' && previous?.status === 'ok') {
        data = { ...previous, stale: true, reason: fresh.reason || 'unavailable' };
      } else if (name === 'github' && fresh.status === 'ok') {
        const partial = !fresh.languages || fresh.coverage?.events === 'unavailable';
        data = { ...fresh, updatedAt: time, stale: partial, reason: partial ? 'partial' : undefined };
        if (!fresh.languages && previous?.languages) data.languages = previous.languages;
        if (fresh.coverage?.events === 'unavailable' && previous?.activity) {
          data.activity = { ...fresh.activity, commitsPerHour: previous.activity.commitsPerHour,
            totalSampleCommits: previous.activity.totalSampleCommits };
        }
      } else if (fresh.status === 'ok') data = { ...fresh, updatedAt: time, stale: false };
      const ttl = data.reason === 'rate_limited' ? 60000
        : data.status === 'error' || data.stale ? 10000 : ttls[name] ?? 60000;
      entries.set(name, { data, expires: time + ttl });
      return data;
    });
    entries.set(name, { ...entry, promise });
    return promise;
  }
  return { entries, get };
}
