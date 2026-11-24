import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { useReducedSceneMotion } from './sceneAssets';
import useCharacterActivity from './useCharacterActivity';

// Eye contours are registered in the original PNG coordinates. Only the lids
// move over the intact portrait, including where the eyes extend past the face.
const portraits = {
  poopybutthole: { size: [399, 1162], view: '30 25 495 640', skin: '#fff2a6', eyes: [
    'M120 292 C125 259 151 240 177 257 C206 273 205 316 185 346 C163 376 128 356 120 329 Q114 310 120 292Z',
    'M211 312 C222 276 252 268 278 284 C314 301 330 343 309 371 C286 398 248 382 227 365 Q202 347 211 312Z',
  ], seams: ['M119 301 Q160 326 197 307', 'M209 324 Q256 352 318 334'] },
  squanchy: { size: [512, 512], view: '17 2 478 493', skin: '#cda02f', eyes: [
    'M158 316 C161 279 200 272 222 292 C246 313 243 347 218 360 C185 376 152 350 158 316Z',
    'M269 319 C277 288 309 286 328 305 C350 329 335 358 311 362 C278 367 259 344 269 319Z',
  ], seams: ['M158 319 Q195 342 240 319', 'M267 324 Q301 345 337 326'] },
  meeseeks: { size: [579, 596], view: '-10 -3 599 602', skin: '#39def4', eyes: [
    'M153 291 Q157 256 185 263 C220 261 250 302 231 335 Q213 351 177 343 Q148 340 153 291Z',
    'M251 263 Q256 228 284 232 C318 229 342 268 331 301 Q321 326 286 316 Q248 307 251 263Z',
  ], seams: ['M153 299 Q189 318 236 299', 'M252 272 Q291 293 331 272'] },
};
const noSubscribe = () => () => {};
const neutral = { name: 'idle', beat: 0 };

export default function AssistantPortrait({ persona, visible, focused, typing, loading, streaming, last }) {
  const ref = useRef(null);
  const previous = useRef(null);
  const reduced = useReducedSceneMotion();
  const [imageReady, setImageReady] = useState(false);
  const active = useCharacterActivity(ref, visible) && imageReady && !reduced;
  const hasText = useSyncExternalStore(streaming?.buffer.subscribe ?? noSubscribe,
    () => Boolean(streaming?.buffer.getSnapshot().text), () => false);
  const [gesture, setGesture] = useState(neutral);
  const clip = useId();
  const id = last?.id;
  const error = last?.tone === 'error';
  const turn = streaming?.id;
  useEffect(() => {
    const old = previous.current;
    if (!active) {
      previous.current = null;
      setGesture(neutral);
      return;
    }
    const presented = hasText ? turn : old?.presented;
    previous.current = { id, focused, typing, loading, presented, hasText, turn };
    let name;
    if (loading) {
      if (!old?.loading || old.hasText !== hasText || old.turn !== turn) name = hasText ? 'reply' : 'processing';
    } else if (!old) name = 'greeting';
    else if (id !== old.id && last?.sender === 'ai') {
      if (error) name = 'error';
      else if (last.degraded) name = 'idle';
      else if (old.presented !== id) name = 'reply';
    } else if ((focused && !old.focused) || (typing && !old.typing)) name = 'attention';
    if (name) setGesture(current => ({ name, beat: current.beat + 1 }));
  }, [active, id, last, focused, typing, loading, hasText, turn, error]);
  useEffect(() => {
    if (!active || gesture.name === 'idle' || gesture.name === 'processing') return;
    const timer = setTimeout(() => setGesture(current => ({ ...current, name: 'idle' })), 780);
    return () => clearTimeout(timer);
  }, [active, gesture]);
  const art = portraits[persona.id];
  return <span ref={ref} className="assistant-portrait" data-rick-motion data-active={active}
    data-persona={persona.id} data-gesture={gesture.name} data-alternate={gesture.beat % 2 === 0} aria-hidden="true">
    {!imageReady && <span className="portrait-initial">{persona.name[0]}</span>}
    <svg viewBox={art.view}>
      <defs><clipPath id={clip}>{art.eyes.map(d => <path key={d} d={d} />)}</clipPath></defs>
      <g className="portrait-breath"><g className="portrait-gesture">
        <image href={persona.image} width={art.size[0]} height={art.size[1]} onLoad={() => setImageReady(true)} onError={() => setImageReady(false)} />
        {imageReady && <g className="portrait-expression" clipPath={`url(#${clip})`}>
          <g className="portrait-lids">
            {art.eyes.map(d => <path key={d} d={d} fill={art.skin} stroke="#26313a" strokeWidth="3" />)}
            {art.seams.map(d => <path key={d} d={d} fill="none" stroke="#36302d" strokeWidth="4" strokeLinecap="round" />)}
          </g>
        </g>}
      </g></g>
    </svg>
  </span>;
}
