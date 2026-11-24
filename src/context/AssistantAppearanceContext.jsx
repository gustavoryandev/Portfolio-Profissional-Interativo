import { assistantPersonaId } from '../data/assistantPersonas.js';
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
  const id = assistantPersonaId({ theme, dimension, surface: surface ?? inheritedSurface });
  if (!id) return null;
  return { id, image: `/rick-assets/avatar-${id}.webp`,
    name: t(`rick.${id}.name`), intro: t(`rick.${id}.intro`), welcome: t(`rick.${id}.welcome`) };

}
