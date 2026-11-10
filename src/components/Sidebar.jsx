import { Home, User, Code2, BriefcaseBusiness, GraduationCap, Star, Mail, TrendingUp } from 'lucide-react';
import PortfolioLogo from './PortfolioLogo';
export const sections = [
  ['home', Home, 'Home', 'Home'], ['about', User, 'Sobre Mim', 'About Me'],
  ['projects', Code2, 'Projetos', 'Projects'], ['experience', BriefcaseBusiness, 'Experiência', 'Experience'],
  ['education', GraduationCap, 'Educação', 'Education'], ['skills', Star, 'Habilidades', 'Skills'],
  ['proficiency', TrendingUp, 'Proficiência', 'Proficiency'],
  ['contact', Mail, 'Contato', 'Contact'],
];
export default function Sidebar({ active, onSelect, onAsk, en }) {
  return <nav className="sidebar glass-panel" aria-label={en ? 'Main navigation' : 'Navegação principal'}>
    <div className="sidebar-brand"><PortfolioLogo label="GR" /><span>PORTFÓLIO</span></div>
    <div className="nav-items">{sections.map(([id, Icon, pt, english]) => <button type="button" key={id} onClick={() => onSelect(id)} aria-current={active === id ? 'page' : undefined} className={active === id ? 'nav-item active' : 'nav-item'}><Icon size={19} aria-hidden="true" /><span>{en ? english : pt}</span></button>)}</div>
    <button type="button" className="sidebar-note" onClick={onAsk || (() => onSelect('home'))}>
      <img src="/astra-avatar.png" alt="" className="avatar-astra h-9 w-9 rounded-full border object-cover" />
      <p>{en ? 'Get to know my journey. Talk to Astra.' : 'Conheça minha trajetória. Converse com a Astra.'}</p>
    </button>
  </nav>;
}
