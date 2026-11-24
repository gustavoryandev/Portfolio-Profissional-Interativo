// All paths are drawn once in a 240-unit field. The two banks of a current
// widen, split and taper independently as the spiral curls toward its well.
type Point = [number, number];
const TAU = Math.PI * 2;
const num = (n: number) => n.toFixed(2);
function closedCurve(points: Point[]) {
  const at = (i: number) => points[(i + points.length) % points.length];
  let path = 'M' + points[0].map(num).join(' ');
  for (let i = 0; i < points.length; i++) {
    const [a, b, c, d] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    path += 'C' + [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6,
      c[0] - (d[0] - b[0]) / 6, c[1] - (d[1] - b[1]) / 6, ...c].map(num).join(' ');
  }
  return path + 'Z';
}

function point(angle: number, radius: number): Point {
  const depth = 1 - radius / 112;
  return [120 + Math.cos(angle) * radius - depth * 9, 120 + Math.sin(angle) * radius + depth * 7];
}

export const silhouette = closedCurve(Array.from({ length: 76 }, (_, i) => {
  const a = TAU * i / 76;
  return point(a, 108 + 2.5 * Math.sin(3*a+.8) + 1.9*Math.cos(7*a) + Math.sin(13*a+.5) + .7*Math.cos(21*a));
}));

function current(start: number, turns: number, outer: number, inner: number, width: number) {
  const a: Point[] = [], b: Point[] = [];
  for (let i=0; i<=40; i++) {
    const t = i/40, theta = start + turns * t;
    const radius = outer + (inner-outer)*t + Math.sin(t*8+start)*2.5 + Math.sin(theta*4)*1.4;
    const swell = width * Math.pow(Math.sin(Math.PI*t), .85) * (.78+.22*Math.sin(t*13+start));
    a.push(point(theta, radius+swell*.67));
    b.push(point(theta, radius-swell*(.45+.32*Math.sin(t*10-.4))));
  }
  return closedCurve([...a, ...b.reverse().slice(1,-1)]);
}

export const trenches = [
  current(-1.9,3.45,110,29,16), current(.08,3.65,110,19,18),
  current(2.2,3.1,108,32,13), current(4.5,4.7,56,4,12),
];
export const tongues = [
  current(-1.62,3.8,111,24,14), current(.64,3.35,109,17,15),
  current(2.54,3.65,113,32,16), current(1.9,4.8,55,4,10),
];
export const rimCurrents = Array.from({ length: 11 }, (_, i) =>
  current(i*2.399, .49+(i%4)*.26, 110-(i%3)*3, 91-(i%4)*3, 3+(i%4)*1.8)
);
export const flecks = Array.from({ length: 34 }, (_, i) => {
  const a = i*2.39996+.2;
  const [x,y] = point(a, 87+(i*11%19));
  return { x, y, angle: a*180/Math.PI+90, scale: .45+(i*7%13)/10 };
});
export const drops = Array.from({ length: 8 }, (_, i) => ({
  angle: i*2.399+.64, phase: (i*.373+.17)%1, period: 3.8+(i*7%11)*.38,
  radius: 103+i%4, size: 1.2+(i%3)*.43, escaping: i%3 !== 0,
}));

export function dropPose(drop: typeof drops[number], elapsed: number) {
  const t = (drop.phase + elapsed/drop.period)%1;
  const angle = drop.angle + (drop.escaping ? .19*t : elapsed*.12);
  const radius = drop.radius + (drop.escaping ? 12*t : 2*Math.sin(t*TAU));
  const [x,y] = point(angle, radius);
  const scale = drop.size * (drop.escaping ? .65+.28*t : .79);
  return {
    transform: `translate(${num(x)} ${num(y)}) rotate(${num(angle*180/Math.PI)}) scale(${num(scale*(drop.escaping?1+t:1))} ${num(scale)})`,
    opacity: drop.escaping ? Math.pow(Math.sin(t*Math.PI),1.4)*.93 : .85,
  };
}
