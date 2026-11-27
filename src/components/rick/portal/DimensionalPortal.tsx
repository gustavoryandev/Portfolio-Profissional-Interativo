import { useEffect, useId, useLayoutEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { animate, motion, useAnimationFrame, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import useCharacterActivity from '../useCharacterActivity';
import { useReducedSceneMotion } from '../sceneAssets';
import { bounded, portalWidth, portalVariants, qualityLevels, resolveQuality, type PortalVariant, type PortalQuality } from './portalConfig';
import { drops, dropPose, flecks, rimCurrents, silhouette, tongues, trenches } from './portalDrawing';
import './dimensional-portal.css';

export type { PortalVariant, PortalQuality } from './portalConfig';
export interface DimensionalPortalProps {
  isOpen: boolean;
  variant?: PortalVariant;
  size?: number | string;
  aspectRatio?: number;
  glowIntensity?: number;
  effectsPaused?: boolean;
  quality?: PortalQuality;
  className?: string;
  children?: ReactNode;
  onOpenComplete?: () => void;
  onCloseComplete?: () => void;
}

interface DrawingRefs {
  deep: RefObject<SVGGElement | null>;
  surface: RefObject<SVGGElement | null>;
  noise: RefObject<SVGFEOffsetElement | null>;
  light: RefObject<SVGGElement | null>;
  rim: RefObject<SVGGElement | null>;
  drops: RefObject<SVGGElement | null>;
}

// Mount only while visible and moving. The elapsed drawing time survives a
// pause. Motion disposes its frame subscription when this component unmounts.
function CurrentClock({ refs, elapsed, speed, rate }: {
  refs: DrawingRefs; elapsed: RefObject<number>; speed: number; rate: number;
}) {
  const accumulated = useRef(0);
  useAnimationFrame((_, delta) => {
    accumulated.current += Math.min(delta, 80);
    if (accumulated.current < 1000/rate) return;
    elapsed.current += speed * accumulated.current / 1000;
    accumulated.current = 0;
    const t = elapsed.current;
    refs.deep.current?.setAttribute('transform', `rotate(${(t*3.6)%360} 120 120)`);
    refs.surface.current?.setAttribute('transform', `rotate(${(-t*2.15)%360} 120 120)`);
    refs.noise.current?.setAttribute('dx', String(3.2*Math.sin(t*.48)));
    refs.noise.current?.setAttribute('dy', String(2.1*Math.sin(t*.66)));
    refs.light.current?.setAttribute('opacity', String(.8+.13*Math.sin(t*.81)));
    refs.rim.current?.setAttribute('opacity', String(.84+.13*Math.sin(t*1.32)));
    const particles = refs.drops.current?.children;
    if (!particles) return;
    for (let i=0; i<particles.length; i++) {
      const pose = dropPose(drops[i], t);
      particles[i].setAttribute('transform', pose.transform);
      particles[i].setAttribute('opacity', pose.opacity.toFixed(3));
    }
  });
  return null;
}

export default function DimensionalPortal({ isOpen, variant = 'garage', size = 320, aspectRatio = 1,
  glowIntensity = .65, effectsPaused = false, quality = 'auto', className = '', children,
  onOpenComplete, onCloseComplete }: DimensionalPortalProps) {
  const style = portalVariants[variant] ?? portalVariants.garage;
  const { palette: p } = style;
  const level = resolveQuality(quality);
  const detail = qualityLevels[level];
  const glow = bounded(glowIntensity, .65, 0, 1);
  const withContent = children != null && typeof children !== 'boolean';
  const id = useId();
  const url = (name: string) => `url(#${id}-${name})`;
  const host = useRef<HTMLDivElement>(null);
  const visible = useCharacterActivity(host);
  const motionPreference = useReducedMotion();
  const livePreference = useReducedSceneMotion();
  const reduced = typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? livePreference : Boolean(motionPreference);
  const progress = useMotionValue(0);
  const opacity = useTransform(progress, [0,.42,1], [0,.83,1]);
  const scale = useTransform(progress, n => Math.max(.055, .055+.945*n));
  const rotate = useTransform(progress, n => (1-n)*-13);
  const photoOpacity = useTransform(progress, [.48,.94], [0,1]);
  const openingGlow = useTransform(progress, [0,.65,1], [.12,1,.78]);
  const callbacks = useRef({ onOpenComplete, onCloseComplete });
  useLayoutEffect(() => { callbacks.current = { onOpenComplete, onCloseComplete }; }, [onOpenComplete, onCloseComplete]);
  const completed = useRef<boolean | null>(isOpen ? null : false);
  useEffect(() => {
    const target = isOpen ? 1 : 0;
    if (completed.current === isOpen && progress.get() === target) return;
    completed.current = null;
    let current = true;
    const control = animate(progress, target, {
      ...(reduced ? { type: 'tween', duration: .14 } : { type: 'spring', ...style.spring }),
      onComplete: () => {
        if (!current) return;
        completed.current = isOpen;
        if (isOpen) callbacks.current.onOpenComplete?.();
        else callbacks.current.onCloseComplete?.();
      },
    });
    return () => { current = false; control.stop(); };
  }, [isOpen, progress, reduced, style]);
  const elapsed = useRef(0);
  const refs = { deep: useRef<SVGGElement>(null), surface: useRef<SVGGElement>(null),
    noise: useRef<SVGFEOffsetElement>(null), light: useRef<SVGGElement>(null), rim: useRef<SVGGElement>(null),
    drops: useRef<SVGGElement>(null) };
  const flowing = isOpen && visible && !effectsPaused && !reduced;
  const box = { '--portal-width': portalWidth(size), aspectRatio: bounded(aspectRatio, 1, .65, 1.6) } as CSSProperties;
  return <div ref={host} className={`dimensional-portal ${className}`.trim()} style={box}
    data-portal-variant={variant} data-quality={level} data-flowing={flowing} data-rick-motion>
    <motion.div aria-hidden="true" className="dimensional-portal-energy"
      style={{ opacity, scale: reduced ? 1 : scale, rotate: reduced ? 0 : rotate }}>
      <svg viewBox="0 0 240 240" preserveAspectRatio="none" focusable="false">
        <defs>
          <radialGradient id={id+'-pool'} cx="46%" cy="53%" r="59%">
            <stop stopColor={p.abyss}/><stop offset=".47" stopColor={p.shadow}/><stop offset=".76" stopColor={p.body}/>
            <stop offset=".9" stopColor={p.energy}/><stop offset="1" stopColor={p.shadow}/>
          </radialGradient>
          <linearGradient id={id+'-ribbon'} x1="0" x2=".84" y2="1">
            <stop stopColor={p.current}/><stop offset=".48" stopColor={p.energy}/><stop offset=".8" stopColor={p.body}/><stop offset="1" stopColor={p.current}/>
          </linearGradient>
          <radialGradient id={id+'-halo'}>
            <stop offset=".72" stopColor={p.energy} stopOpacity="0"/><stop offset=".89" stopColor={p.energy} stopOpacity=".48"/>
            <stop offset="1" stopColor={p.energy} stopOpacity="0"/>
          </radialGradient>
          <radialGradient id={id+'-core'} cx="40%" cy="40%">
            <stop stopColor={p.light}/><stop offset=".52" stopColor={p.accent}/><stop offset="1" stopColor={p.energy}/>
          </radialGradient>
          <clipPath id={id+'-edge'}><path d={silhouette}/></clipPath>
          <mask id={id+'-opening'} maskUnits="userSpaceOnUse" x="0" y="0" width="240" height="240">
            <rect width="240" height="240" fill="white"/>
            {withContent && <ellipse cx="118.8" cy="118.8" rx="88" ry="88" fill="black"/>}
          </mask>
          <filter id={id+'-liquid'} filterUnits="userSpaceOnUse" x="-5" y="-6" width="79" height="38" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency=".065 .093" numOctaves={detail.octaves} seed="13" result="field"/>
            <feOffset ref={refs.noise} in="field" dx="0" dy="0" result="drift"/>
            <feDisplacementMap in="SourceGraphic" in2="drift" scale={style.displacement} xChannelSelector="R" yChannelSelector="G"/>
          </filter>
        </defs>
        <motion.g style={{opacity: openingGlow}}>
          <g ref={variant === 'beyond-curve' ? refs.rim : undefined}>
            <ellipse cx="120" cy="120" rx="119" ry="118" fill={url('halo')} opacity={glow}/>
          </g>
        </motion.g>
        <g mask={url('opening')}>
          <path d={silhouette} fill={url('pool')} stroke={p.shadow} strokeWidth="1.8"/>
          <g clipPath={url('edge')}>
            <g ref={refs.deep}>
              {trenches.map(d=><path key={d} d={d} fill={p.abyss}/>)}
              {tongues.map(d=><path key={d} d={d} fill={url('ribbon')}/>)}
              <g fill={p.body}>
                <path d="M41 121C31 101 40 79 57 64Q51 75 59 70Q67 66 72 55C73 74 55 80 51 89Q58 84 65 84C53 94 45 99 46 111Q42 106 40 112Z"/>
                <path d="M126 181C150 181 169 161 179 145Q174 159 182 155Q194 147 199 135C197 154 184 170 165 178Q172 172 167 171C155 173 145 186 126 181Z"/>
              </g>
              <g fill={p.current}>
                <path d="M59 83Q61 72 70 69Q77 65 80 59Q80 69 71 73T59 83ZM68 86Q71 80 75 80Q78 81 74 83Z"/>
                <path d="M143 159C157 154 166 140 166 126Q170 136 166 143Q174 138 178 130C176 144 165 148 160 153Q163 148 158 151Z"/>
                <path d="M84 169Q68 162 63 152Q61 146 57 144Q67 144 70 152T84 169Z"/>
              </g>
              <path fill={p.accent} d="M81 61Q85 55 88 57T85 61Q82 64 81 61ZM175 123Q177 116 179 117T178 123Q174 128 175 123Z"/>
              <path fill={p.body} d="M36 82C47 61 60 60 70 42C66 61 60 68 59 78Q54 72 49 80T36 82ZM165 159C183 153 192 142 197 126Q197 152 178 165Q170 173 164 178Q171 165 165 159Z"/>
            </g>
            <g ref={refs.surface}>
              {rimCurrents.map((d,i)=><path key={d} d={d} fill={i%3===0?p.shadow:i%3===1?p.current:p.energy}/>)}
              <g fill="none" stroke={p.current} strokeWidth="1.5" strokeLinecap="round">
                <path d="M28 118Q28 94 43 76M43 79L48 70M83 35Q103 22 127 23M207 128Q203 157 187 172M69 188Q50 177 45 164"/>
              </g>
              {flecks.slice(0,detail.flecks).map(({x,y,angle,scale},i)=><path key={i}
                transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}
                fill={i%7===0?p.light:i%4===0?p.accent:i%3===0?p.shadow:p.current}
                d={i%3===0?'M-4 0Q-2-2.2 1-1.5Q5-1 4 0Q1 2.8-3 1.6Z':'M-2 .4Q-2.6-1.7 0-1.3Q3-1 2 .7Q.4 2-2 .4Z'}/>)}
            </g>
          </g>
          <g transform="translate(83 10)">
            <g filter={url('liquid')}>
              <path fill={p.body} d="M1 11Q13 7 23 5T49 2Q62 1 71 7Q60 4 52 8Q43 12 31 10Q24 8 17 11T1 14Z"/>
              <path fill={p.current} d="M9 10Q20 2 33 5T53 4Q45 10 32 8T15 11Z"/>
            </g>
          </g>
          {!withContent && <g ref={refs.light} opacity=".8">
            <path fill={p.shadow} d="M68 129C65 105 87 80 120 81C153 83 166 110 150 133C161 106 132 91 112 103C92 114 97 141 118 140Q102 154 82 144Q73 140 68 129Z"/>
            <path fill={p.current} d="M87 116C96 96 126 93 140 110C130 104 116 105 109 114C97 128 109 144 131 138C110 154 82 140 87 116Z"/>
            <path fill={url('core')} d="M103 124C104 113 117 107 129 114Q116 111 113 122Q110 133 124 132Q111 141 105 133Q102 129 103 124Z"/>
            <path fill={p.light} d="M117 120Q119 115 124 116Q128 118 124 120Q120 121 118 125Q115 125 117 120Z"/>
            <path fill={p.light} d="M104 119Q107 113 114 114Q109 115 107 121Q105 124 104 119Z"/>
          </g>}
        </g>
        <g ref={refs.drops}>{drops.slice(0, detail.particles).map((drop,i)=>{
          const pose = dropPose(drop, elapsed.current);
          return <path key={i} {...pose} fill={i%4===0?p.accent:p.energy} d="M-2 0Q-1.2-1.35.4-1.2Q2.4-1.1 2 .35Q1.2 1.65-.8 1Z"/>;
        })}</g>
      </svg>
    </motion.div>
    {withContent && <motion.div className="dimensional-portal-opening" inert={!isOpen} style={{opacity:photoOpacity}}>
      <div className="dimensional-portal-content">{children}</div>
    </motion.div>}
    {flowing && <CurrentClock refs={refs} elapsed={elapsed} speed={style.speed} rate={detail.updatesPerSecond}/>}
  </div>;
}
