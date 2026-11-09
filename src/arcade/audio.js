const key = 'astra-arcade-sound';
const sounds = {
  menu: [[440, 0]], score: [[630, 0]], hit: [[160, 0]],
  win: [[440, 0], [554, 0.09], [659, 0.18], [880, 0.27]],
  loss: [[392, 0], [330, 0.12], [247, 0.24]],
};

export function createAudio() {
  let enabled = false;
  let context;
  let last = 0;
  try { enabled = globalThis.localStorage.getItem(key) === 'on'; } catch {}
  return {
    get enabled() { return enabled; },
    set(value) {
      enabled = value;
      try { globalThis.localStorage.setItem(key, enabled ? 'on' : 'off'); } catch {}
      if (!enabled) void context?.suspend().catch(() => {});
    },
    unlock() {
      if (!enabled || !globalThis.AudioContext) return;
      try {
        context ??= new AudioContext();
        if (context.state === 'suspended') void context.resume().catch(() => {});
      } catch {}
    },
    play(sound) {
      if (!enabled || context?.state !== 'running') return;
      const now = context.currentTime;
      if (sound === 'score' && now - last < 0.1) return;
      last = now;
      for (const [pitch, delay] of sounds[sound]) {
        const at = now + delay;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = pitch;
        gain.gain.setValueAtTime(0.07, at);
        gain.gain.exponentialRampToValueAtTime(0.001, at + 0.11);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(at);
        oscillator.stop(at + 0.12);
      }
    },
    close() { void context?.close().catch(() => {}); context = null; },
  };
}
