import { useEffect, useRef } from 'react';
import { Home, Code2, Sparkles, Menu, X } from 'lucide-react';
import { HeaderActions, portfolioLinks } from './Navbar';
import { sections } from './Sidebar';

const mobilePortfolioLinks = portfolioLinks.filter(([id]) => id !== 'laboratorio');

export default function MobileNav({ en, active, onSelect }) {
  const dialog = useRef(null);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)');
    const close = () => { if (desktop.matches) dialog.current?.close(); };
    desktop.addEventListener('change', close);
    return () => desktop.removeEventListener('change', close);
  }, []);
  const chat = Boolean(onSelect);
  const target = 'flex min-h-12 min-w-12 flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';
  return <>
    <nav className="mobile-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 gap-3 border-t border-line bg-panel px-4 pt-2 pb-[max(8px,env(safe-area-inset-bottom))]" aria-label={en ? 'Main navigation' : 'Navegação principal'}>
      {chat ? <>
        <button className={target} onClick={() => onSelect('home')} aria-current={active === 'home' ? 'page' : undefined}><Sparkles size={20} aria-hidden="true" />Astra</button>
        <button className={target} onClick={() => onSelect('projects')} aria-current={active === 'projects' ? 'page' : undefined}><Code2 size={20} aria-hidden="true" />{en ? 'Projects' : 'Projetos'}</button>
      </> : <>
        <a className={target} href="/chat"><Sparkles size={20} aria-hidden="true" />Astra</a>
        <a className={target} href="#projetos"><Code2 size={20} aria-hidden="true" />{en ? 'Projects' : 'Projetos'}</a>
      </>}
      <button className={target} onClick={() => dialog.current.showModal()} aria-haspopup="dialog"><Menu size={20} aria-hidden="true" />Menu</button>
    </nav>
    <dialog ref={dialog} className="mobile-menu fixed inset-x-0 bottom-0 top-auto m-0 max-h-[80dvh] w-full max-w-none overflow-y-auto rounded-t-2xl border border-line bg-panel p-5 pb-[max(20px,env(safe-area-inset-bottom))] text-ink" aria-labelledby="mobile-menu-title" onClick={event => { if (event.target === event.currentTarget) dialog.current.close(); }}>
      <div className="mb-4 flex items-center justify-between gap-4"><h2 id="mobile-menu-title" className="text-lg font-semibold">{en ? 'Explore portfolio' : 'Explorar portfólio'}</h2><button autoFocus className={target} aria-label={en ? 'Close menu' : 'Fechar menu'} onClick={() => dialog.current.close()}><X aria-hidden="true" /></button></div>
      <nav className="flex flex-col gap-3" aria-label={en ? 'More sections' : 'Mais seções'}>
        {chat && <a className={target} href="/"><Home size={20} aria-hidden="true" />{en ? 'Portfolio' : 'Portfólio'}</a>}
        {(chat ? sections : mobilePortfolioLinks).map(row => {
          const [id] = row;
          const label = chat ? row[en ? 3 : 2] : row[en ? 2 : 1];
          return chat ? <button key={id} className={target} aria-current={active === id ? 'page' : undefined} onClick={() => { onSelect(id); dialog.current.close(); }}>{label}</button> : <a key={id} className={target} href={`#${id}`} onClick={() => dialog.current.close()}>{label}</a>;
        })}
      </nav>
      <div className="mt-5 border-t border-line pt-5"><HeaderActions /></div>
    </dialog>
  </>;
}
