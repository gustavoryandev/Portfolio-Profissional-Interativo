import { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { REDUCED_MOTION_QUERY } from '../../motionPreferences';
import { BEYOND_CURVE } from '../../data/rickDimensions';
import { beyondJourney, preloadScene } from './sceneAssets';

const discovery = [
  ['detected', 325], ['instability', 425], ['curve', 600], ['rupture', 580],
  ['portal', 720], ['transit', 570], ['mansion', 730],
];
const revisit = [['portal', 420], ['mansion', 430]];
const departure = [['portal', 420]];

export default function BeyondCurveTransit({ trip, onArrive, onFinish }) {
  const { t } = useTranslation();
  const returnFocus = useRef(null);
  const dialog = useRef(null);
  const skip = useRef(null);
  const finish = useRef(null);
  const [frame, setFrame] = useState(0);
  const incoming = trip.destination === BEYOND_CURVE;
  const frames = incoming ? trip.firstDiscovery ? discovery : revisit : departure;
  const [shot] = frames[frame];

  useLayoutEffect(() => {
    const node = dialog.current;
    const preference = window.matchMedia?.(REDUCED_MOTION_QUERY);
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

    returnFocus.current = document.activeElement;
    if (node.showModal) node.showModal();
    else node.setAttribute('open', '');
    skip.current.focus({ preventScroll: true });
    void preloadScene(incoming ? trip.firstDiscovery ? 'beyondDiscovery' : 'beyondVisit' : 'beyondPortal');
    if (!incoming) void preloadScene(trip.destination === 'lab' ? 'labExterior' : 'citadelExterior');
    let index = 0;
    function advance() {
      index++;
      if (index >= frames.length) {
        settle(false);
        return;
      }
      if (frames[index][0] === 'mansion') arrive();
      setFrame(index);
      timer = setTimeout(advance, frames[index][1]);
    }
    timer = setTimeout(advance, frames[0][1]);
    preference?.addEventListener('change', onPreference);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('popstate', interrupt);
    return () => {
      active = false;
      clearTimeout(timer);
      preference?.removeEventListener('change', onPreference);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('popstate', interrupt);
      const restore = node.contains(document.activeElement);
      if (node.close) node.close();
      else node.removeAttribute('open');
      const opener = returnFocus.current;
      if (restore && opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [frames, incoming, onArrive, onFinish, trip]);

  return <dialog ref={dialog} className="beyond-transit" data-shot={shot} aria-label={t('rick.beyond.scenes.transit')}
    onCancel={event => { event.preventDefault(); finish.current?.(); }}
    onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); finish.current?.(); }
    }}>
    <div key={shot} className="beyond-transit-frame" aria-hidden="true">
      {beyondJourney[shot] && <img src={beyondJourney[shot]} alt="" decoding="async"
        onError={event => { event.currentTarget.hidden = true; }} />}
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
