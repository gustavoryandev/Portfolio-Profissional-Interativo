import { clamp, rect, stateFor } from './shared.js';

const width = 480;
const height = 300;
const radius = 6;
const paddleWidth = 10;
const left = 22;
const right = width - left - paddleWidth;
const target = 7;

export default function createPong(difficulty, random = Math.random) {
  const paddleHeight = [68, 59, 50][difficulty];
  const half = paddleHeight / 2;
  const baseSpeed = [228, 260, 295][difficulty];
  const state = { ...stateFor({ opponent: 0, rally: 0 }), player: height / 2, cpu: height / 2, ball: {} };
  const pressed = new Set();
  let rally = 0;
  let aim = height / 2;
  let reaction = 0;
  let serveTime = 0;
  let pointer = null;

  const serve = direction => {
    state.ball = { x: width / 2, y: height / 2, vx: direction * baseSpeed, vy: (random() < 0.5 ? -1 : 1) * (45 + random() * 60) };
    rally = 0;
    serveTime = 0.85;
  };
  serve(1);

  function score(player) {
    if (player) state.score++;
    else state.metrics.opponent++;
    state.level = 1 + Math.floor((state.score + state.metrics.opponent) / 3);
    if (state.score === target || state.metrics.opponent === target) state.result = player ? 'win' : 'loss';
    else serve(player ? 1 : -1);
  }

  function returnBall(paddle, direction) {
    const ball = state.ball;
    const offset = clamp((ball.y - paddle) / (half + radius), -1, 1);
    const speed = Math.min(570, Math.hypot(ball.vx, ball.vy) + 22);
    const angle = offset * 1.06;
    ball.vx = direction * Math.cos(angle) * speed;
    ball.vy = Math.sin(angle) * speed;
    ball.x = direction > 0 ? left + paddleWidth + radius : right - radius;
    state.metrics.rally = Math.max(state.metrics.rally, ++rally);
  }

  return {
    width, height, state,
    press(action) { pressed.add(action); pointer = null; },
    release(action) { pressed.delete(action); },
    clearInput() { pressed.clear(); pointer = null; },
    point(_x, y) { pointer = y; },
    step(dt) {
      if (state.result) return;
      const delta = Number(pressed.has('down')) - Number(pressed.has('up'));
      state.player = clamp(pointer ?? state.player + delta * 330 * dt, half, height - half);
      const ball = state.ball;
      reaction -= dt;
      if (reaction <= 0) {
        reaction = [0.28, 0.15, 0.065][difficulty];
        const error = [42, 25, 12][difficulty];
        aim = ball.vx > 0 ? ball.y + (random() - 0.5) * error * 2 : height / 2;
      }
      const limit = [125, 190, 256][difficulty] * dt;
      state.cpu = clamp(state.cpu + clamp(aim - state.cpu, -limit, limit), half, height - half);
      serveTime -= dt;
      if (serveTime > 0) return;
      const previousX = ball.x;
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      if (ball.y < radius || ball.y > height - radius) {
        ball.y = clamp(ball.y, radius, height - radius);
        ball.vy *= -1;
      }
      const hit = paddle => Math.abs(ball.y - paddle) <= half + radius;
      const leftEdge = left + paddleWidth + radius;
      const rightEdge = right - radius;
      if (ball.vx < 0 && previousX >= leftEdge && ball.x <= leftEdge && hit(state.player)) returnBall(state.player, 1);
      if (ball.vx > 0 && previousX <= rightEdge && ball.x >= rightEdge && hit(state.cpu)) returnBall(state.cpu, -1);
      if (ball.x < -radius || ball.x > width + radius) score(ball.x > width);
    },
    render(ctx, _en, palette) {
      const ink = palette?.ink ?? '#f5f5ee';
      rect(ctx, palette?.background ?? '#101110', 0, 0, width, height);
      for (let y = 8; y < height; y += 19) rect(ctx, palette?.muted ?? '#888982', width / 2 - 1, y, 2, 10);
      rect(ctx, ink, left, state.player - half, paddleWidth, paddleHeight);
      rect(ctx, ink, right, state.cpu - half, paddleWidth, paddleHeight);
      rect(ctx, palette?.accent ?? ink, state.ball.x - radius, state.ball.y - radius, radius * 2, radius * 2);
    },
  };
}
