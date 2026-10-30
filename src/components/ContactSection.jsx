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
      <div className="portfolio-card contact-card card-surface mt-2 flex w-full max-w-md flex-col items-center p-6 text-center">
        <CheckCircle size={48} className="mb-4 text-brand-400" />
        <h3 className="text-xl font-bold mb-2">Sucesso!</h3>
        <p>{t.contact_success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="portfolio-card contact-card card-surface mt-2 w-full max-w-md p-6">
      <div className="flex items-center gap-3 mb-4 text-neutral-900 dark:text-white">
        <Mail size={24} className="text-blue-500" />
        <h3 className="card-heading">{t.contact_title}</h3>
      </div>
      <div className="space-y-4">
        <input
          required
          type="text"
          placeholder={t.contact_name} aria-label={t.contact_name}
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--panel-soft)] p-3 text-[var(--ink)] outline-none transition-all focus:border-brand-500/60"
        />
        <input
          required
          type="email"
          placeholder={t.contact_email} aria-label={t.contact_email}
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--panel-soft)] p-3 text-[var(--ink)] outline-none transition-all focus:border-brand-500/60"
        />
        <textarea
          required
          rows="3"
          placeholder={t.contact_msg} aria-label={t.contact_msg}
          className="w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--panel-soft)] p-3 text-[var(--ink)] outline-none transition-all focus:border-brand-500/60"
        ></textarea>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-lg shadow-brand-500/20 transition-colors hover:bg-blue-500"
        >
          <Send size={18} /> {t.contact_send}
        </button>
      </div>
    </form>
  );
};

export default ContactSection;
