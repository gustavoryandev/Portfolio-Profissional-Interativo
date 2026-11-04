export function projectContent(project, field, language, translate) {
  const lang = language?.startsWith('en') ? 'en' : 'pt';
  const value = project[field];
  if (typeof value === 'string') return value;
  if (value?.[lang]) return value[lang];
  const key = project.chavesI18n?.[field];
  return key ? translate(key) : field === 'titulo' ? project.id : '';
}
