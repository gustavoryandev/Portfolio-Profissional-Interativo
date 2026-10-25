import { Sparkles, User } from 'lucide-react';
import { useContext, useMemo } from 'react';
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
import GithubLanguagesCard from './GithubLanguagesCard';
import ChessCard from './ChessCard';

// Tags fixas que viram cards. Esta é a única lista: a regex abaixo é derivada dela.
const cards = {
  '[SPOTIFY_CARD]': SpotifyCard,
  '[GITHUB_CARD]': GithubCard,
  '[STATS_CARD]': StatsCard,
  '[CANVAS_CARD]': CanvasCard,
  '[CONTACT_FORM]': ContactSection,
  '[PROJECTS_CARD]': ProjectsCard,
  '[EXPERIENCE_CARD]': ExperienceCard,
  '[REPOSITORIES_CARD]': RepositoriesCard,
  '[GITHUB_ACTIVITY_CARD]': GithubActivityCard,
  '[GITHUB_LANGUAGES_CARD]': GithubLanguagesCard,
  '[CHESS_CARD]': ChessCard
};

// [GALO_CARD], [GALO_CARD:5] ou [GALO_CARD:ALL]; sem número mostra 3 jogos
const GALO_TAG = /^\[GALO_CARD(?::(\d+|ALL))?\]$/;
const GALO_PATTERN = '\\[GALO_CARD(?::(?:\\d+|ALL))?\\]';

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Grupo de captura: os pedaços ímpares do split são sempre tags.
const TAG_SPLIT = new RegExp(
  `(${[...Object.keys(cards).map(escapeRegExp), GALO_PATTERN].join('|')})`
);

function resolveCard(tag) {
  const galo = GALO_TAG.exec(tag);
  if (galo) {
    const limit = galo[1] === undefined ? 3 : galo[1] === 'ALL' ? null : Number(galo[1]);
    return { Component: GaloCard, limit };
  }
  const Component = cards[tag];
  return Component ? { Component, limit: undefined } : null;
}

// Negrito com **texto**, dentro de um trecho de texto
function renderInline(text, boldClass) {
  return text.split(/(\*\*.*?\*\*)/g).map((piece, index) =>
    piece.length >= 4 && piece.startsWith('**') && piece.endsWith('**')
      ? <strong key={index} className={boldClass}>{piece.slice(2, -2)}</strong>
      : piece
  );
}

// Texto e cards, em ordem. Quebras de linha encostadas num card são removidas
// para não criar espaço em branco extra acima ou abaixo dele.
function splitMessage(text) {
  const pieces = text.split(TAG_SPLIT);
  return pieces
    .map((value, index) => {
      if (index % 2 === 1) return { type: 'card', tag: value };
      let clean = value;
      if (index > 0) clean = clean.replace(/^\n+/, '');
      if (index < pieces.length - 1) clean = clean.replace(/\n+$/, '');
      return { type: 'text', value: clean };
    })
    .filter((segment) => segment.type === 'card' || segment.value);
}

export default function MessageBubble({ message }) {
  const { darkMode } = useContext(ThemeContext);
  const isUser = message?.sender === 'user';
  const text = message?.text || '';

  const segments = useMemo(() => (isUser ? [] : splitMessage(text)), [isUser, text]);

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
            <span className="whitespace-pre-wrap">
              {renderInline(text, 'text-amber-400 font-bold')}
            </span>
          </div>
        ) : (
          <div className={`px-7 py-6 rounded-[2rem] rounded-tl-sm w-full border ${
            darkMode ? 'bg-[#141414] border-[#2a2a2a] text-zinc-300' : 'bg-white border-gray-100 text-gray-700 shadow-lg shadow-gray-200/50'
          }`}>
            {segments.map((segment, index) => {
              if (segment.type === 'text') {
                return (
                  <span className="whitespace-pre-wrap" key={index}>
                    {renderInline(
                      segment.value,
                      darkMode ? 'text-zinc-100 font-bold' : 'text-zinc-900 font-bold'
                    )}
                  </span>
                );
              }

              const card = resolveCard(segment.tag);
              if (!card) return <span key={index}>{segment.tag}</span>;

              const { Component, limit } = card;
              return (
                <div className="my-4" key={index}>
                  <Component context={message.context} lang={message.lang || 'pt'} limit={limit} />
                </div>
              );
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
