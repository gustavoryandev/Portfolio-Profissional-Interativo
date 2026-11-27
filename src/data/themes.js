import { HEIST_DARK } from './heistThemes.js';

export const themes = [
  { id: 'light', light: true },
  { id: 'dark' },
  { id: 'rick-morty', name: 'Rick and Morty' },
  { id: 'galo', name: 'Galo CAM Dark' },
  { id: 'galo-light', name: 'Galo CAM Light', light: true },
  { id: 'aurora', name: 'Aurora' },
  { id: 'midnight-violet', name: 'Midnight Violet' },
  { id: 'papel-violeta', name: 'Papel violeta', light: true },
  { id: HEIST_DARK, name: 'La Casa de Papel — O Assalto' },
  { id: 'quartzo-framboesa', name: 'Quartzo framboesa', light: true },
  { id: 'ardosia-cobalto', name: 'Ardósia e Cobalto', light: true },
  { id: 'cobalto-intenso', name: 'Cobalto intenso' },
  { id: 'petroleo-gelo', name: 'Petróleo e Gelo', light: true },
  { id: 'petroleo-eletrico', name: 'Petróleo elétrico' },
  { id: 'floresta-mineral', name: 'Floresta mineral' },
];

export const themePalettes = themes;

// Keep these aliases in sync with the first-paint script in index.html.
export const legacyThemeIds = {
  'rick-morty-secret': 'rick-morty',
  'midnight-pink': HEIST_DARK,
  'obsidian-gold': HEIST_DARK,
  'grafite-coral': HEIST_DARK,
  'champagne-gold': 'ardosia-cobalto',
  'mint-frost': 'petroleo-gelo',
  'porcelain-indigo': 'papel-violeta',
};

export const isGaloTheme = theme => theme === 'galo' || theme === 'galo-light';

export const isDimensionalTheme = theme => theme === 'rick-morty';
