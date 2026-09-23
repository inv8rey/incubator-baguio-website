-- ===========================================================================
-- 2026-09-23 — Auto-send a one-time welcome email to every new newsletter
-- subscriber (homepage form, the "Stay in the loop" overlay, and the
-- calendar page's Subscribe form all insert into newsletter_subscribers
-- directly from the client, so there's no single server-side chokepoint to
-- hang this off of the way an admin-triggered action would have).
--
-- Safe to re-run.
-- ===========================================================================

-- welcomed_at makes the claim function below atomic and idempotent: calling
-- it twice for the same email only ever sends once, no matter how many times
-- (or how many different call sites) end up asking.
alter table public.newsletter_subscribers
  add column if not exists welcomed_at timestamptz;

-- ---------------------------------------------------------------------------
-- Same "SECURITY DEFINER function, not a raw-table RLS policy" shape as
-- unsubscribe_newsletter() above it: newsletter_subscribers only grants
-- INSERT to anon (schema.sql), so a public POST /api/newsletter/welcome
-- route needs its own narrow, single-purpose way in. The function only ever
-- claims (and returns the token for) the one row matching p_email, and only
-- the first time -- a second call for an already-welcomed email finds no
-- row and the route sends nothing.
-- ---------------------------------------------------------------------------
create or replace function public.claim_newsletter_welcome(p_email text)
returns table(unsubscribe_token uuid)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update public.newsletter_subscribers
  set welcomed_at = now()
  where email = p_email and welcomed_at is null
  returning newsletter_subscribers.unsubscribe_token;
end;
$$;

revoke all on function public.claim_newsletter_welcome(text) from public;
grant execute on function public.claim_newsletter_welcome(text) to anon, authenticated;
