import { EdgeTTS } from '@andresaya/edge-tts';

const VOICES = { pt: 'pt-BR-FranciscaNeural', en: 'en-US-AriaNeural' };

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
  catch { return res.status(400).json({ error: 'Invalid JSON.' }); }
  if (!body || typeof body.text !== 'string' || !body.text.trim() || !Object.hasOwn(VOICES, body.lang)) {
    return res.status(400).json({ error: 'Expected text and lang (pt or en).' });
  }
  if (body.text.length > 5000) return res.status(413).json({ error: 'Text exceeds 5000 characters.' });

  const signal = AbortSignal.timeout(20000);
  try {
    const text = body.text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ').trim();
    // The client escapes XML internally and closes its socket on completion/abort.
    const { audio } = await new EdgeTTS().generate(text, VOICES[body.lang], {
      outputFormat: 'audio-24khz-96kbitrate-mono-mp3',
      signal,
      timeout: 15000,
    });
    if (!audio.length) throw new Error('Empty audio');
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audio.length);
    res.setHeader('Content-Disposition', 'inline; filename="speech.mp3"');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.status(200).send(audio);
  } catch (error) {
  console.error('[TTS] Falha na síntese:', {
    name: error?.name,
    message: error?.message,
    code: error?.code,
    timedOut: signal.aborted,
  });

  return res.status(signal.aborted ? 504 : 502).json({
    error: 'Voice synthesis unavailable. Please try again.',
  });
}
}
