import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useLaboratory } from '../context/AstraContext';
import { LAB_MODES } from '../services/portfolioActions';
import { languages } from '../data/playgroundLanguages';
import FullAstraCardLink from './FullAstraCardLink';

const messages = {
  applied: ['Alteração aplicada ao editor.', 'Change applied to the editor.'],
  approved: ['Execução aprovada. Veja a saída do console no Laboratório.', 'Run approved. See the console output in the Laboratory.'],
  rejected: ['Proposta descartada.', 'Proposal discarded.'],
  stale: ['O código mudou depois da proposta. Peça à Astra para preparar outra.', 'The code changed after the proposal. Ask Astra to prepare a new one.'],
};

export default function LaboratoryReview({ onOpenLab, onViewFull, focusId }) {
  const [lab, { review, reviewStatus, busy }] = useLaboratory();
  const { i18n } = useTranslation();
  const title = useId();
  const en = i18n.language.startsWith('en');
  if (!review) return reviewStatus && <p role="status" className="lab-review-status">
    {messages[reviewStatus][Number(en)]}{onOpenLab && (reviewStatus === 'applied' || reviewStatus === 'approved') &&
      <> <button className="chip chip--accent" type="button" onClick={onOpenLab}>{en ? 'Open Laboratory' : 'Abrir Laboratório'}</button></>}
  </p>;
  const example = LAB_MODES.find(item => item.id === review.example)[en ? 'en' : 'pt'];
  return <section id={focusId} tabIndex={focusId ? -1 : undefined} className="lab-review glass-panel outline-none" aria-labelledby={title}>
    <h3 id={title}>{review.edits ? (en ? 'Review Astra’s code changes' : 'Revise as alterações da Astra')
      : (en ? 'Review code before running' : 'Revise o código antes de executar')}</h3>
    <p>{languages[review.language].label} · {example} · {languages[review.language].file}</p>
    {review.edits ? <div className="lab-review-diff" tabIndex={0} aria-label={en ? 'Proposed replacements' : 'Substituições propostas'}>
      {review.edits.map(({ find, replace }, index) => <div key={index}>
        <p>{en ? 'Before' : 'Antes'}</p><pre>{find || (en ? '(empty)' : '(vazio)')}</pre>
        <p>{en ? 'After' : 'Depois'}</p><pre>{replace || (en ? '(removed)' : '(removido)')}</pre>
      </div>)}
    </div> : <div className="lab-review-diff" tabIndex={0}><pre>{review.code}</pre></div>}
    {review.runAfter && review.language === 'java' && <p>{en ? 'Java execution sends this code to Wandbox.' : 'A execução de Java envia este código ao Wandbox.'}</p>}
    <div className="lab-review-actions">
      <button className="chip chip--accent" type="button" disabled={busy} onClick={() => lab.resolveReview(review.id, true)}>
        {review.edits ? (review.runAfter ? (en ? 'Apply and run' : 'Aplicar e executar') : (en ? 'Apply changes' : 'Aplicar alterações'))
          : (en ? 'Run code' : 'Executar código')}
      </button>
      <button className="chip" type="button" onClick={() => lab.resolveReview(review.id, false)}>{en ? 'Discard' : 'Descartar'}</button>
      {onViewFull && <FullAstraCardLink onOpen={onViewFull} />}
    </div>
  </section>;
}
