import assert from 'node:assert/strict';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import ProjectsScrollSection from '../src/components/ProjectsScrollSection';

const dom = new JSDOM('<div class="scroll-portfolio"><header class="site-header"></header><div id="root"></div></div>', { url: 'http://localhost' });
const { window } = dom;
Object.assign(globalThis, {
  window, document: window.document, IS_REACT_ACT_ENVIRONMENT: true,
  requestAnimationFrame: callback => setTimeout(callback, 0),
  cancelAnimationFrame: clearTimeout,
});
const observers = [];
globalThis.ResizeObserver = class { constructor(callback) { observers.push(callback); } observe() {} disconnect() {} };
const desktop = { matches: true, addEventListener() {}, removeEventListener() {} };
const reduced = { ...desktop, matches: false };
window.matchMedia = query => query.includes('pointer: fine') ? desktop : reduced;
Object.defineProperty(window, 'innerHeight', { writable: true, value: 900 });
const start = 904;
let scrollY = 0;
Object.defineProperty(window, 'scrollY', { get: () => scrollY });
let pageWrites = 0;
window.scrollTo = ({ top }) => { pageWrites++; scrollY = top; };
const children = el => [...el.querySelectorAll('[data-project-slide]')];
Object.defineProperties(window.HTMLElement.prototype, {
  clientWidth: { get() { return 1000; } },
  scrollWidth: { get() { return Math.max(1000, children(this).length * 320); } },
  offsetWidth: { get() { return 300; } },
  offsetHeight: { get() { return this.classList.contains('site-header') ? 80 : 590; } },
  offsetLeft: { get() { return [...this.parentElement.children].indexOf(this) * 320; } },
});
window.HTMLElement.prototype.getBoundingClientRect = function () {
  if (this.id === 'projetos') return { top: 1000 - scrollY };
  return { height: this.classList.contains('projects-pin') ? 590 : 80 };
};
let nativeDirect;
window.HTMLElement.prototype.scrollIntoView = function () { nativeDirect = this.dataset.projectId; };
await import('../src/i18n/index.js');
const root = createRoot(document.getElementById('root'));
await act(async () => root.render(<ProjectsScrollSection />));
const section = document.getElementById('projetos');
const track = section.querySelector('[data-projects-track]');
const ids = () => children(track).map(node => node.dataset.projectId);
const renderFrame = () => new Promise(resolve => setTimeout(resolve, 15));
async function scroll(top) {
  window.scrollTo({ top });
  window.dispatchEvent(new window.Event('scroll'));
  await renderFrame();
}
const run = track.scrollWidth - track.clientWidth;
assert.equal(section.dataset.pinned, 'true');
assert.equal(parseFloat(section.style.height), 590 + run);
assert.deepEqual(ids().slice(0, 3), ['portfolio', 'car-rental', 'geosolar']);
assert.equal(new Set(ids()).size, ids().length);
await scroll(start);
assert.equal(track.scrollLeft, 0);
await scroll(start - 32);
section.querySelector('[data-project-step="-1"]').click();
assert.equal(window.scrollY, start - 32, 'disabled previous does not pull the page into the pin');
await scroll(start + run);
assert.equal(track.scrollLeft, run);
assert.equal(section.querySelector('.projects-scroll-progress span').style.transform, 'scaleX(1)');
await scroll(start + run + 60);
assert.equal(track.scrollLeft, run);
section.querySelector('[data-project-step="1"]').click();
assert.equal(window.scrollY, start + run + 60, 'disabled next does not pull the page back to the pin');
track.scrollLeft = run - 100;
const beforeTrackScroll = pageWrites;
track.dispatchEvent(new window.Event('scroll'));
await renderFrame();
assert.equal(track.scrollLeft, run, 'a track-only scroll is reconciled to the pinned page position');
assert.equal(pageWrites, beforeTrackScroll, 'reconciling track movement does not move the page');
assert.ok(section.getBoundingClientRect().top + parseFloat(section.style.height) < 96 + 590, 'the stage can leave the viewport when the run is over');
await scroll(start + run / 2);
assert.equal(track.scrollLeft, run / 2, 'reverse document scroll moves the rail backward');
for (let pass = 0; pass < 4; pass++) {
  await scroll(start + run + 20);
  const writes = pageWrites;
  observers.forEach(callback => callback());
  await renderFrame();
  assert.equal(pageWrites, writes, 'passive measurement at the exit must never move the page');
  assert.equal(track.scrollLeft, run);
  await scroll(start + run - 20);
  assert.equal(track.scrollLeft, run - 20);
}
const key = name => track.dispatchEvent(new window.KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));
key('End');
assert.equal(window.scrollY, start + run);
key('Home');
assert.equal(window.scrollY, start);
const filter = label => [...section.querySelectorAll('.project-filter')].find(button => button.textContent === label);
const game = filter('Jogos') || filter('Games');
await act(async () => game.click());
assert.deepEqual(ids(), ['snakepy']);
assert.equal(track.scrollLeft, 0);
assert.equal(section.dataset.pinned, 'false');
assert.equal(section.style.height, '');
assert.equal(game.getAttribute('aria-pressed'), 'true');

await act(async () => root.render(<ProjectsScrollSection projectFocus={{ project: 'academia' }} />));
await renderFrame();
assert.equal(document.activeElement, section.querySelector('[data-project-id="academia"] h4'));
assert.equal(game.getAttribute('aria-pressed'), 'false');
assert.ok(window.scrollY > start);
const oldLeft = track.scrollLeft;
window.innerHeight = 560;
window.dispatchEvent(new window.Event('resize'));
await renderFrame();
assert.equal(section.dataset.pinned, 'true', 'short desktop screens retain the mandatory horizontal pin');
assert.equal(track.scrollLeft, oldLeft);
desktop.matches = false;
window.dispatchEvent(new window.Event('resize'));
await renderFrame();
assert.equal(section.dataset.pinned, 'false');
const oldY = window.scrollY;
key('End');
assert.equal(window.scrollY, oldY, 'keyboard controls in native mode only scroll the rail');
assert.equal(track.scrollLeft, run);
window.innerHeight = 900;
desktop.matches = true;
reduced.matches = true;
window.dispatchEvent(new window.Event('resize'));
await renderFrame();
assert.equal(section.dataset.pinned, 'false');

await act(async () => root.render(<ProjectsScrollSection projectFocus={{ project: 'oficina-java' }} />));
await renderFrame();
assert.equal(nativeDirect, 'oficina-java');
assert.equal(track.scrollLeft, run);

const first = section.querySelector('[data-project-id="portfolio"]');
const techButton = first.querySelector('.project-tech-toggle');
assert.equal(first.querySelectorAll('ul li').length, 3);
await act(async () => techButton.click());
assert.equal(techButton.getAttribute('aria-expanded'), 'true');
assert.ok(first.querySelectorAll('ul li').length > 3);
const descriptionButton = first.querySelector('.project-description-toggle');
assert.equal(descriptionButton.getAttribute('aria-expanded'), 'false');
await act(async () => descriptionButton.click());
assert.equal(descriptionButton.getAttribute('aria-expanded'), 'true');
assert.equal(document.getElementById(descriptionButton.getAttribute('aria-controls').split(' ')[0]).dataset.summary, undefined);
await act(async () => root.unmount());
dom.window.close();
