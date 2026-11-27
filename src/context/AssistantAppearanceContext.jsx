import { assistantAppearance, assistantPersonaId, assistantPersonaPresentation } from '../data/assistantPersonas.js';
import { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from './ThemeState';

const SurfaceContext = createContext('compact');

export function AstraSurfaceProvider({ surface, children }) {
  return <SurfaceContext.Provider value={surface}>{children}</SurfaceContext.Provider>;
}

export function useAssistantPersona(surface, author) {
  const { theme, dimension } = useContext(ThemeContext) ?? {};
  const inheritedSurface = useContext(SurfaceContext);
  const { t } = useTranslation();
  const id = author ? author.personaId
    : assistantPersonaId({ ...assistantAppearance(theme, dimension), surface: surface ?? inheritedSurface });
  const presentation = assistantPersonaPresentation(id);
  if (!presentation) return null;
  const key = `${presentation.catalog}.${id}`;
  return { id, key, image: presentation.image,
    name: t(`${key}.name`), intro: t(`${key}.intro`), welcome: t(`${key}.welcome`) };
}
