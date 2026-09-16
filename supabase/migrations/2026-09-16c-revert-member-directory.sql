-- Full revert of the Members directory feature (2026-09-11-member-directory.sql,
-- now deleted from this repo). The directory launched opt-in and empty --
-- nobody had used the toggle -- and rather than backfilling everyone's
-- discoverability without their consent, or waiting on individual opt-ins,
-- the decision was to remove the feature entirely.
--
-- Undoes exactly what that migration added, in reverse order, and restores
-- has_pending_request_from() to its pre-member-directory definition (the
-- mentor_connections / cofounder_connections checks only -- copied from
-- that migration's own "before" state, so this isn't a guess).
--
-- Safe to re-run.

drop function if exists public.discoverable_members();

drop table if exists public.member_connections;

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
  );
$$;

revoke all on function public.has_pending_request_from(uuid) from public;
grant execute on function public.has_pending_request_from(uuid) to authenticated;

alter table public.profiles drop column if exists is_discoverable;
