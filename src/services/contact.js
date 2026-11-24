
const config = { captchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim() };
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

async function send(kind, params) {
  // Shared across both forms and, with Web Locks, tabs of this browser origin.
  const saved = Number(read(PREFIX + 'last-send')) || 0;
  await wait(Math.max(0, Math.max(lastSend, saved) + 1100 - Date.now()));
  lastSend = Date.now(); write(PREFIX + 'last-send', lastSend);
  let timer;
  try {
    return await Promise.race([
      fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind, ...params }) }).then(async response => { if (!response.ok) throw { status: response.status, code: (await response.json()).code }; }),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Delivery unknown')), 25000); }),
    ]);
  } finally {
    clearTimeout(timer);
    lastSend = Date.now(); write(PREFIX + 'last-send', lastSend);
  }
}

async function deliver(data, key, submissionId, getCaptchaToken) {
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
  if (recent.some(time => time > Date.now() - 60000)) return result('rate_limited');
  write(rateKey, [...recent, Date.now()]);
  const common = {
    name: data.name, email: data.email, subject: data.subject,
    message: (data.lang === 'en' ? 'Subject: ' : 'Assunto: ') + data.subject + '\n\n' + data.message,
    reference: receipt.id,
  };
  for (const kind of ['notification', 'confirmation']) {
    if (receipt[kind] === 'sent') continue;
    let captchaToken;
    try {
      captchaToken = await getCaptchaToken();
      if (typeof captchaToken !== 'string' || !captchaToken.trim()) throw new Error('Missing CAPTCHA');
    } catch { return result('captcha_failed'); }
    receipt[kind] = 'sending'; write(key, receipt);
    try {
      await send(kind, { ...common,
        'g-recaptcha-response': captchaToken,
      });
      receipt[kind] = 'sent'; write(key, receipt);
    } catch (error) {
      const status = Number(error?.status);
      if (['captcha_failed', 'unavailable'].includes(error?.code)) { receipt[kind] = 'failed'; write(key, receipt); return result(error.code); }
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

export async function submitContact(payload, { getCaptchaToken } = {}) {
  const data = normalize(payload);
  if (!data) return { code: 'validation_error' };
  if (Object.values(config).some(value => !value)) return { code: 'unavailable' };
  if (typeof getCaptchaToken !== 'function') return { code: 'captcha_failed' };
  if (navigator.onLine === false) return { code: 'network_error' };
  const normalized = JSON.stringify([data.name, data.email, data.subject, data.message]);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalized));
  const key = PREFIX + Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  if (pending.has(key)) return pending.get(key);
  const work = () => deliver(data, key, payload.submissionId, getCaptchaToken);
  const execute = () => navigator.locks?.request
    ? navigator.locks.request('portfolio-emailjs-send', work) : work();
  const request = queue.then(execute, execute);
  queue = request.catch(() => {});
  pending.set(key, request);
  try { return await request; } finally { pending.delete(key); }
}
