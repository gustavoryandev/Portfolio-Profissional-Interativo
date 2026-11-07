import { useEffect, useRef } from 'react';

// VisualViewport also follows keyboards that overlay the layout viewport (iOS).
export default function useMobileViewport() {
  const ref = useRef(null);
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    let frame;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        ref.current?.style.setProperty('--chat-viewport-height', `${viewport.height}px`);
        ref.current?.style.setProperty('--chat-viewport-top', `${viewport.offsetTop}px`);
      });
    };
    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
    };
  }, []);
  return ref;
}
