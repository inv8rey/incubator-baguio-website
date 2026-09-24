-- ===========================================================================
-- 2026-09-26 — PinaSIKLab Baguio 2026 application form (/pinasiklab/register/).
--
-- Anyone can submit (no login, same as the Google Form it replaces); only
-- admins can read. Rules that matter (age 18-30, BLISTT municipality, one
-- application per email, team fields present for team applicants) are CHECK
-- constraints so they hold no matter what the client sends, and every free-text
-- column is length-capped so the public insert can't be used to stuff the table.
--
-- Safe to re-run.
-- ===========================================================================

create table if not exists public.siklab_registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- About you
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text not null default '' check (char_length(phone) <= 40),
  age integer not null check (age between 18 and 30),
  category text not null check (char_length(category) between 1 and 160),
  organization text not null check (char_length(organization) between 1 and 200),
  municipality text not null check (municipality in ('Baguio City', 'La Trinidad', 'Itogon', 'Sablan', 'Tuba', 'Tublay')),

  -- Background
  expertise text not null check (char_length(expertise) between 1 and 300),
  skills text[] not null check (array_length(skills, 1) between 1 and 20),

  -- Team
  participation text not null check (participation in ('individual', 'team')),
  team_name text not null default '' check (char_length(team_name) <= 80),
  is_team_leader boolean,
  team_leader_contact text not null default '' check (char_length(team_leader_contact) <= 300),
  team_size integer check (team_size between 2 and 5),
  team_members text not null default '' check (char_length(team_members) <= 1500),
  contribution text not null default '' check (char_length(contribution) <= 1500),
  teammate_preference text not null default '' check (char_length(teammate_preference) <= 1000),

  -- Problem & innovation interest (optional)
  -- Focus areas picked from the checklist, comma-separated.
  problem text not null default '' check (char_length(problem) <= 2000),
  solution_types text[] not null default '{}' check (coalesce(array_length(solution_types, 1), 0) <= 10),

  -- Motivation & commitment
  motivation text not null check (char_length(motivation) between 1 and 2000),
  available_full_duration text not null check (char_length(available_full_duration) <= 120),
  continue_after text not null check (char_length(continue_after) <= 120),
  heard_from text not null default '' check (char_length(heard_from) <= 160),
  notes text not null default '' check (char_length(notes) <= 1000),

  -- Review (set by PinaSIKLab organizers only)
  status text not null default 'new' check (status in ('new', 'shortlisted', 'accepted', 'waitlisted', 'declined')),
  admin_note text not null default '' check (char_length(admin_note) <= 2000),

  -- Consent & declaration (both must be true to submit at all)
  consent_privacy boolean not null check (consent_privacy),
  declaration boolean not null check (declaration),

  -- A team application must describe the team; an individual one must say what they bring.
  constraint siklab_registrations_team_fields check (
    participation = 'individual'
    or (team_size is not null and is_team_leader is not null and char_length(team_members) > 0 and char_length(team_name) > 0)
  ),
  constraint siklab_registrations_individual_fields check (
    participation = 'team' or char_length(contribution) > 0
  )
);

-- One application per person. Case-insensitive so Ana@x.com and ana@x.com match.
create unique index if not exists siklab_registrations_email_key on public.siklab_registrations (lower(email));

-- PinaSIKLab organizers. Deliberately separate from profiles.is_admin: being
-- an Incubator Baguio site admin grants nothing here, and organizers of the
-- event don't need site-admin rights. Add one with:
--   insert into public.siklab_admins (user_id) select id from auth.users where email = 'you@example.com';
create table if not exists public.siklab_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.siklab_admins enable row level security;
drop policy if exists "organizers read own row" on public.siklab_admins;
create policy "organizers read own row" on public.siklab_admins for select using (user_id = auth.uid());

create or replace function public.siklab_is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.siklab_admins where user_id = auth.uid());
$$;
grant execute on function public.siklab_is_admin() to anon, authenticated;

alter table public.siklab_registrations enable row level security;

-- Applications close at the end of October 13, 2026 (Philippine time).
drop policy if exists "anyone can submit a registration" on public.siklab_registrations;
create policy "anyone can submit a registration" on public.siklab_registrations
  for insert with check (status = 'new' and admin_note = '' and now() < timestamptz '2026-10-14 00:00:00+08');

drop policy if exists "admins manage registrations" on public.siklab_registrations;
drop policy if exists "organizers manage registrations" on public.siklab_registrations;
create policy "organizers manage registrations" on public.siklab_registrations
  for all using (public.siklab_is_admin()) with check (public.siklab_is_admin());
