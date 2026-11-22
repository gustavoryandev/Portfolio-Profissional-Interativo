import assert from 'node:assert/strict';
import React, { act } from 'react';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/chat', pretendToBeVisual: true });
const { window } = dom;
const { document } = window;
Object.assign(globalThis, { window, document, HTMLElement: window.HTMLElement, MutationObserver: window.MutationObserver,
  requestAnimationFrame: window.requestAnimationFrame.bind(window), cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
  IS_REACT_ACT_ENVIRONMENT: true });
window.localStorage.setItem('astra-intro-seen', '1'); // Left by a previous visit.
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: window.localStorage });
window.sessionStorage.setItem('astra-intro-seen', '1');
let reducedMotion = true;
window.matchMedia = query => ({ matches: (reducedMotion && query.includes('prefers-reduced-motion')) || query.includes('pointer: coarse'),
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
window.scrollTo = () => {};
window.HTMLElement.prototype.scrollTo = () => {};
const sectionScrolls = [];
window.HTMLElement.prototype.scrollIntoView = function ({ behavior } = {}) { sectionScrolls.push([this.id, behavior]); };
window.HTMLElement.prototype.hidePopover = () => {};
window.HTMLDialogElement.prototype.showModal = window.HTMLDialogElement.prototype.show = function () { this.open = true; };
window.HTMLDialogElement.prototype.close = function () { this.open = false; };
const anthemEvents = [];
window.Audio = class {
  paused = true;
  constructor(src) { this.src = src; }
  play() {
    this.paused = false;
    anthemEvents.push(['play', this.src]);
    this.onplay?.();
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
    anthemEvents.push(['pause']);
    this.onpause?.();
  }
};
globalThis.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
globalThis.ResizeObserver = class {
  constructor(callback) { this.callback = callback; }
  observe(element) {
    if (element.closest('[aria-label="Chess game with Astra"]')) this.callback([{ contentRect: { width: 480 } }]);
  }
  unobserve() {}
  disconnect() {}
};

const requests = [];
const workers = [];
let canvasStarts = 0;
window.HTMLCanvasElement.prototype.getContext = function () {
  canvasStarts++;
  return new Proxy({}, { get: () => () => {} });
};
globalThis.Worker = class {
  constructor(url) { this.url = url; workers.push(this); }
  postMessage({ code }) { this.code = code; }
  terminate() {}
};
globalThis.fetch = async (_url, options) => {
  const body = JSON.parse(options.body);
  if (body.action === 'models') return Response.json({ models: ['fixture'] });
  requests.push(body);
  if (body.userMessage === 'Open Full Astra') return Response.json({ actions: [{ type: 'astra.openFull' }] });
  if (body.userMessage === 'Which version of Astra am I using?') return Response.json({ translationKey: `chat.surface.${body.surface}` });
  if (body.userMessage === 'Show me WakaTime and the projects') return Response.json({
    response: 'Here are the metrics and projects.\n[WAKATIME_CARD]\n[PROJECTS_CARD]',
    liveContext: { wakatime: { status: 'ok', week: { totalFormatted: '2h 30m' } } },
  });
  if (body.userMessage === 'Thanks') return Response.json({ response: 'You’re welcome.' });
  if (body.userMessage.startsWith('Which part of ')) return Response.json({ response: 'Here is Gustavo’s contribution.' });
  if (body.userMessage === 'Como foi o último jogo do Galo?') {
    return Response.json({ response: 'O último jogo do Galo terminou Atlético-MG 2 × 0 Cruzeiro.' });
  }
  if (body.userMessage === 'Show a code example') return Response.json({ response: '```js\nconsole.log("[CHESS_GAME]");\n```' });
  if (body.userMessage === 'Can we play?') return Response.json({
    response: 'Would you like to play a game of chess with me?', translationKey: 'chat.chessGame.offer',
  });
  if (body.userMessage === 'ss') return Response.json({ response: 'Let’s play!\n[CHESS_GAME]' });
  if (body.labSnapshot) return Response.json({ actions: [
    { type: 'lab.edit', edits: [{ find: 'aluno = "Carlos"', replace: 'aluno = "Ana"' }] },
  ] });
  if (body.surface === 'full') return Response.json({ actions: [
    { type: 'navigate', target: 'laboratorio' }, { type: 'lab.language', target: 'python' },
    { type: 'lab.example', target: 'bro-fit' }, { type: 'lab.read', target: 'code' },
  ] });
  return Response.json({ actions: [{ type: 'lab.run' }] });
};

const { createRoot } = await import('react-dom/client');
const { default: App } = await import('../src/App');
const { ThemeProvider } = await import('../src/context/ThemeContext');
const { default: i18n } = await import('../src/i18n/index');
await i18n.changeLanguage('en');
const root = createRoot(document.getElementById('root'));
let activeRoot = root;
const $ = selector => document.querySelector(selector);
const click = node => act(async () => node.click());
const clickDialog = (node, clientX, clientY) => act(async () => {
  node.dispatchEvent(new window.MouseEvent('click', { bubbles: true, clientX, clientY }));
});
const findButton = (parent, label) => [...parent.querySelectorAll('button')].find(button => button.textContent.trim() === label);
async function until(predicate) {
  for (let i = 0; i < 30 && !predicate(); i++) await act(async () => { await new Promise(resolve => setTimeout(resolve, 12)); });
  assert.ok(predicate(), 'expected the UI to reach the requested state');
}
async function send(text) {
  const input = $('#chat-input');
  await act(async () => {
    Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value').set.call(input, text);
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
  });
  assert.equal(input.value, text);
  const button = $('.chat-form button[type="submit"]');
  assert.equal(button.disabled, false);
  await click(button);
}
try {
  await act(async () => root.render(<ThemeProvider><App /></ThemeProvider>));
  assert.ok($('.astra-entrance'), 'direct entry shows the intro even with stale storage flags');
  await click($('.astra-entrance a[href="/"]'));
  await until(() => $('.astra-fab'));
  reducedMotion = false;
  await click($('.scroll-nav a[href="#sobre"]'));
  await until(() => document.activeElement?.id === 'sobre');
  assert.equal(window.location.hash, '#sobre');
  assert.deepEqual(sectionScrolls.at(-1), ['sobre', 'smooth']);
  reducedMotion = true;
  await click($('.scroll-nav a[href="#inicio"]'));
  await until(() => document.activeElement?.id === 'inicio');
  assert.deepEqual(sectionScrolls.at(-1), ['inicio', 'instant']);
  const featuredProject = $('[data-project-id="portfolio"]');
  const featuredTitle = featuredProject.querySelector('h4').textContent;
  const askProject = featuredProject.querySelector('.project-ask-astra');
  assert.equal(askProject.getAttribute('aria-label'), `Ask Astra about ${featuredTitle}`);
  assert.ok([...document.querySelectorAll('#projetos [data-project-slide]')].every(slide => slide.querySelector('.project-ask-astra')));
  await click(askProject);
  await until(() => document.activeElement?.id === 'chat-input');
  assert.ok($('.astra-shell-modal').open);
  assert.equal($('#chat-input').value, `What did Gustavo contribute to the ${featuredTitle} project?`);
  assert.equal(requests.length, 0, 'the project shortcut leaves the draft unsent');
  await click($('.astra-toolbar button'));
  assert.equal(document.activeElement, askProject);
  await click($('.astra-fab'));
  assert.equal($('#chat-input').value, `What did Gustavo contribute to the ${featuredTitle} project?`);
  const editedQuestion = `Which part of ${featuredTitle} did Gustavo implement?`;
  await send(editedQuestion);
  assert.equal(requests.at(-1).userMessage, editedQuestion);
  assert.equal(requests.at(-1).surface, 'compact');
  assert.equal($('#chat-input').value, '');
  await click($('.astra-toolbar button'));
  const broFit = $('[data-project-id="academia"]');
  await act(async () => i18n.changeLanguage('pt'));
  await click(broFit.querySelector('.project-ask-astra'));
  assert.equal($('#chat-input').value, `Qual foi a contribuição do Gustavo no projeto ${broFit.querySelector('h4').textContent}?`);
  await send('/help');
  assert.match($('#astra-resource-askProject-description').textContent, /Perguntar à Astra sobre este projeto/);
  await click($('#astra-resource-askProject').closest('button'));
  assert.equal(window.location.hash, '#projetos');
  assert.equal($('.astra-shell-modal').open, false);
  assert.equal(requests.length, 1);
  await act(async () => i18n.changeLanguage('en'));
  await click($('.astra-fab'));
  await until(() => $('.astra-compact #chat-input'));
  assert.equal($('.astra-entrance'), null, 'opening compact Astra does not consume the intro');
  await send('Open Full Astra');
  assert.equal(window.location.pathname, '/chat');
  assert.equal(requests.at(-1).surface, 'compact');
  assert.ok($('.astra-entrance'), 'first Full Astra opening from compact plays the intro');
  await click($('.astra-entrance button'));
  assert.equal($('.astra-entrance'), null);
  // Fresh direct entry in the same tab: both intro and editor state belong to this app load.
  await act(async () => root.unmount());
  requests.length = 0;
  const directRoot = createRoot(document.getElementById('root'));
  activeRoot = directRoot;
  await act(async () => directRoot.render(<ThemeProvider><App /></ThemeProvider>));
  assert.ok($('.astra-entrance'), 'a new app load plays the intro again in the same tab');
  await click($('.astra-entrance button'));
  await until(() => $('.astra-full #chat-input'));
  assert.equal($('#laboratorio'), null, 'direct entry to Full Astra has no mounted Laboratory');
  await send('/help');
  assert.ok($('#astra-resources[open]'));
  assert.ok($('#astra-resource-identifyVersion'));
  assert.match($('#astra-resource-askProject-description').textContent, /Ask Astra about this project/);
  assert.equal($('#astra-resource-openFullVersion'), null);
  assert.ok($('#astra-resource-labAnalyze'));
  assert.ok($('#astra-resource-chessGame'), 'full Astra keeps its existing integrations');
  assert.equal(requests.length, 0, '/help stays local');
  await click($('#astra-resource-theme').closest('button'));
  assert.equal(document.documentElement.dataset.theme, 'aurora');
  assert.equal($('#astra-resources').open, false);
  assert.equal(requests.length, 0, 'a fixed shortcut does not require the model');
  await send('/help');
  await click($('#astra-resource-designSystem').closest('button'));
  await until(() => $('.astra-full .ds-card'));
  assert.equal($('#astra-resources').open, false);
  assert.match($('.ds-card').textContent, /Portfolio Design System/);
  assert.match($('.ds-theme').textContent, /Aurora/);
  assert.equal(requests.length, 0, 'the Design System shortcut stays local');
  await send('Open the Laboratory, select Python, load Bro Fit and rename the student to Ana.');
  await until(() => $('#laboratorio .lab-review'));
  assert.equal(window.location.hash, '#laboratorio');
  assert.match($('#playground-code').value, /aluno = "Carlos"/);
  assert.equal(requests[0].labSnapshot, undefined);
  assert.match(requests[1].labSnapshot.code, /aluno = "Carlos"/);
  await click(findButton($('#laboratorio .lab-review'), 'Apply changes'));
  assert.match($('#playground-code').value, /aluno = "Ana"/);
  assert.equal(workers.length, 0);
  await click($('.astra-fab'));
  await until(() => $('.astra-compact #chat-input'));
  const editMessage = $('.astra-compact .lab-review-status').closest('.chat-msg-in');
  assert.match(editMessage.textContent, /Change applied to the editor/);
  await send('/HELP');
  assert.ok($('.astra-compact #astra-resources[open]'));
  assert.ok($('#astra-resource-metrics'));
  assert.equal($('#astra-resource-chessGame'), null);
  assert.ok($('#astra-resource-openFullVersion'));
  assert.match($('#astra-resources[open]').textContent, /open the same reply/);
  await click($('#astra-resource-identifyVersion').closest('button'));
  assert.equal(requests.at(-1).surface, 'compact');
  assert.match($('.astra-compact [role="log"]').textContent, /You’re in Compact Astra/);
  const beforeHelp = requests.length;
  await send('/help');
  await click($('#astra-resource-labRun').closest('button'));
  await until(() => $('.astra-compact .lab-review'));
  const runMessage = $('.astra-compact .lab-review').closest('.chat-msg-in');
  assert.notEqual(runMessage, editMessage);
  assert.ok($('.astra-compact .lab-review a[href="/chat"]'));
  assert.equal(requests.length, beforeHelp);
  assert.equal(workers.length, 0, 'the run shortcut still requires approval');
  await send('/ds');
  await until(() => $('.astra-compact .ds-card'));
  assert.equal(requests.length, beforeHelp, 'the typed Design System command stays local');
  await click(findButton($('.astra-compact .lab-review'), 'Run code'));
  assert.equal(workers.length, 1);
  assert.match(workers[0].code, /aluno = "Ana"/);
  await send('Show me WakaTime and the projects');
  const cardMessage = [...document.querySelectorAll('.astra-compact .chat-msg-in')].find(node => node.textContent.includes('Here are the metrics and projects.'));
  assert.match(cardMessage.textContent, /2h 30m/);
  assert.equal(cardMessage.querySelectorAll('a[href="/chat"]').length, 1, 'one switch link for a reply with multiple cards');
  await send('Thanks');
  const plainMessage = [...document.querySelectorAll('.astra-compact .chat-msg-in')].find(node => node.textContent.includes('You’re welcome.'));
  assert.equal(plainMessage.querySelector('a[href="/chat"]'), null);
  assert.equal(plainMessage.querySelector('.lab-review-status'), null);
  assert.match(editMessage.textContent, /Change applied to the editor/);
  assert.match(runMessage.textContent, /Run approved/);
  await click(cardMessage.querySelector('a[href="/chat"]'));
  await until(() => $('.astra-full #chat-input'));
  await until(() => document.activeElement === cardMessage);
  assert.equal(cardMessage.querySelector('a[href="/chat"]'), null);
  assert.ok(cardMessage.querySelector('.project-tile'), 'the same reply now shows the full project card');
  assert.equal($('.astra-entrance'), null, 'returning to Full Astra during the same visit skips the intro');
  await act(async () => workers[0].onmessage({ data: { type: 'done', output: 'BRO FIT | Ficha de Ana' } }));
  assert.match($('.astra-full [role="log"]').textContent, /rename the student to Ana/);
  const historyLength = window.history.length;
  await send('Open Full Astra');
  assert.equal(requests.at(-1).surface, 'full');
  assert.match($('.astra-full [role="log"]').textContent, /already in Full Astra/);
  assert.equal(window.history.length, historyLength);
  assert.ok($('.astra-full .astra-resources-trigger'));
  await click(findButton(runMessage, 'Open Laboratory'));
  await until(() => window.location.hash === '#laboratorio');
  assert.match($('#playground-code').value, /aluno = "Ana"/);
  assert.match($('.code-lab-output pre').textContent, /Ficha de Ana/);
  await click($('.astra-fab'));
  await send('/help');
  const beforeShortcut = requests.length;
  await click($('#astra-resource-openFullVersion').closest('button'));
  assert.equal(window.location.pathname, '/chat');
  assert.equal(requests.length, beforeShortcut, 'switch shortcut uses the shared action without a model request');
  assert.match($('.astra-full [role="log"]').textContent, /Full Astra is open/);
  await send('/help');
  await click($('#astra-resource-identifyVersion').closest('button'));
  assert.equal(requests.at(-1).surface, 'full');
  assert.match($('.astra-full [role="log"]').textContent, /You’re in Full Astra/);

  const fullInput = $('#chat-input');
  await act(async () => { fullInput.focus(); fullInput.click(); });
  assert.equal($('#astra-resources').open, false, 'clicking outside the desktop Help panel closes it');
  assert.equal(document.activeElement, fullInput, 'the clicked control keeps focus');

  await click($('.astra-full .brand-lockup'));
  await click($('.astra-fab'));
  const compactInput = $('#chat-input');
  $('.chat-form button[type="submit"]').focus();
  await send('Thanks');
  assert.equal(document.activeElement, compactInput, 'sending from Compact Astra returns focus to the composer');

  const shell = $('.astra-shell-modal');
  const help = $('#astra-resources');
  for (const dialog of [shell, help]) dialog.getBoundingClientRect = () => ({ left: 100, right: 500, top: 50, bottom: 500 });
  await send('/help');
  await clickDialog(help, 200, 100);
  assert.equal(help.open, true, 'a click inside Help does not dismiss it');
  await clickDialog(help, 20, 100);
  assert.equal(help.open, false, 'the Help backdrop dismisses only Help');
  assert.equal(shell.open, true);
  await clickDialog(shell, 200, 100);
  assert.equal(shell.open, true, 'a click inside the Compact Astra panel leaves it open');
  await clickDialog(shell, 20, 100);
  assert.equal(shell.open, false, 'the Compact Astra backdrop returns to the portfolio');
  assert.equal(document.activeElement, $('.astra-fab'));
  await click($('.astra-fab'));

  await send('Show a code example');
  assert.equal(window.location.pathname, '/', 'markers in code do not open Full Astra');
  assert.match($('.astra-compact [role="log"] pre').textContent, /\[CHESS_GAME\]/);
  await send('Can we play?');
  assert.equal(window.location.pathname, '/');
  assert.match($('.astra-compact [role="log"]').textContent, /Would you like to play a game of chess/);
  await send('ss');
  assert.equal(window.location.pathname, '/', 'confirming chess keeps the visitor in Compact Astra');
  assert.equal(requests.at(-1).surface, 'compact');
  const gameMessage = [...document.querySelectorAll('.astra-compact .chat-msg-in')]
    .find(node => node.textContent.includes('This resource can only be shown in Full Astra.'));
  assert.ok(gameMessage, 'the compact reply explains why the card is unavailable');
  assert.equal(gameMessage.querySelector('[data-square="a1"]'), null);
  const random = Math.random;
  try {
    Math.random = () => 0;
    await click(gameMessage.querySelector('a[href="/chat"]'));
    await until(() => gameMessage.querySelector('[data-square="a1"]'));
  } finally { Math.random = random; }
  assert.equal(window.location.pathname, '/chat');
  assert.doesNotMatch(gameMessage.textContent, /This resource can only be shown in Full Astra/);
  await until(() => document.activeElement === gameMessage);

  await click($('.astra-full .brand-lockup'));
  await click($('.astra-fab'));
  const beforeArcade = requests.length;
  const beforeCanvas = canvasStarts;
  await send('/help');
  const arcadeHelp = $('section[aria-labelledby="astra-resources-arcade"]');
  assert.ok(arcadeHelp.querySelector('#astra-resource-arcadeBrowse'));
  assert.equal(arcadeHelp.querySelector('#astra-resource-arcadeOpen'), null);
  assert.equal(arcadeHelp.querySelectorAll('button').length, 7);
  await click($('#astra-resource-arcade-snake').closest('button'));
  const handoff = $('.astra-compact a[href="/chat?arcade=snake"]');
  assert.ok(handoff);
  assert.match($('.astra-compact [role="log"]').textContent, /Each pickup is worth 10 points/);
  assert.equal($('.arcade'), null);
  assert.equal(canvasStarts, beforeCanvas, 'the compact request does not initialize a game canvas');
  await send('/help');
  await click($('#astra-resource-arcadeRecords').closest('button'));
  assert.match($('.astra-compact [role="log"]').textContent, /Personal bests saved in this browser/);
  await click(handoff);
  await until(() => $('.arcade-board canvas'));
  assert.ok($('.astra-full .arcade canvas'));
  assert.equal(window.location.pathname, '/chat');
  await send('Pause the game');
  assert.match($('.arcade-overlay').textContent, /Paused/);
  await send('Resume');
  assert.equal($('.arcade-overlay'), null);
  await send('Increase the difficulty');
  await until(() => $('.arcade-game-header .arcade-difficulty-trigger')?.textContent === 'Hard' && $('.arcade-board canvas'));
  await send('Show game status');
  assert.match($('.astra-full [role="log"]').textContent, /Snake · Playing/);
  await click(findButton($('.arcade-game-actions'), 'Controls'));
  assert.match($('#arcade-game-help').textContent, /cannot reverse direction/);
  await click(findButton($('#arcade-game-help'), 'Close instructions'));
  assert.match($('.arcade-overlay').textContent, /Paused/);
  await send('/help');
  await click($('#astra-resource-arcadeOpen').closest('button'));
  assert.equal(requests.length, beforeArcade, 'arcade commands use local game state without the model');
  assert.equal($('.arcade').dataset.visual, 'classic');
  await click($('.arcade-toolbar [aria-label="Game appearance"]'));
  await click(findButton($('.arcade-toolbar [role="menu"]'), 'Astra Theme'));
  assert.equal($('.arcade').dataset.visual, 'astra');
  assert.equal(window.localStorage.getItem('astra-arcade-visual'), 'astra');
  await click($('.arcade-hero .arcade-difficulty-trigger'));
  await click($('.arcade-hero [data-preview="easy"]'));
  assert.equal($('.arcade-hero .arcade-difficulty-trigger').textContent, 'Easy');
  for (const [name, rule] of [
    ['Pong', /left paddle/], ['Frogger', /resets the timer/],
    ['Pulse Maze', /four sentinels/], ['Orbit Blocks', /once per piece/],
  ]) {
    await click($(`button[aria-label="Play ${name}"]`));
    await until(() => $('.arcade-board canvas')?.getAttribute('aria-label')?.startsWith(name));
    if (name === 'Orbit Blocks') {
      await click($('button[aria-label="Drop"]'));
      const score = () => Number($('.arcade-hud b').textContent);
      const touchScore = score();
      assert.ok(touchScore > 0, 'mobile drop button changes the real score');
      await act(async () => $('.arcade-board canvas').dispatchEvent(new window.KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true })));
      assert.ok(score() > touchScore, 'keyboard hard drop changes the real score');
      await act(async () => window.dispatchEvent(new window.Event('blur')));
      assert.match($('.arcade-overlay').textContent, /Paused/);
    }
    await click(findButton($('.arcade-game-actions'), 'Controls'));
    assert.match($('#arcade-game-help').textContent, rule);
    await click(findButton($('.arcade-game-header'), 'Games'));
  }
  const themeTrigger = $('.astra-full .header-actions button[aria-haspopup]');
  const { themes } = await import('../src/data/themes.js');
  for (const theme of themes) {
    await click(themeTrigger);
    const option = $(`.astra-full [data-preview="${theme.id}"]`);
    const moreThemes = $('.astra-full .option-menu-disclosure');
    assert.equal(moreThemes.getAttribute('aria-expanded'), 'false');
    if (theme.name) {
      assert.ok(option.closest('[hidden]'));
      await click(moreThemes);
      assert.equal(moreThemes.getAttribute('aria-expanded'), 'true');
      assert.equal(option.closest('[hidden]'), null);
    }
    await click(option);
    assert.equal(document.documentElement.dataset.theme, theme.id);
    assert.equal(document.querySelectorAll('.arcade-card').length, 5);
    if (theme.id === 'rick-morty') {
      const arcade = $('.arcade');
      const log = $('.astra-full [role="log"]');
      const portal = $('.astra-full .dimension-portal');
      assert.ok(portal);
      assert.match($('.astra-full .chat-heading h2').textContent, /Squanchy/);
      assert.equal($('.astra-full .chat-heading img').dataset.astraCharacter, 'squanchy');
      assert.equal($('.astra-fab img').dataset.astraCharacter, 'meeseeks');
      const details = $('.dimension-project-details');
      const projectCard = details.closest('.project-tile');
      await click(details.querySelector('summary'));
      await until(() => details.open);
      assert.equal(projectCard.querySelector('.project-morty').dataset.expanded, 'true');
      await click($('.meeseeks-box'));
      assert.ok($('.meeseeks-visitor'));
      await act(async () => i18n.changeLanguage('pt'));
      assert.match($('.dimension-astra-signal').textContent, /Procure o portal/);
      assert.match($('.meeseeks-visitor').textContent, /Pronto, achei a saída/);
      assert.equal(projectCard.dataset.dimensionLabel, 'GARAGEM / PESQUISA');
      assert.match($('.dimension-scan-label').textContent, /PORTAL ESTÁVEL/);
      await act(async () => i18n.changeLanguage('en'));
      assert.match($('.dimension-astra-signal').textContent, /Look for the portal/);
      assert.equal(projectCard.dataset.dimensionLabel, 'GARAGE / RESEARCH');
      const pickleStage = $('.lab-pickle-stage');
      await click(pickleStage.querySelector('button'));
      assert.equal(pickleStage.dataset.side, 'right');
      assert.equal(pickleStage.dataset.found, 'true');
      assert.match(pickleStage.querySelector('img').getAttribute('src'), /pickle-rat/);
      const requestsBeforeEggs = requests.length;
      assert.equal($('[data-preview="rick-morty-secret"]'), null, 'secret dimension stays outside the selector');
      await click(portal);
      assert.equal(document.documentElement.dataset.theme, 'rick-morty');
      assert.equal(document.documentElement.dataset.dimension, 'corrupted');
      assert.equal($('.astra-full .chat-heading img').dataset.astraCharacter, 'poopybutthole');
      assert.match($('.astra-full .chat-heading h2').textContent, /Mr. Poopybutthole/);
      await act(async () => i18n.changeLanguage('pt'));
      assert.match($('.astra-full .chat-heading h2').textContent, /Sr. Bunda Cagada/);
      await act(async () => i18n.changeLanguage('en'));
      assert.equal($('.astra-fab img').dataset.astraCharacter, 'meeseeks');
      assert.equal(window.localStorage.getItem('theme'), 'rick-morty');
      assert.equal(window.localStorage.getItem('rick-morty-dimension'), 'corrupted');
      assert.equal($('.arcade'), arcade, 'crossing does not remount the arcade');
      assert.equal($('.astra-full [role="log"]'), log, 'crossing preserves the conversation');
      assert.equal($('.dimension-project-details'), details, 'crossing preserves the open project node');
      assert.ok(details.open, 'the project stays open in the Citadel');
      await click($('.reception-morty'));
      assert.equal($('.reception-morty').getAttribute('aria-pressed'), 'true');
      assert.match($('.citadel-reception').textContent, /Talk directly to Gustavo/);
      assert.match($('.dimension-astra-signal').textContent, /waiting to hear back/);
      await act(async () => i18n.changeLanguage('pt'));
      assert.match($('.dimension-astra-signal').textContent, /processo seletivo/);
      assert.match($('.citadel-reception').textContent, /Fale direto/);
      assert.equal(projectCard.dataset.dimensionLabel, 'CIDADELA / ARQUIVO');
      await act(async () => i18n.changeLanguage('en'));
      assert.equal(requests.length, requestsBeforeEggs, 'easter eggs do not send artificial chat requests');
      await until(() => portal.getAttribute('aria-disabled') === 'false');
      await click(portal);
      assert.equal(document.documentElement.dataset.theme, 'rick-morty');
      assert.equal(window.localStorage.getItem('theme'), 'rick-morty');
      assert.equal(document.documentElement.dataset.dimension, 'lab');
      assert.equal(window.localStorage.getItem('rick-morty-dimension'), 'lab');
      assert.equal($('.arcade'), arcade);
      assert.ok(details.open);
      await click(details.querySelector('summary'));
      await until(() => !details.open);
      assert.equal(projectCard.querySelector('.project-morty').dataset.expanded, 'false');
      await click($('.meeseeks-box'));
      assert.equal($('.meeseeks-visitor'), null);
      assert.equal($('.dimension-intro'), null, 'reduced motion suppresses the intro scenes');
    }
  }
  assert.deepEqual(anthemEvents, [
    ['play', '/hino-do-galo.mp3'],
    ['pause'],
  ]);
  await click(findButton($('.arcade-toolbar'), 'Stats'));
  assert.match($('.arcade-dashboard').textContent, /Orbit Blocks/);
  assert.ok([...Array(window.localStorage.length)].some((_, index) => window.localStorage.key(index).startsWith('astra-arcade-session-v1:')));
  await click($('.astra-full .brand-lockup'));
  assert.equal($('.arcade'), null);

  // Verify PGN before recreating the welcome screen used by shortcut tests.
  window.history.replaceState(null, '', '/chat');
  await act(async () => window.dispatchEvent(new window.PopStateEvent('popstate')));
  await act(async () => i18n.changeLanguage('pt'));
  await until(() => $('.astra-full'));
  const requestsBeforeReplay = requests.length;
  await send('[Event "Local replay"]\n\n1. e4 e5 2. Nf3 Nc6 *');
  await until(() => $('section[aria-label="Análise de partida"] button[aria-pressed]'));
  const replay = $('section[aria-label="Análise de partida"]');
  await click(findButton(replay, '2. Nf3'));
  assert.equal(findButton(replay, '2. Nf3').getAttribute('aria-pressed'), 'true');
  assert.equal(requests.length, requestsBeforeReplay, 'pasted PGN stays in the browser');
  assert.match(replay.textContent, /sem API de IA/);
  assert.equal(findButton(replay, 'Explique este lance'), undefined);
  await click(replay.querySelector('summary'));
  const pgnInput = replay.querySelector('textarea');
  await act(async () => {
    Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set.call(pgnInput, '1. f3 e5 2. g4 Qh4#');
    pgnInput.dispatchEvent(new window.Event('input', { bubbles: true }));
  });
  await click(findButton(replay, 'Carregar partida'));
  await click(findButton(replay, '2... Qh4#'));
  assert.match(replay.textContent, /Qh4# é xeque-mate: o rei adversário está em xeque e não há defesa legal/);
  assert.doesNotMatch(replay.textContent, /FEN|\*\*|API_KEY/);
  await act(async () => i18n.changeLanguage('en'));
  assert.match(replay.textContent, /Qh4# is checkmate/);
  assert.match(replay.textContent, /no AI API/);
  assert.equal(requests.length, requestsBeforeReplay, 'import, move explanations and language changes never request AI');
  await act(async () => i18n.changeLanguage('pt'));

  await act(async () => activeRoot.unmount());
  anthemEvents.length = 0;
  window.history.replaceState(null, '', '/chat');
  document.documentElement.dataset.theme = 'galo';
  await i18n.changeLanguage('pt');
  activeRoot = createRoot(document.getElementById('root'));
  await act(async () => activeRoot.render(<ThemeProvider><App /></ThemeProvider>));
  assert.equal($('.astra-entrance-avatar img').getAttribute('src'), '/astra-avatar-galo.jpg');
  await click($('.astra-entrance button'));
  await until(() => $('.astra-full .astra-hero [role="group"]'));
  assert.match($('.astra-full .astra-hero').textContent, /Fala, Massa!/);
  await click($('.astra-full .header-actions button[aria-haspopup]'));
  assert.match($('.astra-full .option-menu-disclosure').textContent, /Mais temasGalo CAM Dark/);
  await click($('.astra-full .option-menu-disclosure'));
  for (const theme of ['galo', 'galo-light']) {
    assert.match($(`.astra-full [data-preview="${theme}"]`).textContent, /Hino do Galo · Pause no escudo do topo/);
  }
  await click($('.astra-full [data-preview="galo-light"]'));
  assert.equal($('.astra-full .astra-avatar img').getAttribute('src'), '/astra-avatar-galo-light.jpg');
  assert.deepEqual(anthemEvents, [], 'restoring Galo and switching variants does not start the anthem');
  const fullGaloShortcuts = $('.astra-full .astra-hero [role="group"]');
  await click(findButton(fullGaloShortcuts, 'Explorar projetos'));
  await until(() => window.location.hash === '#projetos' && $('.astra-fab'));
  assert.equal($('.astra-fab img').getAttribute('src'), '/astra-avatar-galo-light.jpg');
  const anthemButton = $('.site-header .galo-brand-badge');
  assert.equal(anthemButton.getAttribute('aria-label'), 'Tocar o hino do Galo');
  await click(anthemButton);
  assert.equal(anthemButton.getAttribute('aria-label'), 'Pausar o hino do Galo');
  await click(anthemButton);
  assert.equal(anthemButton.getAttribute('aria-label'), 'Tocar o hino do Galo');
  await click(anthemButton);
  assert.deepEqual(anthemEvents, [['play', '/hino-do-galo.mp3'], ['pause'], ['play', '/hino-do-galo.mp3']]);
  assert.equal(window.location.hash, '#projetos');
  await click($('.astra-fab'));
  await until(() => $('.astra-compact [role="log"] [role="group"]'));
  const compactLog = $('.astra-compact [role="log"]');
  assert.match(compactLog.textContent, /Fala, Massa!/);
  await click(findButton(compactLog, 'Último jogo do Galo'));
  await until(() => compactLog.textContent.includes('Atlético-MG 2 × 0 Cruzeiro'));
  assert.equal(requests.at(-1).predefinedSuggestion, true);
} finally {
  await act(async () => activeRoot.unmount());
  dom.window.close();
}
