// src/App.jsx
import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProfilePanel from './components/ProfilePanel';
import PortfolioSection from './components/PortfolioSection';
import MessageBubble from './components/MessageBubble';
import AstraHero from './components/AstraHero';
import sendMessage from './services/api';
import useLiveContext from './hooks/useLiveContext';
import { sourcesForText } from './services/liveContext';

const FONT_SANS = "Inter, 'Geist Sans', Roboto, system-ui, sans-serif";

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

export default function App() {
  const { t, i18n } = useTranslation();

  const [messages, setMessages] = useState(() => [{ id: 'welcome', sender: 'ai', text: t('chat.boasVindas'), translationKey: 'chat.boasVindas' }]);
  const [input, setInput] = useState('');
  const [activeSection, setActiveSection] = useState('home');
  const en = i18n.language.startsWith('en');
  const [loading, setLoading] = useState(false);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const wasLoading = useRef(false);
  const focusChat = useRef(false);
  const idCounter = useRef(0);
  const messagesRef = useRef(messages);
  const sendingRef = useRef(false);
  const conversationRef = useRef({ chatContext: null, model: null });
  const live = useLiveContext();

  const nextId = () => `msg-${++idCounter.current}`;
  const compact = messages.length > 1; // hero grande só no estado vazio

  // Rola até a última mensagem. O timeout espera os cards renderizarem; limpar evita efeito tardio.
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !compact) return undefined;
    const id = setTimeout(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }, 100);
    return () => clearTimeout(id);
  }, [messages.length, loading, compact]);

  // Devolve o foco ao input quando a resposta chega (não rouba foco na montagem)
  useEffect(() => {
    if (wasLoading.current && !loading) inputRef.current?.focus();
    wasLoading.current = loading;
  }, [loading]);

  // Voltar ao chat pelo atalho da Astra: foca o campo depois que a vista deixa de estar oculta
  useEffect(() => {
    if (activeSection === 'home' && focusChat.current) {
      focusChat.current = false;
      inputRef.current?.focus();
    }
  }, [activeSection]);

  const openChat = () => {
    if (activeSection === 'home') {
      inputRef.current?.focus();
      return;
    }
    focusChat.current = true;
    setActiveSection('home');
  };

  const appendMessage = message => {
    messagesRef.current = [...messagesRef.current, message];
    setMessages(messagesRef.current);
  };

  const handleSend = async (suggestion = input, predefinedSuggestion = false) => {
    const query = suggestion.trim();
    if (!query || sendingRef.current) return;
    sendingRef.current = true;
    const requestLanguage = i18n.language;

    appendMessage({ id: nextId(), sender: 'user', text: query, lang: requestLanguage });
    setInput('');
    setLoading(true);
    try {
      // O campo "id" é só da interface: não vai para o backend
      const history = messagesRef.current.map(({ sender, text, translationKey }) => ({ sender, text, translationKey }));
      const data = await sendMessage(query, requestLanguage, history, conversationRef.current.chatContext, predefinedSuggestion);
      conversationRef.current = {
        chatContext: data.chatContext ?? conversationRef.current.chatContext,
        model: data.model ?? conversationRef.current.model,
      };
      const id = nextId();
      appendMessage({
        id,
        sender: 'ai',
        text: data.response || data.error,
        translationKey: data.translationKey,
        context: data.liveContext,
        lang: requestLanguage,
        model: data.model,
      });
      live.absorb(data.liveContext);
      const cardSources = sourcesForText(data.response);
      live.watch(cardSources);
      // Fontes com falha: recarrega com aviso. Todas as demais: revalida em silêncio,
      // pois a resposta pode ter saído de um snapshot em cache enquanto o dado novo chegava.
      void live.refresh(cardSources);
      void live.refresh(cardSources, true, { silent: true });
    } catch {
      appendMessage({
        id: nextId(),
        sender: 'ai',
        tone: 'error',
        translationKey: 'chat.erro',
        text: t('chat.erro', {
          defaultValue: 'ERRO: não foi possível processar sua pergunta agora. Tente novamente em instantes.',
        }),
      });
    } finally {
      sendingRef.current = false;
      setLoading(false);
    }
  };

  const rawPrompts = t('chat.sugestoes', { returnObjects: true });
  const prompts = Array.isArray(rawPrompts) ? rawPrompts : [];

  return (
    <div
      className="portfolio-app relative flex min-h-screen flex-col overflow-x-clip transition-colors duration-300"
      style={{ fontFamily: FONT_SANS }}
    >
      <style>{MOTION_CSS}</style>

      <a href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:border focus:border-line focus:bg-panel focus:px-4 focus:py-2 focus:text-ink">
        {en ? 'Skip to content' : 'Pular para o conteúdo'}
      </a>

      {/* Fundo decorativo: grade em ciano, igual ao blueprint da referência */}
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 h-[200%] w-[200%] -translate-x-1/4 -translate-y-1/4 rotate-[35deg] bg-[size:6rem_6rem] opacity-40
          bg-[linear-gradient(to_right,rgb(var(--brand-400)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(var(--brand-400)/0.05)_1px,transparent_1px)]"
      />

      <div className="app-frame relative z-10 flex flex-col">
        <Navbar />
        <div className="workspace">
          <Sidebar active={activeSection} onSelect={setActiveSection} onAsk={openChat} en={en} />

          <main id="conteudo" tabIndex={-1} className="center-panel glass-panel">
            {activeSection !== 'home' && <PortfolioSection active={activeSection} en={en} />}

            <div className="chat-view" hidden={activeSection !== 'home'}>
              <div className="chat-heading">
                <div>
                  <span className="astra-mini" aria-hidden="true"><img src="/astra-avatar.png" alt="" /></span>
                  <h2>{en ? 'Talk to Astra' : 'Converse com a Astra'}</h2>
                </div>
                <span>{en ? 'AI assistant' : 'Assistente de IA'}</span>
              </div>

              <div
                ref={messagesContainerRef}
                role="log"
                aria-live="polite"
                aria-relevant="additions"
                aria-label={en ? 'Conversation' : 'Conversa'}
                className="chat-messages custom-scrollbar flex min-h-0 w-full flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6"
              >
                <div className="space-y-6">
                  <AstraHero en={en} compact={compact} prompts={prompts} disabled={loading}
                    onPick={(prompt) => handleSend(prompt, true)} />
                  {messages.map(message => (
                    <div className="chat-msg-in" key={message.id}>
                      <MessageBubble message={message} liveContext={live.context} refreshing={live.refreshing} onRefresh={live.refresh} />
                    </div>
                  ))}
                  {loading && (
                    <TypingIndicator label={t('chat.digitando', { defaultValue: en ? 'Generating reply' : 'Gerando resposta' })} />
                  )}
                </div>
              </div>

              {/* Atalhos: no estado vazio ficam dentro do hero */}
              <div className="chat-composer flex min-w-0 flex-col gap-3">
                {compact && prompts.length > 0 && (
                  <div className="custom-scrollbar flex gap-2 overflow-x-auto px-1 pb-3 pt-1">
                    {prompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handleSend(prompt, true)}
                        disabled={loading}
                        className="shrink-0 rounded-full border border-line bg-panel-soft px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={(event) => { event.preventDefault(); handleSend(); }}
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
                    disabled={loading}
                    autoComplete="off"
                    className="min-w-0 flex-1 bg-transparent py-3 pl-4 pr-2 text-[15px] font-medium text-ink outline-none placeholder:text-muted disabled:opacity-60 sm:pl-2"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 sm:px-5"
                  >
                    {t('chat.enviar')} <Send size={16} aria-hidden="true" />
                  </button>
                </form>
              </div>
            </div>

            {activeSection !== 'home' && (
              <button type="button" className="astra-fab" onClick={openChat}>
                <img src="/astra-avatar.png" alt="" />
                {en ? 'Ask Astra' : 'Perguntar à Astra'}
              </button>
            )}
          </main>

          <ProfilePanel en={en} onSelect={setActiveSection} />
        </div>
      </div>
    </div>
  );
}
