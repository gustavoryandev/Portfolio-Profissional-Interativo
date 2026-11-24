import { pickleBody } from './sceneAssets';

// Drawings share a 104 × 112 field. Limbs are specified as knee/ankle
// or elbow/wrist pairs. The native body looks left, so each suit drawing
// faces left too. The sole rests at y=106 on contact frames.
const standing = {
  lift: 0, suit: 3, nearLeg: [63, 83, 70, 102], farLeg: [32, 83, 28, 102],
  nearArm: [72, 56, 76, 73], farArm: [26, 53, 22, 68],
};
const assembly = [
  { ...standing, suit: 0, lift: 31 },
  { ...standing, suit: 1, lift: 31 },
  { ...standing, suit: 2, lift: 17, nearLeg: [72, 73, 62, 85], farLeg: [26, 74, 35, 85] },
  { ...standing, lift: 8, nearLeg: [71, 80, 70, 94], farLeg: [25, 79, 27, 94], nearArm: [69, 49, 64, 58], farArm: [31, 48, 35, 60] },
  standing,
];
const stride = [
  { nearLeg: [38, 79, 23, 102], farLeg: [62, 82, 81, 93], nearArm: [68, 55, 78, 42], farArm: [24, 47, 19, 34], lift: 0 },
  { nearLeg: [34, 84, 40, 99], farLeg: [63, 80, 77, 72], nearArm: [64, 56, 75, 49], farArm: [31, 54, 22, 43], lift: 3 },
  { nearLeg: [55, 85, 65, 101], farLeg: [28, 73, 45, 86], nearArm: [47, 54, 37, 39], farArm: [39, 54, 44, 66], lift: -1 },
  { nearLeg: [61, 82, 82, 93], farLeg: [35, 79, 20, 102], nearArm: [37, 48, 25, 35], farArm: [53, 55, 62, 42], lift: 0 },
  { nearLeg: [60, 79, 78, 72], farLeg: [33, 83, 38, 99], nearArm: [38, 52, 31, 40], farArm: [51, 55, 58, 48], lift: 3 },
  { nearLeg: [29, 73, 45, 87], farLeg: [53, 86, 65, 101], nearArm: [63, 55, 71, 64], farArm: [28, 52, 21, 40], lift: -1 },
];
export const frameCounts = { prepare: 3, assemble: assembly.length, run: stride.length };

function Limb({ root, points, foot, far }) {
  const [x, y] = root;
  const [jointX, jointY, tipX, tipY] = points;
  const sinew = far ? '#9c6854' : '#dc8e70';
  const bone = far ? '#afa58a' : '#e7d8b6';
  return <g strokeLinejoin="round" strokeLinecap="round">
    <path fill={sinew} d={`M ${x-4} ${y-1} Q ${x-6} ${y+5} ${jointX-2} ${jointY+2} Q ${jointX+2} ${jointY+4} ${jointX+3} ${jointY-1} L ${x+4} ${y-3} Z`} />
    <path stroke="#302a27" strokeWidth="5.8" d={`M ${jointX} ${jointY} L ${tipX} ${tipY}`} />
    <path stroke={bone} strokeWidth="2.9" d={`M ${jointX} ${jointY} L ${tipX} ${tipY}`} />
    <circle cx={jointX} cy={jointY} r="2.9" fill={bone} />
    <g transform={`translate(${tipX} ${tipY})`} fill={bone}>
      <path d={foot ? 'M 2 -2 Q -2 -4 -4 0 L -11 3 L -3 3 L 3 4 Z' : 'M 2 -1 Q 0 -3 -3 -1 L -7 3 L -8 8 L -4 4 L -2 3 L -3 9 L 0 5 L 3 4 Z'} />
    </g>
  </g>;
}

function Body({ useImage }) {
  if (useImage) return <image href={pickleBody} x="35" y="5" width="31" height="71" />;
  return <g strokeWidth="1.5">
    <path fill="#6d962c" d="M 45 72 Q 34 71 36 59 L 41 20 Q 42 5 52 5 Q 65 6 64 21 L 59 62 Q 58 78 45 72 Z" />
    <path fill="none" stroke="#b4d953" d="M 45 17 Q 47 9 51 9 M 41 53 l1 -7" />
    <ellipse fill="#f2ffcc" cx="48" cy="23" rx="4" ry="4.5" /><ellipse fill="#f2ffcc" cx="57" cy="22" rx="4" ry="4.5" />
    <path d="M 46 23 h.6 M 55 22 h.6 M 47 16 Q 53 12 59 16" fill="none" strokeWidth="2" />
    <path d="M 45 31 Q 51 34 59 29 Q 54 41 45 33 Z" fill="#512c26" />
  </g>;
}

export default function PickleFrames({ action, frame = 0, suited, useImage, facingLeft }) {
  const pose = action === 'run' ? { ...stride[frame], suit: 3 }
    : action === 'assemble' ? assembly[frame] : suited ? standing : assembly[0];
  const { lift, suit } = pose;
  return <svg viewBox="0 0 104 112" aria-hidden="true" data-action={action} data-frame={frame}>
    <g transform={facingLeft ? undefined : 'translate(104 0) scale(-1 1)'}>
      <g transform={`rotate(${action === 'prepare' ? [4, 12, 8][frame] : 0} 52 106) translate(0 ${lift})`} stroke="#302a27" strokeWidth="1.7">
        {suit >= 2 && <Limb root={[45, 65]} points={pose.farLeg} foot far />}
        {suit >= 2 && <Limb root={[56, 66]} points={pose.nearLeg} foot />}
        <g transform={action === 'run' ? 'rotate(-13 50 66)' : undefined}>
          {suit === 3 && <Limb root={[42, 38]} points={pose.farArm} far />}
          <Body useImage={useImage} />
          {action === 'prepare' && frame > 0 && <g fill="#9aded7" strokeWidth="1">
            <path d="M65 13 Q70 5 72 9 Q73 12 65 13Z" />
            <path d="M66 17 Q75 14 74 18 Q72 20 66 17Z" />
          </g>}
          {suit > 0 && <g>
            <path fill="#986756" d="M65 37 Q66 32 58 31 L54 35 57 43 64 44Z M61 63 Q51 67 41 61 L41 68 Q50 75 61 68Z" />
            <path fill="#ddc3a0" d="M63 43 Q57 48 43 43 Q48 51 62 47Z M63 49 Q55 55 41 49 Q47 57 62 54Z M62 55 Q53 61 42 55 Q45 63 60 60Z" />
          </g>}
          {suit === 3 && <>
            <Limb root={[61, 37]} points={pose.nearArm} />
            <path d="M67 39 Q70 32 63 29 Q53 28 55 36 Q57 42 67 39Z" fill="#c47c61" />
            <path d="M65 36 Q64 32 58 32" fill="none" stroke="#edb592" />
          </>}
        </g>
      </g>
    </g>
  </svg>;
}
