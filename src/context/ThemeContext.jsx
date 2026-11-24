import useRickThemeMusic from '../hooks/useRickThemeMusic';
import useRickExploration from '../hooks/useRickExploration';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { isGaloTheme, isDimensionalTheme, legacyThemeIds, themePalettes, themes } from '../data/themes.js';
import { DimensionalIntro } from '../components/RickDimensionExperience';
import { DimensionTransit } from '../components/DimensionPortal';
import { REDUCED_MOTION_QUERY } from '../motionPreferences';
export { themes };

import { ThemeContext } from './ThemeState';
export { ThemeContext } from './ThemeState';

// Versão Estádio do hino oficial, publicada pelo Clube Atlético Mineiro.
const galoAnthemUrl = '/hino-do-galo.mp3';

export function ThemeProvider({ children }) {
  const { playMusic, stopMusic, toggleMusic, musicStatus, musicVolume, changeMusicVolume } = useRickThemeMusic();
  const { progress, enable: enableExploration, reset: resetExploration, recordDiscovery } = useRickExploration();
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
  const [signals, setSignals] = useState({});
  const eggMessage = signals[dimension] ?? '';
  const setEggMessage = message => setSignals(previous => ({ ...previous, [dimension]: message }));
  const garageSeen = useRef(false);
  const focusFrame = useRef(null);
  const keyboardFocus = useRef(false);
  useEffect(() => {
    if (theme !== 'rick-morty') return;
    const keyboard = () => { keyboardFocus.current = true; };
    const pointer = () => { keyboardFocus.current = false; };
    window.addEventListener('keydown', keyboard, true);
    window.addEventListener('pointerdown', pointer, true);
    return () => {
      window.removeEventListener('keydown', keyboard, true);
      window.removeEventListener('pointerdown', pointer, true);
    };
  }, [theme]);
  const replayTrigger = useRef(null);
  const [shipDeparted, setShipDeparted] = useState(() => {
    try { return sessionStorage.getItem('rick-ship-departed') === '1'; } catch { return false; }
  });
  const markShipDeparted = useCallback(() => {
    setShipDeparted(true);
    try { sessionStorage.setItem('rick-ship-departed', '1'); } catch {}
  }, []);
  const dismissIntro = useCallback(() => {
    const opener = replayTrigger.current;
    replayTrigger.current = null;
    if (!opener && introScene === 'garage') markShipDeparted();
    const returnFocus = document.activeElement?.closest('.dimension-intro');
    setIntroScene(null);
    if (returnFocus) focusFrame.current = requestAnimationFrame(() => {
      if (opener?.isConnected && opener.getClientRects().length) {
        opener.focus({ preventScroll: true });
        return;
      }
      const portal = [...document.querySelectorAll('.dimension-portal')].find(button => button.getClientRects().length);
      if (portal) {
        portal.toggleAttribute('data-quiet-focus', !keyboardFocus.current);
        portal.focus({ preventScroll: true });
      }
    });
  }, [introScene, markShipDeparted]);
  useLayoutEffect(() => {
    if (theme !== 'rick-morty' || dimension !== 'lab') return;
    let seen = false;
    try { seen = sessionStorage.getItem('rick-garage-intro-seen') === '1'; } catch {}
    if (seen || garageSeen.current) return;
    garageSeen.current = true;
    try { sessionStorage.setItem('rick-garage-intro-seen', '1'); } catch {}
    if (window.matchMedia?.(REDUCED_MOTION_QUERY).matches) { markShipDeparted(); return; }
    setIntroScene('garage');
  }, [theme, dimension, markShipDeparted]);
  useEffect(() => {
    if (theme !== 'rick-morty' || dimension !== 'lab' || shipDeparted) return;
    const motion = window.matchMedia?.(REDUCED_MOTION_QUERY);
    const settleFlight = () => { if (motion?.matches) markShipDeparted(); };
    settleFlight();
    motion?.addEventListener('change', settleFlight);
    return () => motion?.removeEventListener('change', settleFlight);
  }, [theme, dimension, shipDeparted, markShipDeparted]);
  const selectedDimension = useRef(dimension);
  const restoreFrame = useRef(null);
  const selectedTheme = useRef(theme);
  const anthem = useRef(null);
  const [anthemPlaying, setAnthemPlaying] = useState(false);
  const [trip, setTrip] = useState(null);
  const crossing = Boolean(trip) || introScene === 'citadel';
  const tripLocked = useRef(false);
  const scrollPosition = useRef(null);
  const palette = themePalettes.find(option => option.id === theme);
  const darkMode = !palette.light;

  const replayIntro = useCallback((scene, trigger) => {
    if (!isDimensionalTheme(selectedTheme.current) || tripLocked.current || introScene || document.hidden
      || window.matchMedia?.(REDUCED_MOTION_QUERY).matches) return;
    replayTrigger.current = trigger;
    setIntroScene(scene);
  }, [introScene]);

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
    if (introScene === 'garage' && !replayTrigger.current) markShipDeparted();
    replayTrigger.current = null;
    setTrip(null);
    setIntroScene(null);
    cancelAnimationFrame(focusFrame.current);
    cancelAnimationFrame(restoreFrame.current);
    setSignals({});
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
  }, [introScene, markShipDeparted, playAnthem, playMusic, stopMusic]);

  const arrive = useCallback((next, withDock = false) => {
    if (window.scrollY || window.scrollX) {
      const readingLine = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0;
      const section = [...document.querySelectorAll('.scroll-content > [id]')].find(element => {
        const rect = element.getBoundingClientRect();
        return rect.top <= readingLine && rect.bottom > readingLine;
      });
      scrollPosition.current = {
        left: window.scrollX, top: window.scrollY, section, sectionTop: section?.getBoundingClientRect().top,
      };
    }
    selectedDimension.current = next;
    if (next === 'corrupted') recordDiscovery('citadel');
    setDimension(next);
    setIntroScene(withDock ? 'citadel' : null);
  }, [recordDiscovery]);
  const finishTrip = useCallback(interrupted => {
    setTrip(null);
    if (interrupted) setIntroScene(null);
  }, []);
  const crossDimension = useCallback(event => {
    if (!isDimensionalTheme(selectedTheme.current) || tripLocked.current || replayTrigger.current) return;
    tripLocked.current = true;
    const destination = selectedDimension.current === 'lab' ? 'corrupted' : 'lab';
    if (introScene === 'garage') markShipDeparted();
    if (window.matchMedia?.(REDUCED_MOTION_QUERY).matches) {
      arrive(destination);
      return;
    }
    const button = event?.currentTarget;
    const bounds = (button?.querySelector('.portal-art') ?? button)?.getBoundingClientRect();
    setIntroScene(null);
    setTrip({ destination,
      x: bounds ? bounds.left + bounds.width / 2 : window.innerWidth / 2,
      y: bounds ? bounds.top + bounds.height / 2 : window.innerHeight / 2,
    });
  }, [arrive, introScene, markShipDeparted]);
  useEffect(() => () => {
    cancelAnimationFrame(restoreFrame.current);
    cancelAnimationFrame(focusFrame.current);
  }, []);

  useEffect(() => () => {
    const audio = anthem.current;
    if (!audio) return;
    audio.onplay = audio.onpause = audio.onended = audio.onerror = null;
    audio.pause();
    anthem.current = null;
  }, []);

  useLayoutEffect(() => {
    tripLocked.current = crossing;
    document.documentElement.toggleAttribute('data-crossing', crossing);
  }, [dimension, crossing]);
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    if (isDimensionalTheme(theme)) root.dataset.dimension = dimension;
    else delete root.dataset.dimension;
    root.classList.toggle('dark', darkMode);
    root.toggleAttribute('data-custom-theme', Boolean(palette.name));
    try { localStorage.setItem('theme', theme); localStorage.setItem('rick-morty-dimension', dimension); } catch { /* The palette still works without storage. */ }
    if (scrollPosition.current) {
      const { left, top, section, sectionTop } = scrollPosition.current;
      // A taller mobile dock can shift all sections below the hero.
      const restore = () => window.scrollTo({ left, behavior: 'instant',
        top: section?.isConnected ? window.scrollY + section.getBoundingClientRect().top - sectionTop : top,
      });
      restore();
      cancelAnimationFrame(restoreFrame.current);
      restoreFrame.current = requestAnimationFrame(restore);
      scrollPosition.current = null;
    }
  }, [theme, dimension, darkMode, palette]);

  return (
      <ThemeContext.Provider value={{ musicStatus, musicVolume, changeMusicVolume, toggleMusic, effectsPaused, changeEffectsPaused, theme, darkMode, setTheme, anthemPlaying, toggleAnthem, crossDimension, crossing, dimension, eggMessage, setEggMessage, shipDeparted, markShipDeparted, introScene, replayIntro, progress, enableExploration, resetExploration, recordDiscovery }}>
      {children}
      {introScene && <DimensionalIntro key={introScene} scene={introScene} onDismiss={dismissIntro} />}
      {trip && <DimensionTransit trip={trip} onArrive={arrive} onFinish={finishTrip} />}
    </ThemeContext.Provider>
  );
}
