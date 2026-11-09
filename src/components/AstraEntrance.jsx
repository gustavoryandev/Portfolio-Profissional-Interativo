import { useEffect, useState } from 'react';
import { useAstra } from '../context/AstraContext';
import './AstraEntrance.css';
import useEntranceInteraction from '../hooks/useEntranceInteraction';

const VISITED_KEY = 'astra-visited';
let visitedInPage = false;

export function markAstraVisited() {
  visitedInPage = true;
  try { window.localStorage.setItem(VISITED_KEY, '1'); } catch {}
}

function hasVisitedAstra() {
  if (visitedInPage) return true;
  try { return window.localStorage.getItem(VISITED_KEY) === '1'; } catch { return false; }
}

export default function AstraEntrance({ en, full }) {
  const interaction = useEntranceInteraction();
  const { returnPortfolio } = useAstra();
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    if (!full || hasVisitedAstra()) return;
    // The Suspense fallback unmounts when the chat is ready. Fast loads never reach this timer.
    const timer = setTimeout(() => {
      markAstraVisited();
      setShowIntro(true);
    }, 180);
    return () => clearTimeout(timer);
  }, [full]);

  useEffect(() => {
    if (!showIntro) return;
    const skip = event => { if (event.key === 'Escape') setShowIntro(false); };
    window.addEventListener('keydown', skip);
    return () => window.removeEventListener('keydown', skip);
  }, [showIntro]);

  if (!showIntro) return <p className="astra-loading" role="status">{en ? 'Opening Astra…' : 'Abrindo Astra…'}</p>;
  return (
    <div {...interaction} className="astra-entrance">
      <div className="astra-entrance-grid" aria-hidden="true" />
      <header className="astra-entrance-top"><span>Gustavo Ryan<span>.ai</span></span><span>PORTFOLIO / ASTRA</span></header>
      <div className="astra-entrance-word" aria-hidden="true">ASTRA</div>
      <section className="astra-entrance-panel" aria-labelledby="astra-entrance-title">
        <div className="astra-entrance-avatar"><img src="/astra-avatar.png" alt="" width="80" height="80" /></div>
        <span className="astra-entrance-label">{en ? 'A NEW PERSPECTIVE' : 'UMA NOVA PERSPECTIVA'}</span>
        <h1 id="astra-entrance-title">{en ? 'Meet the mind behind' : 'Conheça as ideias'}<br />{en ? 'the experience.' : 'por trás da experiência.'}</h1>
        <p>{en ? 'Projects, ideas and the journey. Let’s talk.' : 'Projetos, ideias e trajetória. Vamos conversar.'}</p>
        <div className="astra-entrance-status" role="status"><span />{en ? 'Opening your conversation with Astra' : 'Abrindo sua conversa com a Astra'}</div>
        <div className="astra-entrance-line" aria-hidden="true" />
      </section>
      <footer className="astra-entrance-bottom"><a href="/" onClick={returnPortfolio}>← {en ? 'Portfolio' : 'Portfólio'}</a><button type="button" onClick={() => setShowIntro(false)}>{en ? 'Skip animation' : 'Pular animação'} ↗</button></footer>
    </div>
  );
}
