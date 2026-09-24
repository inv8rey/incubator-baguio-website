-- ===========================================================================
-- 2026-09-29 — PinaSIKLab sponsor / collaborator inquiries (/pinasiklab/partner/).
--
-- Anyone can submit (no login); only PinaSIKLab organizers (siklab_admins,
-- from the registrations migration) can read or manage them. Every text
-- column is length-capped so the public insert can't be used to stuff the
-- table. Safe to re-run.
-- ===========================================================================

create table if not exists public.siklab_partner_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  org_name text not null check (char_length(org_name) between 1 and 160),
  org_type text not null default '' check (char_length(org_type) <= 80),
  contact_name text not null check (char_length(contact_name) between 1 and 120),
  email text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text not null default '' check (char_length(phone) <= 40),
  ways text[] not null check (array_length(ways, 1) between 1 and 12),
  details text not null default '' check (char_length(details) <= 3000),
  status text not null default 'new' check (status in ('new', 'contacted', 'confirmed', 'declined')),
  admin_note text not null default '' check (char_length(admin_note) <= 2000)
);

alter table public.siklab_partner_inquiries enable row level security;

drop policy if exists "anyone can send a partner inquiry" on public.siklab_partner_inquiries;
create policy "anyone can send a partner inquiry" on public.siklab_partner_inquiries
  for insert with check (status = 'new' and admin_note = '');

drop policy if exists "organizers manage partner inquiries" on public.siklab_partner_inquiries;
create policy "organizers manage partner inquiries" on public.siklab_partner_inquiries
  for all using (public.siklab_is_admin()) with check (public.siklab_is_admin());
