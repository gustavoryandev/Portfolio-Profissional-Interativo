import React, { createContext, useLayoutEffect, useState } from 'react';

export const ThemeContext = createContext(null);

export const themes = [
  { id: 'light', light: true },
  { id: 'dark' },
  { id: 'galo', name: 'Galo CAM' },
  { id: 'aurora', name: 'Aurora' },
  { id: 'midnight-violet', name: 'Midnight Violet' },
  { id: 'obsidian-gold', name: 'Obsidian Gold' },
  { id: 'porcelain-indigo', name: 'Porcelain Indigo', light: true },
  { id: 'champagne-gold', name: 'Champagne Gold', light: true },
  { id: 'neon-green', name: 'Neon Green' },
  { id: 'mint-frost', name: 'Mint Frost', light: true },
];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    let initial = document.documentElement.dataset.theme;
    if (!initial) {
      try { initial = localStorage.getItem('theme'); } catch {}
    }
    return themes.find(option => option.id === initial)?.id ?? 'dark';
  });
  const palette = themes.find(option => option.id === theme);
  const darkMode = !palette.light;

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle('dark', darkMode);
    root.toggleAttribute('data-custom-theme', Boolean(palette.name));
    try { localStorage.setItem('theme', theme); } catch { /* The palette still works without storage. */ }
  }, [theme, darkMode, palette]);

  return (
    <ThemeContext.Provider value={{ theme, darkMode, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
