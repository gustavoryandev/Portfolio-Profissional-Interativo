// src/hooks/useVoice.js
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  SpeechRecognitionCtor,
  getActiveSpeechId,
  isRecognitionSupported,
  stopSpeaking,
  subscribeSpeech,
  toSpeechLocale,
} from '../services/speech';

// Id da mensagem que está sendo lida em voz alta (null se nenhuma)
export function useActiveSpeechId() {
  return useSyncExternalStore(subscribeSpeech, getActiveSpeechId, getActiveSpeechId);
}

// Erros do SpeechRecognition -> códigos da UI.
// "not-allowed" fica fora desta tabela de propósito: pode ser permissão negada,
// bloqueio do sistema operacional ou bloqueio do serviço. Ele é diferenciado por probeMicrophone().
const RECOGNITION_ERROR = {
  'service-not-allowed': 'service',
  'audio-capture': 'noMic',
  'no-speech': 'noSpeech',
  network: 'network',
};

// Erros do getUserMedia -> códigos da UI
function classifyMediaError(err) {
  switch (err?.name) {
    case 'NotAllowedError':
      // O Chrome informa "Permission denied by system" quando o sistema operacional bloqueia o navegador
      return /system/i.test(err.message || '') ? 'system' : 'denied';
    case 'SecurityError':
      return 'insecure';
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'noMic';
    case 'NotReadableError':
    case 'AbortError':
      return 'busy';
    default:
      return 'generic';
  }
}

// Estado da permissão do site ('granted' | 'prompt' | 'denied') ou null se não puder consultar
async function queryMicPermission() {
  try {
    const status = await navigator.permissions.query({ name: 'microphone' });
    return status.state;
  } catch {
    return null;
  }
}

// Abre o microfone uma vez: dispara o prompt se necessário, confirma que há um dispositivo
// e devolve um erro específico quando não há. O stream é fechado logo em seguida.
async function probeMicrophone() {
  if (!navigator.mediaDevices?.getUserMedia) return { ok: true };
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return { ok: true };
  } catch (err) {
    console.warn('[voz] getUserMedia falhou:', err?.name, err?.message);
    return { ok: false, error: classifyMediaError(err) };
  }
}

export function useSpeechRecognition({ lang, onFinal }) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const startingRef = useRef(false);
  const finalTextRef = useRef('');
  const onFinalRef = useRef(onFinal);

  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  // Cancela sem enviar nada (envio por texto, troca de idioma, desmontagem)
  const abort = useCallback(() => {
    const rec = recognitionRef.current;
    recognitionRef.current = null;
    finalTextRef.current = '';
    if (rec) {
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
      try {
        rec.abort();
      } catch {
        // já encerrado
      }
    }
    setListening(false);
    setInterim('');
  }, []);

  // Para o microfone ao desmontar o componente
  useEffect(() => abort, [abort]);

  const start = useCallback(async () => {
    if (!isRecognitionSupported) {
      setError('unsupported');
      return;
    }
    if (!window.isSecureContext) {
      setError('insecure');
      return;
    }
    if (recognitionRef.current || startingRef.current) return;

    startingRef.current = true;
    setError(null);
    stopSpeaking(); // evita que o microfone capte a própria resposta em áudio

    try {
      // Com permissão já concedida, o reconhecimento inicia direto.
      // Caso contrário (prompt ou denied), o getUserMedia pede a permissão e explica a falha.
      if ((await queryMicPermission()) !== 'granted') {
        const probe = await probeMicrophone();
        if (!probe.ok) {
          setError(probe.error);
          return;
        }
      }

      const rec = new SpeechRecognitionCtor();
      rec.lang = toSpeechLocale(lang);
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      finalTextRef.current = '';

      rec.onresult = (event) => {
        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTextRef.current += result[0].transcript;
          } else {
            interimText += result[0].transcript;
          }
        }
        setInterim(finalTextRef.current + interimText);
      };

      rec.onerror = async (event) => {
        console.warn('[voz] SpeechRecognition erro:', event.error, event.message || '');
        if (event.error === 'aborted') return;

        if (event.error === 'not-allowed') {
          // Se o microfone abre, o bloqueio veio do serviço de reconhecimento.
          // Se não abre, o motivo é a permissão, o sistema operacional ou a falta de dispositivo.
          const probe = await probeMicrophone();
          setError(probe.ok ? 'service' : probe.error);
          return;
        }

        setError(RECOGNITION_ERROR[event.error] || 'generic');
      };

      rec.onend = () => {
        recognitionRef.current = null;
        const text = finalTextRef.current.trim();
        finalTextRef.current = '';
        setListening(false);
        setInterim('');
        if (text) onFinalRef.current?.(text);
      };

      recognitionRef.current = rec;
      rec.start();
      setListening(true);
    } catch (err) {
      console.warn('[voz] falha ao iniciar o reconhecimento:', err?.name, err?.message);
      recognitionRef.current = null;
      setError('generic');
    } finally {
      startingRef.current = false;
    }
  }, [lang]);

  // Encerra e envia o que foi captado
  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return {
    supported: isRecognitionSupported,
    listening,
    interim,
    error,
    start,
    stop,
    abort,
  };
}