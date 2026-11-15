import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const themedAvatars = {
  galo: '/astra-avatar-galo.jpg',
  'galo-light': '/astra-avatar-galo-light.jpg',
};

export default function AstraAvatar({ alt = '', ...props }) {
  const theme = useContext(ThemeContext)?.theme;
  return <img {...props} alt={alt} src={themedAvatars[theme] ?? '/astra-avatar-mobile.png'} />;
}
