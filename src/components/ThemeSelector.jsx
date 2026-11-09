import { useContext, useId, useRef } from 'react';
import { Check, Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeContext, themes } from '../context/ThemeContext';

const groups = [
  { label: 'original', options: themes.slice(0, 2) },
  { label: 'custom', options: themes.slice(2) },
];

export default function ThemeSelector() {
  const { t } = useTranslation();
  const { darkMode, theme = darkMode ? 'dark' : 'light', setTheme } = useContext(ThemeContext);
  const id = useId();
  const trigger = useRef(null);
  const menu = useRef(null);
  const label = t('navbar.appearance.title');

  const placeMenu = event => {
    if (event.newState !== 'open') return;
    const bounds = trigger.current.getBoundingClientRect();
    const width = Math.min(264, window.innerWidth - 24);
    const below = window.innerHeight - bounds.bottom;
    const above = bounds.top;
    const openUp = below < 300 && above > below;
    Object.assign(menu.current.style, {
      left: `${Math.max(12, Math.min(bounds.right - width, window.innerWidth - width - 12))}px`,
      top: openUp ? 'auto' : `${bounds.bottom + 8}px`,
      bottom: openUp ? `${window.innerHeight - bounds.top + 8}px` : 'auto',
      maxHeight: `${(openUp ? above : below) - 16}px`,
    });
  };

  const close = () => {
    menu.current.hidePopover();
    trigger.current.focus();
  };

  const handleKeys = event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const options = [...menu.current.querySelectorAll('[role="menuitemradio"]')];
    const index = options.indexOf(document.activeElement);
    const step = event.key === 'ArrowUp' ? -1 : 1;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1
      : (index + step + options.length) % options.length;
    options[next].focus();
  };

  return <>
    <button ref={trigger} type="button" className="icon-button" aria-label={label} title={label}
      aria-haspopup="menu" aria-controls={id} popoverTarget={id}
      onKeyDown={event => {
        if (event.key !== 'ArrowDown') return;
        event.preventDefault();
        if (!menu.current.matches(':popover-open')) trigger.current.click();
      }}>
      <Palette size={19} aria-hidden="true" />
    </button>
    <div ref={menu} id={id} className="theme-picker" popover="auto" role="menu" aria-label={label}
      onBeforeToggle={placeMenu} onToggle={event => {
        if (event.newState === 'open') menu.current.querySelector('[aria-checked="true"]').focus();
      }}
      onKeyDown={handleKeys} onBlur={event => {
        const next = event.relatedTarget;
        if (next && next !== trigger.current && !event.currentTarget.contains(next)) menu.current.hidePopover();
      }}>
      <div className="theme-picker-title" aria-hidden="true"><strong>{label}</strong><span>{t('navbar.appearance.count', { count: themes.length })}</span></div>
      {groups.map(group => (
        <div className="theme-picker-group" key={group.label} role="group" aria-labelledby={`${id}-${group.label}`}>
          <p id={`${id}-${group.label}`}>{t(`navbar.appearance.${group.label}`)}</p>
          {group.options.map(option => (
            <button key={option.id} type="button" className="theme-option" data-preview={option.id} role="menuitemradio"
              aria-checked={theme === option.id} tabIndex={-1}
              onClick={() => { setTheme(option.id); close(); }}>
              <span className="theme-swatch" aria-hidden="true">
                {option.id === 'galo' && <img src="https://a.espncdn.com/i/teamlogos/soccer/500/7632.png" alt="" loading="lazy" />}
              </span>
              <span>{option.name ?? t(`navbar.appearance.${option.id}`)}</span>
              {theme === option.id && <Check size={16} aria-hidden="true" />}
            </button>
          ))}
        </div>
      ))}
    </div>
  </>;
}
