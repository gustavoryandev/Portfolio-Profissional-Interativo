import { memo, useLayoutEffect, useSyncExternalStore } from 'react';
import AstraAvatar from './AstraAvatar';
import { useAssistantPersona } from '../context/AssistantAppearanceContext';

function StreamingReply({ author, buffer, fallback, containerRef, followRef }) {
  const persona = useAssistantPersona(undefined, author);
  const { text, model } = useSyncExternalStore(buffer.subscribe, buffer.getSnapshot, buffer.getSnapshot);
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (text && container && followRef.current) container.scrollTop = container.scrollHeight;
  }, [text, containerRef, followRef]);
  if (!text) return fallback;
  // Rich markdown/cards are mounted once on completion, never on half a marker.
  const visible = text.replace(/\[[A-Z_]+(?:CARD|FORM)(?::(?:\d+|ALL))?\]/g, '').replace(/\[[A-Z_][A-Z_:\d]*$/, '');
  return <div className="my-2 flex w-full justify-start gap-3" aria-live="off" aria-busy="true" data-streaming-reply>
    <div className="avatar-astra mt-2 h-10 w-10 shrink-0 overflow-hidden rounded-full border" aria-hidden="true"><AstraAvatar author={author} /></div>
    <div className="message-content"><div className="astra-label"><span>{persona?.name ?? 'Astra'}</span>{model && <span className="dim-tag">{model}</span>}</div>
      <div className="chat-bubble chat-bubble--astra"><p className="whitespace-pre-wrap break-words">{visible}</p></div>
    </div>
  </div>;
}
export default memo(StreamingReply);
