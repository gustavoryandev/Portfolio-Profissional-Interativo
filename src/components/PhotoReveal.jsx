import { useEffect, useId, useRef, useState } from 'react';
import { REDUCED_MOTION_QUERY } from '../motionPreferences.js';

const DEFAULT_RADIUS = 110;
const DEFAULT_SOFTNESS = 38;
const MAX_DEVICE_PIXEL_RATIO = 2;
const TRAIL_LIFETIME = 660;
const MAX_STAMPS = 30;
const DEFAULT_MATTE = ['#141414', '#141414'];

function drawAlternative(context, image, width, height, placement) {
  if (placement) {
    const left = placement.x * width;
    const drawWidth = placement.width * width;
    context.drawImage(image, left, placement.y * height, drawWidth,
      drawWidth * image.naturalHeight / image.naturalWidth);
    if (placement.fadeRight) {
      const right = left + drawWidth;
      const start = right - placement.fadeRight * drawWidth;
      const edge = context.createLinearGradient(start, 0, right, 0);
      edge.addColorStop(0, 'transparent');
      edge.addColorStop(1, 'black');
      context.globalCompositeOperation = 'destination-out';
      context.fillStyle = edge;
      context.fillRect(start, 0, Math.max(0, width - start), height);
    }
    return;
  }
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  context.drawImage(
    image,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

function clearCanvas(canvas, context) {
  if (!canvas || !context) return;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function subscribeToMediaQuery(query, listener) {
  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }
  query.addListener(listener);
  return () => query.removeListener(listener);
}

const containedImageStyle = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' };

function alternativeStyle(placement) {
  if (!placement) return containedImageStyle;
  return {
    position: 'absolute',
    width: `${placement.width * 100}%`,
    height: 'auto',
    left: `${placement.x * 100}%`,
    top: `${placement.y * 100}%`,
    maxWidth: 'none',
    maskImage: placement.fadeRight
      ? `linear-gradient(to right, black ${(1 - placement.fadeRight) * 100}%, transparent)` : undefined,
  };
}

export default function PhotoReveal({
  originalSrc,
  alternativeSrc,
  alt = '',
  alternativeAlt = '',
  alternativePlacement,
  showLabel,
  hideLabel,
  radius = DEFAULT_RADIUS,
  softness = DEFAULT_SOFTNESS,
  aspectRatio = '572 / 777',
  className = '',
  style,
  onAlternativeError,
}) {
  if (typeof originalSrc !== 'string' || !originalSrc.trim()) {
    throw new TypeError('PhotoReveal requires a non-empty originalSrc.');
  }
  if (alternativeSrc != null && typeof alternativeSrc !== 'string') {
    throw new TypeError('PhotoReveal alternativeSrc must be a string when provided.');
  }
  if (!Number.isFinite(radius) || radius < 0) {
    throw new RangeError('PhotoReveal radius must be a finite non-negative number.');
  }
  if (!Number.isFinite(softness) || softness < 0) {
    throw new RangeError('PhotoReveal softness must be a finite non-negative number.');
  }

  const stageId = useId();
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const alternativeRef = useRef(null);
  const [reduced, setReduced] = useState(() => Boolean(window.matchMedia?.(REDUCED_MOTION_QUERY).matches));
  const [loadedAlternative, setLoadedAlternative] = useState('');
  const [shownAlternative, setShownAlternative] = useState('');
  const alternativeReady = Boolean(alternativeSrc) && loadedAlternative === alternativeSrc;
  const showingAlternative = alternativeReady && shownAlternative === alternativeSrc;
  const interactive = alternativeReady && !showingAlternative && !reduced && radius > 0;

  useEffect(() => {
    const preference = window.matchMedia?.(REDUCED_MOTION_QUERY);
    if (!preference) return;
    return subscribeToMediaQuery(preference, () => setReduced(preference.matches));
  }, []);

  useEffect(() => {
    if (!interactive) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const alternative = alternativeRef.current;
    const context = canvas.getContext('2d');
    const alternativeFrame = document.createElement('canvas');
    const frameContext = alternativeFrame.getContext('2d');
    if (!context || !frameContext) return;

    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let frameId = null;
    let inView = true;
    let touchId = null;
    let lastFrame = 0;
    let target = null;
    let tip = null;
    const trail = [];

    const stop = () => {
      touchId = null;
      target = null;
      tip = null;
      lastFrame = 0;
      trail.length = 0;
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      frameId = null;
      clearCanvas(canvas, context);
    };

    const schedule = () => {
      if (frameId === null && inView && !document.hidden && width && height) {
        frameId = window.requestAnimationFrame(draw);
      }
    };

    function draw(time) {
      frameId = null;
      if (!inView || document.hidden) { stop(); return; }
      const elapsed = lastFrame ? Math.min(40, time - lastFrame) : 16;
      lastFrame = time;
      while (trail.length && time - trail[0].time >= TRAIL_LIFETIME) trail.shift();

      if (target) {
        const bounds = container.getBoundingClientRect();
        const end = { x: target.x - bounds.left, y: target.y - bounds.top };
        const previous = tip ?? end;
        const easing = 1 - Math.exp(-elapsed / 54);
        const brush = Math.min(radius, width * .43) * (target.touch ? 1.16 : 1);
        const next = { x: previous.x + (end.x - previous.x) * easing, y: previous.y + (end.y - previous.y) * easing };
        const distance = Math.hypot(next.x - previous.x, next.y - previous.y);
        if (!tip || distance >= .45) {
          const steps = Math.min(8, Math.max(1, Math.ceil(distance / (brush * .23))));
          for (let step = 1; step <= steps; step += 1) {
            const progress = step / steps;
            trail.push({
              x: previous.x + (next.x - previous.x) * progress,
              y: previous.y + (next.y - previous.y) * progress,
              radius: brush * (1 + Math.sin((time + step * 13) / 76) * .09),
              time,
            });
          }
          if (trail.length > MAX_STAMPS) trail.splice(0, trail.length - MAX_STAMPS);
        }
        tip = next;
        if (Math.hypot(end.x - next.x, end.y - next.y) < .6) target = null;
      }

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      if (trail.length) {
        for (const stamp of trail) {
          const opacity = .8 * (1 - (time - stamp.time) / TRAIL_LIFETIME) ** 1.8;
          const inner = Math.max(0, stamp.radius - Math.max(1, softness));
          const edge = context.createRadialGradient(stamp.x, stamp.y, inner, stamp.x, stamp.y, stamp.radius);
          edge.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
          edge.addColorStop(1, 'rgba(255, 255, 255, 0)');
          context.fillStyle = edge;
          context.fillRect(stamp.x - stamp.radius, stamp.y - stamp.radius, stamp.radius * 2, stamp.radius * 2);
        }
        context.globalCompositeOperation = 'source-in';
        context.drawImage(alternativeFrame, 0, 0, width, height);
        context.globalCompositeOperation = 'source-over';
      }
      if (target || trail.length) schedule();
      else { lastFrame = 0; tip = null; }
    }

    const resize = () => {
      const bounds = container.getBoundingClientRect();
      const sizeChanged = width !== bounds.width || height !== bounds.height;
      width = bounds.width;
      height = bounds.height;
      pixelRatio = Math.min(MAX_DEVICE_PIXEL_RATIO, Math.max(.5, Number(window.devicePixelRatio) || 1));
      const backingWidth = Math.max(1, Math.round(width * pixelRatio));
      const backingHeight = Math.max(1, Math.round(height * pixelRatio));
      if (!sizeChanged && canvas.width === backingWidth && canvas.height === backingHeight) return;
      stop();
      canvas.width = backingWidth;
      canvas.height = backingHeight;
      alternativeFrame.width = backingWidth;
      alternativeFrame.height = backingHeight;
      if (!width || !height) return;
      // Paint the opaque alternate once at this size. Only the brush mask changes per frame.
      frameContext.setTransform(backingWidth / width, 0, 0, backingHeight / height, 0, 0);
      drawAlternative(frameContext, alternative, width, height, alternativePlacement);
      frameContext.globalCompositeOperation = 'destination-over';
      const matte = frameContext.createLinearGradient(0, 0, 0, height);
      const colors = alternativePlacement?.matte ?? DEFAULT_MATTE;
      colors.forEach((color, index) => matte.addColorStop(index / (colors.length - 1), color));
      frameContext.fillStyle = matte;
      frameContext.fillRect(0, 0, width, height);
    };

    const handleMove = event => {
      if (!inView || document.hidden || (event.pointerType === 'touch' && touchId !== event.pointerId)) return;
      target = { x: event.clientX, y: event.clientY, touch: event.pointerType === 'touch' };
      schedule();
    };
    const handleDown = event => {
      if (event.pointerType !== 'touch' || !event.isPrimary || !inView || document.hidden) return;
      touchId = event.pointerId;
      tip = null;
      handleMove(event);
    };
    const handleLeave = event => {
      if (event.pointerType === 'touch' && event.pointerId !== touchId) return;
      touchId = null;
      target = null;
      tip = null;
    };
    const handleTouchEnd = event => {
      if (event.pointerType !== 'touch' || event.pointerId !== touchId) return;
      if (event.type === 'pointerup' && target && !tip) {
        // A quick tap can end before its first animation frame.
        touchId = null;
      } else {
        handleLeave(event);
      }
    };
    const handleVisibility = () => { if (document.hidden) stop(); };
    const intersection = typeof IntersectionObserver === 'function' ? new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (!inView) stop();
    }) : null;
    const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;

    container.addEventListener('pointerdown', handleDown, { passive: true });
    container.addEventListener('pointermove', handleMove, { passive: true });
    container.addEventListener('pointerleave', handleLeave);
    window.addEventListener('pointerup', handleTouchEnd);
    window.addEventListener('pointercancel', handleTouchEnd);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('resize', resize);
    intersection?.observe(container);
    resizeObserver?.observe(container);
    resize();

    return () => {
      container.removeEventListener('pointerdown', handleDown);
      container.removeEventListener('pointermove', handleMove);
      container.removeEventListener('pointerleave', handleLeave);
      window.removeEventListener('pointerup', handleTouchEnd);
      window.removeEventListener('pointercancel', handleTouchEnd);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('resize', resize);
      intersection?.disconnect();
      resizeObserver?.disconnect();
      stop();
    };
  }, [interactive, alternativePlacement, radius, softness]);

  const handleAlternativeError = event => {
    setLoadedAlternative('');
    setShownAlternative('');
    onAlternativeError?.(event);
  };

  return (
    <div className={className} data-photo-reveal data-interactive={interactive}>
      <div id={stageId} ref={containerRef} className="photo-reveal-stage"
        style={{ position: 'relative', overflow: 'hidden', aspectRatio, touchAction: 'pan-y pinch-zoom', ...style }}>
        <img src={originalSrc} alt={alt} draggable="false" fetchPriority="high"
          aria-hidden={showingAlternative || undefined}
          style={{ ...containedImageStyle, visibility: showingAlternative ? 'hidden' : 'visible' }} />
        {showingAlternative && <div aria-hidden="true" style={{ position: 'absolute', inset: 0,
          background: `linear-gradient(${(alternativePlacement?.matte ?? DEFAULT_MATTE).join(', ')})` }} />}
        {alternativeSrc && (
          <img key={alternativeSrc} ref={alternativeRef} src={alternativeSrc}
            alt={showingAlternative ? alternativeAlt : ''} aria-hidden={!showingAlternative}
            draggable="false" decoding="async"
            onLoad={() => { if (alternativeRef.current?.naturalWidth) setLoadedAlternative(alternativeSrc); }}
            onError={handleAlternativeError}
            style={{ ...alternativeStyle(alternativePlacement), opacity: showingAlternative ? 1 : 0, pointerEvents: 'none' }}
          />
        )}
        {interactive && <canvas ref={canvasRef} aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />}
      </div>
      {showLabel && hideLabel && <button type="button" className="photo-reveal-toggle" aria-controls={stageId}
        disabled={!alternativeReady}
        onClick={() => setShownAlternative(showingAlternative ? '' : alternativeSrc)}>
        {showingAlternative ? hideLabel : showLabel}
      </button>}
    </div>
  );
}
