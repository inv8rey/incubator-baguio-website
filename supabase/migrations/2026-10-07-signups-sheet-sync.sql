-- 2026-10-07 — Mirror newsletter and member signups into a Google Sheet.
--
-- The site calls /api/signups-sheet/ after a signup. That endpoint is public,
-- so it only syncs when this claim succeeds: there must be a signup newer than
-- the last sync. Repeated calls with nothing new do nothing, so the endpoint
-- can't be used to hammer the Google Sheets API. Service role only.
-- Safe to re-run.

create table if not exists public.sheet_sync_state (
  key text primary key,
  synced_at timestamptz not null default 'epoch'
);
alter table public.sheet_sync_state enable row level security;  -- no policies: service role only

create or replace function public.claim_signups_sheet_sync(p_force boolean default false)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  latest timestamptz;
  claimed boolean;
begin
  select greatest(
    coalesce((select max(created_at) from public.newsletter_subscribers), 'epoch'),
    coalesce((select max(created_at) from public.profiles), 'epoch')
  ) into latest;

  insert into public.sheet_sync_state (key) values ('signups') on conflict (key) do nothing;

  update public.sheet_sync_state
  set synced_at = now()
  where key = 'signups' and (p_force or synced_at < latest)
  returning true into claimed;

  return coalesce(claimed, false);
end;
$$;

revoke all on function public.claim_signups_sheet_sync(boolean) from public, anon, authenticated;
grant execute on function public.claim_signups_sheet_sync(boolean) to service_role;
