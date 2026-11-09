import { useContext, useEffect, useRef } from 'react';
import { ThemeContext } from '../context/ThemeContext.jsx';
import { fixedStep } from './session.js';

const keys = {
  arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down',
  arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right',
  ' ': 'drop', x: 'up', z: 'reverse', c: 'hold',
};

export function useArcadeCanvas(session, size, en, visualMode) {
  const canvas = useRef(null);
  const { theme } = useContext(ThemeContext) ?? {};
  const [width, height] = size ?? [];
  useEffect(() => {
    const node = canvas.current;
    if (!node || !width) return;
    const ctx = node.getContext('2d');
    if (!ctx) return;
    const style = window.getComputedStyle(node);
    const color = token => style.getPropertyValue(token).trim() || undefined;
    const palette = visualMode === 'astra' ? {
      background: color('--panel'), surface: color('--panel-soft'), ink: color('--ink'),
      muted: color('--muted'), accent: color('--accent'),
    } : undefined;
    let frame;
    let last;
    let accumulator = 0;
    let cssWidth = width;
    let cssHeight = height;

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const pixelWidth = Math.max(1, Math.round(cssWidth * dpr));
      const pixelHeight = Math.max(1, Math.round(cssHeight * dpr));
      if (node.width !== pixelWidth) node.width = pixelWidth;
      if (node.height !== pixelHeight) node.height = pixelHeight;
      ctx.setTransform(pixelWidth / width, 0, 0, pixelHeight / height, 0, 0);
      session.render(ctx, en, palette);
    };

    const tick = time => {
      frame = undefined;
      if (session.getSnapshot().status !== 'running') return;
      const dt = last === undefined ? 0 : Math.min((time - last) / 1000, 0.1);
      last = time;
      accumulator += dt;
      while (accumulator >= fixedStep) {
        session.step(fixedStep);
        accumulator -= fixedStep;
      }
      draw();
      session.publish();
      if (frame === undefined && session.getSnapshot().status === 'running') frame = requestAnimationFrame(tick);
    };

    const sync = () => {
      if (session.getSnapshot().status === 'running') {
        if (frame === undefined) frame = requestAnimationFrame(tick);
      } else {
        cancelAnimationFrame(frame);
        frame = last = undefined;
        accumulator = 0;
        draw();
      }
    };
    const resize = () => {
      const box = node.getBoundingClientRect();
      cssWidth = box.width || width;
      cssHeight = box.height || height;
      draw();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(node);
    const unsubscribe = session.subscribe(sync);
    resize();
    sync();
    return () => {
      unsubscribe();
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [session, width, height, en, theme, visualMode]);
  return canvas;
}

export function useArcadeInput(session, game, canvas) {
  const gesture = useRef(null);
  const keyFor = event => {
    const key = event.key.toLowerCase();
    if (game === 'blocks') return keys[key];
    if (['x', 'z', 'c', ' '].includes(key)) return undefined;
    const action = keys[key];
    if (game === 'pong' && (action === 'left' || action === 'right')) return undefined;
    return action;
  };

  function toggle() {
    const status = session.getSnapshot().status;
    session.unlockSound();
    void session.dispatch({ type: status === 'running' ? 'game.pause' : 'game.resume' });
  }

  return {
    onKeyDown(event) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === 'Escape' || event.key === 'Enter' || (event.key === ' ' && game !== 'blocks')) {
        event.preventDefault();
        if (!event.repeat) toggle();
        return;
      }
      const action = keyFor(event);
      if (!action) return;
      event.preventDefault();
      if (!event.repeat || !['drop', 'hold', 'reverse'].includes(action)) session.press(action, event.code);
    },
    onKeyUp(event) { session.release(event.code); },
    onBlur() { session.resetInput(); },
    onPointerDown(event) {
      if (!event.isPrimary || event.button !== 0) return;
      event.currentTarget.focus({ preventScroll: true });
      event.currentTarget.setPointerCapture?.(event.pointerId);
      gesture.current = { x: event.clientX, y: event.clientY };
      if (game === 'pong') position(event);
    },
    onPointerMove(event) {
      if (game === 'pong' && (event.pointerType === 'mouse' || gesture.current)) position(event);
    },
    onPointerUp(event) {
      const start = gesture.current;
      gesture.current = null;
      if (!start || game === 'pong' || game === 'blocks') return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 15) return;
      const action = Math.abs(dx) >= Math.abs(dy) ? dx < 0 ? 'left' : 'right' : dy < 0 ? 'up' : 'down';
      session.press(action, 'swipe');
      session.release('swipe');
    },
    onPointerCancel() { gesture.current = null; },
  };

  function position(event) {
    const box = canvas.current.getBoundingClientRect();
    const [width, height] = session.getSnapshot().size;
    session.point((event.clientX - box.left) / box.width * width, (event.clientY - box.top) / box.height * height);
  }
}
