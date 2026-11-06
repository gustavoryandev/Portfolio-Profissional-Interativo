import { cloneElement } from 'react';

export default function StatTile({ icon, label, value, sub, highlight = false }) {
  return (
    <div className="stat-tile">
      <div className="stat-tile__label">
        {icon && cloneElement(icon, { size: 14, 'aria-hidden': true })}
        <span>{label}</span>
      </div>
      <strong className={`stat-tile__value${highlight ? ' is-accent' : ''}`}>{value ?? '—'}</strong>
      {sub && <p className="stat-tile__sub">{sub}</p>}
    </div>
  );
}
