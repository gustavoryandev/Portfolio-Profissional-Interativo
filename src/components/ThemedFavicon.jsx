import { useContext, useEffect } from 'react';
import favicon from '/favicon.svg?raw';
import { isHeistTheme } from '../data/heistThemes.js';
import { ThemeContext } from '../context/ThemeContext.jsx';

export default function ThemedFavicon() {
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const icon = document.querySelector('link[rel="icon"]');
    if (!icon) return;

    // Read the palette after ThemeProvider applies the theme to the root.
    const palette = getComputedStyle(document.documentElement);
    const colors = [
      `--favicon-background:${palette.getPropertyValue('--panel').trim()}`,
      `--favicon-border:${palette.getPropertyValue('--line').trim()}`,
      `--favicon-letters:${palette.getPropertyValue('--ink').trim()}`,
      `--favicon-accent:${palette.getPropertyValue(isHeistTheme(theme) ? '--palette-primary' : '--accent').trim()}`,
    ].join(';');
    const svg = favicon.replace('<svg ', `<svg style="${colors}" `);

    icon.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }, [theme]);

  return null;
}
