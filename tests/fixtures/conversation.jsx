import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import App from '/src/App';
import { ThemeProvider } from '/src/context/ThemeContext';
import '/src/index.css';
import '/src/i18n';
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
context.spotify.recent = Array.from({length:5},(_,i)=>({name:'Faixa recente com título completo para validar a quebra de linha '+(i+1),artists:'Artista convidado, participação especial',url:'#',image:'/icons/react.svg'}));
context.spotify.topTracks = Array.from({length:5},(_,i)=>({name:'Música favorita '+(i+1),artists:'Artista de teste',url:'#',image:'/icons/python.svg'}));
context.spotify.topArtists = Array.from({length:5},(_,i)=>({name:'Artista favorito '+(i+1),url:'#',image:'/icons/git.svg'}));
let chatRequests=0, refreshRequests=0, lastRequest={};
const report=()=>window.dispatchEvent(new CustomEvent('validation-request',{detail:{chatRequests,refreshRequests,lastContext:lastRequest.chatContext,historyLength:lastRequest.chatHistory?.length,language:lastRequest.lang}}));
axios.defaults.adapter=async config=>{
  const body=JSON.parse(config.data);
  if(body.action==='refreshContext'){
    refreshRequests++; report();
    await new Promise(resolve=>setTimeout(resolve,400));
    const liveContext=Object.fromEntries(body.sources.map(name=>[name, refreshRequests===1 && ['github','wakatime'].includes(name)?{status:'error',reason:'timeout'}:context[name]]));
    return {data:{liveContext},status:200,statusText:'OK',headers:{},config};
  }
  chatRequests++; lastRequest=body; report();
  await new Promise(resolve=>setTimeout(resolve,3000));
  const text=chatRequests===1?'Resposta preservada em português. [SPOTIFY_CARD] [GALO_CARD] [STATS_CARD] [GITHUB_CARD] [GITHUB_LANGUAGES_CARD]':'Seguimento confirmado.';
  return {data:{response:text,model:'fixture-model',chatContext:{summary:'Resumo preservado',covered:0,anchor:'fixture'},liveContext:{...context,github:{status:'unknown'},wakatime:{status:'unknown'}}},status:200,statusText:'OK',headers:{},config};
};
function Validation() {
 const [report,setReport]=useState({chatRequests:0,refreshRequests:0});
 useEffect(()=>{const listener=e=>setReport(e.detail); window.addEventListener('validation-request',listener);return()=>window.removeEventListener('validation-request',listener);},[]);
 return <><App/><output id="validation-report" style={{position:'fixed',right:0,top:0,zIndex:100,fontSize:10,background:'#fff',color:'#111'}}>{JSON.stringify(report)}</output></>;
}
const root = createRoot(document.getElementById('root'));
root.render(<ThemeProvider><Validation/></ThemeProvider>);
if (import.meta.hot) import.meta.hot.dispose(() => root.unmount());
