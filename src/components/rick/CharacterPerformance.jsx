import { useLayoutEffect, useRef, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { useReducedSceneMotion } from './sceneAssets';

// A score holds a pose for its beat, then settles on the final pose.
const greeting = [
  ['entrance', 240], ['settle', 180], ['attention', 280], ['reaction', 660], ['idle', 0],
];
export default function CharacterPerformance({ visible, active = true, score = greeting, children }) {
  const reduced = useReducedSceneMotion();
  const [pose, setPose] = useState(null);
  const wasOpen = useRef(false);
  useLayoutEffect(() => {
    let timer;
    function play(index) {
      const [name, hold] = score[index];
      setPose(name);
      if (index + 1 < score.length) timer = setTimeout(() => play(index + 1), hold);
    }
    if (visible) play(reduced || !active || wasOpen.current ? score.length - 1 : 0);
    else {
      setPose(previous => previous && !reduced && active ? 'exit' : null);
      if (!reduced && active) timer = setTimeout(() => setPose(null), 280);
    }
    wasOpen.current = visible;
    return () => clearTimeout(timer);
  }, [visible, reduced, active, score]);
  if (!pose) return null;
  return <MotionConfig transition={{ duration: reduced || !active ? 0 : .16, ease: [.22, .68, .28, 1] }}>
    {children(pose, reduced || !active)}
  </MotionConfig>;
}
