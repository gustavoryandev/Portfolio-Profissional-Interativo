import React, { useId, useRef, useState } from 'react';
import { CheckCircle, LoaderCircle, Mail, Send } from 'lucide-react';
import { submitContact } from '../services/contact.js';

const copy = {
  en: {
    title: 'Send me an email', name: 'Your name', email: 'Your email', subject: 'Subject', message: 'Message',
    send: 'Send message', sending: 'Sending…', retry: 'Try again',
    sent: 'Your message was sent and a confirmation email is on its way. Please check your inbox and spam folder.',
    note: 'You will receive an email confirming receipt of your message.',
    validation_error: 'Check the fields: name (2–100 characters), subject (3–160), message (10–5,000), and a valid email address.',
    error: 'We could not complete your submission. Your message is preserved. Please try again later.',
    confirmation_failed: 'Your message was sent to Gustavo, but the confirmation email failed. Try again to send only the confirmation.',
    delivery_unknown: 'We could not verify email delivery. Please check your inbox or contact Gustavo directly with the reference below. Resending is disabled to prevent duplicates.',
    rate_limited: 'Too many attempts. Please wait before trying again (up to one hour).',
    in_progress: 'This message is already being processed. Wait a few seconds, then try again to check its status.',
    unavailable: 'Email configuration is unavailable. Please contact Gustavo directly by email.',
    provider_configuration: 'EmailJS could not authorize this submission. Please contact Gustavo directly by email.',
    network_error: 'You appear to be offline. Your message is preserved; reconnect and try again.',
    reference: 'Reference',
  },
  pt: {
    title: 'Envie um e-mail', name: 'Seu nome', email: 'Seu e-mail', subject: 'Assunto', message: 'Mensagem',
    send: 'Enviar mensagem', sending: 'Enviando…', retry: 'Tentar novamente',
    sent: 'Sua mensagem foi enviada e um e-mail de confirmação está a caminho. Confira sua caixa de entrada e spam.',
    note: 'Você receberá um e-mail confirmando o recebimento da mensagem.',
    validation_error: 'Confira os campos: nome (2–100 caracteres), assunto (3–160), mensagem (10–5.000) e um e-mail válido.',
    error: 'Não foi possível concluir o envio. Sua mensagem foi preservada. Tente novamente mais tarde.',
    confirmation_failed: 'Sua mensagem foi enviada ao Gustavo, mas a confirmação falhou. Tente novamente para enviar apenas a confirmação.',
    delivery_unknown: 'Não foi possível verificar a entrega. Confira sua caixa de entrada ou fale diretamente com Gustavo usando a referência abaixo. O reenvio foi desativado para evitar duplicatas.',
    rate_limited: 'Muitas tentativas. Aguarde antes de tentar novamente (até uma hora).',
    in_progress: 'Esta mensagem já está sendo processada. Aguarde alguns segundos e tente novamente para verificar o status.',
    unavailable: 'A configuração de e-mail está indisponível. Entre em contato diretamente por e-mail.',
    provider_configuration: 'O EmailJS não autorizou o envio. Entre em contato diretamente por e-mail.',
    network_error: 'Você parece estar sem conexão. Sua mensagem foi preservada; reconecte e tente novamente.',
    reference: 'Referência',
  },
};
const empty = { name: '', email: '', subject: '', message: '', website: '' };

export default function ContactSection({ lang = 'pt', variant = 'chat' }) {
  const language = lang.startsWith('en') ? 'en' : 'pt';
  const t = copy[language];
  const id = useId();
  const [fields, setFields] = useState(empty);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const busy = useRef(false);
  const submission = useRef(null);
  const statusRef = useRef(null);
  const locked = status === 'loading' || status === 'sent' || ['delivery_unknown', 'confirmation_failed'].includes(result?.code);

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy.current || status === 'sent' || result?.code === 'delivery_unknown') return;
    const values = Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, value.trim()]));
    if (values.name.length < 2 || values.subject.length < 3 || values.message.length < 10) {
      setResult({ code: 'validation_error' }); setStatus('error'); return;
    }
    const payload = result?.code === 'confirmation_failed' && submission.current
      ? submission.current.payload : JSON.stringify({ ...values, lang: language });
    if (!submission.current || submission.current.payload !== payload) submission.current = { payload, id: crypto.randomUUID() };
    busy.current = true; setStatus('loading'); setResult(null);
    try {
      const response = await submitContact({ ...JSON.parse(submission.current.payload), submissionId: submission.current.id });
      setResult(response); setStatus(response.code === 'sent' ? 'sent' : 'error');
    } catch { setResult({ code: 'network_error' }); setStatus('error'); }
    finally { busy.current = false; requestAnimationFrame(() => statusRef.current?.focus()); }
  }

  return <form onSubmit={handleSubmit} aria-labelledby={`${id}-title`} aria-busy={status === 'loading'}
    className={`portfolio-card contact-card card-surface mt-2 w-full min-w-0 p-5 sm:p-6 ${variant === 'chat' ? 'max-w-md' : ''}`}>
    <div className="mb-4 flex items-center gap-3"><Mail size={24} className="shrink-0 text-brand-400" aria-hidden="true" />
      <h3 id={`${id}-title`} className="card-heading">{t.title}</h3></div>
    <p className="mb-4 text-sm text-[var(--muted)]">{t.note}</p>
    <fieldset disabled={locked} className="min-w-0 space-y-4">
      {['name', 'email', 'subject', 'message'].map(key => {
        const props = { id: `${id}-${key}`, name: key, required: true, value: fields[key],
          minLength: key === 'name' ? 2 : key === 'subject' ? 3 : key === 'message' ? 10 : undefined,
          maxLength: { name: 100, email: 254, subject: 160, message: 5000 }[key],
          onChange: event => setFields(previous => ({ ...previous, [key]: event.target.value })),
          className: 'mt-1 w-full rounded-xl border border-[var(--line)] bg-[var(--panel-soft)] p-3 text-[var(--ink)] outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:opacity-70',
        };
        return <div key={key}><label htmlFor={props.id} className="text-sm font-medium">{t[key]}</label>
          {key === 'message' ? <textarea {...props} rows={5} />
            : <input {...props} type={key === 'email' ? 'email' : 'text'} autoComplete={key === 'subject' ? 'off' : key} />}</div>;
      })}
      <div className="hidden" aria-hidden="true"><label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" value={fields.website}
          onChange={event => setFields(previous => ({ ...previous, website: event.target.value }))} /></div>
    </fieldset>
    <div ref={statusRef} tabIndex={-1} role={status === 'error' ? 'alert' : 'status'} aria-live="polite" className="mt-4 break-words text-sm outline-none">
      {status === 'sent' && <CheckCircle className="mb-2 text-brand-400" aria-hidden="true" />}
      {status === 'loading' ? t.sending : status === 'sent' ? t.sent : status === 'error' ? t[result?.code] || t.error : ''}
      {result?.reference && <p className="mt-2 break-all">{t.reference}: {result.reference}</p>}
    </div>
    {status !== 'sent' && result?.code !== 'delivery_unknown' && <button type="submit" disabled={status === 'loading'}
      className="contact-submit mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 disabled:cursor-wait disabled:opacity-60">
      {status === 'loading' ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
      {status === 'loading' ? t.sending : status === 'error' ? t.retry : t.send}</button>}
  </form>;
}
