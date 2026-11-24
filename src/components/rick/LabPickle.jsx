import { useContext, useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../../context/ThemeState';
import PickleFrames, { frameCounts } from './PickleFrames';
import useCharacterActivity from './useCharacterActivity';
import { useReducedSceneMotion, useSceneAssets } from './sceneAssets';

function Experiment({ enabled, visible }) {
  const { t } = useTranslation();
  const { recordDiscovery } = useContext(ThemeContext) ?? {};
  const ref = useRef(null);
  const active = useCharacterActivity(ref, visible);
  const [found, setFound] = useState(false);
  const [take, setTake] = useState(null);
  const [drawing, setDrawing] = useState({ action: 'still', frame: 0 });
  const [left, setLeft] = useState(false);
  const position = useMotionValue(1);
  const x = useTransform(position, value => `${value * 100}%`);
  const reduced = useReducedSceneMotion();
  const assets = useSceneAssets(visible ? 'experiment' : null, active || Boolean(take));

  useEffect(() => {
    if (!take) return;
    const target = take.left ? 0 : 1;
    function settle() {
      position.set(target);
      setFound(true);
      recordDiscovery?.('pickle');
      setDrawing({ action: 'still', frame: 0 });
      setTake(null);
    }
    if (reduced || !active) { settle(); return; }
    if (assets === 'loading') return;
    const assemblyTime = take.assemble ? 420 : 0;
    const runningTime = 840;
    const anticipation = 190;
    const runStart = anticipation + assemblyTime;
    // One clock drives both foot contact and travel along the track.
    const playback = animate(0, runStart + runningTime, {
      duration: (runStart + runningTime) / 1000, ease: 'linear',
      onUpdate(time) {
        let action, progress;
        if (time < anticipation) { action = 'prepare'; progress = time / anticipation; }
        else if (time < runStart) { action = 'assemble'; progress = (time - anticipation) / assemblyTime; }
        else {
          action = 'run';
          progress = (time - runStart) / runningTime;
          position.set(take.left ? 1 - progress : progress);
        }
        const frame = Math.floor(progress * frameCounts[action] * (action === 'run' ? 2 : 1)) % frameCounts[action];
        setDrawing(previous => previous.action === action && previous.frame === frame ? previous : { action, frame });
      },
      onComplete: settle,
    });
    return () => playback.stop();
  }, [take, assets, reduced, active, position, recordDiscovery]);

  if (!enabled) return null;
  return <div ref={ref} className="lab-pickle-stage" data-rick-motion data-spotted={active} data-found={found} hidden={!visible}>
    <span className="lost-screw" aria-hidden="true">⚙</span>
    <motion.div className="pickle-runner" style={{ x }}>
      <button type="button" className="pickle-button" aria-label={t('rick.pickleRun')} aria-disabled={Boolean(take)} aria-pressed={found}
        onClick={() => {
          if (take) return;
          setTake({ left: !left, assemble: !found });
          setLeft(!left);
        }}>
        <PickleFrames {...drawing} suited={found} useImage={assets === 'ready'} facingLeft={found || take ? left : true} />
      </button>
    </motion.div>
    <span className="pickle-experiment" aria-hidden="true">{t(found ? 'rick.ratSuit' : 'rick.experiment')}</span>
    <span className="sr-only" role="status">{found ? t('rick.pickleFound') : ''}</span>
  </div>;
}

export default function LabPickle() {
  const { theme, dimension } = useContext(ThemeContext) ?? {};
  return <Experiment enabled={theme === 'rick-morty'} visible={theme === 'rick-morty' && dimension === 'lab'} />;
}
