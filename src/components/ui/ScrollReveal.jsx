export default function ScrollReveal({ children, className = '', delay = 0 }) {
  return <div className={`scroll-reveal ${className}`}
    style={delay ? { '--scroll-reveal-delay': `${delay}s` } : undefined}
  >{children}</div>;
}
