import { Sparkles } from 'lucide-react';
import SpotifyCard from './SpotifyCard';
import GithubCard from './GithubCard';
import StatsCard from './StatsCard';
import CanvasCard from './CanvasCard';
import GaloCard from './GaloCard';
import ContactSection from './ContactSection';
import ProjectsCard from './ProjectsCard';
import ExperienceCard from './ExperienceCard';

const cards = {
  '[SPOTIFY_CARD]': SpotifyCard,
  '[GITHUB_CARD]': GithubCard,
  '[STATS_CARD]': StatsCard,
  '[CANVAS_CARD]': CanvasCard,
  '[GALO_CARD]': GaloCard,
  '[CONTACT_FORM]': ContactSection
  ,'[PROJECTS_CARD]': ProjectsCard
  ,'[EXPERIENCE_CARD]': ExperienceCard
};

export default function MessageBubble({ message }) {
  const isUser = message?.sender === 'user';
  const parts = (message?.text || '').split(/(\[(?:SPOTIFY|GITHUB|STATS|CANVAS|GALO|PROJECTS|EXPERIENCE)_CARD\]|\[CONTACT_FORM\])/g);

  // ... existing code ...
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-500/40 bg-zinc-900 text-amber-400"><Sparkles size={18} /></div>}
      <div className={`max-w-[min(90%,48rem)] rounded-3xl px-5 py-4 text-sm leading-7 shadow-xl ${message?.tone === 'error' ? 'rounded-bl-md border border-red-500/50 bg-zinc-900 text-red-400' : isUser ? 'rounded-br-md bg-zinc-800 text-zinc-200' : 'rounded-bl-md border border-zinc-800 bg-zinc-900/90 text-zinc-300'}`}>
        {parts.map((part, index) => {
          const Card = cards[part];
          // ADICIONADO: Passando a prop context para dentro do Card
          if (Card) return <div className="my-3" key={`${part}-${index}`}><Card context={message.context} /></div>;
          return part ? <span className="whitespace-pre-wrap" key={`${part}-${index}`}>{part}</span> : null;
        })}
      </div>
    </div>
  );
}
