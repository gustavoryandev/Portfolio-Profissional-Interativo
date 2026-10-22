import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import MessageBubble from './components/MessageBubble';
import sendMessage from './services/api';

export default function App() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([{ sender: 'ai', text: t('chat.boasVindas') }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // CORREÇÃO APLICADA: 't' removido das dependências para não resetar o chat a cada re-render do React.
  // Agora o chat só reseta/atualiza a mensagem de boas vindas se o IDIOMA (i18n.language) for alterado manualmente.
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
        context: data.liveContext // <-- ADICIONADO: Guardando dados reais na mensagem
      }]);
    } catch {
      setMessages([...nextMessages, {
        sender: 'ai',
        tone: 'error',
        text: 'ERRO: não foi possível processar sua pergunta agora. Tente novamente em instantes.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const prompts = t('chat.sugestoes', { returnObjects: true });

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-zinc-300">
      <Navbar />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 overflow-y-auto px-4 py-8 sm:px-8">
        <div className="space-y-6">
          {messages.map((message, index) => <MessageBubble key={`${message.sender}-${index}`} message={message} />)}
          {loading && (
            <div className="flex items-center gap-3 font-mono text-sm text-amber-400">
              <Sparkles size={16} />{t('chat.pensando')}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>
      
      <footer className="border-t border-zinc-800 bg-zinc-950/95 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {prompts.map((prompt) => (
              <button 
                key={prompt} 
                type="button" 
                onClick={() => handleSend(prompt)} 
                className="shrink-0 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs text-zinc-400 transition hover:border-amber-500/40 hover:text-amber-400"
              >
                {prompt}
              </button>
            ))}
          </div>
          <form onSubmit={(event) => { event.preventDefault(); handleSend(); }} className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-2 focus-within:border-amber-500/40">
            <input 
              value={input} 
              onChange={(event) => setInput(event.target.value)} 
              placeholder={t('chat.placeholder') || "✦ Digite uma pergunta sobre o Gustavo..."} 
              disabled={loading} 
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600" 
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()} 
              className="rounded-xl bg-amber-500 p-3 text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}