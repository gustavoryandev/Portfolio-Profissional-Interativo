export const themes = [
  { id: 'light', light: true },
  { id: 'dark' },
  { id: 'galo', name: 'Galo CAM Dark' },
  { id: 'galo-light', name: 'Galo CAM Light', light: true },
  { id: 'aurora', name: 'Aurora' },
  { id: 'midnight-violet', name: 'Midnight Violet' },
  { id: 'papel-violeta', name: 'Papel violeta', light: true },
  { id: 'midnight-pink', name: 'Midnight Pink' },
  { id: 'quartzo-framboesa', name: 'Quartzo framboesa', light: true },
  { id: 'ardosia-cobalto', name: 'Ardósia e Cobalto', light: true },
  { id: 'cobalto-intenso', name: 'Cobalto intenso' },
  { id: 'petroleo-gelo', name: 'Petróleo e Gelo', light: true },
  { id: 'petroleo-eletrico', name: 'Petróleo elétrico' },
  { id: 'floresta-mineral', name: 'Floresta mineral' },
];

// Keep these aliases in sync with the first-paint script in index.html.
export const legacyThemeIds = {
  'obsidian-gold': 'midnight-pink',
  'grafite-coral': 'midnight-pink',
  'champagne-gold': 'ardosia-cobalto',
  'mint-frost': 'petroleo-gelo',
  'porcelain-indigo': 'papel-violeta',
};

export const isGaloTheme = theme => theme === 'galo' || theme === 'galo-light';
