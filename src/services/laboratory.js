import { freeCode } from '../data/playgroundFreeCode.js';
import { languages, variants } from '../data/playgroundLanguages.js';
import { LAB_CODE_LIMIT, LAB_MODES, LAB_OUTPUT_LIMIT } from './portfolioActions.js';

const keyOf = ({ language, example }) => `${example}:${language}`;
const original = ({ example, language }) => example === 'free' ? freeCode[language]
  : language === 'python' ? LAB_MODES.find(item => item.id === example).code : variants[example][language];

// One in-memory session per app. Neither editor drafts nor console output go into browser storage.
export function createLaboratory({ makeWorker = language => new Worker(`/${language}-playground.worker.js`) } = {}) {
  let selection = { example: LAB_MODES[0].id, language: 'python' };
  const entries = new Map();
  const listeners = new Set();
  let snapshot;
  let active;
  let review = null;
  let reviewResults = {};
  let reviewId = 0;
  const entry = target => entries.get(keyOf(target)) ?? { code: original(target), output: '', status: 'idle', revision: 0 };
  const publish = () => {
    snapshot = { ...selection, ...entry(selection), busy: Boolean(active), review, latestReviewId: reviewId, reviewResults };
    for (const listener of listeners) listener();
  };
  const update = (target, values) => { entries.set(keyOf(target), { ...entry(target), ...values }); };
  const dispose = () => {
    if (!active) return;
    clearTimeout(active.timer);
    active.worker?.terminate();
    active = null;
  };

  function select(changes) {
    if (active) return false;
    const next = { ...selection, ...changes };
    if (!Object.hasOwn(languages, next.language) || !LAB_MODES.some(item => item.id === next.example)) return false;
    selection = next;
    publish();
    return true;
  }
  function setCode(code) {
    if (active || typeof code !== 'string' || code.length > LAB_CODE_LIMIT) return;
    const current = entry(selection);
    if (code === current.code) return;
    update(selection, { code, revision: current.revision + 1 });
    publish();
  }
  function reset() {
    if (active) return;
    update(selection, { code: original(selection), output: '', status: 'idle', revision: entry(selection).revision + 1 });
    publish();
  }
  function run() {
    const target = selection;
    const { code } = entry(target);
    if (active || !code.trim()) return false;
    const execution = {};
    active = execution;
    update(target, { output: '', status: 'loading' });
    publish();
    const finish = (status, output = '') => {
      if (active !== execution) return;
      dispose();
      update(target, { status, output });
      publish();
    };
    try {
      const instance = makeWorker(target.language);
      execution.worker = instance;
      execution.timer = setTimeout(() => finish('timeout'), 60000);
      instance.onmessage = ({ data }) => {
        if (active !== execution) return;
        if (data?.type === 'ready' && entry(target).status === 'loading') {
          clearTimeout(execution.timer);
          execution.timer = setTimeout(() => finish('timeout'), 10000);
          update(target, { status: 'running' });
          publish();
        } else if (data?.type === 'done' || data?.type === 'error') {
          finish(data.type, [data.output, data.error].filter(value => typeof value === 'string' && value).join('\n').slice(0, LAB_OUTPUT_LIMIT));
        }
      };
      instance.onerror = () => finish('error');
      instance.postMessage({ code });
      return true;
    } catch {
      finish('error');
      return false;
    }
  }
  function stop() {
    if (!active) return false;
    dispose();
    update(selection, { status: 'stopped' });
    publish();
    return true;
  }

  function propose({ edits, runAfter = false, restore = false }, base = snapshot) {
    if (review) return 'pending';
    const current = entry(base);
    if (current.revision !== base.revision) return 'stale';
    let next = current.code;
    if (restore) {
      next = original(base);
      if (next === current.code && !runAfter) return 'original';
      edits = next === current.code ? undefined : [{ find: current.code, replace: next }];
    } else if (edits) {
      for (const { find, replace } of edits) {
        const start = next.indexOf(find);
        if (start < 0 || start !== next.lastIndexOf(find)) return 'patch';
        next = next.slice(0, start) + replace + next.slice(start + find.length);
        if (next.length > LAB_CODE_LIMIT) return 'patch';
      }
      if (next === current.code) return 'patch';
    }
    if (runAfter && !next.trim()) return 'empty';
    review = { id: ++reviewId, language: base.language, example: base.example, revision: current.revision,
      code: current.code, next, edits, runAfter, restore };
    publish();
    return 'review';
  }
  function resolveReview(id, approve) {
    if (review?.id !== id || (approve && active)) return;
    const proposal = review;
    review = null;
    let status;
    if (!approve) status = 'rejected';
    else if (entry(proposal).revision !== proposal.revision) status = 'stale';
    else {
      selection = { language: proposal.language, example: proposal.example };
      if (proposal.edits) update(selection, { code: proposal.next, revision: proposal.revision + 1,
        ...(proposal.restore && { output: '', status: 'idle' }) });
      status = proposal.edits ? 'applied' : 'approved';
    }
    reviewResults = { ...reviewResults, [id]: status };
    if ((status === 'applied' || status === 'approved') && proposal.runAfter) {
      run();
      return;
    }
    publish();
  }

  publish();
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    select, setCode, reset, run, stop, propose, resolveReview,
    destroy() { if (active) stop(); },
  };
}
