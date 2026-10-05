-- "We received your application" email for PinaSIKLab registrations.
--
-- Same claim pattern as the newsletter welcome email: the API route can only
-- send for an address that really has an application, only once, and only
-- shortly after it was submitted, so the endpoint can't be used to email
-- arbitrary people. Safe to re-run.

alter table public.siklab_registrations
  add column if not exists confirmation_claimed_at timestamptz,
  add column if not exists confirmation_sent_at timestamptz;

create or replace function public.claim_siklab_confirmation(p_email text)
returns table(full_name text, participation text, team_name text)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update public.siklab_registrations r
  set confirmation_claimed_at = now()
  where lower(r.email) = lower(p_email)
    and r.confirmation_claimed_at is null
    and r.created_at > now() - interval '30 minutes'
  returning r.full_name, r.participation, r.team_name;
end;
$$;

create or replace function public.confirm_siklab_confirmation(p_email text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.siklab_registrations set confirmation_sent_at = now()
  where lower(email) = lower(p_email) and confirmation_claimed_at is not null and confirmation_sent_at is null;
$$;

-- Un-claims after a failed send so a retry can try again.
create or replace function public.release_siklab_confirmation(p_email text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.siklab_registrations set confirmation_claimed_at = null
  where lower(email) = lower(p_email) and confirmation_sent_at is null;
$$;

revoke all on function public.claim_siklab_confirmation(text) from public;
revoke all on function public.confirm_siklab_confirmation(text) from public;
revoke all on function public.release_siklab_confirmation(text) from public;
grant execute on function public.claim_siklab_confirmation(text) to anon, authenticated;
grant execute on function public.confirm_siklab_confirmation(text) to anon, authenticated;
grant execute on function public.release_siklab_confirmation(text) to anon, authenticated;
