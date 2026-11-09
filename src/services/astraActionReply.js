// UI messages describe what actually happened, independently of the model's wording.
const notices = {
  navigated: ['Seção aberta.', 'Section opened.'],
  project: ['Projeto aberto.', 'Project opened.'],
  theme: ['Tema alterado.', 'Theme changed.'],
  language: ['Idioma alterado.', 'Language changed.'],
  labLanguage: ['Linguagem do Laboratório selecionada.', 'Laboratory language selected.'],
  labExample: ['Exemplo carregado.', 'Example loaded.'],
  busy: ['Pare a execução atual antes de trocar o exemplo ou a linguagem.', 'Stop the current run before switching examples or languages.'],
  review: ['A proposta está pronta para revisão.', 'The proposal is ready to review.'],
  pending: ['Revise ou descarte a proposta anterior primeiro.', 'Review or discard the previous proposal first.'],
  stale: ['O código mudou. Peça uma nova proposta.', 'The code changed. Ask for a new proposal.'],
  patch: ['Não consegui preparar a alteração com segurança. Nenhum código foi modificado.', 'I couldn’t prepare the change safely. No code was modified.'],
  empty: ['O editor está vazio.', 'The editor is empty.'],
  original: ['O editor já contém o código original.', 'The editor already contains the original code.'],
  stopped: ['Execução interrompida.', 'Execution stopped.'],
  notRunning: ['Nenhuma execução em andamento.', 'No run is in progress.'],
  invalid: ['Não consegui realizar a ação solicitada.', 'I couldn’t complete the requested action.'],
};

export function actionReply(noticeIds, en) {
  return [...new Set(noticeIds)].map(id => notices[id][Number(en)]).join(' ');
}
