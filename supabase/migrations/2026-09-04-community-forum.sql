-- 2026-09-04: Community forum. Open posting (visible immediately once
-- posted, no admin pre-approval queue like every other UGC on this site) so
-- discussion actually feels open, moderated instead through member reports
-- that land in an admin queue.
--
-- Author name/photo are denormalized onto each thread/reply at write time,
-- captured from the poster's own profile (which they always have full read
-- access to). This is deliberate: `profiles` is NOT publicly readable --
-- "members read profiles they are entitled to" restricts it to yourself, an
-- admin, or someone you share an org / have a pending request with (see
-- 2026-08-28b-fix-profiles-recursion.sql) -- so a public forum reader could
-- never join against it to show another member's name. Same pattern
-- `saved_items` already uses for exactly this reason.

create table if not exists public.forum_threads (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  author_name text not null default '',
  author_photo_url text not null default '',
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.forum_threads enable row level security;

drop policy if exists "forum threads are publicly readable" on public.forum_threads;
create policy "forum threads are publicly readable" on public.forum_threads
  for select using (true);

drop policy if exists "members can start a thread" on public.forum_threads;
create policy "members can start a thread" on public.forum_threads
  for insert with check (auth.uid() = author_id);

drop policy if exists "authors delete their own thread" on public.forum_threads;
create policy "authors delete their own thread" on public.forum_threads
  for delete using (auth.uid() = author_id);

-- Routed through is_site_admin() (security definer), not an inline
-- `exists (select 1 from public.profiles where ...)` -- that pattern caused
-- a production 42P17 infinite recursion once already when used directly on
-- the profiles table itself. Not a risk here since this policy lives on a
-- different table, but the helper is the established convention going
-- forward for every new admin-all policy in this codebase.
drop policy if exists "admins manage all forum threads" on public.forum_threads;
create policy "admins manage all forum threads" on public.forum_threads
  for all using (public.is_site_admin()) with check (public.is_site_admin());


create table if not exists public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.forum_threads (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  author_name text not null default '',
  author_photo_url text not null default '',
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.forum_replies enable row level security;

drop policy if exists "forum replies are publicly readable" on public.forum_replies;
create policy "forum replies are publicly readable" on public.forum_replies
  for select using (true);

drop policy if exists "members can reply" on public.forum_replies;
create policy "members can reply" on public.forum_replies
  for insert with check (auth.uid() = author_id);

drop policy if exists "authors delete their own reply" on public.forum_replies;
create policy "authors delete their own reply" on public.forum_replies
  for delete using (auth.uid() = author_id);

drop policy if exists "admins manage all forum replies" on public.forum_replies;
create policy "admins manage all forum replies" on public.forum_replies
  for all using (public.is_site_admin()) with check (public.is_site_admin());

create index if not exists forum_replies_thread_id_idx on public.forum_replies (thread_id);


-- Reports land in an admin-only queue. target_preview is a snapshot of the
-- reported content's title/body at report time, so the queue is readable
-- (and stays readable even if the post is deleted before review) without
-- needing a join back to forum_threads/forum_replies.
create table if not exists public.forum_reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('thread', 'reply')),
  target_id uuid not null,
  thread_id uuid not null references public.forum_threads (id) on delete cascade,
  target_preview text not null default '',
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null default '',
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now()
);

alter table public.forum_reports enable row level security;

drop policy if exists "members can report forum content" on public.forum_reports;
create policy "members can report forum content" on public.forum_reports
  for insert with check (auth.uid() = reporter_id);

drop policy if exists "admins manage forum reports" on public.forum_reports;
create policy "admins manage forum reports" on public.forum_reports
  for all using (public.is_site_admin()) with check (public.is_site_admin());

create index if not exists forum_reports_status_idx on public.forum_reports (status);
