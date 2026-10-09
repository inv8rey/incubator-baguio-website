-- 2026-10-09 — Dependable automatic Google Sheet sync for PinaSIKLab applications.
--
-- The sync no longer depends on the confirmation email. The public endpoint
-- /api/pinasiklab/sheet/ only syncs when an application is newer than the last
-- sync, so calling it with nothing new does nothing and can't hammer the
-- Google Sheets API. Service role only. Safe to re-run.

create table if not exists public.sheet_sync_state (
  key text primary key,
  synced_at timestamptz not null default 'epoch'
);
alter table public.sheet_sync_state enable row level security;  -- no policies: service role only

create or replace function public.claim_siklab_sheet_sync(p_force boolean default false)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  latest timestamptz;
  claimed boolean;
begin
  select coalesce(max(created_at), 'epoch') into latest from public.siklab_registrations;

  insert into public.sheet_sync_state (key) values ('pinasiklab') on conflict (key) do nothing;

  update public.sheet_sync_state
  set synced_at = now()
  where key = 'pinasiklab' and (p_force or synced_at < latest)
  returning true into claimed;

  return coalesce(claimed, false);
end;
$$;

revoke all on function public.claim_siklab_sheet_sync(boolean) from public, anon, authenticated;
grant execute on function public.claim_siklab_sheet_sync(boolean) to service_role;
