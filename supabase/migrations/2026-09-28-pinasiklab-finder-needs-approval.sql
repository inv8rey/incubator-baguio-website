-- 2026-09-28 — Applicants only appear on the Team Finder after an organizer
-- approves (accepts) their application. Re-creates the view from 2026-09-27.

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
