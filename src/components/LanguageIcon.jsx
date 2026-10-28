import { useState } from 'react';
import { Code2 } from 'lucide-react';
import { getLanguageIcon } from '../data/languageIcons';

// Decorative: every consumer already displays the language name alongside it.
export default function LanguageIcon({ name, size = 20, color = 'currentColor', className = '' }) {
  const src = getLanguageIcon(name);
  const [failedSrc, setFailedSrc] = useState(null);

  if (!src || failedSrc === src) {
    return <Code2 size={size} color={color} className={`shrink-0 ${className}`} aria-hidden="true" />;
  }

  return <img
    src={src}
    alt=""
    aria-hidden="true"
    width={size}
    height={size}
    className={`shrink-0 object-contain ${className}`}
    style={{ width: size, height: size }}
    decoding="async"
    onError={() => setFailedSrc(src)}
  />;
}
