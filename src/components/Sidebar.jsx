import { Home, User, Code2, BriefcaseBusiness, GraduationCap, Star, Mail, MessageCircle } from 'lucide-react';
export const sections = [
  ['home', Home, 'Home', 'Home'], ['about', User, 'Sobre Mim', 'About Me'],
  ['projects', Code2, 'Projetos', 'Projects'], ['experience', BriefcaseBusiness, 'Experiência', 'Experience'],
  ['education', GraduationCap, 'Educação', 'Education'], ['skills', Star, 'Habilidades', 'Skills'],
  ['contact', Mail, 'Contato', 'Contact'],
];
export default function Sidebar({ active, onSelect, en }) {
  return <nav className="sidebar" aria-label={en ? 'Main navigation' : 'Navegação principal'}>
    <div className="sidebar-brand"><img className="brand-logo" src="/logo-astra-ai.png" alt="GR" /><span>PORTFÓLIO</span></div>
    <div className="nav-items">{sections.map(([id, Icon, pt, english]) => <button key={id} onClick={() => onSelect(id)} aria-current={active === id ? 'page' : undefined} className={active === id ? 'nav-item active' : 'nav-item'}><Icon size={19} /><span>{en ? english : pt}</span></button>)}</div>
    <div className="sidebar-note"><MessageCircle size={19} /><p>{en ? 'Get to know my journey. Talk to Astra.' : 'Conheça minha trajetória. Converse com a Astra.'}</p></div>
  </nav>;
}
