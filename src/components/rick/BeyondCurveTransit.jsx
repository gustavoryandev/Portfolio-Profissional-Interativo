import { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { REDUCED_MOTION_QUERY } from '../../motionPreferences';
import { BEYOND_CURVE } from '../../data/rickDimensions';
import SceneBackdrop from './SceneBackdrop';
import { preloadScene } from './sceneAssets';
import { curveFlightCues, curveFlightRoutes, paintCurveFlight } from './curveFlight.js';

export default function BeyondCurveTransit({ trip, onArrive, onFinish, onMusicCue }) {
  const { t } = useTranslation();
  const returnFocus = useRef(null);
  const dialog = useRef(null);
  const canvas = useRef(null);
  const skip = useRef(null);
  const finish = useRef(null);
  const incoming = trip.destination === BEYOND_CURVE;
  const extended = incoming && trip.extended;
  const route = incoming ? extended ? curveFlightRoutes.discovery : curveFlightRoutes.revisit : curveFlightRoutes.departure;
  const [shot, setShot] = useState(extended ? 'instability' : 'portal');
  const [fallback, setFallback] = useState(false);

  useLayoutEffect(() => {
    const node = dialog.current;
    const stage = canvas.current;
    const preference = window.matchMedia?.(REDUCED_MOTION_QUERY);
    let frame;
    let timer;
    let active = true;
    let arrived = false;
    const arrive = () => {
      if (arrived) return;
      arrived = true;
      onArrive(trip.destination);
    };
    const settle = interrupted => {
      if (!active) return;
      active = false;
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      arrive();
      onFinish(interrupted);
    };
    const interrupt = () => settle(true);
    finish.current = interrupt;
    const onPreference = () => { if (preference.matches) interrupt(); };
    const onVisibility = () => { if (document.hidden) interrupt(); };
    if (document.hidden || preference?.matches) {
      interrupt();
      return;
    }

    returnFocus.current = trip.opener ?? document.activeElement;
    if (node.showModal) node.showModal();
    else node.setAttribute('open', '');
    skip.current.focus({ preventScroll: true });
    if (!incoming) void preloadScene(trip.destination === 'lab' ? 'labExterior' : 'citadelExterior');

    const context = stage.getContext('2d');
    let viewWidth = 0;
    let viewHeight = 0;
    let lowQuality;
    let dirty = true;
    const resize = () => { dirty = true; };
    function paint(progress) {
      if (dirty) {
        const { width, height } = stage.getBoundingClientRect();
        viewWidth = Math.max(1, width);
        viewHeight = Math.max(1, height);
        lowQuality = width < 768 || (navigator.hardwareConcurrency || 4) <= 4;
        const density = Math.min(window.devicePixelRatio || 1, lowQuality ? 1.15 : 1.45,
          Math.sqrt(1850000 / (viewWidth * viewHeight)));
        stage.width = Math.max(1, Math.round(viewWidth * density));
        stage.height = Math.max(1, Math.round(viewHeight * density));
        context.setTransform(density, 0, 0, density, 0, 0);
        dirty = false;
      }
      paintCurveFlight(context, viewWidth, viewHeight, progress, lowQuality);
    }
    if (context) {
      let cueIndex = curveFlightCues.findLastIndex(cue => route.from >= cue.progress);
      const start = window.performance.now();
      paint(route.from);
      function advance(now) {
        if (!active) return;
        const fraction = Math.min(1, Math.max(0, (now - start) / route.duration));
        const progress = route.from + (route.to - route.from) * fraction;
        paint(progress);
        while (curveFlightCues[cueIndex + 1]?.progress <= progress) {
          const cue = curveFlightCues[++cueIndex];
          setShot(cue.shot);
          if (extended && cue.volume) onMusicCue?.(cue.volume);
          if (cue.shot === 'mansion') arrive();
        }
        if (fraction === 1) settle(false);
        else frame = requestAnimationFrame(advance);
      }
      frame = requestAnimationFrame(advance);
      window.addEventListener('resize', resize);
    } else {
      setFallback(true);
      if (incoming) { setShot('mansion'); arrive(); }
      timer = setTimeout(() => settle(false), 700);
    }
    preference?.addEventListener('change', onPreference);
    stage.addEventListener('contextlost', interrupt);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('popstate', interrupt);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      preference?.removeEventListener('change', onPreference);
      stage.removeEventListener('contextlost', interrupt);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', resize);
      window.removeEventListener('popstate', interrupt);
      const restore = node.contains(document.activeElement);
      if (node.close) node.close();
      else node.removeAttribute('open');
      const opener = returnFocus.current;
      if (restore && opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [extended, incoming, onArrive, onFinish, onMusicCue, route, trip]);

  return <dialog ref={dialog} className="beyond-transit" data-shot={shot} data-renderer={fallback ? 'fallback' : 'canvas'}
    aria-label={t('rick.beyond.scenes.transit')}
    onCancel={event => { event.preventDefault(); finish.current?.(); }}
    onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); finish.current?.(); }
    }}>
    <div className="beyond-transit-field" aria-hidden="true">
      {incoming && <SceneBackdrop scene="mansion" className="beyond-transit-destination" />}
      <canvas ref={canvas} className="beyond-transit-canvas" />
    </div>
    <div className="beyond-transit-caption">
      {shot === 'mansion' ? <><p>{t('rick.beyond.scenes.mansion')}</p><h2>{t('rick.beyond.name')}</h2></> :
        <p>{t(`rick.beyond.scenes.${shot}`)}</p>}
    </div>
    <button ref={skip} type="button" className="beyond-transit-skip" onClick={() => finish.current?.()}>
      {t('rick.beyond.skip')}
    </button>
  </dialog>;
}
