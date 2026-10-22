import React, { useState } from 'react';
import { CheckCircle, Mail, Send } from 'lucide-react';

// Dicionário local para evitar quebra caso o contexto falhe
const translations = {
  pt: {
    contact_title: 'Fale Comigo',
    contact_name: 'Seu Nome',
    contact_email: 'Seu E-mail',
    contact_msg: 'Sua Mensagem...',
    contact_send: 'Enviar Mensagem',
    contact_success: 'Mensagem enviada com sucesso! Entrarei em contato em breve.'
  },
  en: {
    contact_title: 'Contact Me',
    contact_name: 'Your Name',
    contact_email: 'Your Email',
    contact_msg: 'Your Message...',
    contact_send: 'Send Message',
    contact_success: 'Message sent successfully! I will get back to you soon.'
  }
};

// Recebendo lang por props com fallback para 'pt'
const ContactSection = ({ lang = 'pt' }) => {
  const t = translations[lang] || translations.pt;
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // No projeto real, você integrará o EmailJS aqui usando as chaves import.meta.env.*
    setTimeout(() => setSubmitted(true), 1000);
  };

  if (submitted) {
    return (
      <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-6 rounded-2xl shadow-lg w-full max-w-md mt-2 flex flex-col items-center text-center border border-green-200 dark:border-green-800 transition-all duration-300">
        <CheckCircle size={48} className="mb-4 text-green-500" />
        <h3 className="text-xl font-bold mb-2">Sucesso!</h3>
        <p>{t.contact_success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-xl w-full max-w-md mt-2 border border-neutral-200 dark:border-neutral-700 transition-all duration-300">
      <div className="flex items-center gap-3 mb-4 text-neutral-900 dark:text-white">
        <Mail size={24} className="text-blue-500" />
        <h3 className="font-bold text-lg">{t.contact_title}</h3>
      </div>
      <div className="space-y-4">
        <input 
          required 
          type="text" 
          placeholder={t.contact_name} 
          className="w-full p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border-none outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white transition-all" 
        />
        <input 
          required 
          type="email" 
          placeholder={t.contact_email} 
          className="w-full p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border-none outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white transition-all" 
        />
        <textarea 
          required 
          rows="3" 
          placeholder={t.contact_msg} 
          className="w-full p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border-none outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white transition-all resize-none"
        ></textarea>
        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
        >
          <Send size={18} /> {t.contact_send}
        </button>
      </div>
    </form>
  );
};

export default ContactSection;