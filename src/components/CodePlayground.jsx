import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, RotateCcw, Square, Terminal } from 'lucide-react';
import './CodePlayground.css';

import { playgroundExamples as EXAMPLES } from '../data/playgroundExamples';
import { languages, variants } from '../data/playgroundLanguages';
import { freeCode } from '../data/playgroundFreeCode';

const MODES = [...EXAMPLES, { id: 'free', pt: 'Código livre', en: 'Free coding' }];

export default function CodePlayground() {
  const { i18n } = useTranslation();
  const en = i18n.language.startsWith('en');
  const [example, setExample] = useState(EXAMPLES[0].id);
  const [language, setLanguage] = useState('python');
  const [drafts, setDrafts] = useState({});
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('idle');
  const worker = useRef(null);
  const timer = useRef(null);
  const selected = MODES.find(item => item.id === example);
  const draftKey = `${example}:${language}`;
  const originalCode = example === 'free' ? freeCode[language] : language === 'python' ? selected.code : variants[example][language];
  const code = drafts[draftKey] ?? originalCode;
  const setCode = value => setDrafts(previous => ({ ...previous, [draftKey]: value }));
  const busy = status === 'loading' || status === 'running';

  function dispose() {
    clearTimeout(timer.current);
    worker.current?.terminate();
    worker.current = null;
  }
  useEffect(() => dispose, []);

  function stop() {
    dispose();
    setStatus('stopped');
  }

  function selectExample(id) {
    setExample(id);
    setOutput('');
    setStatus('idle');
  }

  function run() {
    if (worker.current || !code.trim()) return;
    setOutput('');
    setStatus('loading');
    const timeout = () => { dispose(); setStatus('timeout'); };
    try {
      const instance = new Worker(`/${language}-playground.worker.js`);
      worker.current = instance;
      timer.current = setTimeout(timeout, 60000);
      instance.onmessage = ({ data }) => {
        if (worker.current !== instance) return;
        if (data.type === 'ready') {
          clearTimeout(timer.current);
          timer.current = setTimeout(timeout, 10000);
          setStatus('running');
          return;
        }
        setOutput([data.output, data.error].filter(Boolean).join('\n'));
        setStatus(data.type === 'done' ? 'done' : 'error');
        dispose();
      };
      instance.onerror = () => { dispose(); setStatus('error'); };
      instance.postMessage({ code });
    } catch {
      dispose();
      setStatus('error');
    }
  }

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
    <div className="glass-panel code-lab-panel">
      <div className="code-lab-toolbar">
        <span className="code-lab-language"><Terminal size={18} aria-hidden="true" />{languages[language].label}</span>
        <div className="code-lab-languages" role="group" aria-label={en ? 'Programming language' : 'Linguagem de programação'}>{['java', 'python', 'javascript'].map(value => <button key={value} type="button" disabled={busy} aria-pressed={language === value} onClick={() => { setLanguage(value); setOutput(''); setStatus('idle'); }}>{languages[value].label}</button>)}</div>
        <button className="code-lab-reset" type="button" disabled={busy} onClick={() => { setCode(originalCode); setOutput(''); setStatus('idle'); }}><RotateCcw size={15} aria-hidden="true" />{en ? 'Reset' : 'Restaurar'}</button>
      </div>
      <div className="code-lab-examples" role="group" aria-label={en ? 'Choose an example' : 'Escolha um exemplo'}>
        {MODES.map((item, index) => <button key={item.id} type="button" aria-pressed={example === item.id} disabled={busy} onClick={() => selectExample(item.id)}>
          <span className="code-lab-example-number" aria-hidden="true">0{index + 1}</span>
          <span>{item[en ? 'en' : 'pt']}</span>
        </button>)}
      </div>
      <p className="code-lab-source">{example === 'free'
        ? (en ? 'Your space to experiment. Each language keeps its draft while this page is open.' : 'Seu espaço para experimentar. Cada linguagem mantém seu rascunho enquanto esta página estiver aberta.')
        : <>{en ? 'Project demo · ' : 'Demonstração do projeto · '}<a href={selected.source} target="_blank" rel="noreferrer">{en ? 'View original Java project ↗' : 'Ver projeto original em Java ↗'}</a></>}</p><div className="code-lab-columns">
        <div className="code-lab-editor"><label htmlFor="playground-code">{languages[language].file}</label><textarea id="playground-code" value={code} onChange={event => setCode(event.target.value)} disabled={busy} spellCheck={false} autoCapitalize="off" autoCorrect="off" maxLength={20000} aria-label={en ? 'Editable code' : 'Código editável'} /></div>
        <div className="code-lab-output"><h3>{en ? 'Console output' : 'Saída do console'}</h3><p role="status">{labels[status]}</p><pre tabIndex={0} aria-label={en ? 'Execution result' : 'Resultado da execução'}>{output || (status === 'done' ? (en ? 'No console output.' : 'Nenhuma saída no console.') : '› _')}</pre></div>
      </div>
      <div className="code-lab-footer"><p>{language === 'java' ? (en ? 'Your code is sent to Wandbox (OpenJDK 21). Stopping ends the wait, not the remote execution.' : 'Seu código é enviado ao Wandbox (OpenJDK 21). Parar encerra a espera, não a execução remota.') : (en ? 'Runs in your browser. Python requires internet on first load. Up to 10 seconds per run.' : 'Executa no navegador. Python requer internet no primeiro carregamento. Até 10 segundos por execução.')}</p>{busy ? <button type="button" className="neon-cta" onClick={stop}><Square size={16} />{en ? 'Stop' : 'Parar'}</button> : <button type="button" className="neon-cta" disabled={!code.trim()} onClick={run}><Play size={16} />{en ? 'Run code' : 'Executar código'}</button>}</div>
    </div>
  </section>;
}
