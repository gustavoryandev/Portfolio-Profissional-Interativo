export const themes = [
  { id: 'light', light: true },
  { id: 'dark' },
  { id: 'galo', name: 'Galo CAM Dark' },
  { id: 'galo-light', name: 'Galo CAM Light', light: true },
  { id: 'aurora', name: 'Aurora' },
  { id: 'midnight-violet', name: 'Midnight Violet' },
  { id: 'papel-violeta', name: 'Papel violeta', light: true },
  { id: 'midnight-pink', name: 'Midnight Pink' },
  { id: 'ardosia-cobalto', name: 'Ardósia e Cobalto', light: true },
  { id: 'petroleo-gelo', name: 'Petróleo e Gelo', light: true },
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
