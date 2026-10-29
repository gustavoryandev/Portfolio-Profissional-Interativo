import LanguageIcon from './LanguageIcon';
import { Github, Linkedin, Mail, Star, Layers, Code2, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import perfil from '../data/perfil.json';
export function SocialLinks() {
  return <div className="social-links">{[[Github, 'https://github.com/' + perfil.github, 'GitHub'], [Linkedin, perfil.linkedin, 'LinkedIn'], [Mail, 'mailto:' + perfil.email, 'Email']].map(([Icon, href, label]) => <a className="icon-button" key={label} href={href} aria-label={label} target={label === 'Email' ? undefined : '_blank'} rel="noreferrer"><Icon size={19} /></a>)}</div>;
}
export default function ProfilePanel({ en, onSelect }) {
  const { t } = useTranslation();
  return <aside className="profile-panel" aria-label={en ? 'Profile overview' : 'Resumo do perfil'}>
    <section className="profile-card reference-card">
      <div className="profile-heading"><img className="profile-avatar profile-photo" src="/perfil-foto.jpeg" alt={en ? `Photo of ${perfil.nome}` : `Foto de ${perfil.nome}`} /><div><h2>{perfil.nome}</h2><p>{en ? 'Software Engineering · Full Stack' : 'Engenharia de Software · Full Stack'}</p></div></div>
      <p className="profile-intro">{en ? 'Turning ideas into digital experiences with code, technology and artificial intelligence.' : 'Transformando ideias em experiências digitais através de código, tecnologia e inteligência artificial.'}</p><SocialLinks />
    </section>
    <section className="profile-card reference-card"><h3><Star size={18} />{en ? 'Core Skills' : 'Principais Habilidades'}</h3><div className="tech-tags">{perfil.skills.map(skill => <span key={skill.nome}>{skill.nome}</span>)}</div></section>
    <section className="profile-card reference-card"><h3><Layers size={18} />{en ? 'Technologies & Tools' : 'Tecnologias e Ferramentas'}</h3><div className="tool-grid">{['Java', 'Spring Boot', 'React', 'Python', 'Tailwind', 'Git'].map(name => <div key={name}><span><LanguageIcon name={name} size={22} /></span><small>{name}</small></div>)}</div></section>
    <section className="profile-card reference-card"><h3><Code2 size={18} />{en ? 'Featured Project' : 'Projeto em Destaque'}</h3><h4>{t(perfil.projetos[0].chavesI18n.titulo)}</h4><p className="profile-intro">{t(perfil.projetos[0].chavesI18n.descricao)}</p><button className="text-link" onClick={() => onSelect('projects')}>{en ? 'View projects' : 'Ver projetos'}<ArrowUpRight size={15} /></button></section>
    <p className="profile-footer">{perfil.localizacao}</p>
  </aside>;
}
