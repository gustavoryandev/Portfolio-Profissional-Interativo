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
    <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <span className="font-bold text-lg text-neutral-900 dark:text-white">
          Gustavo Ryan<span className="text-blue-500">.ai</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Seletor de Idioma */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg text-xs font-medium">
          <Globe className="w-3.5 h-3.5 ml-1 text-neutral-500" />
          <button
            onClick={() => changeLanguage('pt')}
            className={`px-2 py-1 rounded transition-colors ${
              i18n.language.startsWith('pt')
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            PT
          </button>
          <button
            onClick={() => changeLanguage('en')}
            className={`px-2 py-1 rounded transition-colors ${
              i18n.language.startsWith('en')
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            EN
          </button>
        </div>

        {/* Alternar Tema */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
          title={darkMode ? t('navbar.temaClaro') : t('navbar.temaEscuro')}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Download do CV */}
        <a
          href="/cv-gustavo.pdf"
          download="cv-gustavo.pdf"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t('navbar.baixarCv')}</span>
        </a>
      </div>
    </header>
  );
}