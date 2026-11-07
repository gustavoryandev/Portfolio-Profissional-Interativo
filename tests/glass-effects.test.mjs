import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { installGlassEffects } from '../src/glassFx.js';

test('spotlight batches pointer updates, respects reduced motion and cleans up', () => {
  const dom = new JSDOM('<article class="project-tile"><span>Project</span></article>', { pretendToBeVisual: true });
  const win = dom.window;
  let preference;
  const media = { matches: false, addEventListener(_, callback) { preference = callback; }, removeEventListener() {} };
  win.matchMedia = () => media;
  const frames = new Map();
  let id = 0;
  win.requestAnimationFrame = callback => { frames.set(++id, callback); return id; };
  win.cancelAnimationFrame = key => frames.delete(key);
  const dispose = installGlassEffects(win);
  const card = win.document.querySelector('article');
  card.getBoundingClientRect = () => ({ left: 10, top: 20 });
  function move(x, y, type = 'mouse') {
    const event = new win.Event('pointermove', { bubbles: true });
    Object.assign(event, { clientX: x, clientY: y, pointerType: type });
    card.firstChild.dispatchEvent(event);
  }
  move(30, 50);
  move(50, 90);
  assert.equal(frames.size, 1, 'at most one layout read per animation frame');
  const callback = [...frames.values()][0]; frames.clear(); callback();
  assert.equal(card.style.getPropertyValue('--mx'), '40px');
  assert.equal(card.style.getPropertyValue('--my'), '70px');
  media.matches = true; preference();
  assert.equal(card.style.getPropertyValue('--mx'), '');
  move(100, 100);
  assert.equal(frames.size, 0);
  media.matches = false;
  move(100, 100, 'touch');
  assert.equal(frames.size, 0);
  dispose(); move(100, 100);
  assert.equal(frames.size, 0, 'no listener remains after HMR disposal');
  dom.window.close();
});

test('horizontal cards reveal on intersection, including dynamically mounted cards', async () => {
  const dom = new JSDOM('<section class="projects-scroll-section"><div data-project-slide></div></section>');
  const win = dom.window;
  win.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  const observed = new Set();
  let notify;
  win.IntersectionObserver = class {
    constructor(callback) { notify = callback; }
    observe(node) { observed.add(node); }
    unobserve(node) { observed.delete(node); }
    disconnect() { observed.clear(); }
  };
  win.cancelAnimationFrame = () => {};
  const dispose = installGlassEffects(win);
  const first = win.document.querySelector('[data-project-slide]');
  assert.ok(observed.has(first));
  notify([{ target: first, isIntersecting: true }]);
  assert.ok(first.classList.contains('gn-in-view'));
  assert.ok(observed.has(first), 'keep watching to replay on return');
  notify([{ target: first, isIntersecting: false }]);
  assert.equal(first.classList.contains('gn-in-view'), false);
  notify([{ target: first, isIntersecting: true }]);
  assert.ok(first.classList.contains('gn-in-view'), 'reveal again when scrolling back');
  const next = win.document.createElement('div');
  next.setAttribute('data-project-slide', '');
  first.parentElement.append(next);
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.ok(observed.has(next));
  dispose();
  assert.equal(observed.size, 0);
  assert.equal(first.classList.contains('gn-reveal-ready'), false);
  dom.window.close();
});
