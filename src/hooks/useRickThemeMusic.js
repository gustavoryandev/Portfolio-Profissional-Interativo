import { useCallback, useEffect, useRef, useState } from 'react';
import { BEYOND_CURVE_TRACK, RICK_THEME_TRACK, createRickThemeMusic, readRickMusicVolume } from '../services/rickThemeMusic.js';
import { BEYOND_CURVE } from '../data/rickDimensions.js';

const pauseKey = 'rick-morty-music-paused';

export default function useRickThemeMusic() {
  const player = useRef(null);
  const track = useRef(RICK_THEME_TRACK.preview);
  const pausedByVisitor = useRef(false);
  const savedVolume = useRef(null);
  if (savedVolume.current === null) {
    savedVolume.current = readRickMusicVolume({ getItem: key => window.localStorage.getItem(key) });
    try { pausedByVisitor.current = window.localStorage.getItem(pauseKey) === '1'; } catch {}
  }
  const [musicVolume, setMusicVolume] = useState(savedVolume.current);
  const [musicStatus, setMusicStatus] = useState('idle');
  const getPlayer = useCallback(() => player.current ??= createRickThemeMusic(window.Audio, setMusicStatus, {
    volume: savedVolume.current, hidden: document.hidden, clock: window, source: track.current,
  }), []);
  const changeMusicVolume = useCallback(value => {
    savedVolume.current = value;
    setMusicVolume(value);
    player.current?.setVolume(value);
    try { window.localStorage.setItem('rick-morty-volume', String(value)); } catch {}
  }, []);
  const selectMusic = useCallback((dimension, autoplay = false, mix = 1) => {
    // The imported recording is available to local review while distribution rights are pending.
    const source = dimension === BEYOND_CURVE
      ? import.meta.env.DEV ? BEYOND_CURVE_TRACK.preview : null
      : RICK_THEME_TRACK.preview;
    if (source !== track.current) {
      player.current?.dispose();
      player.current = null;
      track.current = source;
      setMusicStatus(source ? 'idle' : 'unavailable');
    }
    player.current?.setCinematicGain(mix);
    if (autoplay && source && !pausedByVisitor.current && savedVolume.current > 0) {
      const current = getPlayer();
      current.setCinematicGain(mix);
      void current.play();
    }
  }, [getPlayer]);
  const setMusicCue = useCallback(scale => player.current?.setCinematicGain(scale), []);
  const stopMusic = useCallback(() => {
    player.current?.dispose();
    player.current = null;
    setMusicStatus('idle');
  }, []);
  const toggleMusic = useCallback(() => {
    if (!track.current) return;
    const current = getPlayer();
    pausedByVisitor.current = current.isActive();
    try { window.localStorage.setItem(pauseKey, pausedByVisitor.current ? '1' : '0'); } catch {}
    if (pausedByVisitor.current) current.pause();
    else void current.play();
  }, [getPlayer]);
  useEffect(() => {
    const visibility = () => player.current?.setVisibility(document.hidden);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      player.current?.dispose();
      player.current = null;
    };
  }, []);
  return { musicStatus, musicVolume, changeMusicVolume, selectMusic, setMusicCue, stopMusic, toggleMusic };
}
