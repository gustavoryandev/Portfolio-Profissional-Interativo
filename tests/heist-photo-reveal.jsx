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
  let alternativeRect;
  let matteRect;
  let hidden = false;
  let intersection;
  let resize;
  let bounds = { left: 22, top: 30, width: 220, height: 260 };
  let disconnected = 0;
  let failureType;
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
    disconnect() { disconnected += 1; }
  };
  globalThis.ResizeObserver = class {
    constructor(listener) { resize = listener; }
    observe() {}
    disconnect() { disconnected += 1; }
  };
  window.HTMLElement.prototype.getBoundingClientRect = () => bounds;
  window.HTMLCanvasElement.prototype.getContext = () => ({
    setTransform() {},
    clearRect() {},
    fillRect(...rect) {
      if (this.globalCompositeOperation === 'destination-over') matteRect = rect;
      else if (this.globalCompositeOperation !== 'destination-out') painted += 1;
    },
    drawImage(image, ...rect) { if (image.tagName === 'IMG') alternativeRect = rect; },
    createLinearGradient() { return { addColorStop() {} }; },
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
    await act(async () => root.render(<PhotoReveal originalSrc="/base.jpeg" alt="Professional portrait" />));
    assert.equal(stage().querySelectorAll('img').length, 1);
    assert.equal(stage().querySelector('img').getAttribute('src'), '/base.jpeg');
    assert.equal(stage().style.aspectRatio, '572 / 777');
    assert.equal(frames.size, 0);

    await act(async () => root.render(<PhotoReveal originalSrc="/base.jpeg" alt="Professional portrait"
      alternativeSrc="/alternate.webp" alternativeAlt="Masked portrait" showLabel="Reveal" hideLabel="Return"
      onAlternativeError={event => { failureType = event.type; }}
      alternativePlacement={{ x: -.125, y: .025, width: .75, fadeRight: .125 }} />));
    assert.equal(stage().querySelector('img').alt, 'Professional portrait');
    assert.equal(stage().querySelector('img').style.objectFit, 'contain');
    assert.equal(toggle().disabled, true);
    assert.equal(frames.size, 0);
    const alternative = stage().querySelector('img[src="/alternate.webp"]');
    Object.defineProperty(alternative, 'naturalWidth', { value: 918 });
    Object.defineProperty(alternative, 'naturalHeight', { value: 1713 });
    await act(async () => alternative.dispatchEvent(new window.Event('load')));
    assert.equal(toggle().disabled, false);
    assert.equal(stage().querySelector('canvas').width, 440);
    assert.deepEqual(matteRect, [0, 0, 220, 260]);

    pointer(stage(), 'pointerdown');
    pointer(window, 'pointerup');
    assert.equal(frames.size, 1);
    runFrame(16);
    assert.ok(painted > 0, 'a quick tap leaves a radial stamp');
    assert.deepEqual(alternativeRect, [-27.5, 6.5, 165, 165 * 1713 / 918]);
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

    bounds = { left: 32, top: 35, width: 200, height: 150 };
    resize();
    assert.equal(stage().querySelector('canvas').width, 400);
    assert.equal(stage().querySelector('canvas').height, 300);
    assert.deepEqual(matteRect, [0, 0, 200, 150]);
    pointer(stage(), 'pointermove', { pointerType: 'mouse' });
    runFrame(900);
    assert.deepEqual(alternativeRect, [-25, 3.75, 150, 150 * 1713 / 918]);
    pointer(stage(), 'pointerleave', { pointerType: 'mouse' });
    runFrame(1000);
    assert.equal(frames.size, 1, 'the trail continues to fade after the pointer leaves');
    runFrame(1700);
    assert.equal(frames.size, 0, 'the trail does not maintain an idle animation');

    preference.matches = true;
    await act(async () => preference.dispatchEvent(new window.Event('change')));
    assert.equal(stage().querySelector('canvas'), null);
    assert.equal(disconnected, 2);
    pointer(stage(), 'pointermove', { pointerType: 'mouse' });
    assert.equal(frames.size, 0);
    await act(async () => toggle().click());
    assert.equal(alternative.alt, 'Masked portrait');
    assert.equal(alternative.style.width, '75%');
    assert.equal(alternative.style.height, 'auto');
    assert.equal(alternative.style.left, '-12.5%');
    assert.equal(alternative.getAttribute('aria-hidden'), 'false');
    assert.equal(stage().querySelector('img').getAttribute('aria-hidden'), 'true');
    assert.equal(stage().querySelector('img').style.visibility, 'hidden');
    await act(async () => alternative.dispatchEvent(new window.Event('error')));
    assert.equal(toggle().disabled, true);
    assert.equal(stage().querySelector('img').hasAttribute('aria-hidden'), false);
    assert.equal(stage().querySelector('img').style.visibility, 'visible');
    assert.equal(alternative.style.opacity, '0');
    assert.equal(failureType, 'error');
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
    delete globalThis.IntersectionObserver;
    delete globalThis.ResizeObserver;
  }
}
