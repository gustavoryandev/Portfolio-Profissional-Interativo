import { useTranslation } from 'react-i18next';

// Posições fixas (sem Math.random): render estável e sem hydration mismatch.
const SPARKS = [
  { x: '6%',  y: '16%', dx: '-60px', dy: '40px',  d: '0s' },
  { x: '22%', y: '8%',  dx: '30px',  dy: '-50px', d: '.1s' },
  { x: '38%', y: '30%', dx: '-40px', dy: '60px',  d: '.2s' },
  { x: '55%', y: '12%', dx: '50px',  dy: '-30px', d: '.15s' },
  { x: '71%', y: '26%', dx: '-70px', dy: '40px',  d: '.3s' },
  { x: '88%', y: '10%', dx: '40px',  dy: '50px',  d: '.05s' },
  { x: '92%', y: '44%', dx: '-30px', dy: '-60px', d: '.25s' },
  { x: '12%', y: '52%', dx: '60px',  dy: '30px',  d: '.35s' },
  { x: '64%', y: '58%', dx: '-50px', dy: '-40px', d: '.4s' },
  { x: '30%', y: '64%', dx: '40px',  dy: '-50px', d: '.18s' },
];

export default function AstraHero({ en, compact, prompts, onPick, disabled }) {
  const { t } = useTranslation();
  return (
    <div className="astra-hero-wrap" data-compact={compact} aria-hidden={compact || undefined} inert={compact}>
      <div className="astra-hero-clip">
        <section className="astra-hero" aria-label={en ? 'Meet Astra' : 'Conheça a Astra'}>
          {SPARKS.map((spark, i) => (
            <span key={i} className="astra-spark" aria-hidden="true"
              style={{ '--x': spark.x, '--y': spark.y, '--dx': spark.dx, '--dy': spark.dy, '--d': spark.d }} />
          ))}

          <div className="astra-intro">
            <span className="astra-avatar" aria-hidden="true">
              <img src="/astra-avatar.png" alt="" width="56" height="56" />
            </span>
            <p className="astra-greet">{en ? 'Hello, I’m' : 'Olá, eu sou'}</p>
          </div>

          <p className="astra-wordmark" aria-hidden="true">Astra</p>
          <div className="dim-line">
            <span className="dim-tag">{en ? 'Interactive AI résumé' : 'Currículo IA interativo'}</span>
          </div>

          <span className="astra-chip">
            {en ? 'Gustavo’s AI assistant' : 'Assistente IA do Gustavo'}
            <span className="bp-handles" aria-hidden="true"><i /><i /><i /><i /></span>
          </span>
          <p className="hud astra-sub">{`// ${t('chat.subtitulo')}`}</p>

          {prompts.length > 0 && (
            <ul className="astra-starters" aria-label={en ? 'Suggested questions' : 'Sugestões de perguntas'}>
              {prompts.map((prompt, index) => (
                <li key={prompt}>
                  <button type="button" className="astra-starter" disabled={disabled} onClick={() => onPick(prompt)}>
                    <b aria-hidden="true">{String(index + 1).padStart(2, '0')}</b>
                    <span>{prompt}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
