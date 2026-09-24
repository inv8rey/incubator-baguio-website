-- ===========================================================================
-- 2026-09-25 — PinaSIKLab Team Finder: individual registrants find a team,
-- teams find members. Up to 30 teams of up to 5 people.
--
-- Shape follows the newsletter feature: tables have read policies only, and
-- every write goes through a SECURITY DEFINER function that enforces the
-- rules (team cap, member cap, leader-only actions, one team per person,
-- lock-in). That way the rules live in one place and a client can't bypass
-- them by writing to a table directly.
--
-- Public: team names, members' full names, skills and short bio (people
-- consent to this when they create their profile). Private: contact details,
-- shared only with teammates via siklab_team_contacts().
--
-- Safe to re-run.
-- ===========================================================================

create table if not exists public.siklab_participants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  full_name text not null,
  skills text[] not null default '{}',
  bio text not null default '',
  interest text not null default '',
  contact text not null default '',
  consented_at timestamptz not null default now(),
  team_id uuid,
  team_joined_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.siklab_teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  leader_id uuid not null references public.siklab_participants (id) on delete cascade,
  looking_for text[] not null default '{}',
  note text not null default '',
  locked boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists siklab_teams_name_key on public.siklab_teams (lower(name));

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'siklab_participants_team_fk') then
    alter table public.siklab_participants
      add constraint siklab_participants_team_fk
      foreign key (team_id) references public.siklab_teams (id) on delete set null;
  end if;
end $$;

-- kind 'request' = a solo person asking to join; 'invite' = a leader inviting a solo person.
create table if not exists public.siklab_requests (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.siklab_teams (id) on delete cascade,
  participant_id uuid not null references public.siklab_participants (id) on delete cascade,
  kind text not null check (kind in ('request', 'invite')),
  message text not null default '',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz not null default now()
);

-- One open conversation per person/team pair, whichever side started it.
create unique index if not exists siklab_requests_pending_key
  on public.siklab_requests (team_id, participant_id) where status = 'pending';

-- ---------------------------------------------------------------------------
-- Read access
-- ---------------------------------------------------------------------------
alter table public.siklab_participants enable row level security;
alter table public.siklab_teams enable row level security;
alter table public.siklab_requests enable row level security;

create or replace function public.siklab_my_participant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.siklab_participants where user_id = auth.uid();
$$;

revoke all on function public.siklab_my_participant_id() from public;
grant execute on function public.siklab_my_participant_id() to anon, authenticated;

drop policy if exists "teams are publicly readable" on public.siklab_teams;
create policy "teams are publicly readable" on public.siklab_teams
  for select using (true);

drop policy if exists "admins manage teams" on public.siklab_teams;
create policy "admins manage teams" on public.siklab_teams
  for all using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true))
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- The base table carries `contact`, so it is never publicly readable. People
-- see their own row here; everyone else's public fields come from the view.
drop policy if exists "people read their own participant row" on public.siklab_participants;
create policy "people read their own participant row" on public.siklab_participants
  for select using (user_id = auth.uid());

drop policy if exists "admins manage participants" on public.siklab_participants;
create policy "admins manage participants" on public.siklab_participants
  for all using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true))
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create or replace view public.siklab_participants_public
with (security_invoker = off) as
  select id, full_name, skills, bio, interest, team_id, team_joined_at, created_at
  from public.siklab_participants;

grant select on public.siklab_participants_public to anon, authenticated;

drop policy if exists "requests visible to the people involved" on public.siklab_requests;
create policy "requests visible to the people involved" on public.siklab_requests
  for select using (
    participant_id = public.siklab_my_participant_id()
    or team_id in (select id from public.siklab_teams where leader_id = public.siklab_my_participant_id())
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

drop policy if exists "admins manage requests" on public.siklab_requests;
create policy "admins manage requests" on public.siklab_requests
  for all using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true))
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- ---------------------------------------------------------------------------
-- Write functions. Limits: 30 teams, 5 members per team.
-- ---------------------------------------------------------------------------

create or replace function public.siklab_save_profile(
  p_full_name text, p_skills text[], p_bio text, p_interest text, p_contact text, p_consent boolean
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'Please log in first.'; end if;
  if coalesce(trim(p_full_name), '') = '' then raise exception 'Please enter your name.'; end if;
  if coalesce(array_length(p_skills, 1), 0) = 0 then raise exception 'Pick at least one skill.'; end if;
  if coalesce(trim(p_contact), '') = '' then raise exception 'Add a way for teammates to reach you.'; end if;
  if not coalesce(p_consent, false) then
    raise exception 'Please confirm you agree to show your name, skills, and bio on the Team Finder.';
  end if;

  insert into public.siklab_participants (user_id, full_name, skills, bio, interest, contact)
  values (auth.uid(), trim(p_full_name), p_skills, left(coalesce(p_bio, ''), 400), left(coalesce(p_interest, ''), 200), trim(p_contact))
  on conflict (user_id) do update
    set full_name = excluded.full_name, skills = excluded.skills, bio = excluded.bio,
        interest = excluded.interest, contact = excluded.contact
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.siklab_create_team(p_name text, p_looking_for text[], p_note text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_pid uuid; v_team uuid; v_count integer;
begin
  v_pid := public.siklab_my_participant_id();
  if v_pid is null then raise exception 'Create your profile first.'; end if;
  if exists (select 1 from public.siklab_participants where id = v_pid and team_id is not null) then
    raise exception 'You are already on a team. Leave it first.';
  end if;
  if coalesce(trim(p_name), '') = '' then raise exception 'Give your team a name.'; end if;

  -- Serialize creation so two people can't both take the last slot.
  perform pg_advisory_xact_lock(hashtext('siklab_team_cap'));
  select count(*) into v_count from public.siklab_teams;
  if v_count >= 30 then raise exception 'All 30 team slots are taken.'; end if;

  begin
    insert into public.siklab_teams (name, leader_id, looking_for, note)
    values (trim(p_name), v_pid, coalesce(p_looking_for, '{}'), left(coalesce(p_note, ''), 300))
    returning id into v_team;
  exception when unique_violation then
    raise exception 'A team with that name already exists.';
  end;

  update public.siklab_participants set team_id = v_team, team_joined_at = now() where id = v_pid;
  update public.siklab_requests set status = 'cancelled' where participant_id = v_pid and status = 'pending';
  return v_team;
end;
$$;

create or replace function public.siklab_update_team(p_team_id uuid, p_name text, p_looking_for text[], p_note text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.siklab_teams where id = p_team_id and leader_id = public.siklab_my_participant_id()) then
    raise exception 'Only the team leader can do that.';
  end if;
  if coalesce(trim(p_name), '') = '' then raise exception 'Give your team a name.'; end if;
  begin
    update public.siklab_teams
    set name = trim(p_name), looking_for = coalesce(p_looking_for, '{}'), note = left(coalesce(p_note, ''), 300)
    where id = p_team_id;
  exception when unique_violation then
    raise exception 'A team with that name already exists.';
  end;
end;
$$;

create or replace function public.siklab_set_locked(p_team_id uuid, p_locked boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_count integer;
begin
  if not exists (select 1 from public.siklab_teams where id = p_team_id and leader_id = public.siklab_my_participant_id()) then
    raise exception 'Only the team leader can do that.';
  end if;
  select count(*) into v_count from public.siklab_participants where team_id = p_team_id;
  if not p_locked and v_count >= 5 then raise exception 'A full team stays locked.'; end if;

  update public.siklab_teams set locked = p_locked where id = p_team_id;
  -- Locking means "we don't need anyone else": close anything still open.
  if p_locked then
    update public.siklab_requests set status = 'cancelled' where team_id = p_team_id and status = 'pending';
  end if;
end;
$$;

create or replace function public.siklab_send_request(p_team_id uuid, p_message text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_pid uuid; v_team public.siklab_teams%rowtype; v_count integer; v_id uuid;
begin
  v_pid := public.siklab_my_participant_id();
  if v_pid is null then raise exception 'Create your profile first.'; end if;
  if exists (select 1 from public.siklab_participants where id = v_pid and team_id is not null) then
    raise exception 'You are already on a team.';
  end if;
  select * into v_team from public.siklab_teams where id = p_team_id;
  if not found then raise exception 'Team not found.'; end if;
  if v_team.locked then raise exception 'This team is locked.'; end if;
  select count(*) into v_count from public.siklab_participants where team_id = p_team_id;
  if v_count >= 5 then raise exception 'This team is full.'; end if;

  begin
    insert into public.siklab_requests (team_id, participant_id, kind, message)
    values (p_team_id, v_pid, 'request', left(coalesce(p_message, ''), 300))
    returning id into v_id;
  exception when unique_violation then
    raise exception 'You already have a pending request or invite with this team.';
  end;
  return v_id;
end;
$$;

create or replace function public.siklab_send_invite(p_participant_id uuid, p_message text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_pid uuid; v_team public.siklab_teams%rowtype; v_count integer; v_target_team uuid; v_id uuid;
begin
  v_pid := public.siklab_my_participant_id();
  select * into v_team from public.siklab_teams where leader_id = v_pid;
  if not found then raise exception 'Only team leaders can invite people.'; end if;
  if v_team.locked then raise exception 'Your team is locked. Unlock it to invite people.'; end if;
  select count(*) into v_count from public.siklab_participants where team_id = v_team.id;
  if v_count >= 5 then raise exception 'Your team is full.'; end if;

  select team_id into v_target_team from public.siklab_participants where id = p_participant_id;
  if not found then raise exception 'Person not found.'; end if;
  if v_target_team is not null then raise exception 'That person already joined a team.'; end if;

  begin
    insert into public.siklab_requests (team_id, participant_id, kind, message)
    values (v_team.id, p_participant_id, 'invite', left(coalesce(p_message, ''), 300))
    returning id into v_id;
  exception when unique_violation then
    raise exception 'There is already a pending request or invite with this person.';
  end;
  return v_id;
end;
$$;

create or replace function public.siklab_respond(p_request_id uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pid uuid; r public.siklab_requests%rowtype; t public.siklab_teams%rowtype; v_count integer;
begin
  v_pid := public.siklab_my_participant_id();
  select * into r from public.siklab_requests where id = p_request_id for update;
  if not found or r.status <> 'pending' then raise exception 'That request is no longer open.'; end if;
  select * into t from public.siklab_teams where id = r.team_id for update;

  if r.kind = 'request' then
    if t.leader_id is distinct from v_pid then raise exception 'Only the team leader can respond to join requests.'; end if;
  else
    if r.participant_id is distinct from v_pid then raise exception 'Only the invited person can respond to this invite.'; end if;
  end if;

  if not p_accept then
    update public.siklab_requests set status = 'declined' where id = r.id;
    return;
  end if;

  if t.locked then raise exception 'This team is locked.'; end if;
  select count(*) into v_count from public.siklab_participants where team_id = t.id;
  if v_count >= 5 then raise exception 'This team is full.'; end if;
  if exists (select 1 from public.siklab_participants where id = r.participant_id and team_id is not null) then
    raise exception 'That person already joined a team.';
  end if;

  update public.siklab_participants set team_id = t.id, team_joined_at = now() where id = r.participant_id;
  update public.siklab_requests set status = 'accepted' where id = r.id;
  update public.siklab_requests set status = 'cancelled'
    where participant_id = r.participant_id and status = 'pending' and id <> r.id;

  -- Full teams lock themselves and close any other open requests.
  if v_count + 1 >= 5 then
    update public.siklab_teams set locked = true where id = t.id;
    update public.siklab_requests set status = 'cancelled' where team_id = t.id and status = 'pending';
  end if;
end;
$$;

create or replace function public.siklab_cancel_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_pid uuid; r public.siklab_requests%rowtype;
begin
  v_pid := public.siklab_my_participant_id();
  select * into r from public.siklab_requests where id = p_request_id for update;
  if not found or r.status <> 'pending' then raise exception 'That request is no longer open.'; end if;
  -- Whoever sent it can withdraw it.
  if r.kind = 'request' and r.participant_id is distinct from v_pid then raise exception 'Not your request.'; end if;
  if r.kind = 'invite' and not exists (select 1 from public.siklab_teams where id = r.team_id and leader_id = v_pid) then
    raise exception 'Not your invite.';
  end if;
  update public.siklab_requests set status = 'cancelled' where id = r.id;
end;
$$;

create or replace function public.siklab_leave_team()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_pid uuid; v_team uuid; t public.siklab_teams%rowtype; v_count integer; v_next uuid;
begin
  v_pid := public.siklab_my_participant_id();
  select team_id into v_team from public.siklab_participants where id = v_pid;
  if v_team is null then raise exception 'You are not on a team.'; end if;
  select * into t from public.siklab_teams where id = v_team for update;
  select count(*) into v_count from public.siklab_participants where team_id = v_team;

  if t.leader_id = v_pid then
    select id into v_next from public.siklab_participants
      where team_id = v_team and id <> v_pid order by team_joined_at limit 1;
    if v_next is null then
      -- Last person out: the team (and its slot) goes away.
      delete from public.siklab_teams where id = v_team;
      update public.siklab_participants set team_id = null, team_joined_at = null where id = v_pid;
      return;
    end if;
    update public.siklab_teams set leader_id = v_next where id = v_team;
  end if;

  update public.siklab_participants set team_id = null, team_joined_at = null where id = v_pid;
  -- A slot just opened on a team that had auto-locked at 5.
  if v_count >= 5 then update public.siklab_teams set locked = false where id = v_team; end if;
end;
$$;

create or replace function public.siklab_remove_member(p_participant_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_pid uuid; t public.siklab_teams%rowtype; v_count integer;
begin
  v_pid := public.siklab_my_participant_id();
  select * into t from public.siklab_teams where leader_id = v_pid for update;
  if not found then raise exception 'Only the team leader can remove members.'; end if;
  if p_participant_id = v_pid then raise exception 'Use "Leave team" to leave your own team.'; end if;
  if not exists (select 1 from public.siklab_participants where id = p_participant_id and team_id = t.id) then
    raise exception 'That person is not on your team.';
  end if;
  select count(*) into v_count from public.siklab_participants where team_id = t.id;

  update public.siklab_participants set team_id = null, team_joined_at = null where id = p_participant_id;
  if v_count >= 5 then update public.siklab_teams set locked = false where id = t.id; end if;
end;
$$;

-- Contact details are visible to the people on the same team, and no one else.
create or replace function public.siklab_team_contacts(p_team_id uuid)
returns table (participant_id uuid, full_name text, contact text)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.full_name, p.contact
  from public.siklab_participants p
  where p.team_id = p_team_id
    and (
      exists (select 1 from public.siklab_participants me where me.user_id = auth.uid() and me.team_id = p_team_id)
      or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
    );
$$;

do $$
declare f text;
begin
  foreach f in array array[
    'siklab_save_profile(text, text[], text, text, text, boolean)',
    'siklab_create_team(text, text[], text)',
    'siklab_update_team(uuid, text, text[], text)',
    'siklab_set_locked(uuid, boolean)',
    'siklab_send_request(uuid, text)',
    'siklab_send_invite(uuid, text)',
    'siklab_respond(uuid, boolean)',
    'siklab_cancel_request(uuid)',
    'siklab_leave_team()',
    'siklab_remove_member(uuid)',
    'siklab_team_contacts(uuid)'
  ] loop
    execute format('revoke all on function public.%s from public', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;
