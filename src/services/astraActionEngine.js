import { validateActions } from './portfolioActions.js';

const metricsCards = {
  github: '[GITHUB_CARD]',
  wakatime: '[WAKATIME_CARD]',
  'github-detail': '[GITHUB_CARD]\n[GITHUB_ACTIVITY_CARD]\n[GITHUB_LANGUAGES_CARD]\n[REPOSITORIES_CARD]',
  'wakatime-detail': '[WAKATIME_CARD]\n[STATS_CARD]',
};
metricsCards.all = metricsCards.github + '\n' + metricsCards.wakatime;
metricsCards['all-detail'] = metricsCards['github-detail'] + '\n' + metricsCards['wakatime-detail'];

export function createAstraActionEngine({ lab, projectIds }) {
  let lastTurn = 0;
  let handled = new Set();
  return {
    async execute(turn, raw, ui, { base, signal } = {}) {
      const result = { notices: [], cards: [] };
      if (signal?.aborted || turn < lastTurn) return result;
      if (turn !== lastTurn) { lastTurn = turn; handled = new Set(); }
      const phase = base ? 'lab' : 'plan';
      if (handled.has(phase)) return result;
      handled.add(phase);
      const actions = validateActions(raw, projectIds, Boolean(base));
      if (raw?.length && !actions.length) result.notices.push('invalid');
      for (const { type, target, edits, runAfter } of actions) {
        if (signal?.aborted) break;
        if (type === 'astra.openFull') result.notices.push(ui.openFull() ? 'fullOpened' : 'alreadyFull');
        else if (type === 'navigate') { ui.navigate(target); result.notices.push('navigated'); }
        else if (type === 'project.open') { ui.openProject(target); result.notices.push('project'); }
        else if (type === 'theme.set') { ui.setTheme(target); result.notices.push('theme'); }
        else if (type === 'language.set') { await ui.setLanguage(target); result.notices.push('language'); }
        else if (type === 'metrics.open') result.cards.push(metricsCards[target]);
        else if (type === 'lab.language' || type === 'lab.example') {
          const field = type === 'lab.language' ? 'language' : 'example';
          if (!lab.select({ [field]: target })) { result.notices.push('busy'); break; }
          result.notices.push(field === 'language' ? 'labLanguage' : 'labExample');
        } else if (type === 'lab.read') {
          const { language, example, status, code, output, revision } = lab.getSnapshot();
          result.base = { language, example, revision, canEdit: target !== 'result' };
          result.snapshot = { language, example, status, ...(target !== 'result' && { code }), ...(target !== 'code' && { output }) };
        } else if (type === 'lab.stop') result.notices.push(lab.stop() ? 'stopped' : 'notRunning');
        else if (type === 'lab.reset') result.notices.push(lab.propose({ restore: true, runAfter: target === 'run' }));
        else if (type === 'lab.run' || type === 'lab.edit') {
          result.notices.push(edits && !base?.canEdit ? 'invalid' : lab.propose({ edits, runAfter: type === 'lab.run' || runAfter }, base));
        }
      }
      if (result.notices.includes('review')) result.reviewId = lab.getSnapshot().latestReviewId;
      return result;
    },
  };
}
