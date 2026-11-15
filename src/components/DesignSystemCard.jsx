import { useContext, useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronRight, Layers, Palette, RectangleEllipsis, Ruler, Shapes, Type } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeContext, themes } from '../context/ThemeContext';
import AstraAvatar from './AstraAvatar';
import PortfolioLogo from './PortfolioLogo';
import './designSystem.css';

const tokens = ['page', 'panel', 'panel-soft', 'line', 'primary', 'primary-hover', 'on-primary', 'accent', 'ink', 'muted'];
const contrastPairs = [['ink', 'panel'], ['muted', 'panel'], ['accent', 'panel'], ['on-primary', 'primary'], ['on-primary', 'primary-hover']];
const typeSamples = [
  ['display', '64–112 px · 750'],
  ['heading', '28–42 px · 600'],
  ['body', '15 px · 400'],
  ['mono', '12 px · 400'],
];

function colorChannels(value) {
  const hex = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(value);
  if (hex) {
    const digits = hex[1].length === 3 ? [...hex[1]].map(ch => ch + ch).join('') : hex[1];
    return digits.match(/../g).map(channel => Number.parseInt(channel, 16) / 255);
  }
  const rgb = /^(rgb\(|color\(srgb )([\d.,\s]+)\)$/.exec(value);
  if (!rgb) return null;
  return rgb[2].trim().split(/[\s,]+/).map(Number).map(channel => rgb[1] === 'rgb(' ? channel / 255 : channel);
}

function luminance(channels) {
  return channels.map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4)
    .reduce((total, channel, index) => total + channel * [.2126, .7152, .0722][index], 0);
}

function contrast(foreground, background) {
  const a = colorChannels(foreground);
  const b = colorChannels(background);
  if (!a || !b) return null;
  const light = luminance(a);
  const dark = luminance(b);
  return (Math.max(light, dark) + .05) / (Math.min(light, dark) + .05);
}

function GuideSection({ title, icon: Icon, children }) {
  return (
    <details className="ds-section">
      <summary><Icon size={18} aria-hidden="true" />{title}<ChevronRight size={16} aria-hidden="true" /></summary>
      <div className="ds-section-body">{children}</div>
    </details>
  );
}

export default function DesignSystemCard() {
  const { t, i18n } = useTranslation();
  const { theme = 'dark' } = useContext(ThemeContext) ?? {};
  const themeName = themes.find(option => option.id === theme)?.name ?? t(`chat.designSystem.themes.${theme}`);
  const copy = t('chat.designSystem', { returnObjects: true });
  const titleId = useId();
  const guide = useRef(null);
  const [values, setValues] = useState({});
  const [confirmed, setConfirmed] = useState(null);

  useEffect(() => {
    const swatches = guide.current.querySelectorAll('[data-ds-token]');
    const rootStyle = window.getComputedStyle(document.documentElement);
    setValues(Object.fromEntries([...swatches].map(swatch => {
      const token = swatch.dataset.dsToken;
      const value = window.getComputedStyle(swatch).backgroundColor;
      return [token, colorChannels(value) ? value : rootStyle.getPropertyValue(`--${token}`).trim()];
    })));
  }, [theme]);

  return (
    <article ref={guide} className="ds-card" aria-labelledby={titleId}>
      <header className="ds-header">
        <div className="ds-heading">
          <span className="ds-icon"><Layers size={22} aria-hidden="true" /></span>
          <div>
            <h3 id={titleId}>{copy.title}</h3>
            <p>{copy.intro}</p>
          </div>
        </div>
        <div className="ds-theme">
          <span>{copy.activeTheme} <strong>{themeName}</strong></span>
          <div className="ds-theme-strip" aria-hidden="true">
            {['page', 'panel', 'primary', 'accent', 'ink'].map(token => (
              <span key={token} style={{ backgroundColor: `var(--${token})` }} />
            ))}
          </div>
        </div>
      </header>

      <GuideSection title={copy.sections.brand} icon={Shapes}>
        <div className="ds-brand">
          <figure><PortfolioLogo /><figcaption>{copy.portfolio}</figcaption></figure>
          <figure><AstraAvatar width="48" height="48" /><figcaption>Astra</figcaption></figure>
        </div>
        <p>{copy.brandUsage}</p>
      </GuideSection>

      <GuideSection title={copy.sections.colors} icon={Palette}>
        <ul className="ds-swatches">
          {tokens.map(token => (
            <li key={token}>
              <span className="ds-swatch" data-ds-token={token} style={{ backgroundColor: `var(--${token})` }} aria-hidden="true" />
              <strong>{copy.colors[token]}</strong>
              <code>--{token}</code>
              <span className="ds-color-value">{values[token]}</span>
            </li>
          ))}
        </ul>
        <h4>{copy.contrastTitle}</h4>
        <p>{copy.contrastNote}</p>
        <ul className="ds-contrast">
          {contrastPairs.map(([foreground, background]) => {
            const ratio = contrast(values[foreground], values[background]);
            return (
              <li key={`${foreground}-${background}`}>
                <span><code>--{foreground}</code> {copy.on} <code>--{background}</code></span>
                {ratio === null ? <span>{copy.unavailable}</span> : (
                  <strong>{new Intl.NumberFormat(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(ratio)}:1 · {ratio >= 4.5 ? copy.pass : copy.review}</strong>
                )}
              </li>
            );
          })}
        </ul>
      </GuideSection>

      <GuideSection title={copy.sections.type} icon={Type}>
        <p>{copy.fonts}</p>
        <ul className="ds-type">
          {typeSamples.map(([kind, size]) => (
            <li key={kind}>
              <span className={`ds-type-${kind}`}>{copy.type[kind]}</span>
              <span>{size}</span>
            </li>
          ))}
        </ul>
        <p>{copy.typeNote}</p>
      </GuideSection>

      <GuideSection title={copy.sections.layout} icon={Ruler}>
        <ul className="ds-spacing" aria-label={copy.spacing}>
          {[4, 8, 12, 16, 24].map(size => <li key={size}><span style={{ width: size * 2 }} aria-hidden="true" />{size} px</li>)}
        </ul>
        <p>{copy.layoutUsage}</p>
        <div className="ds-radii">
          <span><code>--radius-control</code> · 8 px</span>
          <span><code>--radius-card</code> · 12 px</span>
        </div>
        <ul className="ds-notes">
          <li><strong>700 px</strong> · {copy.breakpoints.projects}</li>
          <li><strong>767 px</strong> · {copy.breakpoints.mobile}</li>
          <li><strong>959 px</strong> · {copy.breakpoints.help}</li>
        </ul>
      </GuideSection>

      <GuideSection title={copy.sections.components} icon={RectangleEllipsis}>
        <p>{copy.demo}</p>
        <div className="ds-demo">
          <button type="button" className="project-action" onClick={() => setConfirmed(true)}>
            <Check size={16} aria-hidden="true" />{copy.confirm}
          </button>
          <button type="button" className="ds-reset" onClick={() => setConfirmed(false)} disabled={!confirmed}>{copy.reset}</button>
          <p role="status">{confirmed === null ? '' : confirmed ? copy.confirmed : copy.cleared}</p>
        </div>
        <ul className="ds-notes">{copy.patterns.map(pattern => <li key={pattern}>{pattern}</li>)}</ul>
        <div className="ds-handoff">
          <h4>{copy.handoff}</h4>
          <p>{copy.handoffNote}</p>
          <ul>{['src/index.css', 'src/themes.css', 'src/scroll.css', 'src/astra.css'].map(path => <li key={path}><code>{path}</code></li>)}</ul>
        </div>
      </GuideSection>
    </article>
  );
}
