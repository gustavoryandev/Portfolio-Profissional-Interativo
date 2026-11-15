import React, { createContext, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { isGaloTheme, legacyThemeIds, themes } from '../data/themes.js';
export { themes };

export const ThemeContext = createContext(null);

// Versão Estádio do hino oficial, publicada pelo Clube Atlético Mineiro.
const galoAnthemUrl = '/hino-do-galo.mp3';

export function ThemeProvider({ children }) {
  const [theme, setSelectedTheme] = useState(() => {
    let initial = document.documentElement.dataset.theme;
    if (!initial) {
      try { initial = localStorage.getItem('theme'); } catch {}
    }
    if (Object.hasOwn(legacyThemeIds, initial)) initial = legacyThemeIds[initial];
    return themes.find(option => option.id === initial)?.id ?? 'dark';
  });
  const selectedTheme = useRef(theme);
  const anthem = useRef(null);
  const palette = themes.find(option => option.id === theme);
  const darkMode = !palette.light;

  const setTheme = useCallback(nextTheme => {
    const wasGalo = isGaloTheme(selectedTheme.current);
    const isGalo = isGaloTheme(nextTheme);
    selectedTheme.current = nextTheme;
    setSelectedTheme(nextTheme);

    if (isGalo && !wasGalo) {
      anthem.current ??= new window.Audio(galoAnthemUrl);
      // Start within the selection event so browsers can use its user activation.
      anthem.current.play().catch(() => {});
    } else if (!isGalo && wasGalo && anthem.current) {
      anthem.current.pause();
      anthem.current.currentTime = 0;
    }
  }, []);

  useEffect(() => () => anthem.current?.pause(), []);

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
