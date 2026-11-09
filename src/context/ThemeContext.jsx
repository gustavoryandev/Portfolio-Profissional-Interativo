import React, { createContext, useLayoutEffect, useState } from 'react';
import { themes } from '../data/themes.js';
export { themes };

export const ThemeContext = createContext(null);

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
