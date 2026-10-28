import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Download, Sparkles } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

export default function Navbar() {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const { i18n, t } = useTranslation();
  const en = i18n.language.startsWith('en');
  const cv = en ? '/Gustavo Ryan Resume (English).pdf' : '/Currículo Gustavo Ryan.pdf';
  return <header className="site-header">
    <div className="brand-lockup"><img className="brand-logo" src="/logo-astra-ai.png" alt="GR" /><div><h1>{en ? 'Interactive AI Résumé' : 'Currículo IA Interativo'}</h1><p>{en ? 'Conversational Portfolio' : 'Portfólio Conversacional'}</p></div></div>
    <p className="header-tagline">{en ? <>Your knowledge.<br />Your journey.<br />Now in conversation.</> : <>Seu conhecimento.<br />Sua trajetória.<br />Agora em conversa.</>}</p>
    <div className="header-actions">
      <span className="header-tech"><Sparkles size={18} /> IA Gemini · React</span>
      <div className="language-switch" aria-label={en ? 'Language' : 'Idioma'}>{['pt', 'en'].map(lang => <button key={lang} aria-pressed={i18n.language.startsWith(lang)} onClick={() => i18n.changeLanguage(lang)}>{lang.toUpperCase()}</button>)}</div>
      <button className="icon-button" onClick={toggleTheme} aria-label={darkMode ? t('navbar.temaClaro') : t('navbar.temaEscuro')}>{darkMode ? <Sun size={19} /> : <Moon size={19} />}</button>
      <a className="cv-link" href={cv} download><Download size={16} /><span>{t('navbar.baixarCv')}</span></a>
    </div>
  </header>;
}
