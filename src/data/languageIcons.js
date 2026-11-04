// Local Devicon v2.16.0 assets. Names are matched against this allowlist only.
// API responses never become URLs or SVG markup.
const icons = new Map([
  ['figma', 'figma'], ['vite', 'vitejs'], ['thymeleaf', 'thymeleaf'],
  ['mongodb', 'mongodb'], ['mongo db', 'mongodb'], ['supabase', 'supabase'],
  ['vscode', 'vscode'], ['vs code', 'vscode'], ['intellij', 'intellij'], ['intellij idea', 'intellij'],
  ['github', 'github'], ['node', 'nodejs'], ['node.js', 'nodejs'], ['nodejs', 'nodejs'], ['maven', 'maven'],
  ['java', 'java'], ['spring', 'spring'], ['spring boot', 'spring'],
  ['react', 'react'], ['react.js', 'react'], ['jsx', 'react'],
  ['javascript / react', 'react'], ['python', 'python'],
  ['tailwind', 'tailwindcss'], ['tailwind css', 'tailwindcss'], ['tailwindcss', 'tailwindcss'],
  ['git', 'git'], ['git & github', 'git'], ['git config', 'git'], ['gitignore file', 'git'],
  ['javascript', 'javascript'], ['js', 'javascript'],
  ['typescript', 'typescript'], ['ts', 'typescript'], ['tsx', 'typescript'],
  ['c', 'c'], ['c++', 'cplusplus'], ['cpp', 'cplusplus'], ['c#', 'csharp'], ['csharp', 'csharp'],
  ['html', 'html5'], ['html5', 'html5'], ['css', 'css3'], ['css3', 'css3'],
  ['docker', 'docker'], ['dockerfile', 'docker'], ['bash', 'bash'], ['shell', 'bash'],
  ['ruby', 'ruby'], ['php', 'php'], ['kotlin', 'kotlin'], ['dart', 'dart'],
  ['go', 'go'], ['golang', 'go'], ['swift', 'swift'], ['vue', 'vuejs'], ['vue.js', 'vuejs'],
  ['jupyter notebook', 'jupyter'], ['sass', 'sass'], ['scss', 'sass'],
  ['visual basic .net', 'dot-net'], ['.net', 'dot-net'], ['powershell', 'powershell'],
  ['r', 'r'], ['scala', 'scala'], ['json', 'json'],
]);

export function getLanguageIcon(name) {
  const key = typeof name === 'string' ? name.trim().replace(/\s+/g, ' ').toLowerCase() : '';
  const icon = icons.get(key);
  return icon ? `/icons/${icon}.svg` : null;
}
