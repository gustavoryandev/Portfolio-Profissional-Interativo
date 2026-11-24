import { useCallback, useEffect, useRef, useState } from 'react';
import { createRickThemeMusic, readRickMusicVolume } from '../services/rickThemeMusic.js';

export default function useRickThemeMusic() {
  const player = useRef(null);
  const savedVolume = useRef(null);
  if (savedVolume.current === null) savedVolume.current = readRickMusicVolume({
    getItem: key => window.localStorage.getItem(key),
  });
  const [musicVolume, setMusicVolume] = useState(savedVolume.current);
  const [musicStatus, setMusicStatus] = useState('idle');
  const getPlayer = useCallback(() => player.current ??= createRickThemeMusic(window.Audio, setMusicStatus, {
    volume: savedVolume.current, hidden: document.hidden, clock: window,
  }), []);
  const changeMusicVolume = useCallback(value => {
    savedVolume.current = value;
    setMusicVolume(value);
    player.current?.setVolume(value);
    try { window.localStorage.setItem('rick-morty-volume', String(value)); } catch {}
  }, []);
  const playMusic = useCallback(() => getPlayer().play(), [getPlayer]);
  const stopMusic = useCallback(() => player.current?.stop(), []);
  const toggleMusic = useCallback(() => {
    const current = getPlayer();
    if (current.isActive()) current.pause();
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
  return { musicStatus, musicVolume, changeMusicVolume, playMusic, stopMusic, toggleMusic };
}
