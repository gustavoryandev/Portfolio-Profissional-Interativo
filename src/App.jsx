import { useEffect, useRef, useState, useContext } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import MessageBubble from './components/MessageBubble';
import sendMessage from './services/api';
import { ThemeContext } from './context/ThemeContext';

export default function App() {
  const { t, i18n } = useTranslation();
  const { darkMode } = useContext(ThemeContext);
  const [messages, setMessages] = useState([{ sender: 'ai', text: t('chat.boasVindas') }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesContainerRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !shouldAutoScrollRef.current) return undefined;

    const frame = requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [messages, loading]);

  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldAutoScrollRef.current = distanceFromBottom < 96;
  };

  useEffect(() => {
    setMessages([{ sender: 'ai', text: t('chat.boasVindas') }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  const handleSend = async (suggestion = input) => {
    const query = suggestion.trim();
    if (!query || loading) return;

    const nextMessages = [...messages, { sender: 'user', text: query }];
    shouldAutoScrollRef.current = true;
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    try {
      const data = await sendMessage(query, i18n.language, nextMessages);
      setMessages([...nextMessages, {
        sender: 'ai',
        text: data.response || data.error,
        context: data.liveContext,
        lang: i18n.language
      }]);
    } catch (error) {
      setMessages([...nextMessages, {
        sender: 'ai',
        tone: 'error',
        text: `ERRO: ${error.message || 'não foi possível processar sua pergunta agora. Tente novamente em instantes.'}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const prompts = t('chat.sugestoes', { returnObjects: true });

  return (
    <div className={`flex min-h-screen flex-col transition-colors duration-300 relative overflow-hidden ${darkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
      {/* Background Decorativo */}
      <div className={`absolute top-0 left-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 rotate-[35deg] opacity-40 ${darkMode ? 'bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)]' : 'bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)]'} bg-[size:6rem_6rem]`}></div>

      <div className="relative z-10 flex flex-col h-screen">
        <Navbar />
        <main
          ref={messagesContainerRef}
          onScroll={handleMessagesScroll}
          className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col gap-6 overflow-y-auto px-4 py-8 pb-48 no-scrollbar sm:px-8"
        >
          <div className="space-y-6">
            {messages.map((message, index) => <MessageBubble key={`${message.sender}-${index}`} message={message} />)}
            {loading && (
              <div className="flex justify-start w-full">
                <div className="flex gap-4 max-w-[90%]">
                  <div className={`w-12 h-12 rounded-full flex shrink-0 items-center justify-center mt-2 bg-transparent text-amber-500`}>
                    <Sparkles className="w-7 h-7 animate-spin-slow" />
                  </div>
                  <div className={`px-7 py-6 rounded-[2rem] rounded-tl-sm flex gap-2 items-center border ${darkMode ? 'bg-[#141414] border-[#2a2a2a]' : 'bg-white border-gray-100 shadow-sm'}`}>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-gray-500' : 'bg-gray-400'}`}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-gray-500' : 'bg-gray-400'}`} style={{ animationDelay: '0.2s' }}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-gray-500' : 'bg-gray-400'}`} style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Input Bar e Prompts Flutuantes */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-20 flex flex-col gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSend(prompt)}
                className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${darkMode ? 'border-zinc-700 bg-[#0a0a0a]/80 text-zinc-400 hover:border-amber-500/40 hover:text-amber-400 backdrop-blur-md' : 'border-gray-200 bg-white/80 text-gray-600 hover:border-amber-500/40 hover:text-amber-600 shadow-sm backdrop-blur-md'}`}
              >
                {prompt}
              </button>
            ))}
          </div>
          <form onSubmit={(event) => { event.preventDefault(); handleSend(); }} className={`flex items-center gap-3 rounded-full border shadow-2xl p-2 transition-colors duration-300 ${darkMode ? 'bg-[#0a0a0a] border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.05)]' : 'bg-white border-amber-500 shadow-xl'}`}>
            <div className="pl-4 text-amber-500">
              <Sparkles size={20} />
            </div>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t('chat.placeholder') || "Digite uma pergunta sobre o Gustavo..."}
              disabled={loading}
              className={`min-w-0 flex-1 bg-transparent px-2 py-3 text-[15px] font-medium outline-none transition-colors ${darkMode ? 'text-white placeholder-zinc-500' : 'text-black placeholder-zinc-400'}`}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex items-center gap-2 rounded-full bg-amber-500 px-8 py-3.5 text-sm font-bold text-zinc-950 transition-all hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('chat.enviar')} <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}