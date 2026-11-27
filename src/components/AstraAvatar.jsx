import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { useAssistantPersona } from '../context/AssistantAppearanceContext';
export { AstraSurfaceProvider } from '../context/AssistantAppearanceContext';

const themedAvatars = {
  galo: '/astra-avatar-galo.jpg',
  'galo-light': '/astra-avatar-galo-light.jpg',
};

export default function AstraAvatar({ alt = '', surface, author, ...props }) {
  const { theme } = useContext(ThemeContext) ?? {};
  const persona = useAssistantPersona(surface, author);
  return <img {...props} data-astra-character={persona?.id} alt={alt}
    src={persona?.image ?? themedAvatars[author ? author.theme : theme] ?? '/astra-avatar-mobile.png'} />;
}
