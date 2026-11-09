import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PortfolioPage from './pages/PortfolioPage';
import PortfolioIntro from './components/PortfolioIntro';
import AstraEntrance from './components/AstraEntrance';
import { AstraContext } from './context/AstraContext';
import useMobileViewport from './hooks/useMobileViewport';

const ChatPage = lazy(() => import('./pages/ChatPage'));

export default function App() {
  const { i18n } = useTranslation();
  const en = i18n.language.startsWith('en');
  const [path, setPath] = useState(() => window.location.pathname.replace(/\/+$/, '') || '/');
  const [chatReady, setChatReady] = useState(false);
  const [entering, setEntering] = useState(path === '/chat');
  const [opened, setOpened] = useState(false);
  const [started, setStarted] = useState(path === '/chat');
  const dialog = useMobileViewport();
  const trigger = useRef(null);
  const scroll = useRef(0);
  const full = path === '/chat';
  const portfolioVisited = useRef(!full);
  if (!full) portfolioVisited.current = true;
  const close = () => { dialog.current?.close(); setOpened(false); };
  const navigate = (url) => {
    window.history.pushState({}, '', url);
    setPath(window.location.pathname);
  };
  const openFull = event => {
    event?.preventDefault();
    dialog.current?.close();
    setOpened(false);
    setStarted(true);
    setEntering(true);
    navigate('/chat');
  };
  const trapFocus = event => {
    if (full || event.key !== 'Tab') return;
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
    const update = () => { setPath(window.location.pathname); setEntering(window.location.pathname === '/chat'); setOpened(false); };
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);
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
    if (!full || entering || !chatReady || window.matchMedia('(pointer: coarse)').matches) return;
    document.getElementById('chat-input')?.focus({ preventScroll: true });
  }, [full, entering, chatReady]);
  const selectSection = section => {
    if (section === 'full') return openFull();
    const id = ({ projects: 'projetos', skills: 'habilidades', proficiency: 'habilidades', contact: 'contato', about: 'sobre' })[section] || section;
    close();
    navigate('/#' + id);
    requestAnimationFrame(() => {
      const node = document.getElementById(id);
      node?.scrollIntoView({ behavior: 'instant' });
      node?.setAttribute('tabindex', '-1');
      node?.focus({ preventScroll: true });
    });
  };
  if (!['/', '/chat'].includes(path)) return <main className="route-loading"><h1>404</h1><a href="/">{en ? 'Back to portfolio' : 'Voltar ao portfólio'}</a></main>;
  return <AstraContext.Provider value={{ openAstra, openFull, returnPortfolio: event => { event.preventDefault(); close(); navigate('/'); } }}>
    <div hidden={full}>{portfolioVisited.current && <PortfolioIntro en={en}><PortfolioPage /></PortfolioIntro>}</div>
    <dialog inert={full && entering} style={full && entering ? { visibility: 'hidden' } : undefined} ref={dialog} role={full ? 'main' : undefined} className={`astra-shell ${full ? 'astra-shell-full' : 'astra-shell-modal'}`} aria-label={en ? 'Astra conversation' : 'Conversa com a Astra'} onCancel={() => setOpened(false)} onKeyDown={trapFocus}>
      <div className="astra-toolbar" hidden={full}>
        {full ? <a href="/" onClick={event => { event.preventDefault(); close(); navigate('/'); }}>{en ? '← Portfolio' : '← Portfólio'}</a> : <a href="/chat" onClick={openFull}>{en ? 'Open full Astra ↗' : 'Abrir Astra completa ↗'}</a>}
        {!full && <button autoFocus onClick={close} aria-label={en ? 'Close Astra' : 'Fechar Astra'}>✕</button>}
      </div>
      {started && <Suspense fallback={<p role="status">{en ? "Opening Astra…" : "Abrindo Astra…"}</p>}><ChatPage onReady={setChatReady} modal={!full} visible={full || opened} onSelectSection={selectSection} /></Suspense>}
    </dialog>
    {full && entering && <AstraEntrance en={en} ready={chatReady} onFinish={() => setEntering(false)} />}
  </AstraContext.Provider>;
}
