import { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { REDUCED_MOTION_QUERY, RICK_ARRIVAL_DURATION } from '../../motionPreferences';
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
  const dock = trip.destination === 'corrupted';
  const backdrop = incoming ? 'mansion' : dock ? 'dock' : 'garage';
  const portal = incoming || trip.origin === BEYOND_CURVE ? undefined : trip.origin;
  const extended = incoming && trip.extended;
  const route = extended ? curveFlightRoutes.discovery
    : trip.origin === BEYOND_CURVE && !incoming ? curveFlightRoutes.departure : curveFlightRoutes.revisit;
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
    let presentationStart;
    const arrive = (withDock = false) => {
      if (arrived) return;
      arrived = true;
      onArrive(trip.destination, withDock);
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
    if (!incoming) void preloadScene(dock ? 'citadelExterior' : 'labExterior');
    if (dock) void preloadScene('citadel', 'high');

    function present(now) {
      if (presentationStart !== undefined) return;
      presentationStart = now;
      setShot(backdrop);
      arrive();
    }

    function finishFlight(now) {
      if (dock) {
        arrive(true);
        settle(false);
        return;
      }
      present(now);
      stage.style.visibility = 'hidden';
      // Keep the overlapping reveal at its original speed and time only the destination shot.
      timer = window.setTimeout(() => settle(false), Math.max(0, presentationStart + RICK_ARRIVAL_DURATION - now));
    }

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
      paintCurveFlight(context, viewWidth, viewHeight, progress, lowQuality, portal);
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
        if (dock && progress >= .78) arrive(true);
        while (curveFlightCues[cueIndex + 1]?.progress <= progress) {
          const cue = curveFlightCues[++cueIndex];
          if (extended && cue.volume) onMusicCue?.(cue.volume);
          if (cue.shot === 'mansion') {
            if (!dock) present(now);
          } else if (extended) setShot(cue.shot);
        }
        if (fraction === 1) finishFlight(now);
        else frame = requestAnimationFrame(advance);
      }
      frame = requestAnimationFrame(advance);
      window.addEventListener('resize', resize);
    } else {
      setFallback(true);
      finishFlight(window.performance.now());
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
  }, [backdrop, dock, extended, incoming, onArrive, onFinish, onMusicCue, portal, route, trip]);

  return <dialog ref={dialog} className="beyond-transit" data-shot={shot} data-destination={trip.destination}
    data-portal={portal ?? BEYOND_CURVE} data-renderer={fallback ? 'fallback' : 'canvas'}
    aria-label={t('rick.beyond.scenes.transit')}
    onCancel={event => { event.preventDefault(); finish.current?.(); }}
    onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); finish.current?.(); }
    }}>
    <div className="beyond-transit-field" aria-hidden="true">
      <SceneBackdrop scene={backdrop} className="beyond-transit-destination" />
      <canvas ref={canvas} className="beyond-transit-canvas" />
    </div>
    <div className="beyond-transit-caption">
      {shot === 'mansion' ? <><p>{t('rick.beyond.scenes.mansion')}</p><h2>{t('rick.beyond.name')}</h2></>
        : shot === 'garage' ? <h2>{t('rick.garageName')}</h2>
          : <p>{t(portal ? 'rick.beyond.scenes.transit' : `rick.beyond.scenes.${shot}`)}</p>}
    </div>
    <button ref={skip} type="button" className="beyond-transit-skip" onClick={() => finish.current?.()}>
      {t('rick.beyond.skip')}
    </button>
  </dialog>;
}
