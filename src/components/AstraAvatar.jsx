import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { useAssistantPersona } from '../context/AssistantAppearanceContext';
export { AstraSurfaceProvider } from '../context/AssistantAppearanceContext';

const themedAvatars = {
  galo: '/astra-avatar-galo.jpg',
  'galo-light': '/astra-avatar-galo-light.jpg',
};

export default function AstraAvatar({ alt = '', surface, author, onError, ...props }) {
  const { theme } = useContext(ThemeContext) ?? {};
  const persona = useAssistantPersona(surface, author);
  const fallback = themedAvatars[author ? author.theme : theme] ?? '/astra-avatar-mobile.png';
  return <img {...props} data-astra-character={persona?.id} alt={alt} src={persona?.image ?? fallback}
    onError={event => {
      const image = event.currentTarget;
      if (image.getAttribute('src') !== fallback) image.src = fallback;
      onError?.(event);
    }} />;
}
