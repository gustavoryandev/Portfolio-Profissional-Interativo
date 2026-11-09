import { playgroundExamples } from '../data/playgroundExamples.js';
import { languages } from '../data/playgroundLanguages.js';
import { themes } from '../data/themes.js';

export const LAB_CODE_LIMIT = 20000;
export const LAB_OUTPUT_LIMIT = 16000;
export const LAB_MODES = [...playgroundExamples, { id: 'free', pt: 'Código livre', en: 'Free coding' }];
export const PORTFOLIO_SECTIONS = [
  ['inicio', 'Início', 'Home'],
  ['sobre', 'Sobre', 'About'],
  ['projetos', 'Projetos', 'Projects'],
  ['laboratorio', 'Laboratório', 'Code Lab'],
  ['habilidades', 'Habilidades', 'Skills'],
  ['experience', 'Experiência', 'Experience'],
  ['education', 'Formação', 'Education'],
  ['contato', 'Contato', 'Contact'],
];
export const ACTION_TARGETS = {
  'navigate': PORTFOLIO_SECTIONS.map(([id]) => id),
  'theme.set': themes.map(({ id }) => id),
  'language.set': ['pt', 'en'],
  'project.open': null, // Validated against the portfolio catalog.
  'metrics.open': ['github', 'wakatime', 'all', 'github-detail', 'wakatime-detail', 'all-detail'],
  'lab.language': Object.keys(languages),
  'lab.example': LAB_MODES.map(({ id }) => id),
  'lab.read': ['code', 'result', 'both'],
  'lab.run': [undefined],
  'lab.reset': [undefined, 'run'],
  'lab.stop': [undefined],
};
export const LAB_STATUSES = ['idle', 'loading', 'running', 'done', 'error', 'stopped', 'timeout'];

export function validateActions(raw, projectIds, snapshot = false) {
  if (!Array.isArray(raw) || !raw.length || raw.length > 8) return [];
  const actions = [];
  const seen = new Set();
  for (const action of raw) {
    if (!action || typeof action !== 'object') return [];
    const { type, target } = action;
    if (typeof type !== 'string') return [];
    let normalized;
    if (snapshot && type === 'lab.edit') {
      if (!Array.isArray(action.edits) || !action.edits.length || action.edits.length > 12) return [];
      const edits = [];
      for (const edit of action.edits) {
        if (typeof edit?.find !== 'string' || !edit.find.length || edit.find.length > LAB_CODE_LIMIT
          || typeof edit.replace !== 'string' || edit.replace.length > LAB_CODE_LIMIT) return [];
        edits.push({ find: edit.find, replace: edit.replace });
      }
      normalized = { type, edits, runAfter: action.runAfter === true };
    } else if (snapshot ? type === 'lab.run' && target === undefined : Object.hasOwn(ACTION_TARGETS, type)
      && (type === 'project.open' ? projectIds.has(target) : ACTION_TARGETS[type].includes(target))) {
      normalized = target === undefined ? { type } : { type, target };
    } else return [];
    const key = JSON.stringify(normalized);
    if (!seen.has(key)) { actions.push(normalized); seen.add(key); }
  }
  if (snapshot) return actions.length === 1 ? actions : [];
  // A read hands off to the model; a run or reset hands off to the review UI.
  const handoffs = actions.filter(({ type }) => ['lab.read', 'lab.run', 'lab.reset'].includes(type));
  if (handoffs.length > 1 || (handoffs.length && actions.at(-1) !== handoffs[0])) return [];
  return actions;
}

export function sanitizeLabSnapshot(raw) {
  if (!raw || !ACTION_TARGETS['lab.language'].includes(raw.language) || !ACTION_TARGETS['lab.example'].includes(raw.example)
    || !LAB_STATUSES.includes(raw.status)) return null;
  const { language, example, status, code, output } = raw;
  if ((code === undefined && output === undefined)
    || (code !== undefined && (typeof code !== 'string' || code.length > LAB_CODE_LIMIT))
    || (output !== undefined && (typeof output !== 'string' || output.length > LAB_OUTPUT_LIMIT))) return null;
  return { language, example, status, code, output };
}
