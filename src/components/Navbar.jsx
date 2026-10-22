import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';
import { Sun, Moon, Download, Globe } from 'lucide-react';

export default function Navbar() {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const { i18n, t } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-6 py-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-white">
          Gustavo Ryan<span className="text-amber-400">.ai</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Seletor de Idioma */}
        <div className="flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900 p-1 text-xs font-medium">
          <Globe className="ml-1 h-3.5 w-3.5 text-zinc-500" />
          <button
            onClick={() => changeLanguage('pt')}
            className={`px-2 py-1 rounded transition-colors ${
              i18n.language.startsWith('pt')
                ? 'bg-amber-500 text-zinc-950 shadow-sm font-semibold'
                : 'text-zinc-500 hover:text-amber-400'
            }`}
          >
            PT
          </button>
          <button
            onClick={() => changeLanguage('en')}
            className={`px-2 py-1 rounded transition-colors ${
              i18n.language.startsWith('en')
                ? 'bg-amber-500 text-zinc-950 shadow-sm font-semibold'
                : 'text-zinc-500 hover:text-amber-400'
            }`}
          >
            EN
          </button>
        </div>

        {/* Alternar Tema */}
        <button
          onClick={toggleTheme}
          className="rounded-full border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 transition-colors hover:text-amber-400"
          title={darkMode ? t('navbar.temaClaro') : t('navbar.temaEscuro')}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Download do CV */}
        <a
          href="/cv-gustavo.pdf"
          download="cv-gustavo.pdf"
          className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-zinc-950 transition-colors hover:bg-amber-400"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t('navbar.baixarCv')}</span>
        </a>
      </div>
    </header>
  );
}