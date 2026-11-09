const upper = 'M-35 252 C100 42 324 76 564 -8';
const lower = 'M-60 774 C142 741 284 946 481 899 C606 867 706 805 850 835 C1008 863 1139 931 1281 860 C1425 788 1515 699 1700 682';
const right = 'M920 957 C1128 944 1237 889 1338 770 C1458 618 1538 520 1700 505';

export default function ThemeWaves() {
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
