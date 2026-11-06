import { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import LanguageIcon from './LanguageIcon';

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const spherePoint = (latitude, longitude) => [Math.cos(latitude) * Math.cos(longitude), Math.sin(latitude), Math.cos(latitude) * Math.sin(longitude)];

export default function SkillsGlobe({ skills, en = false }) {
  const stage = useRef(null);
  const items = useRef([]);
  const mesh = useRef(null);
  const angles = useRef({ x: -0.15, y: 0 });
  const targetAngles = useRef({ x: -0.15, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const drag = useRef(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  const points = useMemo(() => skills.map((_, index) => {
    const y = 1 - 2 * (index + 0.5) / skills.length;
    const radius = Math.sqrt(1 - y * y);
    return [Math.cos(index * GOLDEN_ANGLE) * radius, y, Math.sin(index * GOLDEN_ANGLE) * radius];
  }), [skills]);
  const lines = useMemo(() => {
    const result = [];
    for (let latitude = -2; latitude <= 2; latitude++) {
      result.push(Array.from({ length: 65 }, (_, i) => spherePoint(latitude * Math.PI / 6, i * Math.PI / 32)));
    }
    for (let longitude = 0; longitude < 12; longitude++) {
      result.push(Array.from({ length: 33 }, (_, i) => spherePoint(-Math.PI / 2 + i * Math.PI / 32, longitude * Math.PI / 6)));
    }
    return result;
  }, []);

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query?.addEventListener('change', update);
    return () => query?.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    let frame;
    let previous = 0;
    let visible = true;
    let width = stage.current.clientWidth;
    let height = stage.current.clientHeight;
    const resize = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
    });
    resize.observe(stage.current);
    let sinYaw, cosYaw, sinPitch, cosPitch;
    const project = ([x, y, z], radius) => {
      const rx = x * cosYaw + z * sinYaw;
      const rz = z * cosYaw - x * sinYaw;
      const ry = y * cosPitch - rz * sinPitch;
      const depth = y * sinPitch + rz * cosPitch;
      const perspective = 3.8 / (3.8 - depth);
      return [300 + rx * radius * perspective, 250 + ry * radius * perspective, depth];
    };
    const draw = (time) => {
      const delta = previous ? Math.min((time - previous) / 1000, 0.05) : 0;
      previous = time;
      if (visible && !document.hidden) {
        if (!paused && !reduced && !drag.current) {
          // Integrate momentum in seconds so the glide is consistent at any refresh rate.
          const damping = Math.exp(-delta * 0.6);
          const travel = (1 - damping) / 0.6;
          targetAngles.current.y += delta * 0.18 + velocity.current.y * travel;
          targetAngles.current.x = Math.max(-1, Math.min(1, targetAngles.current.x + velocity.current.x * travel));
          velocity.current.x *= damping;
          velocity.current.y *= damping;
          if (Math.abs(targetAngles.current.x) >= 1) velocity.current.x = 0;
        } else if (paused || reduced) {
          velocity.current = { x: 0, y: 0 };
        }
        const smoothing = reduced ? 1 : 1 - Math.exp(-delta * 14);
        angles.current.x += (targetAngles.current.x - angles.current.x) * smoothing;
        angles.current.y += (targetAngles.current.y - angles.current.y) * smoothing;
        sinYaw = Math.sin(angles.current.y);
        cosYaw = Math.cos(angles.current.y);
        sinPitch = Math.sin(angles.current.x);
        cosPitch = Math.cos(angles.current.x);
        points.forEach((point, index) => {
          const element = items.current[index];
          if (!element) return;
          const [x, y, z] = project(point, 180);
          element.style.transform = `translate3d(${(x / 600 - 0.5) * width}px, ${(y / 500 - 0.5) * height}px, 0) translate(-50%, -50%) scale(${0.76 + (z + 1) * 0.17})`;
          element.style.opacity = String(0.32 + (z + 1) * 0.34);
          element.style.zIndex = String(Math.round((z + 1) * 100));
        });
        mesh.current?.setAttribute('d', lines.map(line => line.map((point, index) => {
          const [x, y] = project(point, 157);
          return `${index ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(' ')).join(' '));
      }
      frame = requestAnimationFrame(draw);
    };
    const observer = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }) : null;
    observer?.observe(stage.current);
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); observer?.disconnect(); resize.disconnect(); };
  }, [points, lines, paused, reduced]);

  const move = event => {
    const start = drag.current;
    if (!start) return;
    const delta = Math.max((event.timeStamp - start.time) / 1000, 0.008);
    const yaw = (event.clientX - start.x) * 0.008;
    const pitch = -(event.clientY - start.y) * 0.008;
    targetAngles.current.y += yaw;
    targetAngles.current.x = Math.max(-1, Math.min(1, targetAngles.current.x + pitch));
    const blend = 1 - Math.exp(-delta * 25);
    velocity.current.x += (Math.max(-4, Math.min(4, pitch / delta)) - velocity.current.x) * blend;
    velocity.current.y += (Math.max(-4, Math.min(4, yaw / delta)) - velocity.current.y) * blend;
    drag.current = { x: event.clientX, y: event.clientY, time: event.timeStamp };
  };
  const release = event => {
    if (!drag.current) return;
    // Holding still before releasing should not launch the globe again.
    const idle = Math.max(0, (event.timeStamp - drag.current.time) / 1000 - 0.08);
    const decay = Math.exp(-idle * 12);
    velocity.current.x *= decay;
    velocity.current.y *= decay;
    drag.current = null;
  };
  const cancelDrag = () => {
    if (!drag.current) return;
    velocity.current = { x: 0, y: 0 };
    drag.current = null;
  };
  return <div className="mb-5 overflow-hidden rounded-xl border border-[var(--line)] [background:radial-gradient(ellipse_at_50%_52%,color-mix(in_srgb,var(--accent)_12%,transparent),transparent_65%),var(--panel)]">
    <div className="flex items-center justify-between gap-3 px-[18px] pt-[18px] max-[400px]:px-3 max-[400px]:pt-3"><p className="m-0 text-[14px] font-semibold text-[var(--ink)] max-[400px]:text-xs">{en ? 'My technology universe' : 'Meu universo de tecnologias'}<span className="mt-1 block text-xs font-normal text-[var(--muted)]">{en ? `${skills.length} skills in my toolkit` : `${skills.length} habilidades na minha bagagem`}</span></p>
      <button type="button" className="flex items-center gap-[5px] rounded-[7px] border border-[var(--line)] px-[9px] py-[7px] text-xs text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--accent)] disabled:cursor-default disabled:opacity-50" aria-pressed={paused || reduced} disabled={reduced} onClick={() => setPaused(value => !value)}>
        {paused || reduced ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}{en ? (paused || reduced ? 'Resume' : 'Pause') : (paused || reduced ? 'Retomar' : 'Pausar')}
      </button>
    </div>
    <div ref={stage} className="relative mx-auto aspect-[6/5] w-full max-w-[520px] cursor-grab touch-pan-y select-none active:cursor-grabbing" onPointerDown={event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      velocity.current = { x: 0, y: 0 };
      drag.current = { x: event.clientX, y: event.clientY, time: event.timeStamp };
      event.currentTarget.setPointerCapture(event.pointerId);
    }} onPointerMove={move} onPointerUp={release} onPointerCancel={cancelDrag} onLostPointerCapture={cancelDrag}>
      <svg className="pointer-events-none absolute inset-0 h-full w-full fill-none stroke-[var(--accent)] stroke-[0.7] opacity-[0.22]" viewBox="0 0 600 500" aria-hidden="true"><circle className="fill-[var(--panel-soft)] fill-opacity-50 stroke-opacity-40" cx="300" cy="250" r="163" /><path ref={mesh} /></svg>
      <ul className="m-0 list-none p-0" aria-label={en ? 'Technical skills' : 'Habilidades técnicas'}>
        {skills.map((skill, index) => <li ref={element => { items.current[index] = element; }} key={skill.nome} className="absolute left-1/2 top-1/2 flex flex-col items-center gap-[5px] whitespace-nowrap will-change-transform"><LanguageIcon name={skill.nome} size={32} className={`pointer-events-none drop-shadow-[0_2px_5px_rgb(0_0_0_/_0.15)] max-[400px]:!h-[25px] max-[400px]:!w-[25px] ${skill.nome === 'GitHub' ? 'dark:invert' : ''}`} /><span className="rounded bg-[var(--panel)] px-[5px] py-0.5 text-[clamp(8px,1vw,11px)] font-semibold leading-[1.3] text-[var(--ink)]">{skill.nome}</span></li>)}
      </ul>
    </div>
    <p className="m-0 px-3 pb-[18px] text-center text-xs text-[var(--muted)]">{en ? 'Drag to explore · The full skill list is below' : 'Arraste para explorar · Lista completa de habilidades abaixo'}</p>
  </div>;
}
