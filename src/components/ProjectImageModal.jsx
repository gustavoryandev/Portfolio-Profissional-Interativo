import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { clickedDialogBackdrop } from '../services/dialogInteraction';

export default function ProjectImageModal({ image, title, alt, trigger, onClose }) {
  const dialog = useRef(null);
  const titleId = useId();
  const { t } = useTranslation();

  useEffect(() => {
    const node = dialog.current;
    const opener = trigger.current;
    node.showModal();
    return () => {
      node.close();
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [trigger]);

  return createPortal(<dialog ref={dialog} className="project-image-modal" aria-labelledby={titleId}
    onKeyDown={event => {
      // The close button is the only interactive element in this viewer.
      if (event.key === 'Tab') { event.preventDefault(); dialog.current.querySelector('button').focus(); }
    }}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => { if (clickedDialogBackdrop(event)) onClose(); }}>
    <header className="project-image-modal-heading">
      <h2 id={titleId}>{title}</h2>
      <button type="button" autoFocus onClick={onClose} aria-label={t('projetos.closePreview')}><X size={22} aria-hidden="true" /></button>
    </header>
    <div className="project-image-modal-content"><img src={image.src} alt={alt} /></div>
  </dialog>, document.body);
}
