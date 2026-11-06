import { CardShell } from './ui/CardShell';
import React, { memo, useMemo } from 'react';
import { BookOpen, ExternalLink, GraduationCap, LayoutDashboard, Clock } from 'lucide-react';

const CANVAS_URL = 'https://pucminas.instructure.com/';
const FONT_MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";
const MAX_VISIBLE = 4;

const translations = {
  pt: {
    canvas_title: 'PUC Minas (Canvas)',
    student_fallback: 'Aluno: Gustavo Ryan (Eng. Software)',
    overview: 'Visão Geral',
    active_courses: 'Disciplinas ativas',
    situation: 'Situação',
    status: 'Status Regular',
    unverified: 'Não verificado',
    access: 'Acessar Ambiente Virtual',
    course_active: 'EM CURSO',
    empty: 'Nenhuma disciplina ativa no momento.',
    unavailable: 'Dados do Canvas indisponíveis no momento.',
    synced: 'Sincronizado ao vivo',
    more: (n) => `+${n} disciplina${n > 1 ? 's' : ''}`,
    open: 'Abrir Canvas em nova aba',
  },
  en: {
    canvas_title: 'PUC Minas (Canvas)',
    student_fallback: 'Student: Gustavo Ryan (Software Eng.)',
    overview: 'Overview',
    active_courses: 'Active courses',
    situation: 'Status',
    status: 'Regular Status',
    unverified: 'Not verified',
    access: 'Access Virtual Environment',
    course_active: 'IN PROGRESS',
    empty: 'No active courses at the moment.',
    unavailable: 'Canvas data is unavailable at the moment.',
    synced: 'Synced live',
    more: (n) => `+${n} course${n > 1 ? 's' : ''}`,
    open: 'Open Canvas in a new tab',
  },
};

// Tokens do design system Alvinegro + Azul (mesmos do GithubActivityCard)
const ui = {
  panel: '', surface: 'border-line bg-panel-soft', divider: 'border-line',
  text: 'text-ink', sub: 'text-muted', muted: 'text-muted',
  accentText: 'text-accent', accentHover: 'hover:text-accent', accentBorderHover: 'hover:border-accent',
  iconTile: 'border-line bg-panel text-accent', iconTileHover: 'group-hover:text-accent',
  linkButton: 'border-line bg-panel text-muted hover:text-accent',
  badge: 'border-brand-400/40 bg-brand-400/10 text-accent',
  dot: 'bg-accent', dotPing: 'bg-accent', dashed: 'border-line bg-panel-soft text-muted',
};

// Disciplina individual (memoizada: não re-renderiza ao trocar o tema de outra parte)
const CourseRow = memo(function CourseRow({ course, ui, badgeLabel }) {
  return (
    <div
      className={`group flex items-center justify-between gap-3 rounded-xl border p-3 transition-all duration-200 ${ui.surface} ${ui.accentBorderHover}`}
    >
      <div className="flex min-w-0 items-center gap-3.5">
        <div
          aria-hidden="true"
          className={`shrink-0 rounded-lg border p-2.5 transition-colors ${ui.iconTile} ${ui.iconTileHover}`}
        >
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`truncate text-[14px] font-bold ${ui.text}`}>{course.name}</p>
          {course.code && (
            <p className={`truncate text-[12px] ${ui.muted}`} style={{ fontFamily: FONT_MONO }}>
              {course.code}
            </p>
          )}
        </div>
      </div>
      <span
        className={`hidden shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wider sm:inline-block ${ui.badge}`}
      >
        {badgeLabel}
      </span>
    </div>
  );
});

export default function CanvasCard({ lang = 'pt', context }) {
  const t = translations[lang] || translations.pt;

  const canvas = context?.canvas;
  const isConfigured = canvas?.status === 'ok';
  const courses = useMemo(() => (Array.isArray(canvas?.courses) ? canvas.courses : []), [canvas?.courses]);
  const visible = courses.slice(0, MAX_VISIBLE);
  const hiddenCount = courses.length - visible.length;

  // Aluno vem do backend; se não vier, usa o texto anterior
  const studentLine = canvas?.student
    ? [canvas.student.name, canvas.student.course].filter(Boolean).join(' • ')
    : t.student_fallback;

  const titleId = 'canvas-card-title';

  return (
    <CardShell as="article" className="my-3" aria-labelledby={titleId}>
      {/* Cabeçalho */}
      <header className="mb-6 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`shrink-0 rounded-lg border p-2.5 ${ui.iconTile}`} aria-hidden="true">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 id={titleId} className={`truncate text-[17px] font-bold ${ui.text}`}>
              {t.canvas_title}
            </h3>
            <p className={`truncate text-[12px] font-medium ${ui.sub}`}>{studentLine}</p>
          </div>
        </div>
        <a
          href={CANVAS_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.open}
          title={t.open}
          className={`hidden rounded-lg border p-2 transition-colors sm:flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 ${ui.linkButton}`}
        >
          <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
        </a>
      </header>

      {!isConfigured ? (
        <div className={`rounded-xl border border-dashed py-10 text-center text-sm font-medium ${ui.dashed}`}>
          {t.unavailable}
        </div>
      ) : (
        <>
          {/* Métricas rápidas */}
          <div className="mb-5 card-grid grid grid-cols-2 gap-3">
            <div className={`flex flex-col justify-center rounded-xl border p-3.5 ${ui.surface}`}>
              <span className={`text-xs font-bold uppercase tracking-wider ${ui.muted}`}>{t.overview}</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className={`text-xl font-semibold tabular-nums ${ui.text}`}>{courses.length}</span>
                <span className={`text-[12px] font-medium ${ui.sub}`}>{t.active_courses}</span>
              </div>
            </div>

            <div className={`flex flex-col justify-center rounded-xl border p-3.5 ${ui.surface}`}>
              <span className={`text-xs font-bold uppercase tracking-wider ${ui.muted}`}>{t.situation}</span>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="relative flex h-3 w-3" aria-hidden="true">
                  <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 motion-reduce:animate-none ${ui.dotPing}`} />
                  <span className={`relative inline-flex h-3 w-3 rounded-full ${ui.dot}`} />
                </span>
                <span className={`text-[13px] font-bold ${ui.accentText}`}>
                  {canvas?.regular === false ? t.unverified : t.status}
                </span>
              </div>
            </div>
          </div>

          {/* Disciplinas */}
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {visible.length > 0 ? (
              visible.map((course, i) => (
                <li key={course.id ?? `${course.code}-${i}`}>
                  <CourseRow course={course} ui={ui} badgeLabel={t.course_active} />
                </li>
              ))
            ) : (
              <li className={`rounded-xl border border-dashed py-6 text-center text-sm ${ui.dashed}`}>
                {t.empty}
              </li>
            )}
            {hiddenCount > 0 && (
              <li className={`pt-1 text-center text-[12px] font-medium ${ui.muted}`}>{t.more(hiddenCount)}</li>
            )}
          </ul>
        </>
      )}

      {/* Rodapé */}
      <footer className={`mt-5 flex items-center justify-between gap-3 border-t pt-4 ${ui.divider}`}>
        <div className="flex items-center gap-1.5">
          <Clock size={14} className={ui.muted} aria-hidden="true" />
          <span className={`text-[12px] font-medium ${ui.muted}`}>{t.synced}</span>
        </div>
        <a
          href={CANVAS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-1.5 text-[13px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 ${ui.accentText} ${ui.accentHover}`}
        >
          {t.access} <ExternalLink size={14} aria-hidden="true" />
        </a>
      </footer>
    </CardShell>
  );
}
