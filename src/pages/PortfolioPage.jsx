import PersonalInterests from '../components/PersonalInterests';
import { useContext, useLayoutEffect, useRef, useState } from 'react';
import SkillsGlobe from '../components/SkillsGlobe';
import { useAstra } from '../context/AstraContext';
import { ThemeContext } from '../context/ThemeContext';
import { ArrowDown, ArrowUpRight, MapPin, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Navbar, { portfolioLinks } from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import ProjectsScrollSection from '../components/ProjectsScrollSection';
import CodePlayground from '../components/CodePlayground';
import PortfolioSection from '../components/PortfolioSection';
import LanguageIcon from '../components/LanguageIcon';
import { SocialLinks } from '../components/ProfilePanel';
import ScrollReveal from '../components/ui/ScrollReveal';
import GaloCrest from '../components/GaloCrest';
import AstraAvatar from '../components/AstraAvatar';
import { useAssistantPersona } from '../context/AssistantAppearanceContext';
import PortraitPortal from '../components/rick/PortraitPortal';
import DimensionalScene, { MansionBackdrop } from '../components/DimensionalScene';
import { PortfolioShip } from '../components/rick/DimensionShip';
import useCharacterActivity from '../components/rick/useCharacterActivity';
import { CitadelCredential, InterdimensionalTV, RickExtraArchive, RickObjects } from '../components/rick/RickPortfolioExtras';
import DimensionAstraSignal from '../components/DimensionAstraSignal';
import { CitadelWindows, GarageWorkbench, CitadelReception } from '../components/RickDimensionExperience';
import perfil from '../data/perfil.json';
import { isGaloTheme, isDimensionalTheme } from '../data/themes.js';
import { BEYOND_CURVE } from '../data/rickDimensions.js';

export default function PortfolioPage({ activeSection, projectFocus, onSectionLink }) {
  const { openAstra, openFull } = useAstra();
  const { theme, dimension, shipDeparted, markShipDeparted, introScene, crossing, effectsPaused } = useContext(ThemeContext) ?? {};
  const galo = isGaloTheme(theme);
  const persona = useAssistantPersona();
  const fullPersona = useAssistantPersona('full');
  const dimensional = isDimensionalTheme(theme);
  const secret = dimension === 'corrupted';
  const beyond = dimensional && dimension === BEYOND_CURVE;
  const { t, i18n } = useTranslation();
  const en = i18n.language.startsWith('en');
  const pageRef = useRef(null);
  const heroRef = useRef(null);
  const heroActive = useCharacterActivity(heroRef, dimensional);
  const headerRef = useRef(null);
  const [visibleSection, setVisibleSection] = useState(() => (
    portfolioLinks.some(([id]) => id === activeSection) ? activeSection : 'inicio'
  ));

  useLayoutEffect(() => {
    const page = pageRef.current;
    const header = headerRef.current;
    const sections = portfolioLinks.map(([id]) => page.querySelector(`#${id}`));
    let frame = null;

    function updateSection() {
      frame = null;
      if (!header.offsetHeight) return;

      const viewportHeight = window.innerHeight;
      // Match the anchor clearance and allow for fractional scroll positions.
      const readingLine = Math.min(viewportHeight, header.getBoundingClientRect().bottom + 17);
      const atBottom = window.scrollY > 0 && window.scrollY + viewportHeight >= document.documentElement.scrollHeight - 1;
      const section = atBottom ? sections.at(-1) : sections.findLast(node => node.getBoundingClientRect().top <= readingLine);
      setVisibleSection(section?.id ?? 'inicio');
    }

    function scheduleUpdate() {
      if (frame === null) frame = requestAnimationFrame(updateSection);
    }

    function measure() {
      page.style.setProperty('--portfolio-header-height', `${header.offsetHeight}px`);
      scheduleUpdate();
    }

    measure();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', measure);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(header, { box: 'border-box' });
    observer?.observe(page);
    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', measure);
      observer?.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  const portrait = <img className="hero-photo" src="/perfil-foto.jpeg" alt={en ? 'Gustavo Ryan' : 'Foto de Gustavo Ryan'} width="572" height="777" fetchPriority="high" />;
  return <div ref={pageRef} className="portfolio-app scroll-portfolio">
    {dimensional && (beyond ? <MansionBackdrop /> : <DimensionalScene secret={secret} />)}
    <a className="skip-link" href="#main-content">{en ? 'Skip to content' : 'Pular para o conteúdo'}</a>
    <Navbar ref={headerRef} portfolio activeSection={visibleSection} onSectionLink={onSectionLink} />
    <MobileNav en={en} active={visibleSection} onSectionLink={onSectionLink} />
    <main id="main-content" tabIndex={-1} className="scroll-content">
      <section ref={heroRef} id="inicio" className="portfolio-hero" aria-labelledby="hero-title">
        {galo && <GaloCrest className="hero-galo-watermark" />}
        <ScrollReveal className={dimensional ? 'rick-presentation' : ''}>
          {dimensional && <div className="dimension-label">{beyond
            ? <b className="beyond-location">{t('rick.beyond.name')}</b>
            : <><span>{t(secret ? 'rick.citadelCode' : 'rick.garageCode')}</span><b>{t(secret ? 'rick.citadelName' : 'rick.garageName')}</b></>}</div>}
          <p className="section-eyebrow">{en ? 'SOFTWARE ENGINEERING · PUC MINAS' : 'ENGENHARIA DE SOFTWARE · PUC MINAS'}</p>
          <h1 id="hero-title">Gustavo<br /><span className="neon-title">Ryan.</span></h1>
          <p className="hero-lead">{dimensional && !beyond ? t(secret ? 'rick.citadelLead' : 'rick.garageLead') : (en ? 'Turning ideas into digital experiences.' : 'Transformando ideias em experiências digitais.')}</p>
          <p className="hero-description">{en ? 'Java, Spring Boot and React. Explore my projects, skills and the journey behind the code.' : 'Java, Spring Boot e React. Explore meus projetos, habilidades e a trajetória por trás do código.'}</p>
          <div className="hero-actions">
            {galo && <a className="neon-cta" href="/chat" onClick={openFull}><Sparkles size={18} aria-hidden="true" />{fullPersona ? (en ? `Talk to ${fullPersona.name}` : `Conversar com ${fullPersona.name}`) : (en ? 'Talk to Astra' : 'Conversar com Astra')}<ArrowUpRight size={18} aria-hidden="true" /></a>}
            <a className={galo ? 'scroll-secondary' : 'neon-cta'} href="#projetos" onClick={onSectionLink}>{en ? 'Explore projects' : 'Explorar projetos'}<ArrowDown size={17} aria-hidden="true" /></a>
          </div>
          <SocialLinks />
          {dimensional && <div className="dimension-instrument-panel">
            {!beyond && <div className="dimension-console-heading">
              <div className="dimension-readout"><span>{t('rick.control')}</span><strong>{t(secret ? 'rick.access' : 'rick.stabilized')}</strong></div>
              <div className="dimension-instruments" aria-hidden="true"><i /><span>⏚</span><b>137.0 Hz</b><em /></div>
            </div>}
            <DimensionAstraSignal />
            <GarageWorkbench onSectionLink={onSectionLink} />
          </div>}
        </ScrollReveal>
        {dimensional && !beyond && <div className="rick-ship-stage" aria-hidden="true">
          {secret && <CitadelWindows dock />}
          {!crossing && !introScene && (secret || !shipDeparted) && <PortfolioShip docked={secret} onDepart={markShipDeparted} visible={heroActive} />}
        </div>}
        <ScrollReveal delay={.08} className="hero-profile glass-panel">
          {dimensional && !beyond && <div className="dimension-scan-label">{t(secret ? 'rick.citizen' : 'rick.researcher')}<span>{t(secret ? 'rick.dockOnline' : 'rick.stable')}</span></div>}
          <div className="portrait-orbit" aria-hidden="true" />
          {dimensional ? <PortraitPortal variant={beyond ? BEYOND_CURVE : secret ? 'citadel' : 'garage'} effectsPaused={effectsPaused || beyond}>{portrait}</PortraitPortal> : portrait}
          <div className="hero-profile-caption">
            <span>{en ? 'DEVELOPER' : 'DESENVOLVEDOR'} <b>/</b> {en ? 'STUDENT' : 'ESTUDANTE'}</span>
            <strong>{galo && <MapPin size={16} aria-hidden="true" />}{perfil.localizacao}</strong>
          </div>
          {dimensional && secret && <CitadelCredential />}
        </ScrollReveal>
      </section>
      {dimensional && <RickObjects onSectionLink={onSectionLink} />}
      <section id="sobre" className="scroll-section" aria-labelledby="about-title">
        <ScrollReveal>
          <p className="section-eyebrow">01 / {en ? 'THE JOURNEY' : 'A TRAJETÓRIA'}</p>
          <h2 id="about-title">{en ? 'About me' : 'Sobre mim'}</h2>
          <div className="glass-panel about-scroll">
            <dl className="about-summary">
              <div>
                <dt>{en ? 'Education' : 'Formação'}</dt>
                <dd>{en ? 'Software Engineering' : 'Engenharia de Software'}<span>PUC Minas</span></dd>
              </div>
              <div>
                <dt>{en ? 'Focus' : 'Foco'}</dt>
                <dd>Back-end<span>Java · Spring Boot</span></dd>
              </div>
              <div>
                <dt>{en ? 'Goal' : 'Objetivo'}</dt>
                <dd>{en ? 'First opportunity in software development' : 'Primeira oportunidade na área'}</dd>
              </div>
            </dl>
            <div className="about-bio">
              {perfil.bio[en ? 'en' : 'pt'].split('\n\n').map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </div>
          <PersonalInterests />
        </ScrollReveal>
      </section>
      <ProjectsScrollSection projectFocus={projectFocus} />
      {dimensional && <InterdimensionalTV onSectionLink={onSectionLink} />}
      <CodePlayground />
      <section id="habilidades" className="scroll-section" aria-labelledby="skills-title">
        <ScrollReveal><p className="section-eyebrow">04 / {en ? 'TOOLKIT' : 'TECNOLOGIAS'}</p><h2 id="skills-title">{en ? 'What I build with.' : 'Com o que eu construo.'}</h2></ScrollReveal>
        <div className="portfolio-skill-visuals"><SkillsGlobe skills={perfil.skills} en={en} /></div><div className="scroll-skills">{perfil.skills.map((skill, index) => <ScrollReveal key={skill.nome} delay={(index % 4) * .025}><div className="glass-panel scroll-skill"><LanguageIcon name={skill.nome} size={28} /><h3>{skill.nome}</h3></div></ScrollReveal>)}</div>
      </section>
      {['experience', 'education', 'contact'].map(section => <div key={section} id={section === 'contact' ? 'contato' : section} className="scroll-section"><ScrollReveal>{section === 'contact' && <CitadelReception />}<PortfolioSection active={section} en={en} dimensional={dimensional} /></ScrollReveal></div>)}
      <ScrollReveal><section className="glass-panel astra-scroll-cta" aria-labelledby="astra-cta-title"><AstraAvatar surface="full" width="64" height="64" /><div><h2 id="astra-cta-title">{en ? 'Curious about my work?' : 'Quer conhecer melhor meu trabalho?'}</h2><p>{t('rick.assistant.guide', { name: fullPersona?.name ?? 'Astra' })}</p></div><a href="/chat" onClick={openFull} className="neon-cta">{fullPersona ? (en ? `Talk to ${fullPersona.name}` : `Conversar com ${fullPersona.name}`) : (en ? 'Talk to Astra' : 'Conversar com Astra')}<ArrowUpRight size={18} aria-hidden="true" /></a></section></ScrollReveal>
    </main>
    <aside className="astra-fab-shortcut" aria-label={persona?.name ?? 'Astra'}><button type="button" className="astra-fab" onClick={openAstra} aria-haspopup="dialog"><AstraAvatar />{persona ? (en ? `Ask ${persona.name}` : `Perguntar ao ${persona.name}`) : (en ? 'Ask Astra' : 'Perguntar pra Astra')}</button></aside>
    <footer className="scroll-footer"><span>© {new Date().getFullYear()} Gustavo Ryan</span><a href="#inicio">{en ? 'Back to top ↑' : 'Voltar ao topo ↑'}</a>{dimensional && <RickExtraArchive />}</footer>
  </div>;
}
