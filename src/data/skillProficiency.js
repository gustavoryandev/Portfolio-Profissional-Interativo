export function proficiencyValue(skill) {
  const value = skill.proficienciaPercentual;
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100 ? value : null;
}

export function proficiencyLevel(percent, lang = 'pt') {
  const en = lang.startsWith('en');
  if (proficiencyValue({ proficienciaPercentual: percent }) === null) return en ? 'Level to be defined' : 'Nível a definir';
  if (percent >= 80) return en ? 'Advanced' : 'Avançado';
  if (percent >= 50) return en ? 'Intermediate' : 'Intermediário';
  return en ? 'Basic' : 'Básico';
}
