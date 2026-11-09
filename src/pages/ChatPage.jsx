// src/App.jsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { CircleHelp, Send, Sparkles, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import useMobileViewport from '../hooks/useMobileViewport';
import AstraHero from '../components/AstraHero';
import AstraResources, { ASTRA_RESOURCES_ID } from '../components/AstraResources';
import MessageBubble, { needsFullAstra } from '../components/MessageBubble';
import StreamingReply from '../components/StreamingReply';
import { createStreamBuffer } from '../services/streamBuffer';
import { warmModelCatalog } from '../services/chatStream';
import sendMessage from '../services/api';
import useLiveContext from '../hooks/useLiveContext';
import { sourcesForText } from '../services/liveContext';
import { useAstra } from '../context/AstraContext';
import LaboratoryReview from '../components/LaboratoryReview';
import { actionReply } from '../services/astraActionReply';

const FONT_SANS = "Inter, 'Geist Sans', Roboto, system-ui, sans-serif";
const LAB_REVIEW_ID = 'astra-lab-review';
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
function TypingIndicator({ label }) {
  return (
    <div className="my-2 flex w-full justify-start gap-3" role="status" aria-label={label}>
      <div aria-hidden="true" className="avatar-astra mt-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border">
        <img src="/astra-avatar.png" alt="" />
      </div>
      <div className="message-content">
        <div className="astra-label" aria-hidden="true"><span>Astra</span></div>
        <div className="chat-bubble chat-bubble--astra flex items-center gap-1.5">
          {[0, 0.15, 0.3].map((delay) => (
            <span key={delay} aria-hidden="true" className="h-2 w-2 animate-bounce rounded-full bg-muted"
              style={{ animationDelay: `${delay}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage({ modal = false, visible = true, onReady, onSelectSection }) {
  const { t, i18n } = useTranslation();
  const viewportRef = useMobileViewport();
  const { actions, actionUi, openFull, setLabHandoff } = useAstra();

  const [messages, setMessages] = useState(() => [{ id: 'welcome', sender: 'ai', text: t('chat.boasVindas'), translationKey: 'chat.boasVindas' }]);
  const [input, setInput] = useState('');
  const en = i18n.language.startsWith('en');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(null);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const resourcesTrigger = useRef(null);
  const activeRequest = useRef(null);
  const mounted = useRef(true);
  const followOutput = useRef(true);
  const compactVisible = useRef(modal && visible);
  const fullCardTarget = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const wasLoading = useRef(false);
  const idCounter = useRef(0);
  const messagesRef = useRef(messages);
  const sendingRef = useRef(false);
  const conversationRef = useRef({ chatContext: null, model: null });
  const live = useLiveContext();

  useEffect(() => {
    mounted.current = true;
    void warmModelCatalog(); // independent of chat history, which already lives locally
    return () => {
      mounted.current = false;
      activeRequest.current?.controller.abort();
      activeRequest.current?.buffer.dispose();
    };
  }, []);

  useEffect(() => { onReady?.(true); }, [onReady]);
  useEffect(() => {
    compactVisible.current = modal && visible;
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
      container.scrollTo({ top: container.scrollHeight, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
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

  const handleSend = async (suggestion = input, predefinedSuggestion = false, resourceActions) => {
    const query = suggestion.trim();
    if (query.toLowerCase() === '/help') {
      setInput('');
      setResourcesOpen(true);
      return;
    }
    if (!query || sendingRef.current) return;
    sendingRef.current = true;
    const requestLanguage = i18n.language;
    followOutput.current = true;

    appendMessage({ id: nextId(), sender: 'user', text: query, lang: requestLanguage });
    setInput('');
    setLoading(true);
    const id = nextId();
    const turn = idCounter.current;
    const controller = new AbortController();
    const buffer = createStreamBuffer();
    activeRequest.current = { controller, buffer };
    setStreaming({ id, buffer });
    const updateHandoff = reply => setLabHandoff?.(current => current?.turn === turn ? { ...current, reply } : current);
    try {
      // O campo "id" é só da interface: não vai para o backend
      const history = messagesRef.current.map(({ sender, text, translationKey }) => ({ sender, text, translationKey }));
      const options = {
        signal: controller.signal,
        surface: modal ? 'compact' : 'full',
        onEvent: event => {
          if (mounted.current && !controller.signal.aborted) buffer.push(event);
        },
      };
      // Catalog shortcuts provide a fixed plan; typed requests use Gemini to choose the same actions.
      let data = resourceActions ? { actions: resourceActions }
        : await sendMessage(query, requestLanguage, history, conversationRef.current.chatContext, predefinedSuggestion, options);
      controller.signal.throwIfAborted();
      if (!mounted.current) return;
      const plan = actions && await actions.execute(turn, data.actions, {
        ...actionUi,
        navigate: section => {
          if (section === 'laboratorio') setLabHandoff({ turn, modal });
          actionUi.navigate(section);
        },
      }, { signal: controller.signal });
      const notices = [...(plan?.notices ?? [])];
      const cards = plan?.cards ?? [];
      if (plan?.snapshot) {
        live.absorb(data.liveContext);
        buffer.push({ type: 'reset' });
        data = await sendMessage(query, requestLanguage, history, data.chatContext ?? conversationRef.current.chatContext,
          false, { ...options, labSnapshot: plan.snapshot });
        controller.signal.throwIfAborted();
        if (!mounted.current) return;
        const proposal = await actions.execute(turn, data.actions, actionUi, { base: plan.base, signal: controller.signal });
        notices.push(...proposal.notices);
      }
      controller.signal.throwIfAborted();
      const replyLanguage = data.response || data.error ? requestLanguage : i18n.language;
      const handoff = modal && needsFullAstra(data.response ?? '');
      const reply = [handoff && t('chat.surface.handoff', { lng: replyLanguage }), data.response || data.error,
        actionReply(notices, replyLanguage.startsWith('en'))].filter(Boolean).join('\n\n');
      const response = [reply, ...cards].filter(Boolean).join('\n');
      updateHandoff(reply);
      conversationRef.current = {
        chatContext: data.chatContext ?? conversationRef.current.chatContext,
        model: data.model ?? conversationRef.current.model,
      };
      appendMessage({
        id,
        sender: 'ai',
        text: response,
        translationKey: data.translationKey,
        context: data.liveContext,
        lang: replyLanguage,
        model: data.model,
      });
      live.absorb(data.liveContext);
      const cardSources = sourcesForText(response);
      live.watch(cardSources);
      // Refresh only missing/stale sources; avoid a second forced HTTP request.
      void live.refresh(cardSources);
      if (handoff && openFull && compactVisible.current && !notices.includes('fullOpened')) viewFullMessage(id);
    } catch {
      if (!mounted.current) return;
      const cancelled = controller.signal.aborted;
      const notice = cancelled
        ? (requestLanguage.startsWith('en') ? 'Response stopped.' : 'Resposta interrompida.')
        : t('chat.erro', { lng: requestLanguage });
      updateHandoff(notice);
      appendMessage({
        id,
        sender: 'ai',
        tone: cancelled ? undefined : 'error',
        lang: requestLanguage,
        text: cancelled ? [buffer.getText(), notice].filter(Boolean).join('\n\n') : notice,
      });
    } finally {
      buffer.dispose();
      activeRequest.current = null;
      sendingRef.current = false;
      if (mounted.current) { setLoading(false); setStreaming(null); }
    }
  };

  const rawPrompts = t('chat.sugestoes', { returnObjects: true });
  const prompts = Array.isArray(rawPrompts) ? rawPrompts : [];

  return (
    <div
      className={`portfolio-app astra-conversation ${modal ? "astra-compact" : "astra-full"}`}
      ref={viewportRef}
      data-chat-empty={!compact}
      style={{ fontFamily: FONT_SANS }}
    >
      <style>{MOTION_CSS}</style>

      <div className="app-frame relative z-10 flex flex-col" onKeyDown={event => {
        if (!resourcesOpen || event.key !== 'Escape' || event.defaultPrevented) return;
        event.preventDefault();
        setResourcesOpen(false);
      }}>
        {!modal && <Navbar />}
        <div className="astra-workspace">
          <section className="center-panel glass-panel" aria-label={en ? 'Conversation with Astra' : 'Conversa com Astra'}>
            <div className="chat-view">
              <div className="chat-heading">
                <div>
                  <span className="astra-mini" aria-hidden="true"><img src="/astra-avatar.png" alt="" /></span>
                  <h2>{en ? 'Talk to Astra' : 'Converse com a Astra'}</h2>
                </div>
                <span className="astra-heading-actions">
                  {en ? 'AI assistant' : 'Assistente de IA'}
                  <button ref={resourcesTrigger} type="button" className="icon-button astra-resources-trigger"
                      aria-label={t('chat.resources.title')} title={t('chat.resources.title')}
                      aria-controls={ASTRA_RESOURCES_ID} aria-expanded={resourcesOpen}
                      onClick={() => setResourcesOpen(open => !open)}>
                      <CircleHelp size={17} aria-hidden="true" />
                  </button>
                </span>
              </div>

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
                  {!modal && <AstraHero en={en} compact={compact} prompts={prompts} disabled={loading} onPick={prompt => handleSend(prompt, true)} />}

                  {messages.map(message => (
                    <div id={messageAnchor(message.id)} tabIndex={-1} className="chat-msg-in outline-none" key={message.id}>
                      <MessageBubble message={message.id === 'welcome' && modal ? { ...message, text: t('chat.quickWelcome'), translationKey: 'chat.quickWelcome' } : message} liveContext={live.context} refreshing={live.refreshing} onRefresh={live.refresh} onSelectSection={onSelectSection}
                        onViewFull={openFull ? viewFullMessage : undefined} compact={modal} />
                    </div>
                  ))}
                  {streaming && (
                    <StreamingReply key={streaming.id} buffer={streaming.buffer} containerRef={messagesContainerRef} followRef={followOutput}
                      fallback={<TypingIndicator label={t('chat.digitando', { defaultValue: en ? 'Generating reply' : 'Gerando resposta' })} />} />
                  )}
                  {actions && <LaboratoryReview focusId={LAB_REVIEW_ID} onOpenLab={() => onSelectSection?.('laboratorio')}
                    onViewFull={modal && openFull ? () => viewFullCard(LAB_REVIEW_ID) : undefined} />}
                </div>
              </div>

              {/* Atalhos: no estado vazio ficam dentro do hero */}
              <div className="chat-composer flex min-w-0 flex-col gap-3">
                {!modal && compact && prompts.length > 0 && (
                  <div className="custom-scrollbar flex gap-2 overflow-x-auto px-1 pb-3 pt-1">
                    {prompts.map((prompt) => (
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
                  <input
                    ref={inputRef}
                    id="chat-input"
                    aria-label={t('chat.placeholder') || 'Pergunte sobre o Gustavo'}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={t('chat.placeholder') || 'Digite uma pergunta sobre o Gustavo...'}
                    disabled={!modal && loading}
                    autoComplete="off"
                    className="min-h-12 min-w-0 flex-1 bg-transparent py-3 pl-4 pr-2 text-[15px] font-medium text-ink outline-none placeholder:text-muted disabled:opacity-60 sm:pl-2"
                  />
                  {loading && <button type="button" onClick={() => activeRequest.current?.controller.abort()}
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
            onClose={() => setResourcesOpen(false)} onPick={(prompt, plan) => handleSend(prompt, !plan, plan)} />
        </div>
      </div>
    </div>
  );
}
