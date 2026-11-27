import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowUpRight, FileText, ScanFace } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../../context/ThemeState';
import { HEIST_DARK, HEIST_LIGHT, heistMedia, isHeistTheme } from '../../data/heistThemes.js';
import { themes } from '../../data/themes.js';
import { REDUCED_MOTION_QUERY } from '../../motionPreferences.js';

const OpeningContext = createContext(null);
const variantKey = theme => theme === HEIST_LIGHT ? 'heist.variant.light' : 'heist.variant.dark';

export function HeistOpeningProvider({ children }) {
  const { theme } = useContext(ThemeContext) ?? {};
  const [opening, setOpening] = useState(null);
  const open = useCallback(opener => {
    if (isHeistTheme(theme) && !document.hidden) setOpening({ theme, opener });
  }, [theme]);

  const finish = useCallback(() => setOpening(null), []);
  useEffect(() => {
    setOpening(current => current?.theme === theme ? current : null);
  }, [theme]);
  return <OpeningContext.Provider value={open}>
    {children}
    {opening?.theme === theme && isHeistTheme(theme) && <HeistOpening opener={opening.opener} theme={theme} onFinish={finish} />}
  </OpeningContext.Provider>;
}

export function useHeistPortfolioOpening() {
  const { theme } = useContext(ThemeContext) ?? {};
  const open = useContext(OpeningContext);
  const seen = useRef(new Set());
  useEffect(() => {
    if (!open || !isHeistTheme(theme) || window.location.pathname !== '/' || document.hidden || seen.current.has(theme)) return;
    const forced = new URLSearchParams(window.location.search).get('intro') === '1';
    if (window.location.hash && !forced) return;
    if (window.matchMedia?.(REDUCED_MOTION_QUERY).matches) return;
    const storageKey = `${theme}:opening-seen`;
    seen.current.add(theme);
    try {
      if (!forced && sessionStorage.getItem(storageKey)) return;
      sessionStorage.setItem(storageKey, '1');
    } catch { /* Opening is still limited to once per mounted portfolio. */ }
    open();
  }, [open, theme]);
}

function HeistMask({ className }) {
  const [failed, setFailed] = useState(false);
  return failed ? <ScanFace aria-hidden="true" className={className} />
    : <img src={heistMedia.mask} className={className} width="107" height="128"
      alt="" draggable="false" onError={() => setFailed(true)} />;
}

export function HeistHeaderBadge() {
  const { theme, setTheme } = useContext(ThemeContext) ?? {};
  const open = useContext(OpeningContext);
  const { t } = useTranslation();
  if (!isHeistTheme(theme) || !open) return null;
  const companion = theme === HEIST_DARK ? HEIST_LIGHT : HEIST_DARK;
  const canSwitch = themes.some(option => option.id === companion);
  const label = canSwitch ? t('heist.opening.switch', { name: t(variantKey(companion)) }) : t('heist.opening.replay');
  return <button type="button" className="heist-mask-button" aria-label={label} title={label}
    aria-haspopup={canSwitch ? undefined : 'dialog'}
    onClick={event => canSwitch ? setTheme(companion) : open(event.currentTarget)}>
    <HeistMask className="heist-mask-art" />
  </button>;
}

export function HeistLabel({ theme }) {
  const { t } = useTranslation();
  return <p className="heist-variant-label"><i aria-hidden="true" />{t('heist.theme')}<span>{t(variantKey(theme))}</span></p>;
}

export function HeistBackdrop({ theme }) {
  return <div className="heist-backdrop" aria-hidden="true"
    style={{ '--heist-location-image': `url("${heistMedia.backgrounds[theme]}")` }} />;
}

export function HeistOperationRecord({ onSectionLink }) {
  const { t } = useTranslation();
  return <details className="heist-record">
    <summary><FileText size={16} aria-hidden="true" />{t('heist.record.title')}</summary>
    <div>
      <p>{t('heist.record.description')}</p>
      <a href="#projetos" onClick={onSectionLink}>{t('heist.record.projects')}<ArrowUpRight size={14} aria-hidden="true" /></a>
      <a href="#laboratorio" onClick={onSectionLink}>{t('heist.record.lab')}<ArrowUpRight size={14} aria-hidden="true" /></a>
    </div>
  </details>;
}

function HeistOpening({ opener, theme, onFinish }) {
  const { t } = useTranslation();
  const dialog = useRef(null);
  const skip = useRef(null);
  const [reduced, setReduced] = useState(() => Boolean(window.matchMedia?.(REDUCED_MOTION_QUERY).matches));

  useLayoutEffect(() => {
    const node = dialog.current;
    node.showModal();
    skip.current.focus({ preventScroll: true });
    return () => {
      node.close();
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [opener]);

  useEffect(() => {
    const preference = window.matchMedia?.(REDUCED_MOTION_QUERY);
    const onPreference = () => {
      if (preference.matches) onFinish();
      else setReduced(false);
    };
    const onVisibility = () => { if (document.hidden) onFinish(); };
    preference?.addEventListener('change', onPreference);
    document.addEventListener('visibilitychange', onVisibility);
    const timeout = reduced ? null : window.setTimeout(onFinish, 2650);
    return () => {
      window.clearTimeout(timeout);
      preference?.removeEventListener('change', onPreference);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [onFinish, reduced]);

  return <dialog ref={dialog} className="heist-opening" data-still={reduced} aria-labelledby="heist-opening-title"
    onCancel={event => { event.preventDefault(); onFinish(); }}>
    <HeistBackdrop theme={theme} />
    <div className="heist-opening-shutters" aria-hidden="true"><i /><i /></div>
    <div className="heist-opening-frame" aria-hidden="true"><span /></div>
    <div className="heist-opening-title">
      <HeistMask className="heist-opening-mask" />
      <p>{t('heist.location')}</p>
      <h2 id="heist-opening-title">{t(variantKey(theme))}</h2>
    </div>
    <button ref={skip} type="button" className="heist-opening-skip" onClick={onFinish}>
      {t(reduced ? 'heist.opening.close' : 'heist.opening.skip')}
    </button>
  </dialog>;
}
