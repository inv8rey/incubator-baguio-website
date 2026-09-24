-- ===========================================================================
-- 2026-09-30 — Newsletter welcome email fixes.
--
--  1. Match the subscriber's email case-insensitively. A signup typed as
--     "Ana@Gmail.com" is stored as typed, but the welcome route looks the
--     address up lower-cased, so it never matched and nothing was sent.
--  2. Track whether the welcome actually went out (welcome_sent_at). Before,
--     claiming the row (welcomed_at) happened first, so ONE failed send (for
--     example Resend not configured yet) marked the person welcomed forever.
--     Now a failed send releases the claim so the next attempt retries.
--
-- release/confirm are callable by the public client (the route uses the anon
-- key), so they're deliberately narrow: release only touches rows that were
-- claimed but never confirmed sent, and every row that already had a welcome
-- is back-filled as "sent" below so it can't be released and re-sent.
--
-- Safe to re-run.
-- ===========================================================================

alter table public.newsletter_subscribers add column if not exists welcome_sent_at timestamptz;

-- Everyone already marked welcomed is treated as sent.
update public.newsletter_subscribers set welcome_sent_at = welcomed_at
where welcomed_at is not null and welcome_sent_at is null;

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
  where lower(email) = lower(p_email) and welcomed_at is null
  returning newsletter_subscribers.unsubscribe_token;
end;
$$;

create or replace function public.confirm_newsletter_welcome(p_email text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.newsletter_subscribers set welcome_sent_at = now()
  where lower(email) = lower(p_email) and welcomed_at is not null and welcome_sent_at is null;
$$;

create or replace function public.release_newsletter_welcome(p_email text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.newsletter_subscribers set welcomed_at = null
  where lower(email) = lower(p_email) and welcomed_at is not null and welcome_sent_at is null;
$$;

do $$
declare f text;
begin
  foreach f in array array['claim_newsletter_welcome(text)', 'confirm_newsletter_welcome(text)', 'release_newsletter_welcome(text)'] loop
    execute format('revoke all on function public.%s from public', f);
    execute format('grant execute on function public.%s to anon, authenticated', f);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- To re-send the welcome to people it never reached (for example your test
-- signups), clear both columns for just those addresses:
--   update public.newsletter_subscribers
--   set welcomed_at = null, welcome_sent_at = null
--   where lower(email) in ('leandrogepila@gmail.com', 'inv8design@gmail.com');
-- Then subscribe again on the site (or the next signup attempt) and it sends.
-- ---------------------------------------------------------------------------
