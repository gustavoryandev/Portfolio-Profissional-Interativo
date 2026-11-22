import { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from './ThemeState';

const SurfaceContext = createContext('compact');

export function AstraSurfaceProvider({ surface, children }) {
  return <SurfaceContext.Provider value={surface}>{children}</SurfaceContext.Provider>;
}

export function useAssistantPersona(surface) {
  const { theme, dimension } = useContext(ThemeContext) ?? {};
  const inheritedSurface = useContext(SurfaceContext);
  const { t } = useTranslation();
  if (theme !== 'rick-morty') return null;
  const id = (surface ?? inheritedSurface) === 'compact' ? 'meeseeks' : dimension === 'corrupted' ? 'poopybutthole' : 'squanchy';
  return { id, image: `/rick-assets/avatar-${id}.png?v=portrait-2`,
    name: t(`rick.${id}.name`), intro: t(`rick.${id}.intro`), welcome: t(`rick.${id}.welcome`) };

}
