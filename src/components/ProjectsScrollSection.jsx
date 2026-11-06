import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ProjectsCard from './ProjectsCard';

// Native document scrolling drives the horizontal track; no wheel interception.
export default function ProjectsScrollSection() {
  const sectionRef = useRef(null);
  const { i18n } = useTranslation();
  const en = i18n.language.startsWith('en');

  useEffect(() => {
    const section = sectionRef.current;
    const pin = section.querySelector('.projects-pin');
    const track = section.querySelector('[data-projects-track]');
    const meter = section.querySelector('.projects-scroll-progress > span');
    const header = document.querySelector('.site-header');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let distance = 0;
    let top = 0;
    let pinned = false;
    let frame = 0;

    const update = () => {
      frame = 0;
      if (!pinned) return;
      const position = Math.min(distance, Math.max(0, top - section.getBoundingClientRect().top));
      track.scrollLeft = position;
      meter.style.transform = `scaleX(${distance ? position / distance : 1})`;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const measure = () => {
      top = (header?.getBoundingClientRect().height || 0) + 12;
      section.style.setProperty('--projects-pin-top', `${top}px`);
      const stageHeight = window.innerHeight - top;
      section.style.setProperty('--projects-stage-height', `${stageHeight}px`);
      distance = Math.max(0, track.scrollWidth - track.clientWidth);
      // Short screens keep all card content readable instead of clipping it.
      pinned = !reduced.matches && distance > 1 && pin.offsetHeight <= stageHeight + 1;
      section.dataset.pinned = String(pinned);
      section.style.height = pinned ? `${stageHeight + distance}px` : '';
      if (!pinned) meter.style.transform = 'scaleX(0)';
      schedule();
    };
    const start = () => window.scrollY + section.getBoundingClientRect().top - top;
    const moveTo = (position) => window.scrollTo({ top: start() + Math.min(distance, Math.max(0, position)), behavior: 'instant' });
    const keydown = (event) => {
      if (!pinned || event.target !== track) return;
      const current = Math.min(distance, Math.max(0, top - section.getBoundingClientRect().top));
      const step = track.querySelector('[data-project-slide]')?.offsetWidth + 24 || 344;
      const positions = { ArrowRight: current + step, ArrowLeft: current - step, Home: 0, End: distance };
      if (positions[event.key] === undefined) return;
      event.preventDefault();
      moveTo(positions[event.key]);
    };
    const focus = (event) => {
      if (!pinned || !event.target.matches(':focus-visible')) return;
      const slide = event.target.closest('[data-project-slide]');
      if (!slide) return;
      const position = slide.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
      moveTo(position);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(pin);
    observer.observe(track);
    if (header) observer.observe(header);
    const mutations = new MutationObserver(measure);
    mutations.observe(track, { childList: true, subtree: true, characterData: true });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', measure);
    reduced.addEventListener('change', measure);
    track.addEventListener('keydown', keydown);
    track.addEventListener('focusin', focus);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutations.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', measure);
      reduced.removeEventListener('change', measure);
      track.removeEventListener('keydown', keydown);
      track.removeEventListener('focusin', focus);
    };
  }, []);

  return <section ref={sectionRef} id="projetos" className="projects-scroll-section" aria-labelledby="projects-title">
    <div className="projects-pin">
      <div className="projects-scroll-heading"><div><p className="section-eyebrow">02 / {en ? 'SELECTED WORK' : 'PROJETOS'}</p><h2 id="projects-title">{en ? 'Ideas put into practice.' : 'Ideias colocadas em prática.'}</h2></div><span className="projects-scroll-hint">{en ? 'Scroll to explore →' : 'Role para explorar →'}</span></div>
      <ProjectsCard />
      <div className="projects-scroll-progress" aria-hidden="true"><span /></div>
    </div>
  </section>;
}
