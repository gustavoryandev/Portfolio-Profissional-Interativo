import { useContext } from 'react';
import { Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeContext, themes } from '../context/ThemeContext';
import { isGaloTheme } from '../data/themes.js';
import GaloCrest from './GaloCrest';
import OptionMenu from './OptionMenu';

const groups = [
  { label: 'original', options: themes.slice(0, 2) },
  { label: 'custom', options: themes.slice(2) },
];

export default function ThemeSelector() {
  const { t } = useTranslation();
  const { darkMode, theme = darkMode ? 'dark' : 'light', setTheme } = useContext(ThemeContext);

  return <OptionMenu
    label={t('navbar.appearance.title')}
    caption={t('navbar.appearance.count', { count: themes.length })}
    triggerClassName="icon-button"
    triggerContent={<Palette size={19} aria-hidden="true" />}
    groups={groups.map(group => ({
      name: t(`navbar.appearance.${group.label}`),
      options: group.options.map(option => ({
        id: option.id,
        label: t(`navbar.appearance.${option.id}`, { defaultValue: option.name }),
        preview: <span className="theme-swatch" aria-hidden="true">
          {isGaloTheme(option.id) && <GaloCrest />}
        </span>,
      })),
    }))}
    value={theme}
    onChange={setTheme}
  />;
}
