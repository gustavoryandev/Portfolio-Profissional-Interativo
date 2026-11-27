export const HEIST_DARK = 'la-casa-de-papel-dark';
export const HEIST_LIGHT = 'la-casa-de-papel-light';

export const isHeistTheme = theme => theme === HEIST_DARK || theme === HEIST_LIGHT;

export const heistMedia = {
  mask: '/la-casa-de-papel/dali-mask-header.png',
  portrait: '/perfil-foto.jpeg',
  maskedPortrait: '/la-casa-de-papel/perfil-foto-reveal.webp',
  backgrounds: {
    [HEIST_DARK]: '/la-casa-de-papel/dark-background.webp',
    [HEIST_LIGHT]: '/la-casa-de-papel/light-background.webp',
  },
  avatars: {
    berlin: '/la-casa-de-papel/avatar-berlin.webp',
    professor: '/la-casa-de-papel/avatar-professor.webp',
  },
};
