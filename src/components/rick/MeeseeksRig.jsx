import { useId } from 'react';
import { motion } from 'framer-motion';

const ink = '#183143';
const skin = '#78dfee';
// Angles are relative to a joint in the parent drawing, in SVG user units.
const poses = {
  settle:    { spine: -5, head: -3, left: 14, right: -24, gaze: 0, lid: 3, brow: 1, mouth: 'smile' },
  entrance:  { spine: 8, head: 10, left: -22, right: 26, gaze: -1, lid: 2, brow: 2, mouth: 'small' },
  attention: { spine: 3, head: -13, left: -7, right: -32, gaze: 2, lid: -1, brow: -2, mouth: 'round' },
  reaction:  { spine: -5, head: -5, left: 33, right: -89, gaze: 1.5, lid: 0, brow: -1, mouth: 'grin' },
  idle:      { spine: 0, head: 3, left: -8, right: -14, gaze: 0, lid: 1, brow: 0, mouth: 'smile' },
  exit:      { spine: 10, head: 16, left: -28, right: 34, gaze: -2, lid: 4, brow: 3, mouth: 'small' },
};
const mouths = {
  small: 'M -9 -10 C -5 -10 1 -8 7 -10 C 8 -6 0 -5 -4 -7 C -7 -8 -9 -8 -9 -10 Z',
  round: 'M -5 -11 C -2 -15 4 -15 6 -11 C 9 -3 2 0 -2 -3 C -6 -4 -7 -7 -5 -11 Z',
  grin:  'M -14 -13 C -7 -10 4 -9 14 -14 C 13 -3 5 0 -3 -2 C -11 -4 -14 -8 -14 -13 Z',
  smile: 'M -13 -11 C -6 -8 5 -7 12 -12 C 10 -5 2 -3 -4 -5 C -9 -6 -12 -8 -13 -11 Z',
};

function Joint({ x, y, angle, name, children }) {
  return <g transform={`translate(${x} ${y})`}>
    <motion.g data-joint={name} animate={{ rotate: angle }} style={{ transformBox: 'view-box', originX: 0, originY: 0 }}>
      {children}
    </motion.g>
  </g>;
}

function Face({ pose }) {
  const mouthClip = useId();
  const eyesClip = useId();
  const mouth = { d: mouths[pose.mouth] };
  return <>
    <defs>
      <clipPath id={mouthClip}><motion.path animate={mouth} /></clipPath>
      <clipPath id={eyesClip}><ellipse cx="-6" cy="-19" rx="3" ry="4.2" /><ellipse cx="5" cy="-19" rx="3" ry="4.2" /></clipPath>
    </defs>
    <path fill={skin} d="M -7 1 C -19 -2 -24 -13 -21 -26 C -18 -40 -4 -44 8 -39 C 24 -33 26 -15 18 -5 Q 9 6 -2 3 Z" />
    <motion.g animate={{ y: pose.brow }} fill="none" strokeWidth="1.6">
      <path d="M -12 -26 Q -9 -30 -5 -29 M 2 -29 Q 7 -31 10 -27" />
    </motion.g>
    <motion.g animate={{ x: pose.gaze }} stroke="none">
      <g clipPath={`url(#${eyesClip})`}>
        <rect x="-11" y="-25" width="21" height="13" fill={ink} />
        <path fill="#fff" d="M -7.8 -21 h1.8 v2 h-1.8z M 3 -21 h1.8 v2 H3z" />
        <motion.path data-joint="eyelids" fill={skin} stroke={ink} strokeWidth=".8"
          d="M -11 -33 H 10 V -24 Q 4 -21 0 -24 Q -6 -21 -11 -24 Z" animate={{ y: pose.lid }} />
      </g>
    </motion.g>
    <motion.path data-joint="mouth" animate={mouth} fill="#50233b" strokeWidth="1.5" />
    <g clipPath={`url(#${mouthClip})`}>
      <path fill="#f9edcf" strokeWidth=".7" d="M -14 -15 H 13 L 10 -10 Q 7 -7 5 -10 Q 2 -6 -1 -9 Q -5 -6 -7 -10 Q -12 -8 -14 -15 Z" />
      <ellipse fill="#e37e8e" stroke="none" cx="4" cy="-2" rx="8" ry="3.8" />
    </g>
  </>;
}

const arm = 'M -2 -1 Q -6 10 -10 16 L -20 19 Q -23 18 -25 19 Q -27 21 -23 22 Q -27 24 -24 25 Q -28 28 -21 26 L -9 22 Q -6 22 -5 19 L 3 4 Q 5 -1 1 -2 Z';
export default function MeeseeksRig({ state, reduced }) {
  const pose = poses[state];
  return <motion.svg className="meeseeks-rig" viewBox="0 0 112 128" aria-hidden="true"
    initial={reduced ? false : { opacity: 0, y: 5 }} animate={{ opacity: state === 'exit' ? 0 : 1, y: state === 'exit' ? 5 : 0 }}
    stroke={ink} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
    <ellipse cx="56" cy="121" rx="25" ry="3" fill="#0a1724" opacity=".45" stroke="none" />
    <path fill="#5fcbdc" d="M 48 85 Q 47 97 40 103 L 43 115 Q 36 115 34 119 Q 33 121 47 120 Q 50 120 49 116 L 47 105 L 57 90 Z" />
    <path fill={skin} d="M 55 89 L 64 102 L 65 117 Q 65 120 69 120 L 79 120 Q 81 117 72 115 L 71 101 Q 71 98 62 85 Z" />
    <Joint x={55} y={88} name="torso" angle={pose.spine}>
      <Joint x={-7} y={-37} name="left-arm" angle={pose.left}><path fill="#69cfdf" d={arm} /></Joint>
      <Joint x={8} y={-37} name="right-arm" angle={pose.right}><path fill={skin} transform="scale(-1 1)" d={arm} /></Joint>
      <path fill={skin} d="M -4 -44 Q -12 -41 -11 -33 Q -9 -25 -12 -14 Q -17 5 -1 7 Q 12 8 13 -4 Q 14 -12 8 -24 Q 6 -31 11 -37 Q 9 -44 2 -44 Z" />
      <path fill="none" stroke="#49b8ce" strokeWidth="2" d="M -9 -13 Q -13 1 -5 3" />
      <path fill={skin} stroke="none" d="M -6 -46 H 4 L 5 -39 Q 0 -36 -6 -39 Z" />
      <Joint x={-1} y={-43} name="head" angle={pose.head}><Face pose={pose} /></Joint>
    </Joint>
  </motion.svg>;
}
