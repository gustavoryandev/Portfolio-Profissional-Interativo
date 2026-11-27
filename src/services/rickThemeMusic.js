// Official Apple Music preview. Streamed from Apple; no redistributed audio file.
export const RICK_THEME_TRACK = {
  title: 'Rick and Morty Theme',
  artist: 'Rick and Morty & Ryan Elder',
  source: 'https://music.apple.com/us/song/1570547237',
  preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/98/bd/f5/98bdf567-f67e-324a-deae-452c07983691/mzaf_11617390157100661171.plus.aac.p.m4a',
};
export const BEYOND_CURVE_TRACK = {
  title: 'For the Damaged Coda',
  artist: 'Blonde Redhead',
  preview: '/rick-assets/audio/evil-morty-30s.mp3',
};

export const RICK_MUSIC_VOLUME = 22;
export function readRickMusicVolume(storage) {
  try {
    const value = storage.getItem('rick-morty-volume');
    if (value !== null && /^\d{1,3}$/.test(value) && Number(value) <= 100) return Number(value);
  } catch { /* Storage may be disabled. */ }
  return RICK_MUSIC_VOLUME;
}

export function createRickThemeMusic(Audio, onStatus, {
  volume = RICK_MUSIC_VOLUME, hidden = false, clock = globalThis, source = RICK_THEME_TRACK.preview,
} = {}) {
  const audio = new Audio();
  audio.preload = 'none';
  audio.crossOrigin = 'anonymous';
  audio.src = source;

  let target = volume / 100;
  audio.volume = .5;
  let context;
  let gain;
  // Some mobile browsers expose volume but only honor the device volume on media elements.
  if (audio.volume !== .5) {
    const AudioContext = clock.AudioContext ?? clock.webkitAudioContext;
    if (AudioContext) {
      try {
        context = new AudioContext();
        gain = context.createGain();
        context.createMediaElementSource(audio).connect(gain);
        gain.connect(context.destination);
      } catch {
        void context?.close().catch(() => {});
        context = gain = undefined;
      }
    }
  }

  let status = 'idle';
  let wanted = false;
  let resumeOnShow = false;
  let hasPlayed = false;
  let revision = 0;
  let disposed = false;
  let frame;
  let timeout;
  let rewinding = false;
  let level = target;
  const setLevel = value => {
    level = value;
    if (gain) gain.gain.value = value;
    else audio.volume = value;
  };
  setLevel(target);
  const update = next => {
    if (disposed || next === status) return;
    status = next;
    onStatus(next);
  };
  const cancelRamp = () => {
    if (frame !== undefined) clock.cancelAnimationFrame?.(frame);
    frame = undefined;
  };
  const clearDeadline = () => clock.clearTimeout(timeout);
  function ramp(to, duration, complete) {
    cancelRamp();
    if (!clock.requestAnimationFrame || hidden || level === to) {
      setLevel(to);
      complete?.();
      return;
    }
    const from = level;
    const start = clock.performance.now();
    function tick(now) {
      frame = undefined;
      const fraction = Math.min(1, Math.max(0, (now - start) / duration));
      setLevel(from + (to - from) * fraction);
      if (fraction < 1) frame = clock.requestAnimationFrame(tick);
      else complete?.();
    }
    frame = clock.requestAnimationFrame(tick);
  }
  function rewind() {
    if (rewinding) audio.currentTime = 0;
    rewinding = false;
  }
  function fail(next = 'error') {
    wanted = resumeOnShow = hasPlayed = false;
    revision++;
    clearDeadline();
    cancelRamp();
    audio.pause();
    update(next);
  }
  function watchLoading() {
    clearDeadline();
    timeout = clock.setTimeout(() => fail(), 12000);
  }
  function playbackStarted() {
    if (!wanted || hidden || disposed || status === 'playing') return;
    clearDeadline();
    hasPlayed = true;
    update('playing');
    ramp(target, 260);
  }
  function outputLevel() {
    const end = audio.duration - audio.currentTime;
    return end >= 0 && end < .65 ? target * end / .65 : target;
  }
  audio.onplaying = playbackStarted;
  audio.onwaiting = () => {
    if (!wanted || hidden) return;
    update('loading');
    watchLoading();
  };
  audio.ontimeupdate = () => {
    if (status === 'playing' && outputLevel() < target) ramp(outputLevel(), 180);
  };
  audio.onended = () => {
    wanted = resumeOnShow = hasPlayed = false;
    revision++;
    clearDeadline();
    cancelRamp();
    update('ended');
  };
  audio.onerror = () => { if (wanted) fail(); };

  async function play() {
    if (disposed || wanted || hidden) return;
    const previous = status;
    const request = ++revision;
    wanted = true;
    resumeOnShow = false;
    cancelRamp();
    rewind();
    if (previous === 'ended') audio.currentTime = 0;
    if (previous === 'error') audio.load?.();
    if (audio.paused !== false) setLevel(0);
    update('loading');
    watchLoading();
    try {
      // Both operations start in the click's user activation.
      void context?.resume().catch(() => {});
      await audio.play();
      if (request === revision) playbackStarted();
      else if (!wanted && frame === undefined && audio.paused !== true) audio.pause();
    } catch (error) {
      if (request === revision) fail(error?.name === 'NotAllowedError' ? 'paused' : 'error');
    }
  }
  function pausePlayback(reset) {
    const fade = status === 'playing' && !hidden;
    wanted = resumeOnShow = hasPlayed = false;
    revision++;
    clearDeadline();
    rewinding ||= reset;
    update(reset ? 'idle' : 'paused');
    const finish = () => { audio.pause(); rewind(); };
    if (fade) ramp(0, 210, finish);
    else {
      cancelRamp();
      finish();
    }
  }

  return {
    isActive: () => wanted,
    play,
    pause: () => pausePlayback(false),
    stop: () => pausePlayback(true),
    setVolume(percent) {
      target = percent / 100;
      if (wanted && status === 'playing') ramp(outputLevel(), 90);
    },
    setVisibility(inBackground) {
      if (inBackground === hidden || disposed) return;
      hidden = inBackground;
      if (hidden) {
        const resume = wanted && hasPlayed;
        if (wanted || frame !== undefined) pausePlayback(false);
        resumeOnShow = resume;
        if (resume) update('hidden');
      } else if (resumeOnShow) void play();
    },
    dispose() {
      disposed = true;
      wanted = resumeOnShow = false;
      revision++;
      clearDeadline();
      cancelRamp();
      audio.onplaying = audio.onwaiting = audio.ontimeupdate = audio.onended = audio.onerror = null;
      audio.pause();
      void context?.close().catch(() => {});
    },
  };
}
