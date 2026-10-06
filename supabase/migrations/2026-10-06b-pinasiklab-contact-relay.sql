-- 2026-10-06 (b) — "Contact" button on Team Finder applicant cards.
--
-- The site relays the message by email, so an applicant's address is never
-- shown on the page. The relay route runs with the service role; nothing here
-- is callable by the public API. Safe to re-run.

-- Log used only to rate-limit the relay (per sender and per recipient).
create table if not exists public.siklab_contact_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  applicant_id uuid not null,
  sender_email text not null
);
create index if not exists siklab_contact_log_sender_idx on public.siklab_contact_log (lower(sender_email), created_at);
create index if not exists siklab_contact_log_target_idx on public.siklab_contact_log (applicant_id, created_at);
alter table public.siklab_contact_log enable row level security;  -- no policies: service role only

-- Returns the address to relay to, only for an individual currently listed on
-- the Team Finder. Service role only, because the result is an email address.
create or replace function public.siklab_contact_target(p_id uuid)
returns table(email text, full_name text)
language sql
security definer
set search_path = public
as $$
  select r.email, r.full_name
  from public.siklab_registrations r
  where r.id = p_id
    and r.id in (select id from public.siklab_applicants_public where participation = 'individual');
$$;

revoke all on function public.siklab_contact_target(uuid) from public, anon, authenticated;
grant execute on function public.siklab_contact_target(uuid) to service_role;
