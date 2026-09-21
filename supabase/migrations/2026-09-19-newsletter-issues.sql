-- ===========================================================================
-- 2026-09-19 — Newsletter, part 1: subscriber unsubscribe tracking +
-- newsletter_issues (drafted/sent issue storage). See the plan this session
-- for the full feature; this migration only lays the schema foundation
-- (Phase 1) -- the compose UI and send route land in later commits.
--
-- Safe to re-run.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- newsletter_subscribers: add unsubscribe tracking. The table already
-- exists (schema.sql) with RLS letting anyone INSERT (subscribe) and only
-- admins do anything else -- untouched here.
-- ---------------------------------------------------------------------------
alter table public.newsletter_subscribers
  add column if not exists status text not null default 'subscribed'
    check (status in ('subscribed', 'unsubscribed')),
  add column if not exists unsubscribed_at timestamptz,
  add column if not exists unsubscribe_token uuid not null default gen_random_uuid();

-- A real send loop filters on this constantly; keeps that query an index
-- lookup instead of a sequential scan once the list has any real size.
create index if not exists newsletter_subscribers_status_idx
  on public.newsletter_subscribers (status);

-- ---------------------------------------------------------------------------
-- newsletter_issues: one row per drafted/sent issue. `sections` is
-- deliberately denormalized jsonb (an array of
-- {sectionName, items:[{kind, refId, title, blurb, href}]}) rather than
-- join tables -- this is a single-editor, low-volume tool, and an issue is
-- meant to be a self-contained editorial artifact, not a live query that
-- could reflect a since-edited/deleted challenge or resource differently
-- after the fact.
-- ---------------------------------------------------------------------------
create table if not exists public.newsletter_issues (
  id uuid primary key default gen_random_uuid(),
  issue_number integer,
  subject text not null default '',
  lead_story_html text not null default '',
  sections jsonb not null default '[]'::jsonb,
  status text not null default 'draft'
    check (status in ('draft', 'sending', 'sent', 'failed')),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  recipient_count integer,
  success_count integer,
  failure_count integer,
  failed_emails jsonb
);

alter table public.newsletter_issues enable row level security;

drop policy if exists "admins manage newsletter issues" on public.newsletter_issues;
create policy "admins manage newsletter issues" on public.newsletter_issues
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  ) with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- ---------------------------------------------------------------------------
-- Public, no-login unsubscribe -- same "SECURITY DEFINER function, not a
-- raw-table RLS policy" shape as request_challenge_collaboration()
-- (2026-09-11c-challenge-collaboration-requests.sql): the token (not email
-- or id) is what a link carries, so knowing/guessing someone else's email
-- can't be used to unsubscribe them, and the function only ever flips
-- exactly the one matching, still-subscribed row.
-- ---------------------------------------------------------------------------
create or replace function public.unsubscribe_newsletter(p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.newsletter_subscribers
  set status = 'unsubscribed', unsubscribed_at = now()
  where unsubscribe_token = p_token and status = 'subscribed';
  return found;
end;
$$;

revoke all on function public.unsubscribe_newsletter(uuid) from public;
grant execute on function public.unsubscribe_newsletter(uuid) to anon, authenticated;
