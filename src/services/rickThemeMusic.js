// Official Apple Music preview. Streamed from Apple; no redistributed audio file.
export const RICK_THEME_TRACK = {
  title: 'Rick and Morty Theme',
  artist: 'Rick and Morty & Ryan Elder',
  source: 'https://music.apple.com/us/song/1570547237',
  preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/98/bd/f5/98bdf567-f67e-324a-deae-452c07983691/mzaf_11617390157100661171.plus.aac.p.m4a',
};

export function createRickThemeMusic(Audio, onStatus) {
  const audio = new Audio(RICK_THEME_TRACK.preview);
  audio.volume = 0.22;
  audio.preload = 'none';
  let status = 'idle';
  let revision = 0;
  let disposed = false;
  const update = next => { status = next; if (!disposed) onStatus(next); };
  audio.onplay = () => update('playing');
  audio.onpause = () => update('paused');
  audio.onended = () => update('idle');
  audio.onerror = () => update('error');
  const isActive = () => status === 'loading' || status === 'playing';
  return {
    isActive,
    async play() {
      if (disposed || isActive()) return;
      const request = ++revision;
      update('loading');
      try {
        // Called synchronously from the theme-selection click for autoplay policy.
        await audio.play();
        if (request !== revision || disposed) audio.pause();
        else update('playing');
      } catch (error) {
        if (request === revision && !disposed) update(error?.name === 'NotAllowedError' ? 'paused' : 'error');
      }
    },
    pause() { ++revision; audio.pause(); update('paused'); },
    stop() { ++revision; audio.pause(); audio.currentTime = 0; update('idle'); },
    dispose() {
      disposed = true; ++revision;
      audio.onplay = audio.onpause = audio.onended = audio.onerror = null;
      audio.pause();
    },
  };
}
