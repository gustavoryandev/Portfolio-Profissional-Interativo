import React, { useContext, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './src/index.css';
import './src/i18n';
import { ThemeProvider, ThemeContext } from './src/context/ThemeContext';
import Projects from './src/components/ProjectsCard';
import { useTranslation } from 'react-i18next';
import Experience from './src/components/ExperienceCard';
import Github from './src/components/GithubCard';
import Activity from './src/components/GithubActivityCard';
import Languages from './src/components/GithubLanguagesCard';
import Repos from './src/components/RepositoriesCards';
import Stats from './src/components/StatsCard';
import Waka from './src/components/WakaTimeCard';
import Canvas from './src/components/CanvasCard';
import Spotify from './src/components/SpotifyCard';
import Chess from './src/components/ChessCard';
import Galo from './src/components/GaloCard';
import Contact from './src/components/ContactSection';
import LanguageIcon from './src/components/LanguageIcon';

const names = ['Java', 'Python', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'C++', 'C#', 'Dockerfile', 'Shell', 'Desconhecida'];
const context = {
  github: {status:'ok',profile:{login:'fixture',joinedYear:2020},stats:{contributions:120,commits:50,prs:8,issues:3,stars:10,forks:2,followers:20,following:12,repos:3,currentStreak:4,longestStreak:10,bestDay:{count:20}},
    languages:{items:names.map((name,i)=>({name,value:1000-i*30,percent:Math.max(1,25-i*2),color:'#3b82f6'}))},
    repositories:[{id:1,name:'projeto-java',description:'Descrição de teste para validar layout e ícones.',language:'Java',languageColor:'#f89820',stars:5,forks:1},{id:2,name:'projeto-python',language:'Python',stars:2,forks:0}],
    activity:{weeks:[],years:[{year:2025,total:80},{year:2026,total:120}],contributionsByDayOfWeek:[1,5,3,6,2,4,0],commitsPerHour:Array.from({length:24},(_,i)=>i%5)}},
  wakatime:{status:'ok',summary:{totalFormatted:'12h 30m',dailyAverageFormatted:'2h 5m',activeDays:6,totalDays:7,topEditorName:'VS Code',topEditorPercent:95},languages:names.map((name,i)=>({name,percent:Math.max(1,25-i*2),formatted:'1h 20m'})),days:[{readable:'1h',totalSeconds:3600},{readable:'2h',totalSeconds:7200}]},
  canvas:{status:'ok',regular:true,courses:[{id:1,name:'Engenharia de Software',code:'ES101',url:'#'},{id:2,name:'Programação Modular',code:'PM102',url:'#'}]},
  spotify:{status:'ok',current:{name:'Faixa de teste',artists:'Artista de teste',url:'#',image:'/icons/react.svg'},recent:[{name:'Faixa recente',artists:'Artista',url:'#',image:'/icons/python.svg'}],topTracks:[{name:'Faixa favorita',artists:'Artista',url:'#',image:'/icons/java.svg'}],topArtists:[{name:'Artista favorito',url:'#',image:'/icons/git.svg'}]},
  chess:{status:'ok',profile:{username:'fixture',name:'Perfil de teste',country:'BR',followers:10},totals:{games:20,wins:12,draws:2,losses:6,winRate:60},ratings:[{mode:'rapid',rating:1500,best:1600,wins:12,draws:2,losses:6,winRate:60}],puzzles:{tactics:1700},recent:[]},
  galo:{status:'ok',games:[{id:1,league:'Brazilian Serie A',date:'2027-01-01T20:00:00Z',state:'pre',isHome:true,home:{name:'Atlético-MG',logo:'/icons/git.svg'},away:{name:'Visitante',logo:'/icons/react.svg'},venue:'Estádio de teste'}]},
};
const cards = {Projects,Experience,Github,Activity,Languages,Repos,Stats,Waka,Canvas,Spotify,Chess,Galo,Contact};
function App() {
  const {darkMode,toggleTheme}=useContext(ThemeContext);
  const [empty,setEmpty]=useState(false);
  const [width,setWidth]=useState(620);
  const { i18n } = useTranslation();
  return <main style={{background:'var(--page)',color:'var(--ink)',padding:12,minHeight:'100vh'}}>
    <button onClick={toggleTheme}>{darkMode?'Claro':'Escuro'}</button>{' '}
    <button onClick={()=>setEmpty(!empty)}>{empty?'Dados preenchidos':'Sem dados'}</button>
    <label>Largura dos cards <select value={width} onChange={event=>setWidth(Number(event.target.value))}><option value={320}>320 px</option><option value={620}>620 px</option><option value={960}>960 px</option></select></label>{' '}
    <button onClick={()=>i18n.changeLanguage(i18n.language.startsWith('en')?'pt':'en')}>Alternar idioma</button>
    <div id="icon-fallback"><LanguageIcon name="Java" /><LanguageIcon name="Desconhecida" /></div>
    <button onClick={()=>document.querySelector('#icon-fallback img')?.dispatchEvent(new Event('error'))}>Simular falha</button>
    {Object.entries(cards).map(([name,Component])=><section data-fixture={name} key={name} style={{maxWidth:width,width:'calc(100% - 48px)',margin:'24px auto'}}><h2>{name}</h2><Component context={empty?{}:context} /></section>)}
  </main>;
}
createRoot(document.getElementById('root')).render(<ThemeProvider><App /></ThemeProvider>);
