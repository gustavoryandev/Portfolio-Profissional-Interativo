import { useEffect, useRef } from 'react';

const COLORS = ['#3B82F6', '#60A5FA', '#93C5FD'];
const ease = (value) => value * value * (3 - 2 * value);

export default function SwarmCursors({ progress }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const agents = Array.from({ length: 36 }, (_, index) => ({
      x: Math.random(), y: Math.random(), phase: index * Math.PI * 2 / 36,
      speed: .18 + Math.random() * .16, size: 8 + Math.random() * 5,
      radius: .8 + Math.random() * .4, color: COLORS[index % COLORS.length],
    }));
    // Lead cursors follow the real panels while the rest of the swarm disperses.
    const panels = ['.agent-introduction', '.agent-identity', '.agent-monitors']
      .map(selector => canvas.parentElement.querySelector(selector))
      .filter(Boolean);
    const cursor = new Path2D('M0 0 L1 15 L5 10 L8 16 L11 14 L8 8 L14 8 Z');
    let width = 0;
    let height = 0;
    let frame = 0;
    let elapsed = 0;
    let lastTime = 0;

    function draw(time) {
      const delta = lastTime ? Math.min((time - lastTime) / 1000, .05) : 0;
      lastTime = time;
      if (!preference.matches) elapsed += delta;
      const stage = preference.matches ? 1 : progress.get();
      const spread = ease(Math.max(0, Math.min(1, (stage - .26) / .24)));
      context.clearRect(0, 0, width, height);
      const assembling = stage > .3 && stage < .88;
      const bounds = assembling ? panels.map(panel => panel.getBoundingClientRect()) : [];
      if (assembling) {
        context.strokeStyle = '#60A5FA';
        context.globalAlpha = Math.sin((stage - .3) / .58 * Math.PI) * .6;
        context.lineWidth = 1;
        for (const rect of bounds) {
          context.strokeRect(rect.left - 5, rect.top - 5, rect.width + 10, rect.height + 10);
          context.fillStyle = '#93C5FD';
          context.fillRect(rect.right + 2, rect.bottom + 2, 6, 6);
        }
      }
      const count = width < 640 ? 20 : agents.length;
      const radius = Math.min(width, height) * .14;
      for (let index = 0; index < count; index++) {
        const agent = agents[index];
        const angle = agent.phase + elapsed * .8;
        const orbitX = width / 2 + Math.cos(angle) * radius * agent.radius;
        const orbitY = height / 2 + Math.sin(angle) * radius * agent.radius * .7;
        const driftX = (agent.x + Math.sin(elapsed * agent.speed + agent.phase) * .04) * width;
        const driftY = (agent.y + Math.cos(elapsed * agent.speed + agent.phase) * .04) * height;
        let x = orbitX + (driftX - orbitX) * spread;
        let y = orbitY + (driftY - orbitY) * spread;
        if (assembling && index < bounds.length) {
          const rect = bounds[index];
          const attach = Math.sin((stage - .3) / .58 * Math.PI);
          x += (rect.right + 5 - x) * attach;
          y += (rect.bottom + 5 - y) * attach;
        }
        context.save();
        context.translate(x, y);
        context.rotate(Math.sin(angle) * .25);
        context.scale(agent.size / 12, agent.size / 12);
        context.globalAlpha = stage < .5 ? .9 : .5;
        context.fillStyle = agent.color;
        context.fill(cursor);
        context.strokeStyle = '#0B0E14';
        context.lineWidth = 1;
        context.stroke(cursor);
        context.restore();
      }
      if (!preference.matches && !document.hidden) frame = requestAnimationFrame(draw);
    }
    function restart() {
      cancelAnimationFrame(frame);
      lastTime = 0;
      if (!document.hidden) frame = requestAnimationFrame(draw);
    }
    const observer = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      restart();
    });
    observer.observe(canvas);
    preference.addEventListener('change', restart);
    document.addEventListener('visibilitychange', restart);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      preference.removeEventListener('change', restart);
      document.removeEventListener('visibilitychange', restart);
    };
  }, [progress]);
  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-20 h-full w-full" />;
}
