import { useTranslation } from 'react-i18next';
import { Play, RotateCcw, Square, Terminal } from 'lucide-react';
import './CodePlayground.css';

import { languages } from '../data/playgroundLanguages';
import { LAB_CODE_LIMIT, LAB_MODES as MODES } from '../services/portfolioActions';
import { useAstra, useLaboratory } from '../context/AstraContext';
import LaboratoryReview from './LaboratoryReview';

export default function CodePlayground() {
  const { i18n } = useTranslation();
  const en = i18n.language.startsWith('en');
  const { openAstra, openFull, labHandoff } = useAstra();
  const [lab, { example, language, code, output, status, busy }] = useLaboratory();
  const selected = MODES.find(item => item.id === example);

  const labels = en ? {
    idle: 'Ready to experiment.', loading: 'Preparing execution… This may take a moment.', running: 'Running…',
    done: 'Execution finished.', stopped: 'Execution stopped.', timeout: 'Time limit reached. Try a smaller example.', error: 'Unable to finish. Check your code and internet connection.',
  } : {
    idle: 'Pronto para experimentar.', loading: 'Preparando a execução… Pode levar alguns instantes.', running: 'Executando…',
    done: 'Execução concluída.', stopped: 'Execução interrompida.', timeout: 'Tempo limite atingido. Tente um exemplo menor.', error: 'Não foi possível concluir. Confira o código e a conexão com a internet.',
  };

  return <section id="laboratorio" className="scroll-section code-lab" aria-labelledby="code-lab-title">
    <p className="section-eyebrow">03 / {en ? 'CODE LAB' : 'LABORATÓRIO'}</p>
    <h2 id="code-lab-title">{en ? 'Make the code yours.' : 'Experimente. Altere. Execute.'}</h2>
    <p className="code-lab-intro">{en ? 'Explore Bro Fit and Shopping Cart in Java, Python and JavaScript.' : 'Explore o Bro Fit e o Carrinho de Compras em Java, Python e JavaScript.'}</p>
    {labHandoff && <div className="lab-handoff glass-panel">
      <p role="status">{labHandoff.reply ?? (en ? 'Astra is working on your request…' : 'Astra está preparando sua resposta…')}</p>
      <button type="button" className="chip chip--accent" onClick={labHandoff.modal ? openAstra : openFull}>{en ? 'Continue with Astra' : 'Continuar com a Astra'}</button>
    </div>}
    <LaboratoryReview />
    <div className="glass-panel code-lab-panel">
      <div className="code-lab-toolbar">
        <span className="code-lab-language"><Terminal size={18} aria-hidden="true" />{languages[language].label}</span>
        <div className="code-lab-languages" role="group" aria-label={en ? 'Programming language' : 'Linguagem de programação'}>{['java', 'python', 'javascript'].map(value => <button key={value} type="button" disabled={busy} aria-pressed={language === value} onClick={() => lab.select({ language: value })}>{languages[value].label}</button>)}</div>
        <button className="code-lab-reset" type="button" disabled={busy} onClick={lab.reset}><RotateCcw size={15} aria-hidden="true" />{en ? 'Reset' : 'Restaurar'}</button>
      </div>
      <div className="code-lab-examples" role="group" aria-label={en ? 'Choose an example' : 'Escolha um exemplo'}>
        {MODES.map((item, index) => <button key={item.id} type="button" aria-pressed={example === item.id} disabled={busy} onClick={() => lab.select({ example: item.id })}>
          <span className="code-lab-example-number" aria-hidden="true">0{index + 1}</span>
          <span>{item[en ? 'en' : 'pt']}</span>
        </button>)}
      </div>
      <p className="code-lab-source">{example === 'free'
        ? (en ? 'Your space to experiment. Each language keeps its draft while this page is open.' : 'Seu espaço para experimentar. Cada linguagem mantém seu rascunho enquanto esta página estiver aberta.')
        : <>{en ? 'Project demo · ' : 'Demonstração do projeto · '}<a href={selected.source} target="_blank" rel="noreferrer">{en ? 'View original Java project ↗' : 'Ver projeto original em Java ↗'}</a></>}</p><div className="code-lab-columns">
        <div className="code-lab-editor"><label htmlFor="playground-code">{languages[language].file}</label><textarea id="playground-code" value={code} onChange={event => lab.setCode(event.target.value)} disabled={busy} spellCheck={false} autoCapitalize="off" autoCorrect="off" maxLength={LAB_CODE_LIMIT} aria-label={en ? 'Editable code' : 'Código editável'} /></div>
        <div className="code-lab-output"><h3>{en ? 'Console output' : 'Saída do console'}</h3><p role="status">{labels[status]}</p><pre tabIndex={0} aria-label={en ? 'Execution result' : 'Resultado da execução'}>{output || (status === 'done' ? (en ? 'No console output.' : 'Nenhuma saída no console.') : '› _')}</pre></div>
      </div>
      <div className="code-lab-footer"><p>{language === 'java' ? (en ? 'Your code is sent to Wandbox (OpenJDK 21). Stopping ends the wait, not the remote execution.' : 'Seu código é enviado ao Wandbox (OpenJDK 21). Parar encerra a espera, não a execução remota.') : (en ? 'Runs in your browser. Python requires internet on first load. Up to 10 seconds per run.' : 'Executa no navegador. Python requer internet no primeiro carregamento. Até 10 segundos por execução.')}</p>{busy ? <button type="button" className="neon-cta" onClick={lab.stop}><Square size={16} />{en ? 'Stop' : 'Parar'}</button> : <button type="button" className="neon-cta" disabled={!code.trim()} onClick={lab.run}><Play size={16} />{en ? 'Run code' : 'Executar código'}</button>}</div>
    </div>
  </section>;
}
