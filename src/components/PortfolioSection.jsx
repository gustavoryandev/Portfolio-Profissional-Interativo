import LanguageIcon from './LanguageIcon';
import ContactSection from './ContactSection';
import { Download, GraduationCap } from 'lucide-react';
import perfil from '../data/perfil.json';
import ProjectsCard from './ProjectsCard';
import ExperienceCard from './ExperienceCard';
import { SocialLinks } from './ProfilePanel';
import { sections } from './Sidebar';
import SkillsGlobe from './SkillsGlobe';
export default function PortfolioSection({ active, en }) {
  const section = sections.find(([id]) => id === active);
  return <section className="portfolio-section" aria-labelledby="section-heading">
    <p className="section-eyebrow">{en ? 'GET TO KNOW MY JOURNEY' : 'CONHEÇA MINHA TRAJETÓRIA'}</p>
    <h2 id="section-heading">{section?.[en ? 3 : 2]}</h2>
    {active === 'about' && <div className="detail-card about-profile-card"><div className="about-profile-heading mb-5 flex w-full flex-col items-center gap-4 text-center"><div className="about-profile-portrait relative isolate h-24 w-24 shrink-0 overflow-hidden rounded-full border border-[var(--accent)] bg-[var(--panel-soft)] sm:h-28 sm:w-28"><img width="572" height="777" className="absolute max-w-none object-cover" src="/perfil-foto.jpeg" alt={en ? `Photo of ${perfil.nome}` : `Foto de ${perfil.nome}`} /></div><h3>{perfil.nome}</h3></div><p>{perfil.bio[en ? 'en' : 'pt']}</p><a className="cv-link" href={en ? '/Gustavo Ryan Resume (English).pdf' : '/Currículo Gustavo Ryan.pdf'} download><Download size={16} />{en ? 'Download résumé' : 'Baixar currículo'}</a></div>}
    {active === 'projects' && <ProjectsCard />}
    {active === 'experience' && <ExperienceCard />}
    {active === 'education' && <div className="detail-card"><GraduationCap size={32} /><h3>{perfil.instituicao}</h3><p>{en ? 'Software Engineering' : 'Engenharia de Software'}</p><h4>{en ? 'Current courses' : 'Disciplinas em andamento'}</h4><ul>{perfil.disciplinas.cursando.map(course => <li key={course}>{course}</li>)}</ul></div>}
    {active === 'skills' && <><SkillsGlobe skills={perfil.skills} en={en} /><div className="skills-grid">{perfil.skills.map(skill => <div className="detail-card" key={skill.nome}><div className="flex items-center gap-3"><LanguageIcon name={skill.nome} size={24} /><h3>{skill.nome}</h3></div><p>{en ? ({ 'Banco de dados': 'Database', Ferramentas: 'Tools', 'Formato de dados': 'Data format' }[skill.categoria] || skill.categoria) : skill.categoria}</p></div>)}</div></>}
    {active === 'contact' && <div className="space-y-5"><div className="detail-card"><h3>{en ? 'Let’s talk' : 'Vamos conversar'}</h3><p>{en ? 'Get in touch by email or through my social profiles.' : 'Entre em contato por e-mail ou pelas minhas redes profissionais.'}</p><a className="text-link break-all" href={'mailto:' + perfil.email}>{perfil.email}</a><SocialLinks /></div><ContactSection lang={en ? 'en' : 'pt'} variant="page" /></div>}
  </section>;
}
