import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
dotenv.config({ path: '.env.local', quiet: true });
const profile = JSON.parse(readFileSync(new URL('../src/data/perfil.json', import.meta.url), 'utf8'));

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const fail = (status, code) => res.status(status).json({ code });
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return fail(405, 'validation_error'); }
  const env = process.env;
  const hosts = (env.RECAPTCHA_ALLOWED_HOSTNAMES || '').split(',').map(s => s.trim()).filter(Boolean);
  const threshold = Number(env.RECAPTCHA_MIN_SCORE || '0.5');
  const service = env.EMAILJS_SERVICE_ID;
  const publicKey = env.EMAILJS_PUBLIC_KEY;
  const privateKey = env.EMAILJS_PRIVATE_KEY;
  if (!env.RECAPTCHA_SECRET_KEY || !hosts.length || !service || !publicKey || !privateKey || !env.EMAILJS_TEMPLATE_ID_FOR_ME || !env.EMAILJS_TEMPLATE_ID_FOR_SENDER || !Number.isFinite(threshold) || threshold < 0 || threshold > 1) return fail(503, 'unavailable');
  let data = req.body;
  try { if (typeof data === 'string') data = JSON.parse(data); } catch { return fail(400, 'validation_error'); }
  if (!data || data.website || !['notification', 'confirmation'].includes(data.kind)) return fail(400, 'validation_error');
  for (const [key, min, max] of [['name', 2, 100], ['email', 3, 254], ['subject', 3, 160], ['message', 10, 5200], ['reference', 1, 100]]) {
    if (typeof data[key] !== 'string' || data[key].trim().length < min || data[key].length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(data[key]) || (key !== 'message' && /[\r\n]/.test(data[key]))) return fail(400, 'validation_error');
  }
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.email)) return fail(400, 'validation_error');
  const token = data['g-recaptcha-response'];
  if (typeof token !== 'string' || !token.trim() || token.length > 10000) return fail(403, 'captcha_failed');
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST', body: new URLSearchParams({ secret: env.RECAPTCHA_SECRET_KEY, response: token }), signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return fail(403, 'captcha_failed');
    const check = await response.json();
    const age = Date.now() - Date.parse(check.challenge_ts);
    if (check.success !== true || check.action !== 'contact' || typeof check.score !== 'number' || !Number.isFinite(check.score) || check.score < threshold || !hosts.includes(check.hostname) || !Number.isFinite(age) || age < -10000 || age > 120000) return fail(403, 'captcha_failed');
  } catch { return fail(403, 'captcha_failed'); }
  try {
    const notification = data.kind === 'notification';
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(10000),
      body: JSON.stringify({ service_id: service, template_id: notification ? env.EMAILJS_TEMPLATE_ID_FOR_ME : env.EMAILJS_TEMPLATE_ID_FOR_SENDER,
        user_id: publicKey, accessToken: privateKey,
        template_params: { name: data.name, email: data.email, subject: data.subject, message: data.message, reference: data.reference,
          to_email: notification ? profile.email : data.email, reply_to: notification ? data.email : profile.email } }),
    });
    if (!response.ok) return fail(response.status >= 400 && response.status < 500 ? response.status : 502, 'send_failed');
    return res.status(200).json({ code: 'sent' });
  } catch { return fail(502, 'delivery_unknown'); }
}
