-- Personal session history. Client-submitted scores are not verified.
create table public.arcade_sessions (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null check (char_length(id) between 1 and 100),
  game text not null check (game in ('snake', 'pong', 'frogger', 'maze', 'blocks')),
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  score integer not null check (score >= 0),
  level integer not null check (level >= 1),
  seconds double precision not null check (seconds >= 0 and seconds < 'Infinity'::double precision),
  outcome text not null check (outcome in ('win', 'loss', 'exit')),
  challenge boolean not null default false,
  metrics jsonb not null default '{}'::jsonb check (jsonb_typeof(metrics) = 'object' and octet_length(metrics::text) <= 4096),
  ended_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index arcade_sessions_history_idx on public.arcade_sessions (user_id, ended_at desc);
alter table public.arcade_sessions enable row level security;
revoke all on public.arcade_sessions from public, anon, authenticated;
grant select, insert on public.arcade_sessions to authenticated;

create policy "Read own arcade sessions"
  on public.arcade_sessions for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Insert own arcade sessions"
  on public.arcade_sessions for insert to authenticated
  with check (user_id = (select auth.uid()));
