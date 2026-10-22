import React from 'react';
import SpotifyCard from './SpotifyCard';
import GithubCard from './GithubCard';
import StatsCard from './StatsCard';
import CanvasCard from './CanvasCard';
import GaloCard from './GaloCard';
import ContactSection from './ContactSection';

export default function MessageBubble({ message }) {
  // Trata valores nulos/indefinidos para impedir a falha do .split()
  const contentText = message?.text || '';
  const isUser = message?.sender === 'user';

  // Renderiza o componente referente a cada marcador
  const renderCard = (tag) => {
    switch (tag) {
      case '[SPOTIFY_CARD]':
        return <SpotifyCard key={tag} />;
      case '[GITHUB_CARD]':
        return <GithubCard key={tag} />;
      case '[STATS_CARD]':
        return <StatsCard key={tag} />;
      case '[CANVAS_CARD]':
        return <CanvasCard key={tag} />;
      case '[GALO_CARD]':
        return <GaloCard key={tag} />;
      case '[CONTACT_FORM]':
        return <ContactSection key={tag} />;
      default:
        return null;
    }
  };

  // Divide o texto mantendo as tags no array
  const parts = contentText.split(/(\[[A-Z_]+\])/g);

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} my-2`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 rounded-bl-none'
        }`}
      >
        {parts.map((part, index) => {
          if (part.startsWith('[') && part.endsWith(']')) {
            const card = renderCard(part);
            if (card) {
              return <div key={index} className="my-3">{card}</div>;
            }
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
    </div>
  );
}