import { useEffect, useRef, useState } from 'react';
import { motion, useAnimate, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { ArrowUpRight, ArrowRight, Terminal, Radio, Github, Linkedin, RefreshCw, Music2, Clock3 } from 'lucide-react';
import SwarmCursors from './SwarmCursors';
import WakaTimeCard from './WakaTimeCard';
import SpotifyCard from './SpotifyCard';
import PortfolioSection from './PortfolioSection';
import perfil from '../data/perfil.json';
import './RedesignHome.css';

export default function RedesignHome({ en, live, active, onSelect, onLanguageChange, children }) {
  const sectionRef = useRef(null);
  const [scope, animate] = useAnimate();
  const reduced = useReducedMotion();
  const progress = useMotionValue(0);
  const bootOpacity = useTransform(progress, [0, .25, .42, 1], [1, 1, 0, 0]);
  const [ready, setReady] = useState(false);
  const controlsRef = useRef(null);
  useEffect(() => {
    let cancelled = false;
    const enter = { opacity: [0, 1], y: [18, 0] };
    const timing = (at, duration = .55) => ({
      at: reduced ? 0 : at, duration: reduced ? 0 : duration,
      ease: [.22, 1, .36, 1],
    });
    const controls = animate([
      [progress, 1, { at: 0, duration: reduced ? 0 : 3.8, ease: 'linear' }],
      ['.agent-topbar', enter, timing(1)],
      ['.agent-navigation', enter, timing(1)],
      ['.agent-outline', { opacity: [0, 1] }, timing(.9, .8)],
      ['.agent-introduction', enter, timing(1.25)],
      ['.agent-identity', enter, timing(1.4)],
      ['.agent-monitors', enter, timing(1.58)],
      ['.agent-chat', enter, timing(1.8)],
      ['.agent-footer', { opacity: [0, 1] }, timing(1.9)],
    ]);
    controlsRef.current = controls;
    controls.then(() => { if (!cancelled) setReady(true); });
    const visibility = () => {
      if (document.hidden) controls.pause();
      else controls.play();
    };
    document.addEventListener('visibilitychange', visibility);
    if (document.hidden) controls.pause();
    return () => {
      cancelled = true;
      controls.stop();
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [animate, progress, reduced]);
  const skipIntro = () => {
    controlsRef.current?.complete();
    progress.set(1);
    setReady(true);
  };
  useEffect(() => {
    if (active !== 'home') sectionRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [active]);
  useEffect(() => {
    live.watch(['wakatime', 'spotify']);
    void live.refresh(['wakatime', 'spotify']);
  }, [live.watch, live.refresh]);
  const week = live.context.wakatime?.week;
  const track = live.context.spotify?.current;
  const lang = en ? 'en' : 'pt';
  function select(section) {
    skipIntro();
    onSelect(section);
    if (section === 'home') scope.current?.scrollIntoView({ behavior: 'instant' });
  }
  const status = (source) => {
    if (live.refreshing.includes(source)) return en ? 'Syncing' : 'Sincronizando';
    const data = live.context[source];
    if (data?.stale) return en ? 'Last saved data' : 'Última sincronização';
    return data?.status === 'ok' ? (en ? 'Connected' : 'Conectado') : (en ? 'Unavailable' : 'Indisponível');
  };
  const nav = [['home', en ? 'Overview' : 'Visão geral'], ['projects', en ? 'Projects' : 'Projetos'], ['about', en ? 'About' : 'Sobre'], ['contact', en ? 'Contact' : 'Contato']];
  return <main id="conteudo" tabIndex={-1} ref={scope} data-ready={ready} className="agent-dashboard dark">
    <a href="#conteudo" className="skip-link" onClick={skipIntro}>{en ? 'Skip to content' : 'Pular para o conteúdo'}</a>
    <SwarmCursors progress={progress} />
    {!ready && <div className="agent-boot-layer">
      <motion.div className="agent-boot-mark" style={{ opacity: bootOpacity }} aria-hidden="true"><span>GR.</span><small>{en ? 'ASSEMBLING WORKSPACE' : 'MONTANDO O WORKSPACE'}</small></motion.div>
      <button className="agent-skip" onClick={skipIntro}>{en ? 'Skip intro' : 'Pular intro'} <ArrowRight size={14}/></button>
    </div>}
    <div className="agent-shell">
      <header className="agent-topbar">
        <button className="agent-wordmark" onClick={() => select('home')} aria-label={en ? 'Back to overview' : 'Voltar à visão geral'}>gr<span>.</span><small>GUSTAVO RYAN<br/>DEVELOPER PORTFOLIO</small></button>
        <nav className="agent-navigation" aria-label={en ? 'Main navigation' : 'Navegação principal'}>{nav.map(([id,label]) => <button onClick={() => select(id)} key={id} aria-current={active === id ? 'page' : undefined}>{label}</button>)}</nav>
        <button className="agent-language" onClick={onLanguageChange}>{en ? 'PT' : 'EN'} <ArrowUpRight size={12}/></button>
      </header>
      <section className="agent-stage" id="dashboard">
        <div className="agent-outline" aria-hidden="true">PORTFOLIO</div>
        <div className="agent-hero-grid">
          <div className="agent-introduction">
            <h1 className="agent-heading">Gustavo<br/><span>Ryan.</span></h1>
            <p className="agent-role">{en ? 'Software engineering.' : 'Engenharia de software.'}<br/>{en ? 'Ideas into interfaces.' : 'Ideias em interfaces.'}</p>
            <p className="agent-description">{en ? 'I study Software Engineering at PUC Minas and build applications with Java, Spring Boot and React.' : 'Estudo Engenharia de Software na PUC Minas e construo aplicações com Java, Spring Boot e React.'}</p>
            <div className="agent-actions"><button className="agent-primary" onClick={() => select('projects')}>{en ? 'Explore my projects' : 'Conheça meus projetos'} <ArrowUpRight size={18}/></button><a className="agent-text-link" href="#astra" onClick={skipIntro}>{en ? 'Talk to Astra' : 'Converse com a Astra'} <ArrowRight size={16}/></a></div>
            <div className="agent-social"><a href={'https://github.com/'+perfil.github} target="_blank" rel="noreferrer"><Github size={15}/> GitHub</a><a href={perfil.linkedin} target="_blank" rel="noreferrer"><Linkedin size={15}/> LinkedIn</a></div>
          </div>
          <div className="agent-identity agent-glass">
            <div className="agent-window-title"><span><i/> PROFILE / GUSTAVO</span><ArrowUpRight size={12}/></div>
            <div className="agent-portrait"><img src="/perfil-foto.jpeg" alt={en ? 'Portrait of Gustavo Ryan' : 'Retrato de Gustavo Ryan'}/><div className="portrait-frame" aria-hidden="true"/><span className="portrait-signature" aria-hidden="true">GR.</span></div>
            <div className="agent-profile-meta"><span>PUC MINAS</span><span>BELO HORIZONTE, BR</span></div>
          </div>
          <aside className="agent-monitors" aria-label={en ? 'Live integrations' : 'Integrações ao vivo'}>
            <section className="agent-telemetry agent-glass">
              <header><span><Clock3 size={14}/> WAKATIME</span><button aria-label={en ? 'Refresh WakaTime' : 'Atualizar WakaTime'} disabled={live.refreshing.includes('wakatime')} onClick={() => live.refresh(['wakatime'],true,{serverForce:true})}><RefreshCw size={13}/></button></header>
              <p className="telemetry-value">{live.context.wakatime?.status === 'ok' ? week?.totalFormatted || '—' : '—'}</p>
              <div className="telemetry-sub"><span>{en ? 'Coding · last 7 days' : 'Código · últimos 7 dias'}</span><span>{status('wakatime')}</span></div>
              <div className="language-bars">{(week?.languages || []).slice(0,3).map(item => <div key={item.name}><span>{item.name}</span><span className="language-track"><i style={{width: Math.min(100,Math.max(0,Number(item.percent)||0))+'%'}}/></span><span>{item.percent == null || !Number.isFinite(Number(item.percent)) ? '—' : Math.round(Number(item.percent))+'%'}</span></div>)}</div>
              <details><summary>{en ? 'View full activity' : 'Ver atividade completa'} <ArrowUpRight size={12}/></summary><WakaTimeCard context={live.context} lang={lang}/></details>
            </section>
            <section className="agent-telemetry agent-glass">
              <header><span><Music2 size={14}/> SPOTIFY</span><button aria-label={en ? 'Refresh Spotify' : 'Atualizar Spotify'} disabled={live.refreshing.includes('spotify')} onClick={() => live.refresh(['spotify'],true,{serverForce:true})}><RefreshCw size={13}/></button></header>
              <div className="spotify-now">{track?.image ? <img src={track.image} alt=""/> : <div className="album-placeholder"><Music2 size={23}/></div>}<div><strong>{track?.name || (live.context.spotify?.status === 'ok' ? (en ? 'Between tracks.' : 'Entre uma faixa e outra.') : (en ? 'Waiting for Spotify' : 'Aguardando o Spotify'))}</strong><p>{track?.artists || (live.context.spotify?.status === 'ok' ? (en ? 'Nothing playing right now.' : 'Nenhuma música tocando agora.') : (en ? 'Try refreshing the connection.' : 'Tente atualizar a conexão.'))}</p></div></div>
              <div className="telemetry-sub"><span>{status('spotify')}</span><Music2 size={12}/></div>
              <details><summary>{en ? 'Explore listening history' : 'Explorar histórico musical'} <ArrowUpRight size={12}/></summary><SpotifyCard context={live.context} lang={lang}/></details>
            </section>
            <a href="#astra" onClick={skipIntro} className="agent-astra-invite agent-glass"><img src="/astra-avatar.png" alt=""/><div><strong>{en ? 'Meet Astra' : 'Conheça a Astra'}</strong><span>{en ? 'Your guide to my work.' : 'Sua guia pelo meu trabalho.'}</span></div><ArrowUpRight size={18}/></a>
          </aside>
        </div>
        <div className="agent-stage-footer"><span><i/>[ SYSTEM ACTIVE ]</span><div>JAVA <span>/</span> SPRING BOOT <span>/</span> REACT <span>/</span> PYTHON</div><span>{en ? 'SCROLL TO EXPLORE' : 'ROLE PARA EXPLORAR'} ↓</span></div>
      </section>
      <section className="agent-workstrip">
        <button className="agent-project-preview" onClick={() => select('projects')}><img src="/portfolio-interativo-ia.png" alt={en ? 'Interactive portfolio project' : 'Projeto de portfólio interativo'}/><div><span>{en ? 'SELECTED PROJECT' : 'PROJETO EM DESTAQUE'}</span><h2>{en ? 'A portfolio with its own voice.' : 'Um portfólio com voz própria.'}</h2><p>React · IA · Astra</p></div><ArrowUpRight size={24}/></button>
      </section>
      {active !== 'home' && <section ref={sectionRef} className="agent-detail agent-glass"><nav aria-label={en ? 'Explore more' : 'Explore mais'}>{[['about','Sobre','About'],['skills','Habilidades','Skills'],['experience','Experiência','Experience'],['education','Formação','Education'],['proficiency','Proficiência','Proficiency']].map(([id,pt,eng])=><button key={id} aria-current={active===id?'page':undefined} onClick={()=>select(id)}>{en?eng:pt}</button>)}</nav><PortfolioSection active={active} en={en}/></section>}
      <section id="astra" className="agent-chat">
        <div className="agent-chat-intro"><img src="/astra-avatar.png" alt="Astra"/><h2>{en ? 'Let’s talk.' : 'Vamos conversar.'}</h2><p>{en ? 'Ask about my projects, skills or journey. Astra will show you around.' : 'Pergunte sobre projetos, habilidades ou minha trajetória. A Astra te acompanha por aqui.'}</p><span><Radio size={13}/> ASTRA · AI ASSISTANT</span></div>
        <div className="agent-chat-terminal agent-glass"><div className="agent-window-title"><span><Terminal size={14}/> astra / conversation</span><ArrowUpRight size={12}/></div>{children}</div>
      </section>
      <footer className="agent-footer"><div className="footer-outline" aria-hidden="true">GUSTAVO RYAN</div><div className="agent-footer-links"><span>© {new Date().getFullYear()} GUSTAVO RYAN</span><a href={'mailto:'+perfil.email}>{en ? 'Get in touch' : 'Entre em contato'} <ArrowUpRight size={14}/></a><span>{en ? 'Built with curiosity.' : 'Construído com curiosidade.'}</span></div></footer>
    </div>
  </main>;
}
