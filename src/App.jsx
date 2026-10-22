import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MessageBubble from './components/MessageBubble';
import sendMessage from './services/api';

export default function App() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: t('chat.boasVindas')
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: query }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const data = await sendMessage(query, i18n.language, newMessages);
      setMessages([...newMessages, { sender: 'ai', text: data.response }]);
    } catch (error) {
      setMessages([
        ...newMessages,
        { sender: 'ai', text: 'Desculpe, ocorreu um erro ao processar sua pergunta.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100">
      <Sidebar onSelectSuggestion={(sug) => handleSend(sug)} />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-4 max-w-4xl w-full mx-auto space-y-4">
          {messages.map((msg, index) => (
            <MessageBubble key={index} message={msg} />
          ))}
          {loading && (
            <div className="text-sm text-neutral-500 dark:text-neutral-400 animate-pulse">
              {t('chat.pensando')}
            </div>
          )}
        </main>

        <footer className="p-4 border-t border-neutral-200 dark:border-neutral-800 max-w-4xl w-full mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('chat.placeholder')}
              className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {t('chat.enviar')}
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}