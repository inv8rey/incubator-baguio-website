-- ===========================================================================
-- 2026-09-11 — Members directory: opt-in discovery of any registered member,
-- not just people who filled out the (separate, narrower) Co-Founder Finder
-- form. Members list showed 33 real sign-ups; nobody had used Co-Founder
-- Finder's own listing form, which is a different ask than "let me find
-- people who are already on the platform."
--
-- Deliberately narrower than the Co-Founder Finder decision:
--   - opt-in only (is_discoverable, default false) -- profiles.email was
--     locked down from world-readable in an earlier pass (see the
--     "SEC-01" note on the original hardening migration); auto-listing
--     every existing member without their say-so would undercut that.
--   - readable by signed-in members only, not anonymous visitors --
--     auth.uid() is not null is part of the USING clause below, unlike
--     cofounder_profiles' public read.
-- Safe to re-run.
-- ===========================================================================

alter table public.profiles add column if not exists is_discoverable boolean not null default false;

-- Deliberately NOT a new RLS policy on profiles directly. RLS is row-level:
-- a policy like `using (is_discoverable = true)` would make the WHOLE row
-- readable to any authenticated caller who asks for it -- including email,
-- the exact column the original SEC-01 hardening was written to stop
-- exposing. A client that only selects the safe columns is client-code
-- discipline, not a guarantee; anyone with the anon key can craft their own
-- request for the columns the UI doesn't ask for.
--
-- A SECURITY DEFINER function closes that gap structurally: it bypasses the
-- caller's own RLS (so it can see rows they otherwise couldn't), but the
-- function body is the only thing deciding what comes back, and email is
-- simply not in the returned shape -- not filtered out, never selected in
-- the first place. profiles' own SELECT policy is untouched by this
-- migration, so nothing changes about who can read a full profile row
-- (still just self / admin / org-mate / pending-request-sender, per the
-- existing "members read profiles they are entitled to" policy).
create or replace function public.discoverable_members()
returns table (
  id uuid,
  full_name text,
  preferred_name text,
  photo_url text,
  role_title text,
  org_affiliation text,
  bio text,
  location text,
  areas_of_interest text[],
  skills text[],
  looking_for text[],
  can_offer text[]
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id, p.full_name, p.preferred_name, p.photo_url, p.role_title,
    p.org_affiliation, p.bio, p.location, p.areas_of_interest, p.skills,
    p.looking_for, p.can_offer
  from public.profiles p
  where p.is_discoverable = true
    and auth.uid() is not null
    and p.id <> auth.uid();
$$;

revoke all on function public.discoverable_members() from public;
grant execute on function public.discoverable_members() to authenticated;


-- ---------------------------------------------------------------------------
-- member_connections: same shape and RLS as mentor_connections /
-- cofounder_connections (see supabase/schema.sql). discoverable_members()
-- above structurally excludes email from the directory, so reaching a
-- member goes through a mediated request here instead of a raw address,
-- same as those two tables.
-- ---------------------------------------------------------------------------
create table if not exists public.member_connections (
  id uuid primary key default gen_random_uuid(),
  target_id uuid not null references public.profiles (id) on delete cascade,
  requester_id uuid not null references public.profiles (id) on delete cascade,
  message text not null default '',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now()
);

alter table public.member_connections enable row level security;

drop policy if exists "requester or target reads a member connection" on public.member_connections;
create policy "requester or target reads a member connection" on public.member_connections
  for select using (auth.uid() = requester_id or auth.uid() = target_id);

drop policy if exists "authenticated users request a member connection" on public.member_connections;
create policy "authenticated users request a member connection" on public.member_connections
  for insert with check (auth.uid() = requester_id and requester_id <> target_id);

drop policy if exists "target updates member connection status" on public.member_connections;
create policy "target updates member connection status" on public.member_connections
  for update using (auth.uid() = target_id) with check (auth.uid() = target_id);


-- ---------------------------------------------------------------------------
-- has_pending_request_from() already lets a mentor/cofounder listing owner
-- read the full profile (name + email) of someone who sent them a
-- connection request -- extended here to cover member_connections too, so
-- the same "you reached out, so I can see who you are" rule applies to this
-- new kind of request. security definer, so this doesn't re-enter the
-- profiles policy it's used inside of.
-- ---------------------------------------------------------------------------
create or replace function public.has_pending_request_from(check_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.mentor_connections mc
    join public.mentors m on m.id = mc.mentor_id
    where mc.requester_id = check_user_id and m.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.cofounder_connections cc
    join public.cofounder_profiles cp on cp.id = cc.cofounder_profile_id
    where cc.requester_id = check_user_id and cp.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.member_connections mc2
    where mc2.requester_id = check_user_id and mc2.target_id = auth.uid()
  );
$$;

revoke all on function public.has_pending_request_from(uuid) from public;
grant execute on function public.has_pending_request_from(uuid) to authenticated;
