-- PinaSIKLab registration deadline moved to October 23, 2026.
-- Applications now close at the end of October 23 (Philippine time), matching
-- REGISTRATION_CLOSES_AT in app/pinasiklab/config.ts. Safe to re-run.
drop policy if exists "anyone can submit a registration" on public.siklab_registrations;
create policy "anyone can submit a registration" on public.siklab_registrations
  for insert with check (status = 'new' and admin_note = '' and now() < timestamptz '2026-10-24 00:00:00+08');
