-- ===========================================================================
-- 2026-09-27 — Show PinaSIKLab applicants in the Team Finder automatically.
--
-- Applicants who tick "show me on the Team Finder" on the application form
-- appear as read-only cards once an organizer approves (accepts) their
-- application: individuals under "Find a member", teams under
-- "Find a team". Only name, skills, a short bio, team name and member NAMES
-- are exposed. Never email, phone, or member emails.
--
-- When an applicant logs in with the same email and creates their Team
-- Finder profile (or a team with the same name), their applicant card
-- disappears and the real, interactive one takes its place, so nobody is
-- listed twice.
--
-- Run after 2026-09-25-pinasiklab-team-finder.sql and
-- 2026-09-26-pinasiklab-registrations.sql. Safe to re-run.
-- ===========================================================================

alter table public.siklab_registrations
  add column if not exists show_in_finder boolean not null default false;

create or replace view public.siklab_applicants_public
with (security_invoker = off) as
  select
    r.id,
    r.participation,
    r.full_name,
    r.skills,
    left(r.contribution, 400) as bio,
    r.team_name,
    r.team_size,
    array(
      select n from (
        select nullif(trim(regexp_replace(l, '[\s,;:|-]*\S+@\S+.*$', '')), '') as n
        from unnest(regexp_split_to_array(r.team_members, E'\r?\n')) as l
      ) s
      where n is not null
    ) as member_names,
    r.created_at
  from public.siklab_registrations r
  where r.show_in_finder
    and r.status = 'accepted'
    and (
      (r.participation = 'individual' and not exists (
        select 1 from public.siklab_participants p
        join auth.users u on u.id = p.user_id
        where lower(u.email) = lower(r.email)
      ))
      or
      (r.participation = 'team' and not exists (
        select 1 from public.siklab_teams t where lower(t.name) = lower(r.team_name)
      ))
    );

grant select on public.siklab_applicants_public to anon, authenticated;

-- Lets a logged-in applicant's profile form come pre-filled from their
-- application (matched on their login email).
create or replace function public.siklab_my_registration()
returns table (full_name text, phone text, skills text[], contribution text, participation text, team_name text)
language sql
stable
security definer
set search_path = public
as $$
  select r.full_name, r.phone, r.skills, r.contribution, r.participation, r.team_name
  from public.siklab_registrations r
  where lower(r.email) = lower((select email from auth.users where id = auth.uid()))
  limit 1;
$$;

revoke all on function public.siklab_my_registration() from public;
grant execute on function public.siklab_my_registration() to authenticated;
