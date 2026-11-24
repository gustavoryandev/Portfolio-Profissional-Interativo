import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import DimensionalPortal, { type PortalQuality } from '../../components/rick/portal/DimensionalPortal';
import './demo.css';
import '../../components/rick/portal/profile-photo.css';

function PortalDemo() {
  const [open, setOpen] = useState(true);
  const [paused, setPaused] = useState(false);
  const [quality, setQuality] = useState<PortalQuality>('auto');
  const [glow, setGlow] = useState(.65);
  const [phase, setPhase] = useState('Abrindo');
  const settings = { isOpen: open, effectsPaused: paused, quality, glowIntensity: glow };
  return <main className="portal-demo">
    <header><a href="/">← Portfólio</a><h1>Portais dimensionais</h1></header>
    <div className="portal-examples">
      {(['garage','citadel'] as const).map((variant,i)=><section className="portal-specimen" data-variant={variant} key={variant}>
        <h2>{i === 0 ? 'Garagem' : 'Cidadela'}</h2>
        <DimensionalPortal {...settings} variant={variant} size="100%" aspectRatio={.92}
          onOpenComplete={i===0 ? ()=>setPhase('Aberto') : undefined}
          onCloseComplete={i===0 ? ()=>setPhase('Fechado') : undefined}/>
      </section>)}
    </div>
    <fieldset className="portal-controls"><legend>Controles do portal</legend>
      <button type="button" onClick={()=>{setPhase(open?'Fechando':'Abrindo');setOpen(!open);}}>{open?'Fechar portal':'Abrir portal'}</button>
      <span role="status">{phase}</span>
      <label><input type="checkbox" checked={paused} onChange={e=>setPaused(e.target.checked)}/> Pausar energia</label>
      <label>Qualidade <select value={quality} onChange={e=>setQuality(e.target.value as PortalQuality)}>
        <option value="auto">Automática</option><option value="low">Baixa</option><option value="high">Alta</option>
      </select></label>
      <label>Brilho <input type="range" min="0" max="1" step=".05" value={glow} onChange={e=>setGlow(e.target.valueAsNumber)}/><output>{Math.round(glow*100)}%</output></label>
    </fieldset>
    <section className="portal-photo-example"><h2>Portal com fotografia</h2>
      <DimensionalPortal {...settings} className="profile-portal" variant="citadel" size={248} aspectRatio={5/6}>
        <img src="/perfil-foto.jpeg" alt="Gustavo Ryan" width="572" height="777"/>
      </DimensionalPortal>
    </section>
  </main>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><PortalDemo/></StrictMode>);
