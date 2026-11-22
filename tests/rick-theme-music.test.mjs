import test from 'node:test';
import assert from 'node:assert/strict';
import { createRickThemeMusic, RICK_THEME_TRACK } from '../src/services/rickThemeMusic.js';

function fixture(play) {
  let audio;
  const statuses = [];
  class Audio {
    constructor(src) { this.src = src; this.currentTime = 8; audio = this; }
    play() { return play?.(this) ?? (this.onplay?.(), Promise.resolve()); }
    pause() { this.pauses = (this.pauses ?? 0) + 1; this.onpause?.(); }
  }
  const player = createRickThemeMusic(Audio, status => statuses.push(status));
  return { audio, statuses, player };
}

test('theme preview pauses, resumes and resets on leaving; dispose detaches listeners', async () => {
  const { audio, statuses, player } = fixture();
  assert.equal(audio.src, RICK_THEME_TRACK.preview);
  assert.equal(audio.volume, .22);
  await player.play();
  assert.equal(player.isActive(), true);
  player.pause();
  assert.equal(audio.currentTime, 8);
  await player.play();
  player.stop();
  assert.equal(audio.currentTime, 0);
  assert.equal(statuses.at(-1), 'idle');
  player.dispose();
  assert.equal(audio.onplay, null);
});

test('autoplay denial and network failure leave a usable retry', async () => {
  let failed = true;
  const { player, statuses, audio } = fixture(() => failed ? Promise.reject({ name: 'NotAllowedError' }) : Promise.resolve());
  await player.play();
  assert.equal(statuses.at(-1), 'paused');
  failed = false;
  await player.play();
  assert.equal(statuses.at(-1), 'playing');
  audio.onerror();
  assert.equal(statuses.at(-1), 'error');
  await player.play();
  assert.equal(statuses.at(-1), 'playing');
});

test('leaving while playback is pending cannot restart the track', async () => {
  let finish;
  const { player, audio } = fixture(() => new Promise(resolve => { finish = resolve; }));
  const pending = player.play();
  player.stop();
  finish();
  await pending;
  assert.equal(audio.pauses, 2);
  assert.equal(player.isActive(), false);
});
