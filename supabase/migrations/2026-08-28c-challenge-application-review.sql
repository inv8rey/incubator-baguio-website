-- ===========================================================================
-- Challenge application review — 28 Aug 2026
-- Closes GAP-06 from the pre-launch audit: solutions could be submitted but
-- never read, shortlisted, or responded to.
--
-- Safe to re-run.
-- ===========================================================================

-- Review state. 'new' rather than 'pending' to match how the admin Messages
-- tab already labels an unread item, and because a submission isn't waiting
-- on the applicant for anything.
alter table public.challenge_applications
  add column if not exists status text not null default 'new';

alter table public.challenge_applications drop constraint if exists challenge_applications_status_check;
alter table public.challenge_applications
  add constraint challenge_applications_status_check
  check (status in ('new', 'shortlisted', 'accepted', 'rejected'));

-- Free-text note for the reviewer's own reference — why this team was
-- shortlisted, what to ask them next. Never shown to the applicant.
alter table public.challenge_applications
  add column if not exists review_note text not null default '';

alter table public.challenge_applications
  add column if not exists reviewed_at timestamptz;

create index if not exists challenge_applications_status_idx
  on public.challenge_applications (status, created_at desc);

create index if not exists challenge_applications_challenge_idx
  on public.challenge_applications (challenge_id);

-- Admins already had SELECT (added with the dashboard counts). They now need
-- UPDATE to move a submission through review, and DELETE for spam.
drop policy if exists "admins manage challenge applications" on public.challenge_applications;
create policy "admins manage challenge applications" on public.challenge_applications
  for all using (public.is_site_admin()) with check (public.is_site_admin());
