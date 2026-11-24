import { resumeUrl } from '../data/resume';
import { RickThemeControls } from './RickThemeMusic';
import { useContext } from 'react';
import { useAstra } from '../context/AstraContext';
import { ThemeContext } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Download, Sparkles } from 'lucide-react';
import ThemeSelector from './ThemeSelector';
import GaloCrest from './GaloCrest';
import { useAssistantPersona } from '../context/AssistantAppearanceContext';
import DimensionPortal from './DimensionPortal';
import PortfolioLogo from './PortfolioLogo';
import { isGaloTheme, isDimensionalTheme } from '../data/themes.js';
import { PORTFOLIO_SECTIONS as portfolioLinks } from '../services/portfolioActions';
export { portfolioLinks };

export default function Navbar({ ref, portfolio = false, activeSection, onSectionLink }) {
  const { openFull, returnPortfolio } = useAstra();
  const { theme, anthemPlaying, toggleAnthem } = useContext(ThemeContext) ?? {};
  const fullPersona = useAssistantPersona('full');
  const galo = isGaloTheme(theme);
  const { i18n, t } = useTranslation();
  const en = i18n.language.startsWith('en');
  const anthemLabel = t(anthemPlaying ? 'navbar.anthem.pause' : 'navbar.anthem.play');
  const sectionLabel = portfolioLinks.find(([id]) => id === activeSection)?.[en ? 2 : 1];
  return <header ref={ref} className="site-header sticky top-0 z-40 bg-white bg-opacity-70 backdrop-blur-lg dark:bg-zinc-950 dark:bg-opacity-70">
    <div className="header-brand">
      <a href={portfolio ? '#inicio' : '/'} onClick={portfolio ? onSectionLink : returnPortfolio} className="brand-lockup" aria-label={en ? 'Gustavo Ryan — portfolio' : 'Gustavo Ryan — portfólio'}>
        <PortfolioLogo />
        <div><p className="brand-title">Gustavo Ryan</p><p>{portfolio ? (en ? 'Software Engineering' : 'Engenharia de Software') : (en ? '← Back to portfolio' : '← Voltar ao portfólio')}</p></div>
      </a>
      {portfolio && galo && <button type="button" className="galo-brand-badge" onClick={toggleAnthem} aria-label={anthemLabel} title={anthemLabel}>
        <GaloCrest />
      </button>}
      {isDimensionalTheme(theme) && <DimensionPortal />}
    </div>
    {portfolio && <nav className="scroll-nav" aria-label={en ? 'Portfolio sections' : 'Seções do portfólio'}>
      {portfolioLinks.map(([id, pt, english]) => (
        <a key={id} href={`#${id}`} onClick={onSectionLink} aria-current={activeSection === id ? 'location' : undefined}>
          {en ? english : pt}
        </a>
      ))}
      <a href="/chat" onClick={openFull} className="nav-astra">{fullPersona?.name ?? 'Astra'} <Sparkles size={14} aria-hidden="true" /></a>
    </nav>}
    {portfolio && sectionLabel && <span className="mobile-current-section">{sectionLabel}</span>}
    {isDimensionalTheme(theme) && <RickThemeControls mobile />}
    <HeaderActions />
  </header>;
}

export function HeaderActions() {
  const { i18n, t } = useTranslation();
  const en = i18n.language.startsWith('en');
  const cv = resumeUrl(i18n.language);
  return (
    <div className="header-actions">
      <div className="language-switch" aria-label={en ? 'Language' : 'Idioma'}>{['pt', 'en'].map(lang => <button key={lang} aria-pressed={i18n.language.startsWith(lang)} onClick={() => i18n.changeLanguage(lang)}>{lang.toUpperCase()}</button>)}</div>
      <RickThemeControls />
      <ThemeSelector />
      <a className="cv-link" href={cv} download aria-label={t('navbar.baixarCv')}><Download size={16} /><span>{t('navbar.baixarCv')}</span></a>
    </div>
  );
}
