export const themes = [
  { id: 'light', light: true },
  { id: 'dark' },
  { id: 'galo', name: 'Galo CAM Dark' },
  { id: 'galo-light', name: 'Galo CAM Light', light: true },
  { id: 'aurora', name: 'Aurora' },
  { id: 'midnight-violet', name: 'Midnight Violet' },
  { id: 'grafite-coral', name: 'Grafite e Coral' },
  { id: 'porcelain-indigo', name: 'Porcelain Indigo', light: true },
  { id: 'ardosia-cobalto', name: 'Ardósia e Cobalto', light: true },
  { id: 'petroleo-gelo', name: 'Petróleo e Gelo', light: true },
];

// Keep these aliases in sync with the first-paint script in index.html.
export const legacyThemeIds = {
  'obsidian-gold': 'grafite-coral',
  'champagne-gold': 'ardosia-cobalto',
  'mint-frost': 'petroleo-gelo',
};

export const isGaloTheme = theme => theme === 'galo' || theme === 'galo-light';
