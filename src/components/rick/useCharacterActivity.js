import { useEffect, useState } from 'react';

const subjects = new Map();
let observer;
const syncVisibility = () => {
  for (const subject of subjects.values()) subject.update(subject.visible && !document.hidden);
};

function watch(element, update) {
  const observable = typeof IntersectionObserver !== 'undefined';
  if (subjects.size === 0) {
    document.addEventListener('visibilitychange', syncVisibility);
    if (observable) observer = new IntersectionObserver(entries => {
      for (const { target, isIntersecting } of entries) {
        const subject = subjects.get(target);
        if (!subject) continue;
        subject.visible = isIntersecting;
        subject.update(isIntersecting && !document.hidden);
      }
    });
  }
  subjects.set(element, { update, visible: !observable });
  observer?.observe(element);
  update(!observable && !document.hidden);
  return () => {
    subjects.delete(element);
    observer?.unobserve?.(element);
    if (!subjects.size) {
      observer?.disconnect();
      observer = undefined;
      document.removeEventListener('visibilitychange', syncVisibility);
    }
  };
}

export default function useCharacterActivity(ref, enabled = true) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (enabled && ref.current) return watch(ref.current, setActive);
    setActive(false);
  }, [ref, enabled]);
  return enabled && active;
}
