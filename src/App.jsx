// src/App.jsx
import { useEffect, useRef, useState, useContext } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import MessageBubble from './components/MessageBubble';
import sendMessage from './services/api';
import { ThemeContext } from './context/ThemeContext';

const FONT_SANS = "Inter, 'Geist Sans', Roboto, system-ui, sans-serif";

// Tokens do design system Alvinegro + Gold
const UI = {
  dark: {
    page: 'bg-[#0A0A0A] text-white',
    grid: 'bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)]',
    chip: 'border-[#2A2A2A] bg-[#1E1E1E]/90 text-zinc-300 hover:border-[#FFD700]/60 hover:text-[#FFD700]',
    bar: 'border-transparent bg-[#1E1E1E] shadow-2xl shadow-black/60',
    ring: 'focus-within:ring-[#FFD700]/40',
    input: 'text-white placeholder:text-zinc-500',
    send: 'bg-[#FFD700] text-[#0A0A0A] hover:bg-[#FFE55C]',
    accentIcon: 'text-[#FFD700]',
    typingAvatar: 'text-[#FFD700]',
    typingBubble: 'border-transparent bg-[#1E1E1E]',
    dot: 'bg-zinc-500',
    focusRing: 'focus-visible:ring-[#FFD700]/60',
  },
  light: {
    page: 'bg-[#F4F4F5] text-[#121212]',
    grid: 'bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)]',
    chip: 'border-[#E5E7EB] bg-white/90 text-[#121212] shadow-sm hover:border-[#D4AF37] hover:text-[#A16207]',
    bar: 'border-2 border-[#0A0A0A] bg-white shadow-xl',
    ring: 'focus-within:ring-[#D4AF37]/50',
    input: 'text-[#121212] placeholder:text-zinc-500',
    send: 'bg-[#D4AF37] text-[#0A0A0A] hover:bg-[#C9A22E]',
    accentIcon: 'text-[#A16207]',
    typingAvatar: 'text-[#A16207]',
    typingBubble: 'border-[#E5E7EB] bg-white shadow-sm',
    dot: 'bg-gray-400',
    focusRing: 'focus-visible:ring-[#D4AF37]/60',
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

  const [messages, setMessages] = useState(() => [{ sender: 'ai', text: t('chat.boasVindas') }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const wasLoading = useRef(false);

  // Rola até a última mensagem. O timeout espera os cards renderizarem; limpar evita efeito tardio.
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return undefined;
    const id = setTimeout(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(id);
  }, [messages, loading]);

  // Devolve o foco ao input quando a resposta chega (não rouba foco na montagem)
  useEffect(() => {
    if (wasLoading.current && !loading) inputRef.current?.focus();
    wasLoading.current = loading;
  }, [loading]);

  // Ao trocar de idioma, reinicia a conversa com a saudação no novo idioma
  useEffect(() => {
    setMessages([{ sender: 'ai', text: t('chat.boasVindas') }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  const handleSend = async (suggestion = input) => {
    const query = suggestion.trim();
    if (!query || loading) return;

    const nextMessages = [...messages, { sender: 'user', text: query }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    try {
      const data = await sendMessage(query, i18n.language, nextMessages);
      setMessages([...nextMessages, {
        sender: 'ai',
        text: data.response || data.error,
        context: data.liveContext,
        lang: i18n.language,
      }]);
    } catch {
      setMessages([...nextMessages, {
        sender: 'ai',
        tone: 'error',
        text: t('chat.erro', {
          defaultValue: 'ERRO: não foi possível processar sua pergunta agora. Tente novamente em instantes.',
        }),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const rawPrompts = t('chat.sugestoes', { returnObjects: true });
  const prompts = Array.isArray(rawPrompts) ? rawPrompts : [];

  return (
    <div
      className={`relative flex min-h-screen flex-col overflow-hidden transition-colors duration-300 ${ui.page}`}
      style={{ fontFamily: FONT_SANS }}
    >
      <style>{MOTION_CSS}</style>

      {/* Fundo decorativo */}
      <div
        aria-hidden="true"
        className={`absolute left-0 top-0 h-[200%] w-[200%] -translate-x-1/4 -translate-y-1/4 rotate-[35deg] bg-[size:6rem_6rem] opacity-40 ${ui.grid}`}
      />

      <div className="relative z-10 flex h-screen flex-col">
        <Navbar />

        <main
          ref={messagesContainerRef}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          className="no-scrollbar mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col gap-6 overflow-y-auto px-4 py-8 pb-48 sm:px-8"
        >
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div className="chat-msg-in" key={`${message.sender}-${index}`}>
                <MessageBubble message={message} />
              </div>
            ))}
            {loading && (
              <TypingIndicator
                ui={ui}
                label={t('chat.digitando', { defaultValue: 'Gerando resposta' })}
              />
            )}
          </div>
        </main>

        {/* Prompts sugeridos e barra de envio */}
        <div className="fixed bottom-6 left-1/2 z-20 flex w-[95%] max-w-4xl -translate-x-1/2 flex-col gap-3 sm:bottom-8">
          {prompts.length > 0 && (
            <div className="custom-scrollbar flex gap-2 overflow-x-auto px-1 pb-3 pt-1">
              {prompts.map((prompt, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSend(prompt)}
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
            className={`flex items-center gap-3 rounded-full p-2 transition-all duration-300 focus-within:ring-2 ${ui.bar} ${ui.ring}`}
          >
            <div className={`pl-4 ${ui.accentIcon}`} aria-hidden="true">
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
              className={`min-w-0 flex-1 bg-transparent px-2 py-3 text-[15px] font-medium outline-none disabled:opacity-60 ${ui.input}`}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all sm:px-8 disabled:cursor-not-allowed disabled:opacity-50 ${ui.send} ${ui.focusRing} focus-visible:outline-none focus-visible:ring-2`}
            >
              {t('chat.enviar')} <Send size={16} aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}