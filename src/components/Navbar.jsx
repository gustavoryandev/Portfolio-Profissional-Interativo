import { useContext } from 'react';
import { useAstra } from '../context/AstraContext';
import { ThemeContext } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Download, Sparkles } from 'lucide-react';
import ThemeSelector from './ThemeSelector';
import GaloCrest from './GaloCrest';
import { isGaloTheme } from '../data/themes.js';
import { PORTFOLIO_SECTIONS as portfolioLinks } from '../services/portfolioActions';
export { portfolioLinks };

export default function Navbar({ portfolio = false, activeSection }) {
  const { openFull, returnPortfolio } = useAstra();
  const galo = isGaloTheme(useContext(ThemeContext)?.theme);
  const { i18n } = useTranslation();
  const en = i18n.language.startsWith('en');
  return <header className="site-header sticky top-0 z-40 bg-white bg-opacity-70 backdrop-blur-lg dark:bg-zinc-950 dark:bg-opacity-70">
    <a href={portfolio ? '#inicio' : '/'} onClick={portfolio ? undefined : returnPortfolio} className="brand-lockup" aria-label={en ? 'Gustavo Ryan — portfolio' : 'Gustavo Ryan — portfólio'}>
      {portfolio && galo ? <svg className="galo-monogram" viewBox="0 0 48 40" aria-hidden="true"><path fill="currentColor" d="M16 7h17l-5 6H16c-4 0-7 3-7 7s3 6 7 6h6l-5-7h7l10 13H16C8 32 3 27 3 20S9 7 16 7Zm10 9h11c5 0 8 3 8 7 0 4-3 7-7 8l5 9h-7l-8-14h9a2 2 0 1 0 0-4h-7Z" /></svg> : <span className="brand-logo" aria-hidden="true" />}
      <div><p className="brand-title">Gustavo Ryan</p><p>{portfolio ? (en ? 'Software Engineering' : 'Engenharia de Software') : (en ? '← Back to portfolio' : '← Voltar ao portfólio')}</p></div>
      {portfolio && galo && <span className="galo-brand-badge"><GaloCrest /></span>}
    </a>
    {portfolio && <nav className="scroll-nav" aria-label={en ? 'Portfolio sections' : 'Seções do portfólio'}>{portfolioLinks.map(([id, pt, english]) => <a key={id} href={`#${id}`} aria-current={activeSection === id ? 'location' : undefined}>{en ? english : pt}</a>)}<a href="/chat" onClick={openFull} className="nav-astra">Astra <Sparkles size={14} aria-hidden="true" /></a></nav>}
    <HeaderActions />
  </header>;
}

export function HeaderActions() {
  const { i18n, t } = useTranslation();
  const en = i18n.language.startsWith('en');
  const cv = en ? '/Gustavo Ryan Resume (English).pdf' : '/Currículo Gustavo Ryan.pdf';
  return (
    <div className="header-actions">
      <div className="language-switch" aria-label={en ? 'Language' : 'Idioma'}>{['pt', 'en'].map(lang => <button key={lang} aria-pressed={i18n.language.startsWith(lang)} onClick={() => i18n.changeLanguage(lang)}>{lang.toUpperCase()}</button>)}</div>
      <ThemeSelector />
      <a className="cv-link" href={cv} download aria-label={t('navbar.baixarCv')}><Download size={16} /><span>{t('navbar.baixarCv')}</span></a>
    </div>
  );
}
