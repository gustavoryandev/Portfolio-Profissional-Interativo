import { STATIC_MOTION_QUERY } from './motionPreferences.js';

// Delegation also covers cards added by chat replies and project filters.
const TARGETS = '.portfolio-card, .profile-card, .project-tile';
const REVEALS = '.scroll-reveal, .projects-scroll-section [data-project-slide]';

export function installGlassEffects(win) {
  const doc = win.document;
  const staticMotion = win.matchMedia(STATIC_MOTION_QUERY);
  let frame = 0;
  let pending;
  let active;
  const clear = () => {
    win.cancelAnimationFrame(frame);
    frame = 0;
    pending = null;
    active?.style.removeProperty('--mx');
    active?.style.removeProperty('--my');
    active = null;
  };
  const move = event => {
    if (event.pointerType !== 'mouse' || staticMotion.matches || doc.hidden) return;
    const card = event.target.closest?.(TARGETS);
    if (!card) { clear(); return; }
    if (active !== card) { clear(); active = card; }
    pending = { card, x: event.clientX, y: event.clientY };
    if (frame) return;
    frame = win.requestAnimationFrame(() => {
      frame = 0;
      if (!pending?.card.isConnected) return;
      const { card, x, y } = pending;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${x - rect.left}px`);
      card.style.setProperty('--my', `${y - rect.top}px`);
    });
  };
  const out = event => {
    if (active && !active.contains(event.relatedTarget)) clear();
  };
  const intersection = win.IntersectionObserver ? new win.IntersectionObserver(entries => {
    if (staticMotion.matches) return;
    for (const entry of entries) {
      const { target, isIntersecting } = entry;
      if (!target.classList.contains('gn-reveal-ready')) continue;
      target.classList.toggle('gn-in-view', isIntersecting);
    }
  }) : null;
  const revealNodes = node => {
    const targets = [...node.querySelectorAll(REVEALS)];
    if (node.matches(REVEALS)) targets.unshift(node);
    return targets;
  };
  const observe = node => {
    if (node.nodeType !== 1 || !node.isConnected) return;
    for (const target of revealNodes(node)) {
      if (target.classList.contains('gn-reveal-ready')) continue;
      target.classList.add('gn-reveal-ready');
      intersection.observe(target);
    }
  };
  const resetReveals = () => {
    intersection?.disconnect();
    doc.querySelectorAll('.gn-reveal-ready').forEach(target => target.classList.remove('gn-reveal-ready', 'gn-in-view'));
  };
  const mutations = new win.MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) observe(node);
      for (const node of record.removedNodes) {
        if (node.nodeType !== 1 || node.isConnected) continue;
        for (const target of revealNodes(node)) {
          intersection.unobserve(target);
          target.classList.remove('gn-reveal-ready', 'gn-in-view');
        }
      }
    }
  });
  const preference = () => {
    clear();
    if (staticMotion.matches) {
      mutations.disconnect();
      resetReveals();
    } else if (intersection) {
      mutations.observe(doc.documentElement, { childList: true, subtree: true });
      observe(doc.documentElement);
    }
  };
  preference();
  win.addEventListener('pointermove', move, { passive: true });
  win.addEventListener('pointerout', out, { passive: true });
  doc.addEventListener('visibilitychange', clear);
  staticMotion.addEventListener('change', preference);
  return () => {
    clear();
    mutations.disconnect();
    resetReveals();
    win.removeEventListener('pointermove', move);
    win.removeEventListener('pointerout', out);
    doc.removeEventListener('visibilitychange', clear);
    staticMotion.removeEventListener('change', preference);
  };
}

if (typeof window !== 'undefined') {
  const dispose = installGlassEffects(window);
  if (import.meta.hot) import.meta.hot.dispose(dispose);
}
