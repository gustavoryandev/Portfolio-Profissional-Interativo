import { useId } from 'react';

export default function PortfolioLogo({ className = 'brand-logo', label }) {
  const filterId = useId();

  return (
    <svg className={className} viewBox="50 13 198 108" width="198" height="108"
      role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} focusable="false">
      <defs>
        <filter id={filterId} colorInterpolationFilters="sRGB">
          {/* The blue channel isolates the white lettering from the dark background and yellow dot. */}
          <feColorMatrix in="SourceGraphic" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 1 0 0" />
          <feComponentTransfer result="letterMask"><feFuncA type="linear" slope="1.8" intercept="-.58" /></feComponentTransfer>
          <feFlood floodColor="currentColor" />
          <feComposite in2="letterMask" operator="in" result="letters" />
          {/* Red minus blue isolates the yellow dot without capturing neutral pixels. */}
          <feColorMatrix in="SourceGraphic" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 -1 0 0" result="dotMask" />
          <feFlood floodColor="var(--portfolio-logo-dot, var(--accent))" />
          <feComposite in2="dotMask" operator="in" />
          <feComposite in2="letters" operator="over" />
        </filter>
      </defs>
      <image href="/logo-portfolio.png" width="296" height="134" filter={`url(#${filterId})`} />
    </svg>
  );
}
