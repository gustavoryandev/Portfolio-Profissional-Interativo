import { useContext } from 'react';
import SkillsGlobe from '../components/SkillsGlobe';
import { useAstra } from '../context/AstraContext';
import { ThemeContext } from '../context/ThemeContext';
import { ArrowDown, ArrowUpRight, MapPin, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import ProjectsScrollSection from '../components/ProjectsScrollSection';
import CodePlayground from '../components/CodePlayground';
import PortfolioSection from '../components/PortfolioSection';
import LanguageIcon from '../components/LanguageIcon';
import { SocialLinks } from '../components/ProfilePanel';
import ScrollReveal from '../components/ui/ScrollReveal';
import perfil from '../data/perfil.json';
import { GALO_LOGO, isGaloTheme } from '../data/themes.js';

export default function PortfolioPage({ activeSection, projectFocus }) {
  const { openAstra, openFull } = useAstra();
  const galo = isGaloTheme(useContext(ThemeContext)?.theme);
  const { i18n } = useTranslation();
  const en = i18n.language.startsWith('en');
  return <div className="portfolio-app scroll-portfolio">
    <a className="skip-link" href="#main-content">{en ? 'Skip to content' : 'Pular para o conteúdo'}</a>
    <Navbar portfolio activeSection={activeSection} />
    <MobileNav en={en} />
    <main id="main-content" tabIndex={-1} className="scroll-content">
      <section id="inicio" className="portfolio-hero" aria-labelledby="hero-title">
        {galo && <img className="hero-galo-watermark" src={GALO_LOGO} alt="" />}
        <ScrollReveal repeat>
          <p className="section-eyebrow">{en ? 'SOFTWARE ENGINEERING · PUC MINAS' : 'ENGENHARIA DE SOFTWARE · PUC MINAS'}</p>
          <h1 id="hero-title">Gustavo<br /><span className="neon-title">Ryan.</span></h1>
          <p className="hero-lead">{en ? 'Turning ideas into digital experiences.' : 'Transformando ideias em experiências digitais.'}</p>
          <p className="hero-description">{en ? 'Java, Spring Boot and React. Explore my projects, skills and the journey behind the code.' : 'Java, Spring Boot e React. Explore meus projetos, habilidades e a trajetória por trás do código.'}</p>
          <div className="hero-actions">
            {galo && <a className="neon-cta" href="/chat" onClick={openFull}><Sparkles size={18} aria-hidden="true" />{en ? 'Talk to Astra' : 'Conversar com Astra'}<ArrowUpRight size={18} aria-hidden="true" /></a>}
            <a className={galo ? 'scroll-secondary' : 'neon-cta'} href="#projetos">{en ? 'Explore projects' : 'Explorar projetos'}<ArrowDown size={17} aria-hidden="true" /></a>
          </div>
          <SocialLinks />
        </ScrollReveal>
        <ScrollReveal repeat delay={.12} className="hero-profile glass-panel">
          <div className="portrait-orbit" aria-hidden="true" />
          <img className="hero-photo" src="/perfil-foto.jpeg" alt={en ? 'Gustavo Ryan' : 'Foto de Gustavo Ryan'} width="572" height="777" fetchPriority="high" />
          <div className="hero-profile-caption">
            <span>{en ? 'DEVELOPER' : 'DESENVOLVEDOR'} <b>/</b> {en ? 'STUDENT' : 'ESTUDANTE'}</span>
            <strong>{galo && <MapPin size={16} aria-hidden="true" />}{perfil.localizacao}</strong>
          </div>
        </ScrollReveal>
      </section>
      <section id="sobre" className="scroll-section" aria-labelledby="about-title">
        <ScrollReveal repeat><p className="section-eyebrow">01 / {en ? 'THE JOURNEY' : 'A TRAJETÓRIA'}</p><h2 id="about-title">{en ? 'About me' : 'Sobre mim'}</h2><div className="glass-panel about-scroll"><p>{perfil.bio[en ? 'en' : 'pt']}</p></div></ScrollReveal>
      </section>
      <ProjectsScrollSection projectFocus={projectFocus} />
      <CodePlayground />
      <section id="habilidades" className="scroll-section" aria-labelledby="skills-title">
        <ScrollReveal repeat><p className="section-eyebrow">04 / {en ? 'TOOLKIT' : 'TECNOLOGIAS'}</p><h2 id="skills-title">{en ? 'What I build with.' : 'Com o que eu construo.'}</h2></ScrollReveal>
        <div className="portfolio-skill-visuals"><SkillsGlobe skills={perfil.skills} en={en} /></div><div className="scroll-skills">{perfil.skills.map((skill, index) => <ScrollReveal repeat key={skill.nome} delay={(index % 4) * .04}><div className="glass-panel scroll-skill"><LanguageIcon name={skill.nome} size={28} /><h3>{skill.nome}</h3></div></ScrollReveal>)}</div>
      </section>
      {['experience', 'education', 'contact'].map(section => <div key={section} id={section === 'contact' ? 'contato' : section} className="scroll-section"><ScrollReveal repeat><PortfolioSection active={section} en={en} /></ScrollReveal></div>)}
      <ScrollReveal repeat><section className="glass-panel astra-scroll-cta" aria-labelledby="astra-cta-title"><img src="/astra-avatar.png" alt="" width="64" height="64" /><div><h2 id="astra-cta-title">{en ? 'Curious about my work?' : 'Quer conhecer melhor meu trabalho?'}</h2><p>{en ? 'Astra can guide you through my projects and live integrations.' : 'A Astra te guia pelos projetos e pelas integrações ao vivo.'}</p></div><a href="/chat" onClick={openFull} className="neon-cta">{en ? 'Talk to Astra' : 'Conversar com Astra'}<ArrowUpRight size={18} aria-hidden="true" /></a></section></ScrollReveal>
    </main>
    <aside aria-label="Astra"><button type="button" className="astra-fab" onClick={openAstra} aria-haspopup="dialog"><img src="/astra-avatar.png" alt="" />{en ? 'Ask Astra' : 'Perguntar pra Astra'}</button></aside>
    <footer className="scroll-footer"><span>© {new Date().getFullYear()} Gustavo Ryan</span><a href="#inicio">{en ? 'Back to top ↑' : 'Voltar ao topo ↑'}</a></footer>
  </div>;
}
