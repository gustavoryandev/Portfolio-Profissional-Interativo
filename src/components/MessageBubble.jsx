// src/components/MessageBubble.jsx
import { lazy, memo, Suspense, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, Copy, Sparkles, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SpotifyCard from './SpotifyCard';
import GithubCard from './GithubCard';
import StatsCard from './StatsCard';
import WakaTimeCard from './WakaTimeCard';
import CanvasCard from './CanvasCard';
import GaloCard from './GaloCard';
import ContactSection from './ContactSection';
import ProjectsCard from './ProjectsCard';
import SkillsProficiencyCard from './SkillsProficiencyCard';
import ExperienceCard from './ExperienceCard';
import RepositoriesCard from './RepositoriesCards';
import GithubActivityCard from './GithubActivityCard';
import GithubLanguagesCard from './GithubLanguagesCard';
import ChessCard, { ChessGame } from './ChessCard';
import LiveDataNotice from './LiveDataNotice';
import { CARD_SOURCES, mergeLiveContext } from '../services/liveContext';

import { translateMessage } from '../services/api';
import FullAstraCardLink from './FullAstraCardLink';

const ResumeCard = lazy(() => import('./ResumeCard'));

// Tags fixas que viram cards. Esta é a única lista: a regex abaixo é derivada dela.
const cards = {
  '[RESUME_CARD]': ResumeCard,
  '[SPOTIFY_CARD]': SpotifyCard,
  '[GITHUB_CARD]': GithubCard,
  '[WAKATIME_CARD]': WakaTimeCard,
  '[STATS_CARD]': StatsCard,
  '[CANVAS_CARD]': CanvasCard,
  '[CONTACT_FORM]': ContactSection,
  '[PROJECTS_CARD]': ProjectsCard,
  '[SKILLS_CARD]': SkillsProficiencyCard,
  '[EXPERIENCE_CARD]': ExperienceCard,
  '[REPOSITORIES_CARD]': RepositoriesCard,
  '[GITHUB_ACTIVITY_CARD]': GithubActivityCard,
  '[GITHUB_LANGUAGES_CARD]': GithubLanguagesCard,
  '[CHESS_CARD]': ChessCard,
  '[CHESS_GAME]': ChessGame,
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
const INLINE = /(`[^`\n]+`|\*\*[^\n]+?\*\*|\[[^\]\n]+\]\(https?:\/\/[^\s)]+\))/;
const BULLET = /^\s*[-*•]\s+/;

// Tokens do design system Alvinegro + Azul.
// Temas via variantes `dark:` (a classe `dark` é aplicada em <html> pelo ThemeProvider):
// o bubble não assina o contexto e o memo evita re-render na troca de tema.
const UI = {
  bold: 'font-bold text-ink',
  bullet: 'bg-accent',
  userAvatar: 'border-line bg-panel-soft text-ink',
  errorIcon: 'text-red-600 dark:text-red-400',
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
    const link = /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/.exec(piece);
    if (link) return <a key={index} href={link[2]} target="_blank" rel="noreferrer" className="underline text-[var(--accent)]">{link[1]}</a>;
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
        <span className="font-mono text-xs uppercase tracking-wider text-zinc-400" style={{ fontFamily: FONT_MONO }}>
          {lang || 'code'}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? 'Copiado' : 'Copiar código'}
          className="flex items-center gap-1.5 rounded px-2 py-1 font-mono text-xs text-zinc-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
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

function Avatar({ isUser, children }) {
  return (
    <div
      aria-hidden="true"
      className={`mt-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${isUser ? UI.userAvatar : 'avatar-astra'}`}
    >
      {children}
    </div>
  );
}

function MessageBubble({ message, liveContext = {}, refreshing = [], onRefresh, onSelectSection, onViewFull, compact = false }) {
  const { i18n } = useTranslation();
  const uiLanguage = i18n.language.startsWith('en') ? 'en' : 'pt';
  const ui = UI;
  const isUser = message?.sender === 'user';
  const isError = message?.tone === 'error';
  const original = message?.text || '';
  const sourceLanguage = message?.lang?.startsWith('en') ? 'en' : 'pt';
  const [translations, setTranslations] = useState({});
  const [translationFailed, setTranslationFailed] = useState(false);
  useEffect(() => {
    if (isUser || message.translationKey || sourceLanguage === uiLanguage || translations[uiLanguage]) return;
    let active = true;
    setTranslationFailed(false);
    translateMessage(original, uiLanguage).then(text => {
      if (active) setTranslations(previous => ({ ...previous, [uiLanguage]: text }));
    }).catch(() => { if (active) setTranslationFailed(true); });
    return () => { active = false; };
  }, [original, uiLanguage, sourceLanguage, isUser, message.translationKey, translations]);
  const text = isUser ? original : message.translationKey ? i18n.t(message.translationKey, { defaultValue: original })
    : sourceLanguage === uiLanguage ? original : translations[uiLanguage] || original;
  const translating = !isUser && !message.translationKey && sourceLanguage !== uiLanguage && !translations[uiLanguage];

  const segments = useMemo(() => (isUser ? [] : splitMessage(text)), [isUser, text]);
  const context = useMemo(() => mergeLiveContext(message?.context, liveContext), [message?.context, liveContext]);
  const hasCards = segments.some(segment => segment.type === 'card');

  if (isUser) {
    return (
      <div className="my-2 flex w-full justify-end gap-3">
        <div className="ml-auto min-w-0 max-w-[calc(100%-3.25rem)]">
          <div className="chat-bubble chat-bubble--user">
            <p className="whitespace-pre-wrap break-words text-[15px] font-medium leading-relaxed">{renderInline(text, 'font-bold')}</p>
          </div>
        </div>
        <Avatar isUser>
          <User className="h-[18px] w-[18px]" aria-hidden="true" />
        </Avatar>
      </div>
    );
  }

  return (
    <div className={`my-2 flex w-full justify-start gap-3 ${hasCards ? 'message-row-with-cards' : ''}`}>
      <Avatar>
        {isError
          ? <AlertTriangle className={`h-[18px] w-[18px] ${ui.errorIcon}`} aria-hidden="true" />
          : <img src="/astra-avatar.png" alt="" />}
      </Avatar>

      <div className={hasCards ? 'message-content message-with-cards' : 'message-content'}>
        {!isError && (
          <div className="astra-label">
            <span>Astra</span>
            {message.model && <span className="dim-tag">{message.model}</span>}
          </div>
        )}
        {translating && (
          <p role="status" className="text-xs text-muted">{i18n.t(translationFailed ? 'chat.translationFailed' : 'chat.translating')}</p>
        )}
        {compact && hasCards && <FullAstraCardLink onOpen={onViewFull ? () => onViewFull(message.id) : undefined} />}

        {segments.map((segment, index) => {
          if (segment.type === 'text') {
            return (
              <div key={index} role={isError ? 'alert' : undefined}
                className={`chat-bubble ${isError ? 'chat-bubble--error' : 'chat-bubble--astra'}`}>
                {parseBlocks(segment.value).map((block, bi) =>
                  block.type === 'code'
                    ? <CodeBlock key={`${index}-${bi}`} lang={block.lang} code={block.value} />
                    : <div key={`${index}-${bi}`}>{renderText(block.value, ui, `${index}-${bi}`)}</div>,
                )}
              </div>
            );
          }

          const card = resolveCard(segment.tag);
          if (!card) return <span key={index}>{segment.tag}</span>;

          const { Component, limit } = card;
          const source = CARD_SOURCES[segment.tag.slice(1, -1).split(':')[0]];
          // Metrics can be opened in either Astra surface; the other rich tools keep their existing full view.
          if (compact && source !== 'github' && source !== 'wakatime') {
            const target = segment.tag === '[PROJECTS_CARD]' ? 'projects' : segment.tag === '[SKILLS_CARD]' ? 'skills' : null;
            if (!target) return null;
            return <button key={index} className="chip chip--accent" onClick={() => onSelectSection?.(target)}>{target === 'projects' ? (uiLanguage === 'en' ? 'Explore projects' : 'Explorar projetos') : (uiLanguage === 'en' ? 'Explore skills' : 'Explorar habilidades')}</button>;
          }
          const data = context[source];
          return (
            <section className="message-card" key={index}>
              {source && <LiveDataNotice data={data} pending={refreshing.includes(source)}
                onRetry={onRefresh ? () => onRefresh([source], true) : undefined} lang={uiLanguage} />}
              <Suspense fallback={<p role="status">{i18n.t('resume.loading')}</p>}>
                {(!source || data?.status === 'ok') && (Component === ProjectsCard
                  ? <ProjectsCard preview onViewAll={() => onSelectSection?.('projects')} />
                  : <Component context={context} lang={uiLanguage} limit={limit} />)}
              </Suspense>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default memo(MessageBubble);
