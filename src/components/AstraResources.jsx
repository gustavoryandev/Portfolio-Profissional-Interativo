import { useLayoutEffect, useRef } from 'react';
import {
  BarChart3, Clock, Code2, Compass, FileCode2, Folder, Gamepad2, Github, GraduationCap, Headphones, Info,
  Languages, Maximize2, Palette, Pencil, Play, RotateCcw, Square, Swords, Terminal, Trophy, UserRound, X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { gameIds, games } from '../arcade/catalog';
import { clickedDialogBackdrop } from '../services/dialogInteraction';

export const ASTRA_RESOURCES_ID = 'astra-resources';
const MOBILE_DRAWER = '(max-width: 959px)';

const identifyVersion = ['identifyVersion', Info];
const openFullVersion = ['openFullVersion', Maximize2, [{ type: 'astra.openFull' }]];
const portfolioActions = [
  ['navigate', Compass, [{ type: 'navigate', target: 'sobre' }]],
  ['openProject', Folder, [{ type: 'project.open', target: 'academia' }]],
  ['theme', Palette, [{ type: 'theme.set', target: 'aurora' }]],
  ['language', Languages, en => [{ type: 'language.set', target: en ? 'pt' : 'en' }]],
  ['metrics', BarChart3, [{ type: 'metrics.open', target: 'all' }]],
];
const labActions = [
  ['labOpen', Terminal, [{ type: 'navigate', target: 'laboratorio' }]],
  ['labExample', FileCode2, [
    { type: 'lab.language', target: 'python' }, { type: 'lab.example', target: 'bro-fit' },
    { type: 'navigate', target: 'laboratorio' },
  ]],
  ['labAnalyze', Code2, [{ type: 'lab.read', target: 'both' }]],
  ['labEdit', Pencil, [{ type: 'lab.read', target: 'code' }]],
  ['labRun', Play, [{ type: 'lab.run' }]],
  ['labStop', Square, [{ type: 'lab.stop' }]],
  ['labReset', RotateCcw, [{ type: 'lab.reset' }]],
];
const integrations = [
  ['about', UserRound],
  ['projects', Folder],
  ['skills', Code2],
  ['github', Github],
  ['wakatime', Clock],
  ['chessGame', Swords],
  ['chessRating', Trophy],
  ['spotify', Headphones],
  ['canvas', GraduationCap],
  ['galo', Trophy],
];

export default function AstraResources({ open, compact, disabled, triggerRef, onClose, onPick }) {
  const { t, i18n } = useTranslation();
  const en = i18n.language.startsWith('en');
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const drawerRef = useRef(false);
  const restoreFocus = useRef(true);
  const closeHandler = useRef(onClose);
  useLayoutEffect(() => { closeHandler.current = onClose; }, [onClose]);

  useLayoutEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const trigger = triggerRef.current;
    restoreFocus.current = true;
    const viewport = window.matchMedia(MOBILE_DRAWER);

    const showPanel = () => {
      drawerRef.current = compact || viewport.matches;
      if (panel.open) panel.close();
      if (drawerRef.current) panel.showModal();
      else panel.show();
      closeRef.current.focus({ preventScroll: true });
    };

    showPanel();
    const dismissOutside = event => {
      if (drawerRef.current || panel.contains(event.target) || trigger?.contains(event.target)) return;
      restoreFocus.current = false;
      closeHandler.current();
    };
    document.addEventListener('click', dismissOutside, true);
    viewport.addEventListener('change', showPanel);
    return () => {
      document.removeEventListener('click', dismissOutside, true);
      viewport.removeEventListener('change', showPanel);
      panel.close();
      if (restoreFocus.current && trigger?.isConnected && !trigger.closest('[hidden]')) trigger.focus({ preventScroll: true });
    };
  }, [open, compact, triggerRef]);

  const handleKey = event => {
    if (!drawerRef.current || event.key !== 'Tab') return;
    const buttons = panelRef.current.querySelectorAll('button:not(:disabled)');
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handlePick = (prompt, actions, arcadeShortcut) => {
    if (drawerRef.current || actions || arcadeShortcut) onClose();
    else closeRef.current.focus({ preventScroll: true });
    onPick(prompt, actions, arcadeShortcut);
  };
  const arcadeItems = [
    compact ? ['arcadeBrowse', Gamepad2, null, { info: 'catalog' }] : ['arcadeOpen', Gamepad2, null, { type: 'arcade.open' }],
    ['arcadeRecords', Trophy, null, { info: 'records' }],
    ...gameIds.map(game => ['arcade-' + game, Gamepad2, null, { info: 'help', game }]),
  ];
  const groups = [
    ['versions', compact ? [identifyVersion, openFullVersion] : [identifyVersion]],
    ['arcade', arcadeItems],
    ['portfolio', portfolioActions], ['laboratory', labActions],
    ...(!compact ? [['integrations', integrations]] : [])];

  return (
    <dialog id={ASTRA_RESOURCES_ID} ref={panelRef} className="astra-resources"
      aria-labelledby="astra-resources-title"
      onCancel={event => { event.preventDefault(); event.stopPropagation(); onClose(); }}
      onClick={event => { if (drawerRef.current && clickedDialogBackdrop(event)) onClose(); }}
      onKeyDown={handleKey}>
      <header className="astra-resources-header">
        <h3 id="astra-resources-title">{t('chat.resources.title')}</h3>
        <button ref={closeRef} type="button" className="icon-button astra-resources-close"
          aria-label={t('chat.resources.close')} onClick={onClose}>
          <X size={17} aria-hidden="true" />
        </button>
      </header>
      <div className="astra-resources-body custom-scrollbar">
        <p className="astra-resources-note">{t('chat.resources.note')}</p>
        {groups.map(([group, items]) => <section className="astra-resources-group" key={group} aria-labelledby={`astra-resources-${group}`}>
          <h4 id={`astra-resources-${group}`}>{t(`chat.resources.groups.${group}`)}</h4>
          {compact && group === 'versions' && <p className="astra-resources-note">{t('chat.resources.cardHandoff')}</p>}
          {group === 'arcade' && <p className="astra-resources-note">{t(compact ? 'chat.resources.arcadeCompact' : 'chat.resources.arcadeFull')}</p>}
          <ul className="astra-resources-list">
            {items.map(([key, Icon, action, arcadeShortcut]) => {
              const game = games[arcadeShortcut?.game];
              const { title, description, prompt } = game ? {
                title: game.name,
                description: game.description[Number(en)],
                prompt: t('chat.resources.arcadeGuide', { game: game.name }),
              } : t(`chat.resources.items.${key}`, { returnObjects: true });
              return (
                <li key={key}>
                  <button type="button" className="astra-resource" disabled={disabled}
                    aria-labelledby={`astra-resource-${key}`} aria-describedby={`astra-resource-${key}-description`}
                    title={prompt} onClick={() => handlePick(prompt, typeof action === 'function' ? action(en) : action, arcadeShortcut)}>
                    <Icon size={17} aria-hidden="true" />
                    <span>
                      <strong id={`astra-resource-${key}`}>{title}</strong>
                      <span id={`astra-resource-${key}-description`}>{description}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>)}
      </div>
    </dialog>
  );
}
