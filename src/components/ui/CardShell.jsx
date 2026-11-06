import { ExternalLink } from 'lucide-react';

// Única origem da classe `portfolio-card`. Largura opcional: size = sm | md | lg.
export function CardShell({ as: Tag = 'article', size, blueprint = true, className = '', children, ...props }) {
  return (
    <Tag className={`portfolio-card glass-panel ${className}`.trim()} data-size={size} {...props}>
      {blueprint && <span className="bp-handles" aria-hidden="true"><i /><i /><i /><i /></span>}
      {children}
    </Tag>
  );
}

// icon: componente lucide; media: nó livre (ex.: logo de time). subtitle aceita texto ou link.
export function CardHeader({ icon: Icon, media, title, subtitle, titleId, aside }) {
  return (
    <header className="card-title-row">
      {(Icon || media) && <span className="card-icon">{media ?? <Icon size={20} aria-hidden="true" />}</span>}
      <div className="min-w-0 flex-1">
        <h3 id={titleId}>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {aside}
    </header>
  );
}

// live=false para o ponto parar de pulsar quando o dado está desatualizado
export function CardFooter({ status, live = true, href, label }) {
  return (
    <footer className="card-footer">
      {status && <span className="hud" data-live={live}><span className="hud-dot" aria-hidden="true" />{status}</span>}
      {href && (
        <a className="card-link" href={href} target="_blank" rel="noopener noreferrer">
          {label}<ExternalLink size={14} aria-hidden="true" />
        </a>
      )}
    </footer>
  );
}
