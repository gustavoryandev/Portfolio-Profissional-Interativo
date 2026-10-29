import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = workerUrl;

function ResumePage({ pdf, number, width, zoom, label, onError }) {
  const host = useRef(null);
  const [text, setText] = useState('');

  useEffect(() => {
    let disposed = false;
    let renderTask;
    const container = host.current;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    container.replaceChildren(canvas);

    async function render() {
      const page = await pdf.getPage(number);
      if (disposed) return;
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: width / base.width * zoom });
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.ceil(viewport.width * ratio);
      canvas.height = Math.ceil(viewport.height * ratio);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      renderTask = page.render({
        canvasContext: canvas.getContext('2d'), viewport,
        transform: [ratio, 0, 0, ratio, 0, 0],
      });
      await renderTask.promise;
      const content = await page.getTextContent();
      if (!disposed) setText(content.items.map(item => item.str || '').join(' '));
    }
    render().catch(error => {
      if (!disposed && error.name !== 'RenderingCancelledException') onError();
    });
    return () => {
      disposed = true;
      renderTask?.cancel();
      canvas.remove();
    };
  }, [pdf, number, width, zoom, onError]);

  return <div className="resume-page" role="group" aria-label={label}>
    <div ref={host} />
    <p className="sr-only">{text}</p>
  </div>;
}

export default function ResumeCard({ lang = 'pt' }) {
  const { t } = useTranslation();
  const url = lang.startsWith('en')
    ? '/Gustavo Ryan Resume (English).pdf' : '/Currículo Gustavo Ryan.pdf';
  const [documentState, setDocumentState] = useState(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [width, setWidth] = useState(300);
  const viewportRef = useRef(null);
  const [reportError] = useState(() => () => setError(true));
  const pdf = documentState?.url === url ? documentState.pdf : null;

  useEffect(() => {
    let disposed = false;
    setDocumentState(null);
    setError(false);
    setZoom(1);
    const task = getDocument({ url: encodeURI(url), isEvalSupported: false });
    task.promise.then(document => {
      if (!disposed) setDocumentState({ url, pdf: document });
    }).catch(() => { if (!disposed) setError(true); });
    return () => { disposed = true; void task.destroy(); };
  }, [url, attempt]);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(120, entry.contentRect.width - 32));
    });
    observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={`resume-viewer${expanded ? ' resume-viewer-expanded' : ''}`} aria-label={t('resume.title')}>
      <div className="resume-toolbar">
        <strong>{t('resume.title')}</strong>
        {pdf && <span className="resume-page-count">{t('resume.pages', { count: pdf.numPages })}</span>}
        <div className="resume-controls">
          <button type="button" disabled={!pdf || zoom <= 0.5} onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} aria-label={t('resume.zoomOut')} title={t('resume.zoomOut')}><ZoomOut size={17} /></button>
          <button type="button" onClick={() => setZoom(1)} title={t('resume.fit')} aria-label={t('resume.fit')}>{Math.round(zoom * 100)}%</button>
          <button type="button" disabled={!pdf || zoom >= 3} onClick={() => setZoom(z => Math.min(3, z + 0.25))} aria-label={t('resume.zoomIn')} title={t('resume.zoomIn')}><ZoomIn size={17} /></button>
          <button type="button" onClick={() => setExpanded(v => !v)} aria-pressed={expanded} aria-label={t(expanded ? 'resume.collapse' : 'resume.expand')} title={t(expanded ? 'resume.collapse' : 'resume.expand')}>{expanded ? <Minimize2 size={17} /> : <Maximize2 size={17} />}</button>
          <a href={encodeURI(url)} download aria-label={t('resume.download')} title={t('resume.download')}><Download size={17} /></a>
        </div>
      </div>
      <div ref={viewportRef} className="resume-viewport" tabIndex={0} aria-label={t('resume.document')} aria-busy={!pdf && !error}>
        {error ? <div className="resume-notice" role="alert"><p>{t('resume.error')}</p><button type="button" onClick={() => setAttempt(v => v + 1)}>{t('resume.retry')}</button></div>
          : !pdf ? <p className="resume-notice" role="status">{t('resume.loading')}</p>
            : Array.from({ length: pdf.numPages }, (_, i) => <ResumePage key={`${url}-${attempt}-${i}`} pdf={pdf} number={i + 1} width={width} zoom={zoom} label={t('resume.page', { number: i + 1 })} onError={reportError} />)}
      </div>
    </section>
  );
}
