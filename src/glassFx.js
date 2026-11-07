// Delegation also covers cards added by chat replies and project filters.
const TARGETS = '.portfolio-card, .profile-card, .project-tile';
const SLIDES = '.projects-scroll-section [data-project-slide]';

export function installGlassEffects(win) {
  const doc = win.document;
  const reduced = win.matchMedia('(prefers-reduced-motion: reduce)');
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
    if (event.pointerType !== 'mouse' || reduced.matches || doc.hidden) return;
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
    for (const entry of entries) {
      entry.target.classList.toggle('gn-in-view', entry.isIntersecting);
    }
  }, { threshold: .08 }) : null;
  const observe = node => {
    if (!intersection || reduced.matches || node.nodeType !== 1) return;
    const slides = [...node.querySelectorAll(SLIDES)];
    if (node.matches(SLIDES)) slides.unshift(node);
    for (const slide of slides) {
      if (slide.classList.contains('gn-reveal-ready')) continue;
      slide.classList.add('gn-reveal-ready');
      intersection.observe(slide);
    }
  };
  const mutations = new win.MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) observe(node);
      for (const node of record.removedNodes) {
        if (node.nodeType !== 1 || node.isConnected) continue;
        if (node.matches('[data-project-slide]')) intersection?.unobserve(node);
        node.querySelectorAll('[data-project-slide]').forEach(slide => intersection?.unobserve(slide));
      }
    }
  });
  mutations.observe(doc.documentElement, { childList: true, subtree: true });
  observe(doc.documentElement);
  const preference = () => {
    clear();
    if (reduced.matches) {
      intersection?.disconnect();
      doc.querySelectorAll('.gn-reveal-ready').forEach(slide => slide.classList.add('gn-in-view'));
    }
  };
  win.addEventListener('pointermove', move, { passive: true });
  win.addEventListener('pointerout', out, { passive: true });
  doc.addEventListener('visibilitychange', clear);
  reduced.addEventListener('change', preference);
  return () => {
    clear();
    mutations.disconnect();
    intersection?.disconnect();
    win.removeEventListener('pointermove', move);
    win.removeEventListener('pointerout', out);
    doc.removeEventListener('visibilitychange', clear);
    reduced.removeEventListener('change', preference);
    doc.querySelectorAll('.gn-reveal-ready').forEach(slide => slide.classList.remove('gn-reveal-ready', 'gn-in-view'));
  };
}

if (typeof window !== 'undefined') {
  const dispose = installGlassEffects(window);
  if (import.meta.hot) import.meta.hot.dispose(dispose);
}
