import { useCallback, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAstra } from '../context/AstraContext';
import ProjectsCard from './ProjectsCard';
import ScrollReveal from './ui/ScrollReveal';

const EPSILON = 2;
const clamp = (value, max) => Math.min(max, Math.max(0, value));

function connectTrack(section) {
  const stage = section.querySelector('.projects-pin');
  const track = section.querySelector('[data-projects-track]');
  const meter = section.querySelector('.projects-scroll-progress > span');
  const previous = section.querySelector('[data-project-step="-1"]');
  const next = section.querySelector('[data-project-step="1"]');
  const header = section.closest('.scroll-portfolio')?.querySelector('.site-header');
  const desktop = window.matchMedia('(min-width: 1120px) and (hover: hover) and (pointer: fine)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let distance = 0;
  let top = 0;
  let pinned = false;
  let frame = 0;
  let measureFrame = 0;
  let expectedLeft = 0;

  const bounds = () => section.getBoundingClientRect();
  const position = () => clamp(top - bounds().top, distance);
  const slidePosition = slide => slide.offsetLeft - track.clientLeft - parseFloat(window.getComputedStyle(track).paddingLeft || '0');
  const slides = () => [...track.querySelectorAll('[data-project-slide]')];
  const goTo = (left, movePage = pinned) => {
    const target = clamp(left, distance);
    if (movePage) window.scrollTo({ top: window.scrollY + bounds().top - top + target, behavior: 'instant' });
    track.scrollLeft = expectedLeft = target;
    showProgress();
  };
  function showProgress() {
    const left = track.scrollLeft;
    meter.style.transform = `scaleX(${distance ? clamp(left, distance) / distance : 0})`;
    previous.setAttribute('aria-disabled', String(left < EPSILON));
    next.setAttribute('aria-disabled', String(distance - left < EPSILON));
  }
  const update = () => {
    frame = 0;
    if (pinned) {
      expectedLeft = position();
      if (Math.abs(track.scrollLeft - expectedLeft) >= 1) track.scrollLeft = expectedLeft;
    }
    showProgress();
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  const onPageScroll = () => { if (pinned) schedule(); };
  // Focus and scrollIntoView can move an overflow-hidden track. While pinned,
  // reconcile those writes to the page position without moving the page itself.
  const onTrackScroll = () => {
    if (!pinned || Math.abs(track.scrollLeft - expectedLeft) >= 1) schedule();
  };

  function measure(reset = false) {
    if (!track.clientWidth) return;
    const sectionTop = bounds().top;
    const inRun = pinned && sectionTop <= top + EPSILON && sectionTop >= top - distance - EPSILON;
    top = (header?.offsetHeight ?? 0) + 16;
    section.style.setProperty('--projects-pin-top', `${top}px`);
    distance = Math.max(0, track.scrollWidth - track.clientWidth);
    section.dataset.overflow = String(distance > EPSILON);
    // The desktop stage has a viewport budget in CSS, independently of pinned state.
    // Never toggle pinning based on its measured height: doing so makes controls,
    // text wrapping and ResizeObserver feed back into each other at the boundary.
    const height = stage.getBoundingClientRect().height;
    pinned = desktop.matches && !reduced.matches && distance > EPSILON;
    section.dataset.pinned = String(pinned);
    section.style.height = pinned ? `${height + distance}px` : '';

    // Only explicit navigation/filtering may move the document. Passive measuring
    // must not write scrollY, particularly after reaching either end of the rail.
    if (reset) goTo(0, inRun);
    update();
  }

  function step(direction) {
    if (distance <= EPSILON) return;
    const current = pinned ? position() : track.scrollLeft;
    const remaining = direction > 0 ? distance - current : current;
    if (remaining < EPSILON) return;
    const stops = slides().map(slidePosition);
    const target = direction > 0 ? stops.find(left => left > current + EPSILON)
      : stops.findLast(left => left < current - EPSILON);
    goTo(target ?? (direction > 0 ? distance : 0));
  }
  const goBack = () => step(-1);
  const goForward = () => step(1);
  function keydown(event) {
    if (event.target !== track || distance <= EPSILON || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    switch (event.key) {
      case 'ArrowLeft': goBack(); break;
      case 'ArrowRight': goForward(); break;
      case 'Home': goTo(0); break;
      case 'End': goTo(distance); break;
      default: return;
    }
    event.preventDefault();
  }
  function reveal(slide, direct = false) {
    const left = slidePosition(slide);
    const current = pinned ? position() : track.scrollLeft;
    const outside = left < current - EPSILON || left + slide.offsetWidth > current + track.clientWidth + EPSILON;
    if (direct && !pinned) slide.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'instant' });
    if (direct || outside) goTo(left);
  }
  const focus = event => {
    if (!event.target.matches(':focus-visible')) return;
    const slide = event.target.closest('[data-project-slide]');
    if (slide) reveal(slide);
  };

  const resize = () => {
    if (!measureFrame) measureFrame = requestAnimationFrame(() => {
      measureFrame = 0;
      measure();
    });
  };
  const observer = new ResizeObserver(resize);
  observer.observe(stage);
  observer.observe(track);
  if (header) observer.observe(header, { box: 'border-box' });
  window.addEventListener('scroll', onPageScroll, { passive: true });
  window.addEventListener('resize', resize);
  desktop.addEventListener('change', resize);
  reduced.addEventListener('change', resize);
  track.addEventListener('scroll', onTrackScroll, { passive: true });
  track.addEventListener('keydown', keydown);
  track.addEventListener('focusin', focus);
  previous.addEventListener('click', goBack);
  next.addEventListener('click', goForward);
  measure();
  return {
    reset: () => measure(true),
    focus(project) {
      measure();
      const slide = slides().find(item => item.dataset.projectId === project);
      const heading = slide?.querySelector('h4');
      if (!heading) return;
      reveal(slide, true);
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    },
    disconnect() {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(measureFrame);
      observer.disconnect();
      window.removeEventListener('scroll', onPageScroll);
      window.removeEventListener('resize', resize);
      desktop.removeEventListener('change', resize);
      reduced.removeEventListener('change', resize);
      track.removeEventListener('scroll', onTrackScroll);
      track.removeEventListener('keydown', keydown);
      track.removeEventListener('focusin', focus);
      previous.removeEventListener('click', goBack);
      next.removeEventListener('click', goForward);
    },
  };
}

export default function ProjectsScrollSection({ projectFocus }) {
  const sectionRef = useRef(null);
  const controller = useRef(null);
  const { openAstra } = useAstra();
  const { t } = useTranslation();
  const reset = useCallback(() => controller.current?.reset(), []);

  useLayoutEffect(() => {
    controller.current = connectTrack(sectionRef.current);
    return () => { controller.current.disconnect(); controller.current = null; };
  }, []);

  useLayoutEffect(() => {
    if (!projectFocus?.project) return;
    const frame = requestAnimationFrame(() => controller.current?.focus(projectFocus.project));
    return () => cancelAnimationFrame(frame);
  }, [projectFocus]);

  return <section ref={sectionRef} id="projetos" className="projects-scroll-section" aria-labelledby="projects-title">
    <div className="projects-pin">
      <ScrollReveal>
        <div className="projects-scroll-heading">
          <div><p className="section-eyebrow">02 / {t('projetos.sectionLabel')}</p>
            <h2 id="projects-title">{t('projetos.sectionTitle')}</h2></div>
          <p className="projects-scroll-hint"><span className="projects-hint-pinned">{t('projetos.scrollHint')}</span><span className="projects-hint-native">{t('projetos.swipeHint')}</span></p>
        </div>
      </ScrollReveal>
      <ProjectsCard showcase projectFocus={projectFocus} onAskAstra={openAstra} onResultsChange={reset} />
    </div>
  </section>;
}
