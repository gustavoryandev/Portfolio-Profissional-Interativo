import useRickThemeMusic from '../hooks/useRickThemeMusic';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { isGaloTheme, isDimensionalTheme, legacyThemeIds, themePalettes, themes } from '../data/themes.js';
import { DimensionalIntro } from '../components/RickDimensionExperience';
export { themes };

import { ThemeContext } from './ThemeState';
export { ThemeContext } from './ThemeState';

// Versão Estádio do hino oficial, publicada pelo Clube Atlético Mineiro.
const galoAnthemUrl = '/hino-do-galo.mp3';

export function ThemeProvider({ children }) {
  const { musicStatus, musicVolume, changeMusicVolume, playMusic, stopMusic, toggleMusic } = useRickThemeMusic();
  const [theme, setSelectedTheme] = useState(() => {
    let initial = document.documentElement.dataset.theme;
    if (!initial) {
      try { initial = localStorage.getItem('theme'); } catch {}
    }
    if (Object.hasOwn(legacyThemeIds, initial)) initial = legacyThemeIds[initial];
    return themePalettes.find(option => option.id === initial)?.id ?? 'dark';
  });
  const [effectsPaused, setEffectsPaused] = useState(() => {
    try { return window.localStorage.getItem('rick-morty-effects-paused') === '1'; } catch { return false; }
  });
  const changeEffectsPaused = useCallback(paused => {
    setEffectsPaused(paused);
    try { window.localStorage.setItem('rick-morty-effects-paused', paused ? '1' : '0'); } catch {}
  }, []);
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.toggleAttribute('data-rick-effects-paused', effectsPaused && theme === 'rick-morty');
  }, [theme, effectsPaused]);
  useEffect(() => {
    if (theme !== 'rick-morty') return;
    const root = document.documentElement;
    const visibility = () => root.toggleAttribute('data-rick-tab-hidden', document.hidden);
    visibility();
    document.addEventListener('visibilitychange', visibility);
    return () => {
      root.removeAttribute('data-rick-tab-hidden');
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [theme]);
  const [dimension, setDimension] = useState(() => {
    if (document.documentElement.dataset.dimension === 'corrupted') return 'corrupted';
    try {
      return localStorage.getItem('theme') === 'rick-morty-secret' || localStorage.getItem('rick-morty-dimension') === 'corrupted' ? 'corrupted' : 'lab';
    } catch { return 'lab'; }
  });
  const [introScene, setIntroScene] = useState(null);
  const [eggMessage, setEggMessage] = useState('');
  const [shipDeparted, setShipDeparted] = useState(() => {
    try { return sessionStorage.getItem('rick-ship-departed') === '1'; } catch { return false; }
  });
  const markShipDeparted = useCallback(() => {
    setShipDeparted(true);
    try { sessionStorage.setItem('rick-ship-departed', '1'); } catch {}
  }, []);
  const dismissIntro = useCallback(() => {
    if (introScene === 'garage') markShipDeparted();
    const returnFocus = document.activeElement?.closest('.dimension-intro');
    setIntroScene(null);
    if (returnFocus) requestAnimationFrame(() => {
      [...document.querySelectorAll('.dimension-portal')].find(button => button.getClientRects().length)?.focus({ preventScroll: true });
    });
  }, [introScene, markShipDeparted]);
  useEffect(() => {
    if (theme !== 'rick-morty') { setIntroScene(null); return; }
    let seen = false;
    try { seen = sessionStorage.getItem('rick-garage-intro-seen') === '1'; } catch {}
    if (seen || dimension !== 'lab') return;
    try { sessionStorage.setItem('rick-garage-intro-seen', '1'); } catch {}
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { markShipDeparted(); return; }
    setIntroScene('garage');
  }, [theme, dimension, markShipDeparted]);
  useEffect(() => {
    if (!introScene) return;
    const timer = setTimeout(dismissIntro, introScene === 'garage' ? 2100 : 1100);
    return () => clearTimeout(timer);
  }, [introScene, dismissIntro]);
  const selectedDimension = useRef(dimension);
  const [portalOrigin, setPortalOrigin] = useState({ x: '50vw', y: '50vh' });
  const restoreFrame = useRef(null);
  const selectedTheme = useRef(theme);
  const anthem = useRef(null);
  const [anthemPlaying, setAnthemPlaying] = useState(false);
  const [crossing, setCrossing] = useState(false);
  const crossingTimer = useRef(null);
  const scrollPosition = useRef(null);
  const palette = themePalettes.find(option => option.id === theme);
  const darkMode = !palette.light;

  const playAnthem = useCallback(() => {
    if (!anthem.current) {
      const audio = new window.Audio(galoAnthemUrl);
      audio.onplay = () => setAnthemPlaying(true);
      audio.onpause = audio.onended = audio.onerror = () => setAnthemPlaying(false);
      anthem.current = audio;
    }
    // Start within the click so browsers can use its user activation.
    anthem.current.play().catch(() => {});
  }, []);

  const toggleAnthem = useCallback(() => {
    if (!isGaloTheme(selectedTheme.current)) return;
    if (anthem.current?.paused === false) anthem.current.pause();
    else playAnthem();
  }, [playAnthem]);

  const setTheme = useCallback(nextTheme => {
    if (!themePalettes.some(option => option.id === nextTheme)) return;
    clearTimeout(crossingTimer.current);
    crossingTimer.current = null;
    setCrossing(false);
    setIntroScene(null);
    setEggMessage('');
    const wasGalo = isGaloTheme(selectedTheme.current);
    const isGalo = isGaloTheme(nextTheme);
    const wasRick = selectedTheme.current === 'rick-morty';
    selectedTheme.current = nextTheme;
    setSelectedTheme(nextTheme);
    if (nextTheme === 'rick-morty') {
      selectedDimension.current = 'lab';
      setDimension('lab');
    }

    if (nextTheme === 'rick-morty' && !wasRick) void playMusic();
    else if (nextTheme !== 'rick-morty' && wasRick) stopMusic();

    if (isGalo && !wasGalo) {
      playAnthem();
    } else if (!isGalo && wasGalo && anthem.current) {
      anthem.current.pause();
      anthem.current.currentTime = 0;
    }
  }, [playAnthem, playMusic, stopMusic]);

  const crossDimension = useCallback(event => {
    if (!isDimensionalTheme(selectedTheme.current) || crossingTimer.current) return;
    const bounds = event?.currentTarget?.getBoundingClientRect();
    setPortalOrigin(bounds ? { x: `${bounds.left + bounds.width / 2}px`, y: `${bounds.top + bounds.height / 2}px` } : { x: '50vw', y: '50vh' });
    scrollPosition.current = [window.scrollX, window.scrollY];
    const next = selectedDimension.current === 'lab' ? 'corrupted' : 'lab';
    selectedDimension.current = next;
    setDimension(next);
    setEggMessage('');
    if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) setIntroScene(next === 'corrupted' ? 'citadel' : null);
    setCrossing(true);
    crossingTimer.current = setTimeout(() => {
      setCrossing(false);
      crossingTimer.current = null;
    }, 700);
  }, []);
  useEffect(() => () => {
    clearTimeout(crossingTimer.current);
    cancelAnimationFrame(restoreFrame.current);
  }, []);

  useEffect(() => () => {
    const audio = anthem.current;
    if (!audio) return;
    audio.onplay = audio.onpause = audio.onended = audio.onerror = null;
    audio.pause();
    anthem.current = null;
  }, []);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    if (isDimensionalTheme(theme)) root.dataset.dimension = dimension;
    else delete root.dataset.dimension;
    root.toggleAttribute('data-crossing', crossing);
    root.classList.toggle('dark', darkMode);
    root.toggleAttribute('data-custom-theme', Boolean(palette.name));
    try { localStorage.setItem('theme', theme); localStorage.setItem('rick-morty-dimension', dimension); } catch { /* The palette still works without storage. */ }
    if (scrollPosition.current) {
      const [left, top] = scrollPosition.current;
      window.scrollTo({ left, top, behavior: 'instant' });
      restoreFrame.current = requestAnimationFrame(() => window.scrollTo({ left, top, behavior: 'instant' }));
      scrollPosition.current = null;
    }
  }, [theme, dimension, darkMode, palette, crossing]);

  return (
    <ThemeContext.Provider value={{ musicStatus, musicVolume, changeMusicVolume, effectsPaused, changeEffectsPaused, toggleMusic, theme, darkMode, setTheme, anthemPlaying, toggleAnthem, crossDimension, crossing, dimension, eggMessage, setEggMessage, shipDeparted, markShipDeparted, introScene }}>
      {children}
      <DimensionalIntro scene={introScene} onDismiss={dismissIntro} />
      {crossing && <div className="dimension-transit" style={{ '--portal-x': portalOrigin.x, '--portal-y': portalOrigin.y }} aria-hidden="true"><span /></div>}
    </ThemeContext.Provider>
  );
}
