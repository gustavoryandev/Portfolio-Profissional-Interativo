import { useContext, useEffect, useRef } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import '../entrance-theme.css';

export default function useEntranceInteraction() {
  const { darkMode } = useContext(ThemeContext);
  const frame = useRef(null);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  function reset(event) {
    cancelAnimationFrame(frame.current);
    const style = event.currentTarget.style;
    style.removeProperty('--pointer-x');
    style.removeProperty('--pointer-y');
    style.removeProperty('--drift-x');
    style.removeProperty('--drift-y');
  }

  function move(event) {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const element = event.currentTarget;
    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      element.style.setProperty('--pointer-x', `${x * 100}%`);
      element.style.setProperty('--pointer-y', `${y * 100}%`);
      element.style.setProperty('--drift-x', `${(x - .5) * 12}px`);
      element.style.setProperty('--drift-y', `${(y - .5) * 8}px`);
    });
  }

  return { 'data-entrance-theme': darkMode ? 'dark' : 'light', onPointerMove: move, onPointerLeave: reset };
}
