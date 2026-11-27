// src/App.jsx
import { lazy, Suspense, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CircleHelp, Gamepad2, Send, Sparkles, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import useMobileViewport from '../hooks/useMobileViewport';
import AstraHero from '../components/AstraHero';
import AstraAvatar, { AstraSurfaceProvider } from '../components/AstraAvatar';
import DimensionAstraSignal from '../components/DimensionAstraSignal';
import { useAssistantPersona } from '../context/AssistantAppearanceContext';
import { isHeistTheme } from '../data/heistThemes.js';
import { ASTRA_PERSONA_ID, assistantAppearance } from '../data/assistantPersonas';
import { ThemeContext } from '../context/ThemeContext';
import { isGaloTheme } from '../data/themes';
import { DESIGN_SYSTEM_ACTION, isDesignSystemRequest } from '../data/designSystem';
import AstraResources, { ASTRA_RESOURCES_ID } from '../components/AstraResources';
import MessageBubble from '../components/MessageBubble';
import StreamingReply from '../components/StreamingReply';
import { createStreamBuffer } from '../services/streamBuffer';
import { warmModelCatalog } from '../services/chatStream';
import sendMessage from '../services/api';
import { isChessReplayRequest, parseChessReplay } from '../services/chessReplay';
import useLiveContext from '../hooks/useLiveContext';
import { sourcesForText } from '../services/liveContext';
import { useAstra } from '../context/AstraContext';
import LaboratoryReview from '../components/LaboratoryReview';
import { actionReply } from '../services/astraActionReply';
import { arcadeIntent } from '../arcade/commands';
import { answerArcade } from '../arcade/replies';
import { isGame } from '../arcade/catalog';
import { BEYOND_CURVE } from '../data/rickDimensions.js';
import { MansionBackdrop } from '../components/DimensionalScene';

const FullArcade = lazy(() => import('../arcade/FullArcade'));
const FONT_SANS = "Inter, 'Geist Sans', Roboto, system-ui, sans-serif";
const messageAnchor = id => `astra-${id}`;

const MOTION_CSS = `
  @keyframes chatMsgIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: none; }
  }
  .chat-msg-in { animation: chatMsgIn 0.4s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
  @media (prefers-reduced-motion: reduce) {
    .chat-msg-in, .animate-spin-slow, .animate-bounce { animation: none !important; }
  }
`;

// Mesmo avatar, rótulo e forma do bubble da Astra: sem salto de layout quando a resposta chega
function TypingIndicator({ author }) {
  const persona = useAssistantPersona(undefined, author);
  const { t } = useTranslation();
  const label = persona ? t(`${persona.key}.waiting`, { defaultValue: t('chat.digitando') }) : t('chat.digitando');
  return (
    <div className="my-2 flex w-full justify-start gap-3" role="status" aria-label={label}>
      <div aria-hidden="true" className="avatar-astra mt-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border">
        <AstraAvatar author={author} />
      </div>
      <div className="message-content">
        <div className="astra-label" aria-hidden="true"><span>{persona?.name ?? 'Astra'}</span></div>
        <div className="chat-bubble chat-bubble--astra flex items-center gap-1.5">
          {[0, 0.15, 0.3].map((delay) => (
            <span key={delay} aria-hidden="true" className="h-2 w-2 animate-bounce rounded-full bg-muted"
              style={{ animationDelay: `${delay}s` }} />
          ))}
          {persona && <span className="text-sm text-muted" aria-hidden="true">{label}</span>}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage({ modal = false, visible = true, onReady, onSelectSection, draft,
  arcade, arcadeChallenge, onOpenArcade, onCloseArcade }) {
  const { t, i18n } = useTranslation();
  const surface = modal ? 'compact' : 'full';
  const persona = useAssistantPersona(surface);
  const assistantName = persona?.name ?? 'Astra';
  const viewportRef = useMobileViewport();
  const { actions, actionUi, lab, openFull, setLabHandoff } = useAstra();
  const { theme, dimension, discoverBeyond } = useContext(ThemeContext) ?? {};
  const galo = isGaloTheme(theme);
  const heist = isHeistTheme(theme);
  const composerLabel = t(heist ? 'heist.composer' : 'chat.placeholder');
  const welcomeKey = galo ? 'chat.galoWelcome.greeting' : modal ? 'chat.quickWelcome' : 'chat.boasVindas';

  const [messages, setMessages] = useState(() => [{ id: 'welcome', sender: 'ai', text: t('chat.boasVindas'), translationKey: 'chat.boasVindas' }]);
  const [input, setInput] = useState('');
  const [composerFocused, setComposerFocused] = useState(false);
  const en = i18n.language.startsWith('en');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(null);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const resourcesTrigger = useRef(null);
  const arcadeSession = useRef(null);
  const showArcade = !modal && visible && Boolean(arcade);
  const activeRequest = useRef(null);
  const followOutput = useRef(true);
  const fullCardTarget = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const wasLoading = useRef(false);
  const idCounter = useRef(0);
  const messagesRef = useRef(messages);
  const conversationRef = useRef({ chatContext: null, model: null });
  const live = useLiveContext();

  useEffect(() => {
    void warmModelCatalog(); // independent of chat history, which already lives locally
    return () => {
      const request = activeRequest.current;
      activeRequest.current = null;
      request?.controller.abort();
      request?.buffer?.dispose();
    };
  }, []);

  useEffect(() => { onReady?.(true); }, [onReady]);
  useEffect(() => {
    if (!draft) return;
    setInput(draft.text);
    const frame = requestAnimationFrame(() => {
      const input = inputRef.current;
      if (input?.closest('dialog')?.open) input.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [draft]);
  useEffect(() => {
    setResourcesOpen(false);
  }, [modal, visible]);
  useEffect(() => {
    if (modal || !visible || !fullCardTarget.current) return;
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(fullCardTarget.current);
      fullCardTarget.current = null;
      target?.scrollIntoView({ block: 'start', behavior: 'instant' });
      target?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [modal, visible]);

  const viewFullCard = useCallback(target => {
    followOutput.current = false;
    fullCardTarget.current = target;
    openFull();
  }, [openFull]);
  const viewFullMessage = useCallback(id => viewFullCard(messageAnchor(id)), [viewFullCard]);

  const nextId = () => `msg-${++idCounter.current}`;
  const compact = messages.length > 1; // hero grande só no estado vazio

  // Rola até a última mensagem. O timeout espera os cards renderizarem; limpar evita efeito tardio.
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!visible || !container || !compact || !followOutput.current || fullCardTarget.current) return undefined;
    const id = setTimeout(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: 'auto' });
    }, 100);
    return () => clearTimeout(id);
  }, [messages.length, loading, compact, visible]);

  // Devolve o foco ao input quando a resposta chega (não rouba foco na montagem)
  useEffect(() => {
    if (wasLoading.current && !loading && visible && document.activeElement?.closest('.chat-form')) inputRef.current?.focus({ preventScroll: true });
    wasLoading.current = loading;
  }, [loading]);

  const appendMessage = message => {
    messagesRef.current = [...messagesRef.current, message];
    setMessages(messagesRef.current);
  };

  const handleSend = async (suggestion = input, predefinedSuggestion = false, resourceActions, arcadeShortcut) => {
    const query = suggestion.trim();
    if (query.toLowerCase() === '/help') {
      setInput('');
      setResourcesOpen(true);
      return;
    }
    if (!query || activeRequest.current) return;
    const userId = nextId();
    const id = nextId();
    const turn = idCounter.current;
    const requestLanguage = i18n.language;
    const author = Object.freeze({
      turnId: turn, attemptId: 1, personaId: persona?.id ?? ASTRA_PERSONA_ID,
      theme, dimension, surface, language: requestLanguage,
    });
    const discovery = discoverBeyond?.(query);
    if (discovery) {
      const translationKey = `rick.beyond.command.${discovery}`;
      followOutput.current = true;
      setInput('');
      appendMessage({ id: userId, sender: 'user', text: query, lang: requestLanguage });
      appendMessage({ id, sender: 'ai', text: t(translationKey), translationKey, lang: requestLanguage, author });
      return;
    }
    if (isChessReplayRequest(query)) {
      followOutput.current = true;
      setInput('');
      const source = query.replace(/^\/pgn\s*/i, '');
      let game;
      let invalid = false;
      try {
        if (source) game = parseChessReplay(source);
      } catch {
        invalid = /^(?:\s*\[|```|\d+\.|\/pgn\s)/i.test(query);
      }
      const translationKey = game ? 'chat.chessReplay.sent' : 'chat.chessReplay.title';
      appendMessage({ id: userId, sender: 'user', text: t(translationKey), translationKey, lang: requestLanguage });
      appendMessage({
        id, sender: 'ai', lang: requestLanguage, author,
        text: '[CHESS_REPLAY]',
        chessReplay: { game, invalid },
      });
      return;
    }
    const selectedActions = resourceActions ?? (isDesignSystemRequest(query) ? [DESIGN_SYSTEM_ACTION] : undefined);
    followOutput.current = true;

    appendMessage({ id: userId, sender: 'user', text: query, lang: requestLanguage });
    setInput('');
    const session = showArcade ? arcadeSession.current : null;
    const intent = arcadeShortcut ?? (!selectedActions && !predefinedSuggestion && arcadeIntent(query, session?.getState().game, showArcade));
    const labAtSend = lab?.getSnapshot();
    const controller = new AbortController();
    const buffer = intent ? null : createStreamBuffer();
    let replyAuthor = author;
    let pendingAttempt;
    const request = { controller, buffer, stop };
    const isCurrent = () => activeRequest.current === request;
    activeRequest.current = request;
    setLoading(true);
    if (buffer) setStreaming({ id, buffer, author });
    const updateHandoff = reply => setLabHandoff?.(current => current?.turn === turn ? { ...current, reply } : current);

    function finish() {
      if (!isCurrent()) return;
      activeRequest.current = null;
      buffer?.dispose();
      setLoading(false);
      setStreaming(null);
    }

    function reportFailure(cancelled) {
      if (!cancelled) setInput(current => current || query);
      const errorKey = persona ? `${persona.key}.error` : 'chat.erro';
      const notice = cancelled
        ? (requestLanguage.startsWith('en') ? 'Response stopped.' : 'Resposta interrompida.')
        : t(errorKey, { lng: requestLanguage });
      updateHandoff(notice);
      appendMessage({
        id, sender: 'ai', author: replyAuthor, degraded: true, lang: requestLanguage,
        tone: cancelled ? undefined : 'error',
        translationKey: cancelled ? undefined : errorKey,
        text: cancelled ? [buffer?.getText(), notice].filter(Boolean).join('\n\n') : notice,
      });
    }

    function stop() {
      if (!isCurrent()) return;
      controller.abort();
      reportFailure(true);
      finish();
    }

    async function requestReply(history, context, suggested, labSnapshot) {
      const attempt = replyAuthor;
      pendingAttempt = attempt;
      try {
        return await sendMessage(query, attempt.language, history, context, suggested, {
          signal: controller.signal,
          surface: attempt.surface,
          appearance: assistantAppearance(attempt.theme, attempt.dimension),
          labSnapshot,
          onEvent: event => {
            if (isCurrent() && pendingAttempt === attempt && !controller.signal.aborted) buffer.push(event);
          },
        });
      } finally {
        if (pendingAttempt === attempt) pendingAttempt = null;
      }
    }

    try {
      if (intent) {
        const response = await answerArcade(intent, { en, compact: modal || !visible, session, openArcade: onOpenArcade });
        if (isCurrent()) appendMessage({ id, sender: 'ai', lang: requestLanguage, ...response, author });
        return;
      }
      // O campo "id" é só da interface: não vai para o backend
      const history = messagesRef.current.filter(message => !message.degraded).map(({ id, sender, text, translationKey }) => id === 'welcome'
        ? { sender, text: persona?.welcome ?? t(welcomeKey), ...(persona ? {} : { translationKey: welcomeKey }) }
        : { sender, text, translationKey });
      // Catalog shortcuts provide a fixed plan; typed requests use Gemini to choose the same actions.
      let data = selectedActions ? { actions: selectedActions }
        : await requestReply(history, conversationRef.current.chatContext, predefinedSuggestion);
      if (!isCurrent()) return;
      const plan = actions && await actions.execute(turn, data.actions, {
        ...actionUi,
        navigate: section => {
          if (section === 'laboratorio') setLabHandoff({ turn, modal, author });
          actionUi.navigate(section);
        },
      }, { signal: controller.signal, labAtSend });
      if (!isCurrent()) return;
      const notices = [...(plan?.notices ?? [])];
      const cards = plan?.cards ?? [];
      let reviewId = plan?.reviewId;
      if (plan?.snapshot) {
        live.absorb(data.liveContext);
        buffer.push({ type: 'reset' });
        replyAuthor = Object.freeze({ ...author, attemptId: 2 });
        setStreaming({ id, buffer, author: replyAuthor });
        data = await requestReply(history, data.chatContext ?? conversationRef.current.chatContext, false, plan.snapshot);
        if (!isCurrent()) return;
        const proposal = await actions.execute(turn, data.actions, actionUi, { base: plan.base, signal: controller.signal });
        reviewId = proposal.reviewId;
        notices.push(...proposal.notices);
      }
      if (!isCurrent()) return;
      if (data.degraded) setInput(current => current || query);
      const replyLanguage = data.response || data.error ? requestLanguage : i18n.language;
      const reply = [data.response || data.error, actionReply(notices, replyLanguage.startsWith('en'))].filter(Boolean).join('\n\n');
      const response = [reply, ...cards].filter(Boolean).join('\n');
      updateHandoff(reply);
      conversationRef.current = {
        chatContext: data.chatContext ?? conversationRef.current.chatContext,
        model: data.model ?? conversationRef.current.model,
      };
      appendMessage({
        id,
        sender: 'ai',
        author: replyAuthor,
        text: response,
        translationKey: data.translationKey,
        context: data.liveContext,
        lang: replyLanguage,
        model: data.model,
        degraded: data.degraded,
        tone: data.degraded || data.error ? 'error' : undefined,
        reviewId,
      });
      live.absorb(data.liveContext);
      const cardSources = sourcesForText(response);
      live.watch(cardSources);
      // Refresh only missing/stale sources; avoid a second forced HTTP request.
      void live.refresh(cardSources);
    } catch {
      if (isCurrent()) reportFailure(false);
    } finally {
      finish();
    }
  };

  const rawPrompts = t('chat.sugestoes', { returnObjects: true });
  const characterPrompts = persona ? t(`${persona.key}.suggestions`, { returnObjects: true }) : null;
  const tailored = Array.isArray(characterPrompts) ? characterPrompts : [];
  const prompts = [...tailored, ...(Array.isArray(rawPrompts) ? rawPrompts.slice(tailored.length) : [])];
  const composerPrompts = modal ? (compact ? [] : tailored.slice(0, 2)) : (compact ? prompts : []);
  const showGaloHero = galo && !modal && !compact && !showArcade;
  const galoShortcuts = galo && !compact && !showArcade && (
    <div role="group" aria-label={t('chat.galoWelcome.shortcuts')} className="mt-2 flex flex-wrap gap-2">
      <button type="button" className="chip chip--accent min-h-11" onClick={() => onSelectSection?.('projects')}>
        {t('chat.galoWelcome.projects')}
      </button>
      <button type="button" className="chip chip--accent min-h-11 disabled:opacity-50" disabled={loading}
        onClick={() => handleSend(t('chat.galoWelcome.matchPrompt'), true)}>
        {t('chat.galoWelcome.lastMatch')}
      </button>
    </div>
  );

  return (
    <AstraSurfaceProvider surface={surface}><div
      className={`portfolio-app astra-conversation ${modal ? "astra-compact" : "astra-full"}`}
      ref={viewportRef}
      data-chat-empty={!compact}
      style={{ fontFamily: FONT_SANS }}
    >
      <style>{MOTION_CSS}</style>
      {visible && !modal && theme === 'rick-morty' && dimension === BEYOND_CURVE && <MansionBackdrop />}

      <div className="app-frame relative z-10 flex flex-col" onKeyDown={event => {
        if (!resourcesOpen || event.key !== 'Escape' || event.defaultPrevented) return;
        event.preventDefault();
        setResourcesOpen(false);
      }}>
        {!modal && <Navbar />}
        <div className={showArcade ? 'astra-workspace astra-workspace-arcade' : 'astra-workspace'}>
          {showArcade && <Suspense fallback={<p role="status">{en ? 'Opening Astra Arcade…' : 'Abrindo Astra Arcade…'}</p>}>
            <FullArcade ref={arcadeSession} en={en} initialGame={isGame(arcade) ? arcade : null}
              challenge={arcadeChallenge} onClose={onCloseArcade} />
          </Suspense>}
          <section className="center-panel glass-panel" aria-label={en ? `Conversation with ${assistantName}` : `Conversa com ${assistantName}`}>
            <div className="chat-view">
              <div className="chat-heading">
                <div>
                  <span className="astra-mini" aria-hidden="true"><AstraAvatar /></span>
                  <h2>{persona ? (en ? `Talk to ${assistantName}` : `Converse com ${assistantName}`) : (en ? 'Talk to Astra' : 'Converse com a Astra')}</h2>
                </div>
                <span className="astra-heading-actions">
                  <span className="astra-heading-description">{heist && !modal ? t('heist.desk') : en ? 'AI assistant' : 'Assistente de IA'}</span>
                  <button type="button" className="icon-button astra-arcade-trigger" aria-label={persona ? `${assistantName} Arcade` : 'Astra Arcade'} title={persona ? `${assistantName} Arcade` : 'Astra Arcade'}
                    aria-expanded={modal ? undefined : showArcade} onClick={() => {
                      setResourcesOpen(false);
                      if (modal) void handleSend(en ? 'Astra Arcade games' : 'Jogos do Astra Arcade');
                      else if (showArcade) onCloseArcade();
                      else onOpenArcade();
                    }}><Gamepad2 size={18} aria-hidden="true" /></button>
                  <button ref={resourcesTrigger} type="button" className="icon-button astra-resources-trigger"
                      aria-label={persona ? (en ? `${assistantName} resources` : `Recursos de ${assistantName}`) : t('chat.resources.title')} title={persona ? (en ? `${assistantName} resources` : `Recursos de ${assistantName}`) : t('chat.resources.title')}
                      aria-controls={ASTRA_RESOURCES_ID} aria-expanded={resourcesOpen}
                      onClick={() => setResourcesOpen(open => !open)}>
                      <CircleHelp size={17} aria-hidden="true" />
                  </button>
                </span>
              </div>

              <DimensionAstraSignal performance={{ visible, focused: composerFocused, typing: Boolean(input.trim()), loading, streaming, last: messages.at(-1) }} />
              <div
                ref={messagesContainerRef}
                onScroll={event => {
                  const node = event.currentTarget;
                  followOutput.current = node.scrollHeight - node.scrollTop - node.clientHeight < 80;
                }}
                role="log"
                aria-live="polite"
                aria-relevant="additions"
                aria-label={en ? 'Conversation' : 'Conversa'}
                className="chat-messages custom-scrollbar flex min-h-0 w-full flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6"
              >
                <div className="space-y-6">
                  {!modal && !showArcade && <AstraHero en={en} compact={compact} prompts={prompts} disabled={loading}
                    onPick={prompt => handleSend(prompt, true)} greeting={showGaloHero ? t(welcomeKey) : undefined}
                    shortcuts={showGaloHero ? galoShortcuts : undefined} />}

                  {messages.filter(message => !showGaloHero || message.id !== 'welcome').map(message => (
                    <div id={messageAnchor(message.id)} tabIndex={-1} className="chat-msg-in outline-none" key={message.id}>
                      <MessageBubble message={message.id === 'welcome' ? { ...message, text: persona?.welcome ?? t(welcomeKey), translationKey: persona ? undefined : welcomeKey, lang: i18n.language } : message} liveContext={live.context} refreshing={live.refreshing} onRefresh={live.refresh} onSelectSection={onSelectSection}
                        onViewFull={openFull ? viewFullMessage : undefined} compact={modal} active={visible && !showArcade}>
                        {message.id === 'welcome' && modal && galoShortcuts}
                        {message.reviewId && <LaboratoryReview reviewId={message.reviewId} onOpenLab={() => onSelectSection?.('laboratorio')}
                          onViewFull={modal && openFull ? () => viewFullMessage(message.id) : undefined} />}
                        {message.arcadeLink && <a className="chip chip--accent self-start" href={message.arcadeLink} onClick={event => {
                          if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
                          event.preventDefault();
                          const params = new URL(message.arcadeLink, window.location.origin).searchParams;
                          const game = params.get('arcade');
                          const challenge = params.get('challenge') === '1';
                          if (showArcade && arcadeSession.current) {
                            void arcadeSession.current.dispatch(isGame(game) ? { type: 'game.start', game, challenge } : { type: 'arcade.open' });
                          } else onOpenArcade(game, challenge);
                        }}>{persona ? (en ? `Open ${assistantName} Arcade` : `Abrir Arcade de ${assistantName}`) : modal ? (en ? 'Open in Full Astra ↗' : 'Abrir na Astra Completa ↗') : (en ? 'Open Astra Arcade' : 'Abrir Astra Arcade')}</a>}
                      </MessageBubble>
                    </div>
                  ))}
                  {streaming && (
                    <StreamingReply key={streaming.id} author={streaming.author} buffer={streaming.buffer} containerRef={messagesContainerRef} followRef={followOutput}
                      fallback={<TypingIndicator author={streaming.author} />} />
                  )}
                </div>
              </div>

              {/* Atalhos: no estado vazio ficam dentro do hero */}
              <div className="chat-composer flex min-w-0 flex-col gap-3">
                {!showArcade && composerPrompts.length > 0 && (
                  <div className="custom-scrollbar flex gap-2 overflow-x-auto px-1 pb-3 pt-1">
                    {composerPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handleSend(prompt, true)}
                        disabled={loading}
                        className="min-h-12 min-w-12 shrink-0 rounded-full border border-line bg-panel-soft px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={event => {
                    event.preventDefault();
                    if (modal) inputRef.current?.focus({ preventScroll: true });
                    handleSend();
                  }}
                  className="chat-form flex items-center gap-2 rounded-xl p-2 transition-colors duration-300 focus-within:ring-2 focus-within:ring-accent sm:gap-3"
                >
                  <div className="hidden pl-4 text-accent sm:block" aria-hidden="true">
                    <Sparkles size={20} />
                  </div>
                  <textarea
                    ref={inputRef}
                    onFocus={() => setComposerFocused(true)}
                    onBlur={() => setComposerFocused(false)}
                    id="chat-input"
                    rows={1}
                    onKeyDown={event => {
                      if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                        event.preventDefault();
                        if (!loading) event.currentTarget.form.requestSubmit();
                      }
                    }}
                    aria-label={showArcade ? (t('rick.assistant.game', { name: assistantName })) : composerLabel}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={showArcade ? (`${t('rick.assistant.game', { name: assistantName })}…`)
                      : composerLabel || 'Digite uma pergunta sobre o Gustavo...'}
                    disabled={!modal && loading}
                    autoComplete="off"
                    className="min-h-12 min-w-0 flex-1 resize-none bg-transparent py-3 pl-4 pr-2 text-[15px] font-medium text-ink outline-none placeholder:text-muted disabled:opacity-60 sm:pl-2"
                  />
                  {loading && <button type="button" onClick={() => activeRequest.current?.stop()}
                    className="icon-button shrink-0" aria-label={en ? 'Stop response' : 'Parar resposta'}><Square size={16} aria-hidden="true" /></button>}
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    aria-label={t('chat.enviar')}
                    className="min-h-12 min-w-12 flex shrink-0 items-center justify-center gap-2 px-4 py-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 sm:px-5"
                  >
                    <span className="hidden sm:inline">{t('chat.enviar')}</span> <Send size={16} aria-hidden="true" />
                  </button>
                </form>
              </div>
            </div>

          </section>
          <AstraResources open={resourcesOpen && visible} compact={modal} disabled={loading} triggerRef={resourcesTrigger}
            onClose={() => setResourcesOpen(false)} onPick={(prompt, plan, arcadeShortcut) => handleSend(prompt, !plan, plan, arcadeShortcut)} />
        </div>
      </div>
    </div></AstraSurfaceProvider>
  );
}
