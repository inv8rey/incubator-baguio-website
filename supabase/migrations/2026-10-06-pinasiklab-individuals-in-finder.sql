-- 2026-10-06 — Individual applicants who opted in appear on the Team Finder's
-- "Find a member" tab right after they apply, instead of waiting for approval.
--
-- * Individuals who applied on or after this date are listed straight away
--   (unless an organizer later declines them). They saw the updated consent
--   wording on the form.
-- * Individuals who applied earlier consented to "once my application is
--   approved", so they stay hidden until accepted.
-- * Teams are unchanged: a team applicant is listed (and counted as a
--   finalized team) only once accepted.
-- Re-creates the view from 2026-09-28. Safe to re-run.

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
    and (
      (r.participation = 'individual'
        and (r.status = 'accepted'
             or (r.status <> 'declined' and r.created_at >= timestamptz '2026-10-06 00:00:00+08'))
        and not exists (
          select 1 from public.siklab_participants p
          join auth.users u on u.id = p.user_id
          where lower(u.email) = lower(r.email)
        ))
      or
      (r.participation = 'team' and r.status = 'accepted' and not exists (
        select 1 from public.siklab_teams t where lower(t.name) = lower(r.team_name)
      ))
    );

grant select on public.siklab_applicants_public to anon, authenticated;
