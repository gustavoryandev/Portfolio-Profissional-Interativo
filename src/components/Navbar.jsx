import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';
import { Sun, Moon, Download, Globe, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const { i18n, t } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const cvFile = i18n.language.startsWith('en')
    ? '/Gustavo Ryan Resume (English).pdf'
    : '/Currículo Gustavo Ryan.pdf';

  return (
    <header className={`relative z-10 px-8 py-5 flex items-center justify-between border-b transition-colors duration-300 ${darkMode ? 'bg-[#0a0a0a]/60 border-[#1f1f1f] backdrop-blur-md' : 'bg-white/80 border-gray-200 backdrop-blur-md'}`}>
      
      <div className="flex items-center gap-3">
        <Sparkles className="w-7 h-7 text-amber-500" />
        <h1 className={`font-bold text-2xl tracking-tight ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
          Gustavo Ryan<span className="text-amber-500">.ai</span>
        </h1>
      </div>

      <div className="flex items-center gap-5">
        {/* Seletor de Idioma */}
        <div className={`flex items-center rounded-full p-1 border transition-colors ${darkMode ? 'bg-[#141414] border-[#222]' : 'bg-gray-100 border-gray-200'}`}>
          <div className={`p-1 mr-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
            <Globe className="w-4 h-4" />
          </div>
          <button
            onClick={() => changeLanguage('pt')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              i18n.language.startsWith('pt')
                ? 'bg-amber-500 text-black'
                : (darkMode ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-black')
            }`}
          >
            PT
          </button>
          <button
            onClick={() => changeLanguage('en')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              i18n.language.startsWith('en')
                ? 'bg-amber-500 text-black'
                : (darkMode ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-black')
            }`}
          >
            EN
          </button>
        </div>

        {/* Alternar Tema */}
        <button
          onClick={toggleTheme}
          className={`p-2.5 rounded-full border transition-all ${darkMode ? 'bg-[#141414] border-[#222] text-zinc-400 hover:text-white' : 'bg-white border-gray-200 text-zinc-600 hover:text-black shadow-sm'}`}
          title={darkMode ? t('navbar.temaClaro') : t('navbar.temaEscuro')}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Download do CV */}
        <a
          href={cvFile}
          download={cvFile}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${darkMode ? 'bg-transparent border-amber-500 text-amber-500 hover:bg-amber-500/10' : 'bg-white border-zinc-300 text-zinc-900 hover:bg-zinc-50 shadow-sm'}`}
        >
          <Download className="w-4 h-4" />
          <span>{t('navbar.baixarCv')}</span>
        </a>
      </div>
    </header>
  );
}