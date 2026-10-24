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

const cards = {
  '[SPOTIFY_CARD]': SpotifyCard,
  '[GITHUB_CARD]': GithubCard,
  '[STATS_CARD]': StatsCard,
  '[CANVAS_CARD]': CanvasCard,
  '[GALO_CARD]': GaloCard,
  '[CONTACT_FORM]': ContactSection,
  '[PROJECTS_CARD]': ProjectsCard,
  '[EXPERIENCE_CARD]': ExperienceCard,
  '[REPOSITORIES_CARD]': RepositoriesCard
};

export default function MessageBubble({ message }) {
  const { darkMode } = useContext(ThemeContext);
  const isUser = message?.sender === 'user';
  const parts = (message?.text || '').split(/(\[(?:SPOTIFY|GITHUB|STATS|CANVAS|GALO|PROJECTS|EXPERIENCE|REPOSITORIES)_CARD\]|\[CONTACT_FORM\])/g);

// ... existing code ...


  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} gap-3 my-2`}>
      {/* Avatar do assistente */}
      {!isUser && (
        <div className="w-10 h-10 rounded-full flex shrink-0 items-center justify-center mt-2 bg-transparent text-amber-500">
          <Sparkles className="w-5 h-5" />
        </div>
      )}

      <div className={`max-w-[80%] ${isUser ? 'ml-auto' : ''}`}>
        {isUser ? (
          // Balão da Mensagem do Usuário
          <div className={`px-6 py-4 rounded-3xl rounded-tr-sm text-[15px] font-medium leading-relaxed border ${
            darkMode 
              ? 'bg-[#1a1a1a] text-white border-amber-500/60' 
              : 'bg-[#1a1a1a] text-white border-amber-500 shadow-md'
          }`}>
            {parts.map((part, index) => {
              if (!part) return null;
              const boldParts = part.split(/(\*\*.*?\*\*)/g);
              return (
                <span className="whitespace-pre-wrap" key={`${part}-${index}`}>
                  {boldParts.map((bPart, bIndex) => {
                    if (bPart.startsWith('**') && bPart.endsWith('**')) {
                      return (
                        <strong key={bIndex} className="text-amber-400 font-bold">
                          {bPart.slice(2, -2)}
                        </strong>
                      );
                    }
                    return bPart;
                  })}
                </span>
              );
            })}
          </div>
        ) : (
          // Balão da Mensagem do Bot / Assistente
          <div className={`px-7 py-6 rounded-[2rem] rounded-tl-sm w-full border ${
            darkMode 
              ? 'bg-[#141414] border-[#2a2a2a] text-zinc-300' 
              : 'bg-white border-gray-100 text-gray-700 shadow-lg shadow-gray-200/50'
          }`}>
            {parts.map((part, index) => {
              const Card = cards[part];
              
              // Se for um card, renderiza o componente correspondente
              if (Card) {
                return (
                  <div className="my-4" key={`${part}-${index}`}>
                    <Card context={message.context} lang={message.lang || 'pt'} />
                  </div>
                );
              }

              // Se for texto normal, formata negritos (**texto**)
              if (part) {
                const boldParts = part.split(/(\*\*.*?\*\*)/g);
                return (
                  <span className="whitespace-pre-wrap" key={`${part}-${index}`}>
                    {boldParts.map((bPart, bIndex) => {
                      if (bPart.startsWith('**') && bPart.endsWith('**')) {
                        return (
                          <strong 
                            key={bIndex} 
                            className={darkMode ? 'text-zinc-100 font-bold' : 'text-zinc-900 font-bold'}
                          >
                            {bPart.slice(2, -2)}
                          </strong>
                        );
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

      {/* Avatar do usuário */}
      {isUser && (
        <div className="w-10 h-10 rounded-full flex shrink-0 items-center justify-center mt-2 bg-transparent text-amber-500">
          <User className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}