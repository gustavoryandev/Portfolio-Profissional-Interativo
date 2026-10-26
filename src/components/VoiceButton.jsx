// src/components/VoiceButton.jsx
import { Mic, Square } from 'lucide-react';

export default function VoiceButton({ listening, disabled, onClick, label, ui }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${listening ? ui.micActive : ui.mic} ${ui.focusRing}`}
    >
      {listening && <span aria-hidden="true" className="voice-ring absolute inset-0 rounded-full" />}
      {listening
        ? <Square size={14} fill="currentColor" aria-hidden="true" className="relative" />
        : <Mic size={18} aria-hidden="true" />}
    </button>
  );
}