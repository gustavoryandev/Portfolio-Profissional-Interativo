const TAU = Math.PI * 2;
const clamp = value => Math.min(1, Math.max(0, value));
const mix = (from, to, amount) => from + (to - from) * amount;
const ease = (start, end, value) => {
  const x = clamp((value - start) / (end - start));
  return x * x * (3 - 2 * x);
};
const noise = index => {
  const value = Math.sin(index * 83.173 + 17.4) * 41372.295;
  return value - Math.floor(value);
};

export const curveFlightCues = [
  { progress: 0, shot: 'instability' },
  { progress: .135, shot: 'curve' },
  { progress: .43, shot: 'rupture', volume: .78 },
  { progress: .6, shot: 'portal', volume: 1 },
  { progress: .88, shot: 'mansion' },
];

export const curveFlightRoutes = {
  discovery: { duration: 6700, from: 0, to: 1 },
  revisit: { duration: 1180, from: .59, to: 1 },
  departure: { duration: 640, from: .57, to: .83 },
};

const gold = [255, 184, 46];
const indigo = [122, 113, 255];
const ice = [107, 194, 246];
const energy = [255, 241, 170];
const tint = (color, alpha) => `rgba(${color.join(',')},${alpha})`;
const blendColor = (a, b, amount) => a.map((channel, index) => Math.round(mix(channel, b[index], amount)));

function ringPoints(samples, at, depth, focal, x, y, clock, strength) {
  const radius = focal / (1 + depth * .72);
  const offset = radius * .18;
  const bendX = x + Math.sin(at * .47 + clock * .62) * offset;
  const bendY = y + Math.cos(at * .39 - clock * .75) * offset;
  const rotation = at * .51 - clock * 1.85;
  return Array.from({ length: samples }, (_, i) => {
    const angle = i * TAU / samples + rotation;
    const swell = 1 + strength * (Math.sin(i * TAU * 3 / samples + at * .7 + clock * 5) * .085
      + Math.cos(i * TAU * 5 / samples - at * 1.04 - clock * 7) * .045);
    return [bendX + Math.cos(angle) * radius * swell * 1.19, bendY + Math.sin(angle) * radius * swell * .85];
  });
}

function trace(ctx, points) {
  ctx.moveTo(...points[0]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(...points[i]);
}

function drawTunnel(ctx, camera, lowQuality) {
  const { x, y, focal, clock, distance, visible, golden, dissolve } = camera;
  const samples = lowQuality ? 28 : 44;
  const depthCount = lowQuality ? 14 : 22;
  const step = lowQuality ? .76 : .61;
  const baseIndex = Math.floor(distance / step);
  const hue = blendColor(indigo, gold, golden);
  const highlight = blendColor(ice, energy, golden);
  const rings = [];
  for (let i = depthCount; i >= 0; i--) {
    const at = (baseIndex + i) * step;
    const depth = at - distance + .025;
    if (depth < 0) continue;
    rings.push({ points: ringPoints(samples, at, depth, focal, x, y, clock, 1 + golden), depth });
  }
  if (!rings.length) return;
  // Longitudinal lines share the same projected rings and turn with the tunnel.
  // Connecting alternating bands leaves open space for the vanishing point.
  for (let band = 0; band < samples; band += 4) {
    ctx.beginPath();
    trace(ctx, rings.map(ring => ring.points[band]));
    ctx.lineWidth = 2.8;
    ctx.strokeStyle = tint(hue, .16 * visible * dissolve);
    ctx.stroke();
    ctx.lineWidth = .7;
    ctx.strokeStyle = tint(highlight, .28 * visible * dissolve);
    ctx.stroke();
  }
  for (const { points, depth } of rings) {
    const near = 1 / (1 + depth * .28);
    const opacity = near * visible * dissolve;
    ctx.beginPath();
    trace(ctx, points);
    ctx.closePath();
    ctx.lineWidth = 2 + near * (3 + golden * 5);
    ctx.strokeStyle = tint(hue, opacity * .2);
    ctx.stroke();
    ctx.lineWidth = .7 + near * 1.45;
    ctx.strokeStyle = tint(hue, opacity * .57);
    ctx.stroke();
    // Short currents move along each ridge independently of the shell.
    const run = Math.floor((clock * -24 + depth * 2 + samples * 10) % samples + samples) % samples;
    ctx.beginPath();
    for (let index = run; index < run + Math.round(samples * .27); index++) {
      const point = points[index % samples];
      if (index === run) ctx.moveTo(...point);
      else ctx.lineTo(...point);
    }
    ctx.lineWidth = .7 + near * 1.7;
    ctx.strokeStyle = tint(highlight, opacity * .82);
    ctx.stroke();
  }
}

function drawParticles(ctx, camera, lowQuality, progress) {
  const { x, y, focal, clock, distance, golden, dissolve } = camera;
  const hue = blendColor(ice, energy, golden);
  const speed = .008 + .045 * ease(.05, .59, progress) * (1 - ease(.72, 1, progress));
  const count = lowQuality ? 66 : 126;
  for (let index = 0; index < count; index++) {
    const depth = (noise(index * 3 + 1) * 24 - distance + 48) % 24;
    const radius = focal * (.19 + noise(index * 3 + 2) * 2.6) / (1 + depth * .49);
    const angle = noise(index * 3 + 3) * TAU + clock * (.16 + golden * .53) + depth * .04;
    const dx = Math.cos(angle) * radius;
    const dy = Math.sin(angle) * radius * .83;
    const alpha = (.38 + noise(index + 240) * .48) * (1 - Math.min(.9, depth / 27)) * dissolve;
    ctx.strokeStyle = tint(hue, alpha);
    ctx.lineWidth = .6 + (1 - depth / 24) * 1.5;
    ctx.beginPath();
    ctx.moveTo(x + dx * (1 - speed * (4 - depth / 9)), y + dy * (1 - speed * (4 - depth / 9)));
    ctx.lineTo(x + dx, y + dy + 1);
    ctx.stroke();
  }
}

function drawBreach(ctx, camera, progress, lowQuality) {
  const { x, y, focal, clock } = camera;
  const fracture = ease(.407, .55, progress);
  const release = ease(.515, .67, progress);
  const opacity = fracture * (1 - release);
  if (opacity < .01) return;
  const radius = focal * mix(.1, 1.7, release);
  const branches = lowQuality ? 9 : 14;
  const points = [];
  ctx.beginPath();
  for (let i = 0; i < branches; i++) {
    const angle = i * TAU / branches;
    const uneven = 1 + .26 * Math.sin(i * 2.42 + clock * 6);
    points.push([x + Math.cos(angle) * radius * uneven * 1.14, y + Math.sin(angle) * radius * uneven * .88]);
  }
  trace(ctx, points);
  ctx.closePath();
  ctx.strokeStyle = tint(gold, opacity * .64);
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.strokeStyle = tint(energy, opacity * .93);
  ctx.lineWidth = 1.7;
  ctx.stroke();
  ctx.beginPath();
  for (let i = 0; i < branches; i++) {
    const [startX, startY] = points[i];
    let angle = i * TAU / branches;
    const length = focal * fracture * (.27 + noise(i + 801) * .88);
    let endX = startX;
    let endY = startY;
    ctx.moveTo(endX, endY);
    for (let joint = 0; joint < 4; joint++) {
      angle += (noise(i * 4 + joint + 812) - .5) * 1.12;
      endX += Math.cos(angle) * length * .25;
      endY += Math.sin(angle) * length * .23;
      ctx.lineTo(endX, endY);
      if (joint === 1) {
        ctx.lineTo(endX + Math.cos(angle + .8) * length * .38, endY + Math.sin(angle + .8) * length * .34);
        ctx.moveTo(endX, endY);
      }
    }
  }
  ctx.strokeStyle = tint(gold, opacity * .49);
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.strokeStyle = tint(energy, opacity * .85);
  ctx.lineWidth = 1;
  ctx.stroke();
}

export function paintCurveFlight(ctx, width, height, progress, lowQuality) {
  const clock = clamp(progress);
  const revolve = ease(.015, .24, clock);
  const golden = ease(.39, .64, clock);
  const landing = ease(.765, 1, clock);
  const focus = Math.min(width, height);
  const x = width * (.5 + Math.sin(clock * 9.4) * .09 * (1 - landing));
  const y = height * (.48 + Math.sin(clock * 6.5) * .063 * (1 - landing));
  const focal = Math.max(focus * .89, Math.hypot(width, height) * .335);
  const distance = .8 * clock + 19 * ease(.04, .91, clock);
  const camera = { x, y, focal, clock, distance, golden,
    visible: (.14 + .86 * revolve) * (1 - .13 * ease(.47, .54, clock)), dissolve: 1 - landing };

  ctx.clearRect(0, 0, width, height);
  const atmosphere = ctx.createRadialGradient(x, y, 0, x, y, focal * 1.85);
  atmosphere.addColorStop(0, tint(blendColor([35, 27, 85], [84, 47, 6], golden), 1));
  atmosphere.addColorStop(.45, tint(blendColor([18, 16, 47], [38, 25, 18], golden), 1));
  atmosphere.addColorStop(1, '#09090d');
  ctx.fillStyle = atmosphere;
  ctx.fillRect(0, 0, width, height);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  drawTunnel(ctx, camera, lowQuality);
  drawBreach(ctx, camera, clock, lowQuality);

  if (landing > 0) {
    ctx.globalCompositeOperation = 'destination-out';
    const radius = Math.hypot(width, height) * (.06 + landing * 1.05);
    const iris = ctx.createRadialGradient(x, y, radius * .56, x, y, radius);
    iris.addColorStop(0, '#000');
    iris.addColorStop(.72, '#000e');
    iris.addColorStop(1, '#0000');
    ctx.fillStyle = iris;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
  }
  drawParticles(ctx, camera, lowQuality, clock);
}
