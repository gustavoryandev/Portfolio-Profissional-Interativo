export default function ScrollReveal({ as: Element = 'div', children, className = '', delay = 0, ...props }) {
  return <Element {...props} className={`scroll-reveal ${className}`}
    style={delay ? { '--scroll-reveal-delay': `${delay}s` } : undefined}
  >
    <div className="scroll-reveal-content">{children}</div>
  </Element>;
}
