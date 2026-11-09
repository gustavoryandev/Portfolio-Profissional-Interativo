export const directions = {
  up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0],
};

export const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
export const wrap = (value, size) => ((value % size) + size) % size;
export const same = (a, b) => a.x === b.x && a.y === b.y;
export const key = ({ x, y }) => x + ',' + y;
export const move = (point, [x, y]) => ({ x: point.x + x, y: point.y + y });
export const pick = (items, random) => items[Math.floor(random() * items.length)];

export function stateFor(metrics, lives = null) {
  return { score: 0, level: 1, lives, result: null, metrics };
}

export function rect(ctx, color, x, y, width, height) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

export function dot(ctx, color, x, y, radius) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fill();
}

export function tile(ctx, color, x, y, size, gap = 1) {
  rect(ctx, color, x * size + gap, y * size + gap, size - gap * 2, size - gap * 2);
}
