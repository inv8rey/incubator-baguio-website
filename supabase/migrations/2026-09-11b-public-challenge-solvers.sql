-- Fix: "Teams currently working on this" always shows 0 on the public
-- challenge detail page, even when the admin panel shows an accepted
-- submission (e.g. SLU Mechanical Engineering Spartans on the Urban Heat
-- Islands challenge).
--
-- Root cause: `challenge_applications` RLS only grants SELECT to
-- public.is_site_admin() (see 2026-08-28b-fix-profiles-recursion.sql). The
-- public challenge page queries this table with the anon client
-- (fetchChallengeApplications in app/challenges/dynamicData.ts), so RLS
-- silently filters every row -- no error, just an empty result -- and the
-- page renders "No teams have registered yet" regardless of what's actually
-- in the table.
--
-- Fix follows the same pattern as discoverable_members() and other public
-- directories in this codebase: a SECURITY DEFINER function that returns
-- only the columns that are safe to publish, rather than an RLS policy on
-- the table itself (RLS is row-level, not column-level -- a policy letting
-- anon read accepted rows would also expose contact_name, contact_email, and
-- phone on those same rows). Only 'accepted' applications are returned --
-- "currently working on this" shouldn't surface unreviewed or rejected
-- submissions.

-- challenge_applications.challenge_id is stored as text (not a uuid foreign
-- key), so p_challenge_id must match that type -- passing uuid here throws
-- "operator does not exist: text = uuid" at query time.
create or replace function public.public_challenge_solvers(p_challenge_id text)
returns table (
  id uuid,
  team_name text,
  team_size text,
  affiliation text,
  course text,
  approach text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select a.id, a.team_name, a.team_size, a.affiliation, a.course, a.approach, a.created_at
  from public.challenge_applications a
  where a.challenge_id = p_challenge_id
    and a.status = 'accepted'
  order by a.created_at desc;
$$;

revoke all on function public.public_challenge_solvers(text) from public;
grant execute on function public.public_challenge_solvers(text) to anon, authenticated;
