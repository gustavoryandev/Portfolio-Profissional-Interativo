// src/App.jsx
import { useEffect, useRef, useState, useContext } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProfilePanel from './components/ProfilePanel';
import PortfolioSection from './components/PortfolioSection';
import MessageBubble from './components/MessageBubble';
import sendMessage from './services/api';
import { ThemeContext } from './context/ThemeContext';
import useLiveContext from './hooks/useLiveContext';
import { sourcesForText } from './services/liveContext';

const FONT_SANS = "Inter, 'Geist Sans', Roboto, system-ui, sans-serif";

// Tokens do design system Alvinegro + Azul
const UI = {
  dark: {
    page: 'bg-[#0A0A0A] text-white',
    grid: 'bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)]',
    chip: 'border-[#2A2A2A] bg-[#1E1E1E]/90 text-zinc-300 hover:border-brand-400/60 hover:text-brand-400',
    bar: 'border-transparent bg-[#1E1E1E] shadow-2xl shadow-black/60',
    ring: 'focus-within:ring-brand-400/40',
    input: 'text-white placeholder:text-zinc-500',
    send: 'bg-brand-400 text-[#0A0A0A] hover:bg-[#60A5FA]',
    accentIcon: 'text-brand-400',
    typingAvatar: 'text-brand-400',
    typingBubble: 'border-transparent bg-[#1E1E1E]',
    dot: 'bg-zinc-500',
    focusRing: 'focus-visible:ring-brand-400/60',
  },
  light: {
    page: 'bg-[#F4F4F5] text-[#121212]',
    grid: 'bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)]',
    chip: 'border-[#E5E7EB] bg-white/90 text-[#121212] shadow-sm hover:border-[#0D6EFD] hover:text-[#1d4ed8]',
    bar: 'border-2 border-[#0A0A0A] bg-white shadow-xl',
    ring: 'focus-within:ring-[#0D6EFD]/50',
    input: 'text-[#121212] placeholder:text-zinc-500',
    send: 'bg-[#0D6EFD] text-[#0A0A0A] hover:bg-[#2563eb]',
    accentIcon: 'text-[#1d4ed8]',
    typingAvatar: 'text-[#1d4ed8]',
    typingBubble: 'border-[#E5E7EB] bg-white shadow-sm',
    dot: 'bg-gray-400',
    focusRing: 'focus-visible:ring-[#0D6EFD]/60',
  },
};

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

// Indicador de digitação (anunciado como status para leitores de tela)
function TypingIndicator({ ui, label }) {
  return (
    <div className="flex w-full justify-start" role="status" aria-label={label}>
      <div className="flex max-w-[90%] items-start gap-4">
        <div className="mt-2 flex h-12 w-12 shrink-0 items-center justify-center" aria-hidden="true">
          <Sparkles className={`h-7 w-7 animate-spin-slow ${ui.typingAvatar}`} />
        </div>
        <div className={`flex items-center gap-2 rounded-[2rem] rounded-tl-sm border px-7 py-6 ${ui.typingBubble}`}>
          {[0, 0.2, 0.4].map((delay) => (
            <span
              key={delay}
              className={`h-2 w-2 animate-bounce rounded-full ${ui.dot}`}
              style={{ animationDelay: `${delay}s` }}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { t, i18n } = useTranslation();
  const { darkMode } = useContext(ThemeContext);
  const ui = darkMode ? UI.dark : UI.light;

  const [messages, setMessages] = useState(() => [{ id: 'welcome', sender: 'ai', text: t('chat.boasVindas'), translationKey: 'chat.boasVindas' }]);
  const [input, setInput] = useState('');
  const [activeSection, setActiveSection] = useState('home');
  const en = i18n.language.startsWith('en');
  const [loading, setLoading] = useState(false);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const wasLoading = useRef(false);
  const idCounter = useRef(0);
  const messagesRef = useRef(messages);
  const sendingRef = useRef(false);
  const conversationRef = useRef({ chatContext: null, model: null });
  const live = useLiveContext();

  const nextId = () => `msg-${++idCounter.current}`;

  // Rola até a última mensagem. O timeout espera os cards renderizarem; limpar evita efeito tardio.
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return undefined;
    const id = setTimeout(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(id);
  }, [messages.length, loading]);

  // Devolve o foco ao input quando a resposta chega (não rouba foco na montagem)
  useEffect(() => {
    if (wasLoading.current && !loading) inputRef.current?.focus();
    wasLoading.current = loading;
  }, [loading]);


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
      className={`portfolio-app relative flex min-h-screen flex-col overflow-hidden transition-colors duration-300 ${ui.page}`}
      style={{ fontFamily: FONT_SANS }}
    >
      <style>{MOTION_CSS}</style>

      {/* Fundo decorativo */}
      <div
        aria-hidden="true"
        className={`absolute left-0 top-0 h-[200%] w-[200%] -translate-x-1/4 -translate-y-1/4 rotate-[35deg] bg-[size:6rem_6rem] opacity-40 ${ui.grid}`}
      />

      <div className="app-frame relative z-10 flex flex-col">
        <Navbar />
        <div className="workspace">
          <Sidebar active={activeSection} onSelect={setActiveSection} en={en} />
          <div className="center-panel">
          {activeSection !== 'home' && <PortfolioSection active={activeSection} en={en} />}
          <div className="chat-view" hidden={activeSection !== 'home'}>
          <div className="chat-heading"><div><Sparkles size={18} /><h2>{en ? 'Talk to Astra' : 'Converse com a Astra'}</h2></div><span>{en ? 'AI assistant' : 'Assistente de IA'}</span></div>

        <main
          ref={messagesContainerRef}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          className="chat-messages custom-scrollbar flex min-h-0 w-full flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6"
        >
          <div className="space-y-6">
            {messages.map(message => (
              <div className="chat-msg-in" key={message.id}>
                <MessageBubble message={message} liveContext={live.context} refreshing={live.refreshing} onRefresh={live.refresh} />
              </div>
            ))}
            {loading && (
              <TypingIndicator
                ui={ui}
                label={t('chat.digitando', { defaultValue: en ? 'Generating reply' : 'Gerando resposta' })}
              />
            )}
          </div>
        </main>

        {/* Prompts sugeridos e barra de envio */}
        <div className="chat-composer flex min-w-0 flex-col gap-3">
          {prompts.length > 0 && (
            <div className="custom-scrollbar flex gap-2 overflow-x-auto px-1 pb-3 pt-1">
              {prompts.map((prompt, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSend(prompt, true)}
                  disabled={loading}
                  className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium backdrop-blur-md transition-colors disabled:opacity-50 ${ui.chip} ${ui.focusRing} focus-visible:outline-none focus-visible:ring-2`}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(event) => { event.preventDefault(); handleSend(); }}
            className={`flex items-center gap-2 rounded-xl p-2 transition-all duration-300 focus-within:ring-2 sm:gap-3 ${ui.bar} ${ui.ring}`}
          >
            <div className={`hidden pl-4 sm:block ${ui.accentIcon}`} aria-hidden="true">
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
              className={`min-w-0 flex-1 bg-transparent py-3 pl-4 pr-2 text-[15px] font-medium outline-none sm:pl-2 disabled:opacity-60 ${ui.input}`}
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-3 text-sm font-bold transition-all sm:px-5 disabled:cursor-not-allowed disabled:opacity-50 ${ui.send} ${ui.focusRing} focus-visible:outline-none focus-visible:ring-2`}
            >
              {t('chat.enviar')} <Send size={16} aria-hidden="true" />
            </button>
          </form>        </div>
          </div>
          </div>
          <ProfilePanel en={en} onSelect={setActiveSection} />
        </div>
      </div>
    </div>
  );
}