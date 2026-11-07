import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Download, Sparkles } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

const portfolioLinks = [
  ['inicio', 'Início', 'Home'],
  ['sobre', 'Sobre', 'About'],
  ['projetos', 'Projetos', 'Projects'],
  ['laboratorio', 'Laboratório', 'Code Lab'],
  ['habilidades', 'Habilidades', 'Skills'],
  ['experience', 'Experiência', 'Experience'],
  ['education', 'Formação', 'Education'],
  ['contato', 'Contato', 'Contact'],
];

export default function Navbar({ portfolio = false }) {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const { i18n, t } = useTranslation();
  const en = i18n.language.startsWith('en');
  const cv = en ? '/Gustavo Ryan Resume (English).pdf' : '/Currículo Gustavo Ryan.pdf';
  return <header className="site-header sticky top-0 z-40 bg-white bg-opacity-70 backdrop-blur-lg dark:bg-zinc-950 dark:bg-opacity-70">
    <a href={portfolio ? '#inicio' : '/'} className="brand-lockup" aria-label={en ? 'Gustavo Ryan — portfolio' : 'Gustavo Ryan — portfólio'}><span className="brand-logo" aria-hidden="true" /><div><p className="brand-title">Gustavo Ryan</p><p>{portfolio ? (en ? 'Software Engineering' : 'Engenharia de Software') : (en ? '← Back to portfolio' : '← Voltar ao portfólio')}</p></div></a>
    {portfolio && <nav className="scroll-nav" aria-label={en ? 'Portfolio sections' : 'Seções do portfólio'}>{portfolioLinks.map(([id, pt, english]) => <a key={id} href={`#${id}`}>{en ? english : pt}</a>)}<a href="/chat" className="nav-astra">Astra <Sparkles size={14} aria-hidden="true" /></a></nav>}
    <div className="header-actions">
      <div className="language-switch" aria-label={en ? 'Language' : 'Idioma'}>{['pt', 'en'].map(lang => <button key={lang} aria-pressed={i18n.language.startsWith(lang)} onClick={() => i18n.changeLanguage(lang)}>{lang.toUpperCase()}</button>)}</div>
      <button className="icon-button" onClick={toggleTheme} aria-label={darkMode ? t('navbar.temaClaro') : t('navbar.temaEscuro')}>{darkMode ? <Sun size={19} /> : <Moon size={19} />}</button>
      <a className="cv-link" href={cv} download><Download size={16} /><span>{t('navbar.baixarCv')}</span></a>
    </div>
  </header>;
}
