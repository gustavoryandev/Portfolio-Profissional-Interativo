import { useEffect, useId, useRef, useState } from 'react';
import { Check } from 'lucide-react';

export default function OptionMenu({
  label, triggerLabel = label, triggerClassName, triggerContent, groups,
  value, onChange, caption, width = 264,
}) {
  const id = useId();
  const trigger = useRef(null);
  const menu = useRef(null);
  const [open, setOpen] = useState(false);

  function placeMenu() {
    const bounds = trigger.current.getBoundingClientRect();
    const menuWidth = Math.min(width, window.innerWidth - 24);
    const below = window.innerHeight - bounds.bottom;
    const above = bounds.top;
    const openUp = below < 300 && above > below;
    Object.assign(menu.current.style, {
      left: `${Math.max(12, Math.min(bounds.right - menuWidth, window.innerWidth - menuWidth - 12))}px`,
      top: openUp ? 'auto' : `${bounds.bottom + 8}px`,
      bottom: openUp ? `${window.innerHeight - bounds.top + 8}px` : 'auto',
      maxHeight: `${(openUp ? above : below) - 16}px`,
    });
  }

  useEffect(() => {
    if (!open) return;
    const reposition = event => {
      if (event.target !== menu.current && menu.current?.matches(':popover-open')) placeMenu();
    };
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open, width]);

  const close = () => {
    menu.current.hidePopover();
    trigger.current.focus();
  };

  const handleKeys = event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const options = [...menu.current.querySelectorAll('[role="menuitemradio"]')];
    const index = options.indexOf(document.activeElement);
    const step = event.key === 'ArrowUp' ? -1 : 1;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1
      : (index + step + options.length) % options.length;
    options[next].focus();
  };

  return <>
    <button ref={trigger} type="button" className={triggerClassName} aria-label={triggerLabel} title={label}
      aria-haspopup="menu" aria-controls={id} aria-expanded={open} popoverTarget={id}
      onKeyDown={event => {
        if (event.key !== 'ArrowDown') return;
        event.preventDefault();
        if (!menu.current.matches(':popover-open')) trigger.current.click();
      }}>
      {triggerContent}
    </button>
    <div ref={menu} id={id} className="option-menu" style={{ '--option-menu-width': `${width}px` }}
      popover="auto" role="menu" aria-label={label}
      onBeforeToggle={event => { if (event.newState === 'open') placeMenu(); }}
      onToggle={event => {
        const opened = event.newState === 'open';
        setOpen(opened);
        if (opened) menu.current.querySelector('[aria-checked="true"]')?.focus();
      }}
      onKeyDown={handleKeys} onBlur={event => {
        const next = event.relatedTarget;
        if (next && next !== trigger.current && !event.currentTarget.contains(next)) menu.current.hidePopover();
      }}>
      {caption && <div className="option-menu-title" aria-hidden="true"><strong>{label}</strong><span>{caption}</span></div>}
      {groups.map(({ name, options }, index) => {
        const items = options.map(option => (
          <button key={option.id} type="button" className="menu-option" data-preview={option.preview ? option.id : undefined}
            role="menuitemradio" aria-checked={value === option.id} tabIndex={-1}
            onClick={() => { onChange(option.id); close(); }}>
            {option.preview}
            <span>{option.label}</span>
            {value === option.id && <Check size={16} aria-hidden="true" />}
          </button>
        ));
        if (!name) return items;
        return (
          <div className="option-menu-group" key={name} role="group" aria-labelledby={`${id}-${index}`}>
            <p id={`${id}-${index}`}>{name}</p>
            {items}
          </div>
        );
      })}
    </div>
  </>;
}
