import { useCallback, useEffect, useRef, useState } from 'react';
import { createRickThemeMusic } from '../services/rickThemeMusic.js';

export default function useRickThemeMusic() {
  const player = useRef(null);
  const [musicStatus, setMusicStatus] = useState('idle');
  const getPlayer = useCallback(() => player.current ??= createRickThemeMusic(window.Audio, setMusicStatus), []);
  const playMusic = useCallback(() => getPlayer().play(), [getPlayer]);
  const stopMusic = useCallback(() => player.current?.stop(), []);
  const toggleMusic = useCallback(() => {
    const current = getPlayer();
    if (current.isActive()) current.pause();
    else void current.play();
  }, [getPlayer]);
  useEffect(() => () => { player.current?.dispose(); player.current = null; }, []);
  return { musicStatus, playMusic, stopMusic, toggleMusic };
}
