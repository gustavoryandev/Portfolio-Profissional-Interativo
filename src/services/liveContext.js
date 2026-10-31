export const CARD_SOURCES = {
  SPOTIFY_CARD: 'spotify', GITHUB_CARD: 'github', GITHUB_ACTIVITY_CARD: 'github',
  GITHUB_LANGUAGES_CARD: 'github', REPOSITORIES_CARD: 'github', STATS_CARD: 'wakatime',
  WAKATIME_CARD: 'wakatime',
  CANVAS_CARD: 'canvas', GALO_CARD: 'galo', CHESS_CARD: 'chess',
};

export function sourcesForText(text = '') {
  return [...new Set([...text.matchAll(/\[([A-Z_]+)(?::(?:\d+|ALL))?\]/g)]
    .map(match => CARD_SOURCES[match[1]]).filter(Boolean))];
}

export function needsRefresh(source, data) {
  if (data?.status === 'not_configured' || ['unauthorized', 'rate_limited'].includes(data?.reason)) return false;
  return !data || data.status !== 'ok' || data.stale || (source === 'github' && data.languages == null);
}

// A temporary failure must not erase the last usable data displayed in a card.
export function mergeLiveContext(previous = {}, incoming = {}) {
  const result = { ...previous };
  for (const source of new Set(Object.values(CARD_SOURCES))) {
    const next = incoming?.[source];
    if (!next) continue;
    const old = previous[source];
    if (old?.status === 'ok' && ['unknown', 'loading'].includes(next.status)) {
      result[source] = old;
    } else if (old?.status === 'ok' && next.status !== 'ok') {
      result[source] = { ...old, stale: true, reason: next.reason || next.status };
    } else if (source === 'github' && old?.languages && next.status === 'ok' && !next.languages) {
      result[source] = { ...next, languages: old.languages, stale: true, reason: 'partial' };
    } else result[source] = next;
  }
  return result;
}