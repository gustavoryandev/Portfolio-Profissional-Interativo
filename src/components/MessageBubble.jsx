import { Sparkles, User } from 'lucide-react';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import SpotifyCard from './SpotifyCard';
import GithubCard from './GithubCard';
import StatsCard from './StatsCard';
import CanvasCard from './CanvasCard';
import GaloCard from './GaloCard';
import ContactSection from './ContactSection';
import ProjectsCard from './ProjectsCard';
import ExperienceCard from './ExperienceCard';
import RepositoriesCard from './RepositoriesCards';
import GithubActivityCard from './GithubActivityCard';

const cards = {
  '[SPOTIFY_CARD]': SpotifyCard,
  '[GITHUB_CARD]': GithubCard,
  '[STATS_CARD]': StatsCard,
  '[CANVAS_CARD]': CanvasCard,
  '[GALO_CARD]': GaloCard, // Opcional aqui pois trataremos customizado no regex
  '[CONTACT_FORM]': ContactSection,
  '[PROJECTS_CARD]': ProjectsCard,
  '[EXPERIENCE_CARD]': ExperienceCard,
  '[REPOSITORIES_CARD]': RepositoriesCard,
  '[GITHUB_ACTIVITY_CARD]': GithubActivityCard
};

export default function MessageBubble({ message }) {
  const { darkMode } = useContext(ThemeContext);
  const isUser = message?.sender === 'user';
  
  // REGEX MELHORADO: Agora captura tags de galo com limite, ex: [GALO_CARD:5] ou [GALO_CARD:ALL]
  const parts = (message?.text || '').split(/(\[(?:SPOTIFY|GITHUB|STATS|CANVAS|PROJECTS|EXPERIENCE|REPOSITORIES|GITHUB_ACTIVITY)_CARD\]|\[GALO_CARD(?::\d+|:ALL)?\]|\[CONTACT_FORM\])/g);

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} gap-3 my-2`}>
      {!isUser && (
        <div className="w-10 h-10 rounded-full flex shrink-0 items-center justify-center mt-2 bg-transparent text-amber-500">
          <Sparkles className="w-5 h-5" />
        </div>
      )}

      <div className={`max-w-[80%] ${isUser ? 'ml-auto' : ''}`}>
        {isUser ? (
          <div className={`px-6 py-4 rounded-3xl rounded-tr-sm text-[15px] font-medium leading-relaxed border ${
            darkMode ? 'bg-[#1a1a1a] text-white border-amber-500/60' : 'bg-[#1a1a1a] text-white border-amber-500 shadow-md'
          }`}>
            {parts.map((part, index) => {
              if (!part) return null;
              const boldParts = part.split(/(\*\*.*?\*\*)/g);
              return (
                <span className="whitespace-pre-wrap" key={`${part}-${index}`}>
                  {boldParts.map((bPart, bIndex) => {
                    if (bPart.startsWith('**') && bPart.endsWith('**')) {
                      return <strong key={bIndex} className="text-amber-400 font-bold">{bPart.slice(2, -2)}</strong>;
                    }
                    return bPart;
                  })}
                </span>
              );
            })}
          </div>
        ) : (
          <div className={`px-7 py-6 rounded-[2rem] rounded-tl-sm w-full border ${
            darkMode ? 'bg-[#141414] border-[#2a2a2a] text-zinc-300' : 'bg-white border-gray-100 text-gray-700 shadow-lg shadow-gray-200/50'
          }`}>
            {parts.map((part, index) => {
              let Card = cards[part];
              let limitProp = undefined;
              
              // Verifica se é o card do Galo para extrair o limit
              if (part.startsWith('[GALO_CARD')) {
                Card = GaloCard;
                const match = part.match(/\[GALO_CARD:(ALL|\d+)\]/);
                if (match) {
                   limitProp = match[1] === 'ALL' ? null : parseInt(match[1]);
                } else {
                   limitProp = 3; // Padrão
                }
              }

              if (Card) {
                return (
                  <div className="my-4" key={`${part}-${index}`}>
                    <Card context={message.context} lang={message.lang || 'pt'} limit={limitProp} />
                  </div>
                );
              }

              if (part) {
                const boldParts = part.split(/(\*\*.*?\*\*)/g);
                return (
                  <span className="whitespace-pre-wrap" key={`${part}-${index}`}>
                    {boldParts.map((bPart, bIndex) => {
                      if (bPart.startsWith('**') && bPart.endsWith('**')) {
                        return <strong key={bIndex} className={darkMode ? 'text-zinc-100 font-bold' : 'text-zinc-900 font-bold'}>{bPart.slice(2, -2)}</strong>;
                      }
                      return bPart;
                    })}
                  </span>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-10 h-10 rounded-full flex shrink-0 items-center justify-center mt-2 bg-transparent text-amber-500">
          <User className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}