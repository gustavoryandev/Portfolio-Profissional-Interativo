import test from 'node:test';
import assert from 'node:assert/strict';
import { BEYOND_CURVE_TRACK, createRickThemeMusic, readRickMusicVolume, RICK_THEME_TRACK } from '../src/services/rickThemeMusic.js';

function makeClock() {
  let now = 0;
  let id = 0;
  const frames = new Map();
  const timers = new Map();
  return {
    performance: { now: () => now },
    requestAnimationFrame(callback) { frames.set(++id, callback); return id; },
    cancelAnimationFrame: key => frames.delete(key),
    setTimeout(callback, delay) { timers.set(++id, { callback, at: now + delay }); return id; },
    clearTimeout: key => timers.delete(key),
    advance(ms) {
      now += ms;
      for (const [key, timer] of timers) {
        if (timer.at > now) continue;
        timers.delete(key);
        timer.callback();
      }
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach(callback => callback(now));
    },
  };
}

function fixture(play, options) {
  let audio;
  const statuses = [];
  class Audio {
    paused = true;
    currentTime = 8;
    duration = 90;
    constructor() { audio = this; }
    play() {
      this.plays = (this.plays ?? 0) + 1;
      this.paused = false;
      return play?.(this) ?? Promise.resolve();
    }
    pause() { this.paused = true; this.pauses = (this.pauses ?? 0) + 1; }
    load() { this.retries = (this.retries ?? 0) + 1; }
  }
  const player = createRickThemeMusic(Audio, status => statuses.push(status), options);
  return { audio, statuses, player };
}

test('the preview ramps at playback and pause, saves volume level for replay, and ends once', async () => {
  const clock = makeClock();
  const { audio, statuses, player } = fixture(null, { clock });
  assert.equal(audio.src, RICK_THEME_TRACK.preview);
  assert.equal(audio.volume, .22);
  await player.play();
  assert.equal(audio.volume, 0);
  clock.advance(130);
  assert.equal(audio.volume, .11);
  clock.advance(130);
  assert.equal(audio.volume, .22);
  player.setVolume(60);
  clock.advance(90);
  assert.equal(audio.volume, .6);
  player.pause();
  assert.equal(player.isActive(), false);
  clock.advance(105);
  assert.equal(audio.volume, .3);
  assert.equal(audio.paused, false);
  clock.advance(105);
  assert.equal(audio.paused, true);
  assert.equal(audio.currentTime, 8);
  await player.play();
  clock.advance(260);
  assert.equal(audio.volume, .6);
  audio.currentTime = 89.8;
  audio.ontimeupdate();
  clock.advance(180);
  assert.ok(audio.volume < .2);
  audio.onended();
  assert.equal(statuses.at(-1), 'ended');
  assert.equal(player.isActive(), false);
  await player.play();
  assert.equal(audio.currentTime, 0);
  player.dispose();
  assert.equal(audio.onplaying, null);
});

test('blocked playback, buffering timeout and media error each allow a retry', async () => {
  const clock = makeClock();
  let blocked = true;
  const { player, statuses, audio } = fixture(() => blocked ? Promise.reject({ name: 'NotAllowedError' }) : Promise.resolve(), { clock });
  await player.play();
  assert.equal(statuses.at(-1), 'paused');
  blocked = false;
  await player.play();
  audio.onwaiting();
  assert.equal(statuses.at(-1), 'loading');
  clock.advance(12000);
  assert.equal(statuses.at(-1), 'error');
  assert.equal(audio.paused, true);
  await player.play();
  assert.equal(statuses.at(-1), 'playing');
  assert.equal(audio.retries, 1);
  audio.onerror();
  assert.equal(statuses.at(-1), 'error');
  await player.play();
  assert.equal(statuses.at(-1), 'playing');
  player.dispose();
});

test('cinematic cues ramp relative to the visitor’s volume and never start playback', async () => {
  const clock = makeClock();
  const { audio, player } = fixture(null, { clock, volume: 40 });
  player.setCinematicGain(.48);
  assert.equal(audio.plays, undefined);
  await player.play();
  clock.advance(260);
  assert.ok(Math.abs(audio.volume - .192) < 1e-6);
  player.setCinematicGain(.78);
  clock.advance(520);
  assert.ok(Math.abs(audio.volume - .312) < 1e-6);
  player.setVolume(0);
  player.setCinematicGain(1);
  clock.advance(520);
  assert.equal(audio.volume, 0);
  assert.equal(audio.plays, 1);
  player.dispose();
});

test('the local transition track can fail without restarting or looping', async () => {
  const clock = makeClock();
  const { player, statuses, audio } = fixture(() => Promise.reject(new Error('missing media')),
    { clock, source: BEYOND_CURVE_TRACK.preview });
  assert.equal(audio.src, '/rick-assets/audio/evil-morty-30s.mp3');
  await player.play();
  assert.equal(statuses.at(-1), 'error');
  assert.equal(player.isActive(), false);
  assert.equal(audio.paused, true);
  player.setVisibility(true);
  player.setVisibility(false);
  clock.advance(20000);
  assert.equal(audio.plays, 1);
  assert.ok(!audio.loop);
  player.dispose();
});

test('visibility resumes only a started preview and preserves manual pause', async () => {
  const clock = makeClock();
  const { player, statuses, audio } = fixture(undefined, { clock });
  await player.play();
  clock.advance(260);
  player.setVisibility(true);
  assert.equal(audio.paused, true);
  assert.equal(statuses.at(-1), 'hidden');
  player.setVisibility(false);
  await Promise.resolve();
  assert.equal(audio.plays, 2);
  assert.equal(statuses.at(-1), 'playing');
  clock.advance(260);
  player.pause();
  player.setVisibility(true);
  player.setVisibility(false);
  assert.equal(audio.plays, 2);
  assert.equal(statuses.at(-1), 'paused');
  player.dispose();
});

test('a pending request cannot resume on tab return or revive after theme exit', async () => {
  const attempts = [];
  const { player, audio } = fixture(() => new Promise(resolve => attempts.push(resolve)));
  const first = player.play();
  player.setVisibility(true);
  player.setVisibility(false);
  attempts[0]();
  await first;
  assert.equal(audio.plays, 1);
  const second = player.play();
  player.stop();
  const third = player.play();
  attempts[1]();
  await second;
  assert.equal(audio.paused, false);
  attempts[2]();
  await third;
  player.stop();
  assert.equal(audio.currentTime, 0);
  assert.equal(audio.paused, true);
  player.dispose();
});

test('volume preference accepts zero and safely falls back for invalid storage', () => {
  for (const [value, expected] of [['0', 0], ['48', 48], ['100', 100], ['101', 22], ['', 22], [null, 22]]) {
    assert.equal(readRickMusicVolume({ getItem: () => value }), expected);
  }
  assert.equal(readRickMusicVolume({ getItem() { throw new Error('disabled'); } }), 22);
});

test('uses the audio graph when the media element ignores volume writes', async () => {
  const clock = makeClock();
  const gain = { gain: { value: 1 }, connect() {} };
  let resumed = false;
  let attached;
  clock.AudioContext = class {
    createGain() { return gain; }
    createMediaElementSource(audio) { attached = audio; return { connect() {} }; }
    async resume() { resumed = true; }
    async close() {}
  };
  class Audio {
    get volume() { return 1; }
    set volume(_value) {}
    async play() {}
    pause() {}
  }
  const player = createRickThemeMusic(Audio, () => {}, { volume: 37, clock });
  assert.equal(attached.crossOrigin, 'anonymous');
  await player.play();
  clock.advance(260);
  assert.equal(resumed, true);
  assert.equal(gain.gain.value, .37);
  player.setVolume(0);
  clock.advance(90);
  assert.equal(gain.gain.value, 0);
  player.dispose();
});
