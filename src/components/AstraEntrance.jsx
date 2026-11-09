import { useEffect, useRef } from 'react';
import { useAstra } from '../context/AstraContext';
import './AstraEntrance.css';
import useEntranceInteraction from '../hooks/useEntranceInteraction';

export default function AstraEntrance({ en, onFinish }) {
  const interaction = useEntranceInteraction();
  const { returnPortfolio } = useAstra();
  const skipButton = useRef(null);

  useEffect(() => {
    skipButton.current.focus({ preventScroll: true });
    const timer = setTimeout(onFinish, 1600);
    const skip = event => { if (event.key === 'Escape') onFinish(); };
    window.addEventListener('keydown', skip);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', skip);
    };
  }, [onFinish]);

  return (
    <main {...interaction} className="astra-entrance">
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
      <footer className="astra-entrance-bottom"><a href="/" onClick={returnPortfolio}>← {en ? 'Portfolio' : 'Portfólio'}</a><button ref={skipButton} type="button" onClick={onFinish}>{en ? 'Skip animation' : 'Pular animação'} ↗</button></footer>
    </main>
  );
}
