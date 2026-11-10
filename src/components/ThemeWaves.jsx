import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const upper = 'M-35 252 C100 42 324 76 564 -8';
const lower = 'M-60 774 C142 741 284 946 481 899 C606 867 706 805 850 835 C1008 863 1139 931 1281 860 C1425 788 1515 699 1700 682';
const right = 'M920 957 C1128 944 1237 889 1338 770 C1458 618 1538 520 1700 505';

export default function ThemeWaves() {
  if (useContext(ThemeContext)?.theme === 'galo-light') return <GaloLightWaves />;

  return (
    <svg className="theme-waves" aria-hidden="true" focusable="false" viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="wave-edge" gradientUnits="userSpaceOnUse" x1="0" x2="1672">
          <stop stopColor="var(--wave-one)" />
          <stop offset=".49" stopColor="var(--wave-glow)" />
          <stop offset="1" stopColor="var(--wave-two)" />
        </linearGradient>
        <linearGradient id="wave-top" gradientUnits="userSpaceOnUse" x1="0" x2="545">
          <stop stopColor="var(--wave-one)" stopOpacity=".45" />
          <stop offset=".25" stopColor="var(--wave-one)" />
          <stop offset="1" stopColor="var(--wave-one)" stopOpacity=".02" />
        </linearGradient>
        <linearGradient id="wave-fill" x2=".12" y2="1" gradientUnits="objectBoundingBox">
          <stop stopColor="var(--wave-two)" stopOpacity=".34" />
          <stop offset=".64" stopColor="var(--wave-glow)" stopOpacity=".17" />
          <stop offset="1" stopColor="var(--wave-one)" stopOpacity=".03" />
        </linearGradient>
        <filter id="wave-halo" x="-.1" y="-.6" width="1.2" height="2.2">
          <feGaussianBlur stdDeviation="17" />
        </filter>
      </defs>
      <path d={`${upper} L 320 -10 C165 60 52 138 -35 252 Z`} fill="url(#wave-top)" opacity=".34" />
      <path d={`${right} V258 C1521 340 1428 570 1270 748 C1178 853 1050 922 920 957 Z`} fill="url(#wave-fill)" opacity=".78" />
      <path d={`${lower} V852 C1530 758 1361 863 1220 920 C1082 978 963 889 829 880 C699 871 617 943 508 964 C328 1005 174 802 -60 816 Z`} fill="url(#wave-fill)" />
      <path d={`${lower} V975 H-60 Z`} fill="url(#wave-edge)" opacity=".09" />
      <g fill="none" filter="url(#wave-halo)" strokeWidth="21" className="theme-wave-glow">
        <path d={upper} stroke="url(#wave-top)" />
        <path d={right} stroke="url(#wave-edge)" />
        <path d={lower} stroke="url(#wave-edge)" />
      </g>
      <g fill="none" strokeWidth="1.7">
        <path d={upper} stroke="url(#wave-top)" />
        <path d={right} stroke="url(#wave-edge)" opacity=".64" />
        <path d={lower} stroke="url(#wave-edge)" />
      </g>
    </svg>
  );
}

function GaloLightWaves() {
  const top = 'M-20 216C68 127 173 80 311 73';
  const bottom = 'M-20 731C137 682 249 801 415 815C573 828 674 747 818 756C960 765 1032 833 1197 787C1357 742 1453 604 1620 551';

  return (
    <svg className="theme-waves galo-light-waves" aria-hidden="true" focusable="false" viewBox="0 0 1600 800" preserveAspectRatio="none">
      <defs>
        <linearGradient id="galo-wave-silver" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop stopColor="#D8D6D8" />
          <stop offset=".54" stopColor="#F8F8F8" />
          <stop offset="1" stopColor="#C7C5C7" />
        </linearGradient>
        <linearGradient id="galo-wave-graphite" x2=".18" y2="1" gradientUnits="objectBoundingBox">
          <stop stopColor="#535353" />
          <stop offset=".46" stopColor="var(--wave-one)" />
          <stop offset="1" stopColor="#242424" />
        </linearGradient>
        <linearGradient id="galo-wave-gold">
          <stop stopColor="var(--wave-two)" />
          <stop offset=".18" stopColor="var(--wave-glow)" />
          <stop offset=".48" stopColor="var(--wave-one)" stopOpacity="0" />
          <stop offset=".71" stopColor="var(--wave-two)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--wave-glow)" />
        </linearGradient>
      </defs>
      <path d="M-20 290C86 142 171 95 347 70H-20Z" fill="url(#galo-wave-silver)" />
      <path d="M-20 290C86 142 171 95 347 70" fill="none" stroke="white" />
      <path d={`${top}L-20 72Z`} fill="url(#galo-wave-graphite)" />
      <path d="M-20 172C91 93 186 76 311 73C169 72 77 82-20 119Z" fill="#fff" opacity=".12" />
      <path d={top} fill="none" stroke="var(--wave-two)" strokeWidth="5" />
      <path d="M-20 665C143 643 253 791 419 796C561 800 679 715 820 730C950 744 1062 810 1194 754C1355 687 1442 517 1620 448V800H-20Z" fill="url(#galo-wave-silver)" stroke="#fff" />
      <path d={`${bottom}V832H-20Z`} fill="url(#galo-wave-graphite)" />
      <path d="M-20 777C143 710 270 787 402 817H-20Zm1164 40c172-25 281-186 476-168v168Z" fill="#fff" opacity=".12" />
      <path d={bottom} fill="none" stroke="url(#galo-wave-gold)" strokeWidth="9" />
      <path d="M1285 817C1409 758 1476 695 1620 748V817Z" fill="url(#galo-wave-silver)" stroke="#fff" />
    </svg>
  );
}
