import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { useAssistantPersona } from '../context/AssistantAppearanceContext';
export { AstraSurfaceProvider } from '../context/AssistantAppearanceContext';

const themedAvatars = {
  galo: '/astra-avatar-galo.jpg',
  'galo-light': '/astra-avatar-galo-light.jpg',
};

export default function AstraAvatar({ alt = '', surface, ...props }) {
  const { theme } = useContext(ThemeContext) ?? {};
  const persona = useAssistantPersona(surface);
  return <img {...props} data-astra-character={persona?.id} alt={alt}
    src={persona?.image ?? themedAvatars[theme] ?? '/astra-avatar-mobile.png'} />;
}
