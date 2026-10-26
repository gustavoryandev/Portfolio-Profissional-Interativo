// src/components/MessageBubble.jsx
import { memo, useContext, useMemo, useState } from 'react';
import { AlertTriangle, Check, Copy, Sparkles, User, Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';
import { isSynthesisSupported, speak, stopSpeaking, toSpeechText } from '../services/speech';
import { useActiveSpeechId } from '../hooks/useVoice';
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
  '[CHESS_CARD]': ChessCard,
};

// [GALO_CARD], [GALO_CARD:5] ou [GALO_CARD:ALL]; sem número mostra 3 jogos
const GALO_TAG = /^\[GALO_CARD(?::(\d+|ALL))?\]$/;
const GALO_PATTERN = '\\[GALO_CARD(?::(?:\\d+|ALL))?\\]';

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Grupo de captura: os pedaços ímpares do split são sempre tags.
const TAG_SPLIT = new RegExp(
  `(${[...Object.keys(cards).map(escapeRegExp), GALO_PATTERN].join('|')})`,
);

// Bloco de código cercado por ``` (com linguagem opcional)
const FENCE = /```([\w+-]*)[ \t]*\n([\s\S]*?)```/g;
// Código inline `assim`, negrito **assim**
const INLINE = /(`[^`\n]+`|\*\*[^\n]+?\*\*)/;
const BULLET = /^\s*[-*•]\s+/;

// Tokens do design system Alvinegro + Gold
const UI = {
  dark: {
    ai: 'border-transparent bg-[#1E1E1E] text-white shadow-lg shadow-black/40',
    user: 'border-transparent bg-[#2A2A2A] text-white',
    bold: 'font-bold text-white',
    bullet: 'bg-[#FFD700]',
    avatar: 'border-[#2A2A2A] bg-[#1E1E1E] text-[#FFD700]',
    userAvatar: 'border-[#2A2A2A] bg-[#2A2A2A] text-white',
    error: 'border-red-500/50 bg-[#1E1E1E] text-red-200',
    errorIcon: 'text-red-400',
    copy: 'text-zinc-400 hover:text-[#FFD700] focus-visible:ring-[#FFD700]/60',
    speak: 'border-white/10 text-zinc-300 hover:border-[#FFD700]/60 hover:text-[#FFD700]',
    focusRing: 'focus-visible:ring-[#FFD700]/60',
  },
  light: {
    ai: 'border-[#E5E7EB] bg-white text-[#121212] shadow-sm',
    user: 'border-transparent bg-[#0A0A0A] text-white',
    bold: 'font-bold text-[#121212]',
    bullet: 'bg-[#D4AF37]',
    avatar: 'border-[#E5E7EB] bg-white text-[#A16207]',
    userAvatar: 'border-transparent bg-[#0A0A0A] text-white',
    error: 'border-red-300 bg-red-50 text-red-900',
    errorIcon: 'text-red-600',
    copy: 'text-gray-500 hover:text-[#A16207] focus-visible:ring-[#D4AF37]/60',
    speak: 'border-[#E5E7EB] text-[#121212] hover:border-[#D4AF37] hover:text-[#A16207]',
    focusRing: 'focus-visible:ring-[#D4AF37]/60',
  },
};

const INLINE_CODE = 'rounded bg-[#0A0A0A] px-1.5 py-0.5 font-mono text-[0.85em] text-white';
const FONT_MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";

// Mesma lógica de antes: [TAG] vira card; resto é texto
function resolveCard(tag) {
  const galo = GALO_TAG.exec(tag);
  if (galo) {
    const limit = galo[1] === undefined ? 3 : galo[1] === 'ALL' ? null : Number(galo[1]);
    return { Component: GaloCard, limit };
  }
  const Component = cards[tag];
  return Component ? { Component, limit: undefined } : null;
}

// Texto e cards, em ordem. Quebras de linha encostadas num card são removidas.
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

// Separa blocos de código cercados do texto comum
function parseBlocks(text) {
  const blocks = [];
  let last = 0;
  for (const match of text.matchAll(FENCE)) {
    if (match.index > last) blocks.push({ type: 'text', value: text.slice(last, match.index) });
    blocks.push({ type: 'code', lang: match[1], value: match[2].replace(/\n$/, '') });
    last = match.index + match[0].length;
  }
  if (last < text.length) blocks.push({ type: 'text', value: text.slice(last) });

  return blocks
    .map((block) => (block.type === 'text' ? { ...block, value: block.value.replace(/^\n+|\n+$/g, '') } : block))
    .filter((block) => block.type === 'code' || block.value.trim());
}

// Negrito e código inline dentro de um trecho. Índices ímpares são sempre os trechos marcados.
function renderInline(text, boldClass) {
  return text.split(new RegExp(INLINE.source, 'g')).map((piece, index) => {
    if (!piece) return null;
    if (index % 2 === 0) return piece;
    if (piece.startsWith('`')) return <code key={index} className={INLINE_CODE}>{piece.slice(1, -1)}</code>;
    return <strong key={index} className={boldClass}>{piece.slice(2, -2)}</strong>;
  });
}

// Parágrafos e listas
function renderText(value, ui, keyPrefix) {
  return value.split(/\n{2,}/).map((para, p) => {
    const lines = para.split('\n').filter((line) => line.trim());
    if (!lines.length) return null;
    const key = `${keyPrefix}-${p}`;

    if (lines.every((line) => BULLET.test(line))) {
      return (
        <ul key={key} className="my-3 space-y-2">
          {lines.map((line, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-relaxed">
              <span aria-hidden="true" className={`mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full ${ui.bullet}`} />
              <span className="min-w-0 break-words">{renderInline(line.replace(BULLET, ''), ui.bold)}</span>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={key} className="my-3 whitespace-pre-wrap break-words text-[15px] leading-relaxed first:mt-0 last:mb-0">
        {renderInline(para, ui.bold)}
      </p>
    );
  });
}

// Bloco de código: fundo #0A0A0A, texto branco, monoespaçado, nos dois temas
function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard indisponível: o usuário ainda pode selecionar o texto
    }
  };

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400" style={{ fontFamily: FONT_MONO }}>
          {lang || 'code'}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? 'Copiado' : 'Copiar código'}
          className="flex items-center gap-1.5 rounded px-2 py-1 font-mono text-[11px] text-zinc-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700]/60"
          style={{ fontFamily: FONT_MONO }}
        >
          {copied ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
          {copied ? 'copiado' : 'copiar'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-white" style={{ fontFamily: FONT_MONO }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Avatar({ ui, isUser, children }) {
  return (
    <div
      aria-hidden="true"
      className={`mt-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${isUser ? ui.userAvatar : ui.avatar}`}
    >
      {children}
    </div>
  );
}

// Animação de "ondas" enquanto a mensagem é lida
function VoiceBars() {
  return (
    <span aria-hidden="true" className="voice-bars">
      <span />
      <span />
      <span />
    </span>
  );
}

// Botão ouvir/parar de uma resposta da IA
function SpeakButton({ id, text, lang, ui }) {
  const { t } = useTranslation();
  const activeId = useActiveSpeechId();
  const speaking = activeId === id;

  return (
    <div className="mt-4 flex items-center">
      <button
        type="button"
        onClick={() => (speaking ? stopSpeaking() : speak(id, text, lang))}
        aria-label={speaking ? t('voz.pararAudio') : t('voz.ouvirResposta')}
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 ${ui.speak} ${ui.focusRing}`}
      >
        {speaking ? <VolumeX size={14} aria-hidden="true" /> : <Volume2 size={14} aria-hidden="true" />}
        <span>{speaking ? t('voz.parar') : t('voz.ouvir')}</span>
        {speaking && <VoiceBars />}
      </button>
    </div>
  );
}

function MessageBubble({ message }) {
  const { darkMode } = useContext(ThemeContext);
  const ui = darkMode ? UI.dark : UI.light;
  const isUser = message?.sender === 'user';
  const isError = message?.tone === 'error';
  const text = message?.text || '';

  const segments = useMemo(() => (isUser ? [] : splitMessage(text)), [isUser, text]);

  if (isUser) {
    return (
      <div className="my-2 flex w-full justify-end gap-3">
        <div className="ml-auto max-w-[80%]">
          <div className={`rounded-3xl rounded-tr-sm border px-6 py-4 text-[15px] font-medium leading-relaxed ${ui.user}`}>
            <p className="whitespace-pre-wrap break-words">{renderInline(text, 'font-bold')}</p>
          </div>
        </div>
        <Avatar ui={ui} isUser>
          <User className="h-[18px] w-[18px]" />
        </Avatar>
      </div>
    );
  }

  // Só respostas válidas, com texto falável, ganham o botão de áudio
  const canSpeak = isSynthesisSupported && !isError && Boolean(message?.id) && toSpeechText(text).length > 0;

  return (
    <div className="my-2 flex w-full justify-start gap-3">
      <Avatar ui={ui}>
        {isError
          ? <AlertTriangle className={`h-[18px] w-[18px] ${ui.errorIcon}`} />
          : <Sparkles className="h-[18px] w-[18px]" />}
      </Avatar>

      <div className="max-w-[80%]">
        <div
          role={isError ? 'alert' : undefined}
          className={`w-full rounded-[1.5rem] rounded-tl-sm border px-6 py-5 ${isError ? ui.error : ui.ai}`}
        >
          {segments.map((segment, index) => {
            if (segment.type === 'text') {
              return parseBlocks(segment.value).map((block, bi) =>
                block.type === 'code'
                  ? <CodeBlock key={`${index}-${bi}`} lang={block.lang} code={block.value} />
                  : <div key={`${index}-${bi}`}>{renderText(block.value, ui, `${index}-${bi}`)}</div>,
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

          {canSpeak && (
            <SpeakButton id={message.id} text={text} lang={message.lang || 'pt'} ui={ui} />
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(MessageBubble);