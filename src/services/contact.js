import emailjs from '@emailjs/browser';
import profile from '../data/perfil.json';

// These are the existing EmailJS PUBLIC browser settings, never private credentials.
const config = {
  service: import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim(),
  notification: import.meta.env.VITE_EMAILJS_TEMPLATE_ID_FOR_ME?.trim(),
  confirmation: import.meta.env.VITE_EMAILJS_TEMPLATE_ID_FOR_SENDER?.trim(),
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim(),
};
const pending = new Map();
const receipts = new Map();
const TTL = 24 * 60 * 60 * 1000;
const PREFIX = 'portfolio-emailjs-v2:';
let queue = Promise.resolve();
let lastSend = 0;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

function read(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') || receipts.get(key); }
  catch { return receipts.get(key); }
}
function write(key, value) {
  receipts.set(key, value);
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Memory fallback when storage is blocked. */ }
}
function normalize(payload) {
  if (!payload || typeof payload !== 'object' || payload.website) return null;
  const data = {};
  for (const [key, min, max] of [['name', 2, 100], ['email', 3, 254], ['subject', 3, 160], ['message', 10, 5000]]) {
    if (typeof payload[key] !== 'string') return null;
    const value = payload[key].trim();
    if (value.length < min || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)
      || (key !== 'message' && /[\r\n]/.test(value))) return null;
    data[key] = value;
  }
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.email)) return null;
  data.email = data.email.toLowerCase();
  data.lang = payload.lang === 'en' ? 'en' : 'pt';
  return data;
}

async function send(template, params) {
  // Shared across both forms and, with Web Locks, tabs of this browser origin.
  const saved = Number(read(PREFIX + 'last-send')) || 0;
  await wait(Math.max(0, Math.max(lastSend, saved) + 1100 - Date.now()));
  lastSend = Date.now(); write(PREFIX + 'last-send', lastSend);
  let timer;
  try {
    return await Promise.race([
      emailjs.send(config.service, template, params, { publicKey: config.publicKey }),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Delivery unknown')), 15000); }),
    ]);
  } finally {
    clearTimeout(timer);
    lastSend = Date.now(); write(PREFIX + 'last-send', lastSend);
  }
}

async function deliver(data, key, submissionId) {
  let receipt = read(key);
  if (!receipt || receipt.expires <= Date.now()) {
    receipt = { id: submissionId || crypto.randomUUID(), notification: 'pending', confirmation: 'pending', expires: Date.now() + TTL };
  }
  const result = code => ({ code, reference: receipt.id, notificationSent: receipt.notification === 'sent' });
  if (receipt.notification === 'sent' && receipt.confirmation === 'sent') return result('sent');
  // An interrupted tab/timeout might have sent the email. Never blindly resend it.
  if ([receipt.notification, receipt.confirmation].some(state => state === 'sending' || state === 'unknown')) return result('delivery_unknown');
  const rateKey = PREFIX + 'attempts';
  const recent = (read(rateKey) || []).filter(time => Number.isFinite(time) && time > Date.now() - 3600000);
  if (recent.length >= 5) return result('rate_limited');
  write(rateKey, [...recent, Date.now()]);
  const common = {
    name: data.name, email: data.email, subject: data.subject,
    message: (data.lang === 'en' ? 'Subject: ' : 'Assunto: ') + data.subject + '\n\n' + data.message,
    reference: receipt.id,
  };
  for (const kind of ['notification', 'confirmation']) {
    if (receipt[kind] === 'sent') continue;
    receipt[kind] = 'sending'; write(key, receipt);
    try {
      await send(config[kind], { ...common,
        to_email: kind === 'notification' ? profile.email : data.email,
        reply_to: kind === 'notification' ? data.email : profile.email,
      });
      receipt[kind] = 'sent'; write(key, receipt);
    } catch (error) {
      const status = Number(error?.status);
      const rejected = [400, 401, 403, 404, 413, 422, 429, 451].includes(status);
      receipt[kind] = rejected ? 'failed' : 'unknown'; write(key, receipt);
      if (!rejected) return result('delivery_unknown');
      if (kind === 'confirmation') return result('confirmation_failed');
      if (status === 429) return result('rate_limited');
      if ([401, 403, 404].includes(status)) return result('provider_configuration');
      return result('send_failed');
    }
  }
  return result('sent');
}

export async function submitContact(payload) {
  const data = normalize(payload);
  if (!data) return { code: 'validation_error' };
  if (Object.values(config).some(value => !value)) return { code: 'unavailable' };
  if (navigator.onLine === false) return { code: 'network_error' };
  const normalized = JSON.stringify([data.name, data.email, data.subject, data.message]);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalized));
  const key = PREFIX + Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  if (pending.has(key)) return pending.get(key);
  const work = () => deliver(data, key, payload.submissionId);
  const execute = () => navigator.locks?.request
    ? navigator.locks.request('portfolio-emailjs-send', work) : work();
  const request = queue.then(execute, execute);
  queue = request.catch(() => {});
  pending.set(key, request);
  try { return await request; } finally { pending.delete(key); }
}
