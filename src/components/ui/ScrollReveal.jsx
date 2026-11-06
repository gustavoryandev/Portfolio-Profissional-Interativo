import { motion, useReducedMotion } from 'framer-motion';

export default function ScrollReveal({ children, className = '', delay = 0 }) {
  const reduced = useReducedMotion();
  return <motion.div className={`scroll-reveal ${className}`}
    initial={reduced ? false : { opacity: 0, scale: .9, y: 32, rotateX: 5 }}
    whileInView={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
    viewport={{ once: true, amount: .08 }}
    transition={{ duration: reduced ? 0 : .65, delay: reduced ? 0 : delay, ease: [.22, 1, .36, 1] }}
    style={{ transformPerspective: 1000 }}
  >{children}</motion.div>;
}
