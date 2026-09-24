-- ===========================================================================
-- 2026-10-01 — Push every website newsletter signup to Beehiiv.
--
-- Same claim / confirm / release shape as the welcome email: the public
-- signup route claims a subscriber's row before calling Beehiiv, confirms
-- when Beehiiv accepts it, and releases the claim if the call fails so the
-- next attempt retries. Existing subscribers start out un-synced, so the
-- admin "Sync to Beehiiv" button can back-fill them.
--
-- Safe to re-run.
-- ===========================================================================

alter table public.newsletter_subscribers
  add column if not exists beehiiv_claimed_at timestamptz,
  add column if not exists beehiiv_synced_at timestamptz;

create or replace function public.claim_newsletter_beehiiv(p_email text)
returns table(email text)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update public.newsletter_subscribers s
  set beehiiv_claimed_at = now()
  where lower(s.email) = lower(p_email) and s.status = 'subscribed' and s.beehiiv_claimed_at is null
  returning s.email;
end;
$$;

create or replace function public.confirm_newsletter_beehiiv(p_email text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.newsletter_subscribers set beehiiv_synced_at = now()
  where lower(email) = lower(p_email) and beehiiv_claimed_at is not null and beehiiv_synced_at is null;
$$;

create or replace function public.release_newsletter_beehiiv(p_email text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.newsletter_subscribers set beehiiv_claimed_at = null
  where lower(email) = lower(p_email) and beehiiv_claimed_at is not null and beehiiv_synced_at is null;
$$;

do $$
declare f text;
begin
  foreach f in array array['claim_newsletter_beehiiv(text)', 'confirm_newsletter_beehiiv(text)', 'release_newsletter_beehiiv(text)'] loop
    execute format('revoke all on function public.%s from public', f);
    execute format('grant execute on function public.%s to anon, authenticated', f);
  end loop;
end $$;
