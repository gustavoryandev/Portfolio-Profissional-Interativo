import { lazy, Suspense, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PortfolioPage from './pages/PortfolioPage';
import PortfolioIntro from './components/PortfolioIntro';
import AstraEntrance from './components/AstraEntrance';
import { AstraContext } from './context/AstraContext';
import useMobileViewport from './hooks/useMobileViewport';
import { ThemeContext } from './context/ThemeContext';
import { createLaboratory } from './services/laboratory';
import { createAstraActionEngine } from './services/astraActionEngine';
import { clickedDialogBackdrop } from './services/dialogInteraction';
import perfil from './data/perfil.json';

const ChatPage = lazy(() => import('./pages/ChatPage'));
const INTRO_SEEN_KEY = 'astra-intro-seen';
const hasSeenAstraIntro = () => {
  try { return window.sessionStorage.getItem(INTRO_SEEN_KEY) === '1'; } catch { return false; }
};
const projectIds = new Set(perfil.projetos.map(project => project.id));
const readRoute = () => {
  const { pathname, hash, search } = window.location;
  const project = new URLSearchParams(search).get('project');
  return { path: pathname.replace(/\/+$/, '') || '/', section: hash.slice(1),
    project: hash === '#projetos' && projectIds.has(project) ? project : null };
};

export default function App() {
  const { i18n } = useTranslation();
  const en = i18n.language.startsWith('en');
  const [route, setRoute] = useState(readRoute);
  const { path } = route;
  const { setTheme } = useContext(ThemeContext) ?? {};
  const [lab] = useState(createLaboratory);
  const [actions] = useState(() => createAstraActionEngine({ lab, projectIds }));
  const [labHandoff, setLabHandoff] = useState(null);
  const introSeen = useRef(null);
  if (introSeen.current === null) introSeen.current = hasSeenAstraIntro();
  const [entering, setEntering] = useState(() => path === '/chat' && !introSeen.current);
  const [chatReady, setChatReady] = useState(false);
  const [opened, setOpened] = useState(false);
  const [started, setStarted] = useState(path === '/chat');
  const dialog = useMobileViewport();
  const trigger = useRef(null);
  const scroll = useRef(0);
  const full = path === '/chat';
  const showIntro = full && entering;
  const finishIntro = useCallback(() => {
    introSeen.current = true;
    try { window.sessionStorage.setItem(INTRO_SEEN_KEY, '1'); } catch { /* The current page still remembers. */ }
    setEntering(false);
  }, []);
  const portfolioVisited = useRef(!full);
  if (!full) portfolioVisited.current = true;
  const close = () => { dialog.current?.close(); setOpened(false); };
  const syncRoute = useCallback(() => {
    const next = readRoute();
    setRoute(next);
    setEntering(next.path === '/chat' && !introSeen.current);
  }, []);
  const navigate = (url) => {
    if (url !== window.location.pathname + window.location.search + window.location.hash) window.history.pushState({}, '', url);
    syncRoute();
  };
  const openFull = event => {
    event?.preventDefault();
    dialog.current?.close();
    setOpened(false);
    setStarted(true);
    navigate('/chat');
  };
  const trapFocus = event => {
    if (full || event.key !== 'Tab' || event.defaultPrevented || event.target.closest('dialog') !== dialog.current) return;
    const controls = [...dialog.current.querySelectorAll('a[href], button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]')]
      .filter(node => node.getClientRects().length && !node.closest('[hidden]'));
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };
  const openAstra = event => {
    event?.preventDefault();
    trigger.current = event?.currentTarget || document.activeElement;
    scroll.current = window.scrollY;
    setStarted(true);
    setOpened(true);
  };
  useEffect(() => {
    const update = () => { syncRoute(); setOpened(false); };
    window.addEventListener('popstate', update);
    window.addEventListener('hashchange', syncRoute);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener('hashchange', syncRoute);
    };
  }, [syncRoute]);
  useEffect(() => () => lab.destroy(), [lab]);
  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    node.close();
    if (full) { node.show(); setStarted(true); }
    else if (opened) node.showModal();
    if (!opened || full) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
      window.scrollTo({ top: scroll.current, behavior: 'instant' });
      trigger.current?.focus({ preventScroll: true });
    };
  }, [full, opened]);
  useEffect(() => {
    if (!full || showIntro || !chatReady) return;
    if (!window.matchMedia('(pointer: coarse)').matches) document.getElementById('chat-input')?.focus({ preventScroll: true });
  }, [full, showIntro, chatReady]);
  useEffect(() => {
    if (route.path !== '/' || route.project || !route.section) return;
    const frame = requestAnimationFrame(() => {
      const node = document.getElementById(route.section);
      if (!node) return;
      node.scrollIntoView({ behavior: 'instant' });
      if (!node.hasAttribute('tabindex')) node.setAttribute('tabindex', '-1');
      node.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [route]);
  const selectSection = section => {
    if (section === 'full') return openFull();
    const id = ({ projects: 'projetos', skills: 'habilidades', proficiency: 'habilidades', contact: 'contato', about: 'sobre' })[section] || section;
    close();
    navigate('/#' + id);
  };
  const actionUi = {
    navigate: selectSection, setTheme, setLanguage: language => i18n.changeLanguage(language),
    openFull: () => { if (full) return false; openFull(); return true; },
    openProject: id => { close(); navigate('/?project=' + encodeURIComponent(id) + '#projetos'); },
  };
  if (!['/', '/chat'].includes(path)) return <main className="route-loading"><h1>404</h1><a href="/">{en ? 'Back to portfolio' : 'Voltar ao portfólio'}</a></main>;
  return <AstraContext.Provider value={{ lab, actions, labHandoff, setLabHandoff, actionUi,
    openAstra, openFull, returnPortfolio: event => { event.preventDefault(); close(); navigate('/'); } }}>
    <div hidden={full}>{portfolioVisited.current && <PortfolioIntro en={en}><PortfolioPage projectFocus={route.project ? route : null} /></PortfolioIntro>}</div>
    <dialog inert={showIntro} style={showIntro ? { visibility: 'hidden' } : undefined} ref={dialog} role={full ? 'main' : undefined} className={`astra-shell ${full ? 'astra-shell-full' : 'astra-shell-modal'}`} aria-label={en ? 'Astra conversation' : 'Conversa com a Astra'} onCancel={() => setOpened(false)} onKeyDown={trapFocus}
      onClick={event => { if (!full && opened && clickedDialogBackdrop(event)) close(); }}>
      <div className="astra-toolbar" hidden={full}>
        {full ? <a href="/" onClick={event => { event.preventDefault(); close(); navigate('/'); }}>{en ? '← Portfolio' : '← Portfólio'}</a> : <a href="/chat" onClick={openFull}>{en ? 'Open full Astra ↗' : 'Abrir Astra completa ↗'}</a>}
        {!full && <button autoFocus onClick={close} aria-label={en ? 'Close Astra' : 'Fechar Astra'}>✕</button>}
      </div>
      {started && <Suspense fallback={<p className="astra-loading" role="status">{en ? 'Opening Astra…' : 'Abrindo Astra…'}</p>}><ChatPage onReady={setChatReady} modal={!full} visible={full ? !showIntro : opened} onSelectSection={selectSection} /></Suspense>}
    </dialog>
    {showIntro && <AstraEntrance en={en} onFinish={finishIntro} />}
  </AstraContext.Provider>;
}
