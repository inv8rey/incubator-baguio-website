-- ===========================================================================
-- 2026-10-02: R&I Idea Lab (/idea-lab): free idea generator grounded in the
-- Baguio City Research and Innovation Agenda.
--
-- All writes and most reads go through server API routes using the service
-- role. The only public read is approved shared ideas (the Idea Bank).
-- Staff (profiles.is_admin) can read and manage everything from the admin
-- panel. Creates new tables only; no existing table is changed.
--
-- Safe to re-run.
-- ===========================================================================

create table if not exists public.idea_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  device_hash text not null,          -- salted hash of IP + user agent, never a raw IP
  project_type text not null check (project_type in ('capstone', 'thesis', 'startup')),
  program text,
  level text,
  priority_area text not null check (priority_area in (
    'environmental-action', 'social-protection-inclusivity', 'economic-expansion-creative-economy',
    'infrastructure-smart-city', 'resilience-drr', 'good-governance')),
  skills text[] not null default '{}',
  time_available text,
  budget text,
  partner_pref text,
  model text,
  input_tokens int not null default 0,
  output_tokens int not null default 0
);

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.idea_sessions (id) on delete cascade,
  created_at timestamptz not null default now(),
  title text not null,
  problem text not null,
  agenda_theme text,
  emerging boolean not null default false,   -- related and emerging idea beyond the listed themes
  agenda_fit text not null,
  statutory_area text,
  deliverable text not null,
  data_and_partners jsonb not null default '[]',
  feasibility text,
  difficulty text,
  common_idea_warning text,
  related_challenge_id text,
  parent_idea_id uuid references public.ideas (id),   -- set when created by Refine
  cache_key text                                       -- project type + program + level + area + time + budget
);
create index if not exists ideas_session_idx on public.ideas (session_id);
create index if not exists ideas_cache_key_idx on public.ideas (cache_key, created_at desc);

create table if not exists public.concept_notes (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references public.ideas (id) on delete cascade,
  content jsonb not null,
  updated_at timestamptz not null default now()
);
create unique index if not exists concept_notes_idea_key on public.concept_notes (idea_id);

create table if not exists public.shared_ideas (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references public.ideas (id) on delete cascade,
  shared_at timestamptz not null default now(),
  show_name boolean not null default false,
  display_name text,
  school text,
  contact_email text,                 -- only if the user opted in
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  moderator_note text,
  sent_to_challenge_id uuid            -- set when staff convert it into a draft challenge
);

create table if not exists public.idea_claims (
  id uuid primary key default gen_random_uuid(),
  shared_idea_id uuid references public.shared_ideas (id) on delete cascade,
  created_at timestamptz not null default now(),
  contact_email text,
  message text
);

-- Per device, per day. Fractional because refine and note cost half a generation.
create table if not exists public.rate_limits (
  device_hash text,
  day date,
  generations numeric(6, 1) not null default 0,
  primary key (device_hash, day)
);

-- Every model call, for the global daily budget guard and the admin cost chart.
create table if not exists public.idea_usage (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid,
  device_hash text,
  kind text not null check (kind in ('generate', 'refine', 'note')),
  model text,
  input_tokens int not null default 0,
  output_tokens int not null default 0
);
create index if not exists idea_usage_day_idx on public.idea_usage (created_at);

-- Atomically add `p_cost` to today's count if it stays under `p_limit`.
create or replace function public.idea_lab_bump_limit(p_device text, p_cost numeric, p_limit numeric)
returns table (ok boolean, used numeric)
language plpgsql
security definer
set search_path = public
as $$
declare v_used numeric;
begin
  insert into public.rate_limits (device_hash, day, generations) values (p_device, current_date, 0)
  on conflict (device_hash, day) do nothing;

  update public.rate_limits set generations = generations + p_cost
  where device_hash = p_device and day = current_date and generations + p_cost <= p_limit
  returning generations into v_used;

  if v_used is null then
    return query select false, (select generations from public.rate_limits where device_hash = p_device and day = current_date);
  else
    return query select true, v_used;
  end if;
end;
$$;
revoke all on function public.idea_lab_bump_limit(text, numeric, numeric) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.idea_sessions enable row level security;
alter table public.ideas enable row level security;
alter table public.concept_notes enable row level security;
alter table public.shared_ideas enable row level security;
alter table public.idea_claims enable row level security;
alter table public.rate_limits enable row level security;
alter table public.idea_usage enable row level security;

-- Public: only approved shared ideas, and the idea rows they point to.
drop policy if exists "approved shared ideas are public" on public.shared_ideas;
create policy "approved shared ideas are public" on public.shared_ideas
  for select using (status = 'approved');

drop policy if exists "ideas of approved shares are public" on public.ideas;
create policy "ideas of approved shares are public" on public.ideas
  for select using (exists (select 1 from public.shared_ideas s where s.idea_id = ideas.id and s.status = 'approved'));

-- Staff: full access from the admin panel (same is_admin check as the rest of the site).
do $$
declare t text;
begin
  foreach t in array array['idea_sessions', 'ideas', 'concept_notes', 'shared_ideas', 'idea_claims', 'rate_limits', 'idea_usage'] loop
    execute format('drop policy if exists "staff manage %1$s" on public.%1$s', t);
    execute format($p$create policy "staff manage %1$s" on public.%1$s for all
      using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true))
      with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true))$p$, t);
  end loop;
end $$;
