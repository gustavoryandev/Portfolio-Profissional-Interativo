import { useEffect, useRef, useState } from 'react';
import useEntranceInteraction from '../hooks/useEntranceInteraction';
import PortfolioLogo from './PortfolioLogo';

function shouldPlay() {
  if (new URLSearchParams(window.location.search).get('intro') === '1') return true;
  return Boolean(window.matchMedia) && !window.matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)').matches && !window.location.hash;
}

export default function PortfolioIntro({ children, en }) {
  const interaction = useEntranceInteraction();
  const [playing, setPlaying] = useState(shouldPlay);
  const button = useRef(null);
  const completed = useRef(false);
  useEffect(() => {
    if (!playing) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const finish = () => {
      completed.current = true;
      setPlaying(false);
    };
    const timer = setTimeout(finish, 2200);
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const preference = () => { if (media.matches) finish(); };
    const key = event => { if (event.key === 'Escape') finish(); };
    const skip = button.current;
    skip?.focus();
    skip?.addEventListener('click', finish);
    media.addEventListener('change', preference);
    window.addEventListener('keydown', key);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = previous;
      skip?.removeEventListener('click', finish);
      media.removeEventListener('change', preference);
      window.removeEventListener('keydown', key);
    };
  }, [playing]);
  useEffect(() => {
    if (!playing && completed.current) document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [playing]);
  if (!playing) return children;
  return <div {...interaction} className="portfolio-opening" role="dialog" aria-modal="true" aria-label={en ? 'Gustavo Ryan opening' : 'Abertura Gustavo Ryan'}>
    <div className="opening-glow" aria-hidden="true" />
    <div className="opening-brand"><PortfolioLogo className="opening-monogram" /><p>Gustavo Ryan<span>.ai</span></p><small>{en ? 'ENGINEERING · AI · EXPERIENCE' : 'ENGENHARIA · IA · EXPERIÊNCIA'}</small></div>
    <button ref={button} type="button" className="opening-skip">{en ? 'Skip intro' : 'Pular abertura'} <span aria-hidden="true">↗</span></button>
  </div>;
}
