import assert from 'node:assert/strict';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import PhotoReveal from '../src/components/PhotoReveal.jsx';

export async function verifyPhotoReveal() {
  const dom = new JSDOM('<div id="test"></div>', { url: 'https://portfolio.test', pretendToBeVisual: true });
  const { window } = dom;
  const { document } = window;
  globalThis.window = window;
  globalThis.document = document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;

  const frames = new Map();
  let frameId = 0;
  let painted = 0;
  let hidden = false;
  let intersection;
  const preference = new window.EventTarget();
  preference.matches = false;
  window.matchMedia = () => preference;
  window.requestAnimationFrame = callback => { frames.set(++frameId, callback); return frameId; };
  window.cancelAnimationFrame = id => frames.delete(id);
  Object.defineProperty(document, 'hidden', { get: () => hidden });
  Object.defineProperty(window, 'devicePixelRatio', { value: 3 });
  globalThis.IntersectionObserver = class {
    constructor(listener) { intersection = listener; }
    observe() {}
    disconnect() {}
  };
  window.HTMLElement.prototype.getBoundingClientRect = () => ({ left: 22, top: 30, width: 220, height: 260 });
  window.HTMLCanvasElement.prototype.getContext = () => ({
    setTransform() {},
    clearRect() {},
    fillRect() { painted += 1; },
    drawImage() {},
    createRadialGradient() { return { addColorStop() {} }; },
  });

  function runFrame(time) {
    const current = [...frames.values()];
    frames.clear();
    current.forEach(callback => callback(time));
  }

  function pointer(target, type, properties) {
    const event = new window.Event(type);
    Object.assign(event, { pointerId: 3, pointerType: 'touch', isPrimary: true, clientX: 100, clientY: 120, ...properties });
    target.dispatchEvent(event);
  }

  const root = createRoot(document.getElementById('test'));
  const check = () => document.querySelector('[data-photo-reveal]');
  const stage = () => check().querySelector('.photo-reveal-stage');
  const toggle = () => check().querySelector('button');
  try {
    await act(async () => root.render(<PhotoReveal originalSrc="/base.jpeg" alt="Professional portrait"
      alternativeSrc="/alternate.webp" alternativeAlt="Masked portrait" showLabel="Reveal" hideLabel="Return" />));
    assert.equal(stage().querySelector('img').alt, 'Professional portrait');
    assert.equal(toggle().disabled, true);
    const alternative = stage().querySelector('img[src="/alternate.webp"]');
    Object.defineProperty(alternative, 'naturalWidth', { value: 918 });
    Object.defineProperty(alternative, 'naturalHeight', { value: 1713 });
    await act(async () => alternative.dispatchEvent(new window.Event('load')));
    assert.equal(toggle().disabled, false);
    assert.equal(stage().querySelector('canvas').width, 440);

    pointer(stage(), 'pointerdown');
    pointer(window, 'pointerup');
    assert.equal(frames.size, 1);
    runFrame(16);
    assert.ok(painted > 0, 'a quick tap leaves a radial stamp');
    runFrame(760);
    assert.equal(frames.size, 0, 'no work remains after the stamp fades');

    pointer(stage(), 'pointermove', { pointerType: 'mouse' });
    runFrame(800);
    assert.equal(frames.size, 1);
    intersection([{ isIntersecting: false }]);
    assert.equal(frames.size, 0);
    pointer(stage(), 'pointermove', { pointerType: 'mouse' });
    assert.equal(frames.size, 0, 'offscreen movement does not schedule work');
    intersection([{ isIntersecting: true }]);
    pointer(stage(), 'pointermove', { pointerType: 'mouse' });
    assert.equal(frames.size, 1);
    hidden = true;
    document.dispatchEvent(new window.Event('visibilitychange'));
    assert.equal(frames.size, 0);
    hidden = false;

    preference.matches = true;
    await act(async () => preference.dispatchEvent(new window.Event('change')));
    assert.equal(stage().querySelector('canvas'), null);
    await act(async () => toggle().click());
    assert.equal(alternative.alt, 'Masked portrait');
    assert.equal(alternative.getAttribute('aria-hidden'), 'false');
    assert.equal(stage().querySelector('img').getAttribute('aria-hidden'), 'true');
    await act(async () => alternative.dispatchEvent(new window.Event('error')));
    assert.equal(toggle().disabled, true);
    assert.equal(stage().querySelector('img').hasAttribute('aria-hidden'), false);
    assert.equal(alternative.style.opacity, '0');
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
    delete globalThis.IntersectionObserver;
  }
}
