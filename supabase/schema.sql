-- Incubator Baguio Website — Supabase schema
-- Run this once in your Supabase project's SQL editor (Project > SQL Editor > New query).
-- Safe to re-run: every statement is guarded with IF NOT EXISTS / OR REPLACE.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles: one row per signed-up user, created client-side right after signup
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  is_mentor boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Migrates profiles created before the admin flag existed. No-op on a fresh table.
alter table public.profiles add column if not exists is_admin boolean not null default false;

alter table public.profiles enable row level security;

drop policy if exists "profiles are publicly readable" on public.profiles;
create policy "profiles are publicly readable" on public.profiles
  for select using (true);

drop policy if exists "users can insert their own profile" on public.profiles;
create policy "users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "users can update their own profile" on public.profiles;
create policy "users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Auto-creates a profiles row whenever a new auth user is created. This is
-- the reliable path — it runs with elevated privileges server-side, so it
-- can't be skipped by RLS timing issues the way a client-side insert can
-- (e.g. when email confirmation delays the first authenticated session).
-- The app's client-side signup insert and AuthProvider self-heal check are
-- both still in place as a backstop, but this trigger is the source of truth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfills any existing auth users (like ones created before this trigger
-- existed) who are still missing a profiles row.
insert into public.profiles (id, email, full_name)
select u.id, coalesce(u.email, ''), coalesce(u.raw_user_meta_data->>'full_name', '')
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- ---------------------------------------------------------------------------
-- startups: "Create a startup profile"
-- ---------------------------------------------------------------------------
create table if not exists public.startups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles (id) on delete cascade,
  name text not null,
  tagline text not null default '',
  sector text not null default '',
  tbi_affiliation text not null default '',
  description text not null default '',
  website text not null default '',
  contact_email text not null default '',
  logo_url text not null default '',
  lifecycle_stage text not null default 'Idea',
  funding_raised text not null default '',
  founded_year text not null default '',
  address text not null default '',
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);

-- Migrates tables created before the stage -> tbi_affiliation rename. No-op on a fresh table.
alter table public.startups add column if not exists tbi_affiliation text not null default '';
alter table public.startups drop column if exists stage;

-- Migrates tables created before admin curation (logo, lifecycle, funding) was added.
-- owner_id becomes optional so admins can add a startup with no linked founder account.
alter table public.startups alter column owner_id drop not null;
alter table public.startups add column if not exists logo_url text not null default '';
alter table public.startups add column if not exists lifecycle_stage text not null default 'Idea';
alter table public.startups add column if not exists funding_raised text not null default '';
alter table public.startups add column if not exists founded_year text not null default '';

-- Migrates tables created before real map locations were supported. Nullable
-- lat/lng is intentional — rows without a set location fall back to the map's
-- deterministic placeholder placement (see app/ecosystem/EcosystemMap.tsx).
alter table public.startups add column if not exists address text not null default '';
alter table public.startups add column if not exists latitude double precision;
alter table public.startups add column if not exists longitude double precision;

-- Keeps startup cards visually consistent by capping field lengths at the database level.
alter table public.startups drop constraint if exists startups_lifecycle_stage_check;
alter table public.startups add constraint startups_lifecycle_stage_check check (lifecycle_stage in ('Idea', 'MVP', 'Launch', 'Growth'));
alter table public.startups drop constraint if exists startups_name_length;
alter table public.startups add constraint startups_name_length check (char_length(name) <= 60);
alter table public.startups drop constraint if exists startups_tagline_length;
alter table public.startups add constraint startups_tagline_length check (char_length(tagline) <= 100);
alter table public.startups drop constraint if exists startups_description_length;
alter table public.startups add constraint startups_description_length check (char_length(description) <= 280);
alter table public.startups drop constraint if exists startups_tbi_affiliation_length;
alter table public.startups add constraint startups_tbi_affiliation_length check (char_length(tbi_affiliation) <= 60);
alter table public.startups drop constraint if exists startups_address_length;
alter table public.startups add constraint startups_address_length check (char_length(address) <= 160);

alter table public.startups enable row level security;

drop policy if exists "startups are publicly readable" on public.startups;
create policy "startups are publicly readable" on public.startups
  for select using (true);

drop policy if exists "owners manage their startups" on public.startups;
create policy "owners manage their startups" on public.startups
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Admins (profiles.is_admin = true) can add, edit, or remove ANY startup —
-- this is what makes the admin dashboard the curated source of truth for
-- what's shown publicly on the Ecosystem directory.
drop policy if exists "admins manage all startups" on public.startups;
create policy "admins manage all startups" on public.startups
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  ) with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- ---------------------------------------------------------------------------
-- mentors: "Be a mentor" — one mentor profile per user
-- ---------------------------------------------------------------------------
create table if not exists public.mentors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid unique references public.profiles (id) on delete cascade,
  name text not null,
  position text not null default '',
  company text not null default '',
  bio text not null default '',
  specializations text[] not null default '{}',
  photo_url text not null default '',
  created_at timestamptz not null default now()
);

-- Migrates tables created before admin-added mentors (no linked founder account) were supported.
alter table public.mentors alter column owner_id drop not null;
alter table public.mentors add column if not exists photo_url text not null default '';

-- Migrates tables created before "Expertise" + "Tag" were replaced with
-- Position/Company + a fixed up-to-3 Specialization list.
alter table public.mentors add column if not exists position text not null default '';
alter table public.mentors add column if not exists company text not null default '';
alter table public.mentors add column if not exists specializations text[] not null default '{}';
alter table public.mentors drop column if exists expertise;
alter table public.mentors drop column if exists tag;

alter table public.mentors drop constraint if exists mentors_specializations_count;
alter table public.mentors add constraint mentors_specializations_count check (array_length(specializations, 1) is null or array_length(specializations, 1) <= 3);
alter table public.mentors drop constraint if exists mentors_specializations_values;
alter table public.mentors add constraint mentors_specializations_values check (
  specializations <@ array[
    'Startup & Entrepreneurship', 'Business Development', 'Finance & Investment',
    'Marketing & Growth', 'Product & Technology', 'Legal & Intellectual Property',
    'Research & Commercialization', 'Industry Experts'
  ]::text[]
);

alter table public.mentors enable row level security;

drop policy if exists "mentors are publicly readable" on public.mentors;
create policy "mentors are publicly readable" on public.mentors
  for select using (true);

drop policy if exists "owners manage their mentor profile" on public.mentors;
create policy "owners manage their mentor profile" on public.mentors
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Admins can add/edit/remove ANY mentor, same reasoning as startups above —
-- lets the admin dashboard curate the Ecosystem "Mentors" tab directly.
drop policy if exists "admins manage all mentors" on public.mentors;
create policy "admins manage all mentors" on public.mentors
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  ) with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- ---------------------------------------------------------------------------
-- mentor_connections: "Connect with mentors"
-- ---------------------------------------------------------------------------
create table if not exists public.mentor_connections (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.mentors (id) on delete cascade,
  requester_id uuid not null references public.profiles (id) on delete cascade,
  message text not null default '',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now()
);

alter table public.mentor_connections enable row level security;

drop policy if exists "requester or mentor can read a connection" on public.mentor_connections;
create policy "requester or mentor can read a connection" on public.mentor_connections
  for select using (
    auth.uid() = requester_id
    or auth.uid() = (select owner_id from public.mentors where id = mentor_id)
  );

drop policy if exists "authenticated users can request a connection" on public.mentor_connections;
create policy "authenticated users can request a connection" on public.mentor_connections
  for insert with check (auth.uid() = requester_id);

drop policy if exists "mentor can update connection status" on public.mentor_connections;
create policy "mentor can update connection status" on public.mentor_connections
  for update using (
    auth.uid() = (select owner_id from public.mentors where id = mentor_id)
  );

-- ---------------------------------------------------------------------------
-- organizations: "Publish an organization"
-- org_type mirrors app/ecosystem/data.ts EcosystemCategory values
-- ---------------------------------------------------------------------------
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles (id) on delete cascade,
  name text not null,
  org_type text not null check (org_type in ('TBIs', 'Corporate', 'Government', 'Community', 'Coworking Spaces', 'Makerspaces & Labs')),
  description text not null default '',
  website text not null default '',
  contact_email text not null default '',
  logo_url text not null default '',
  type text not null default '',
  created_at timestamptz not null default now()
);

-- Migrates tables created before admin-added organizations (no linked founder account) were supported.
alter table public.organizations alter column owner_id drop not null;
alter table public.organizations add column if not exists logo_url text not null default '';
-- A short descriptive label (e.g. "Coworking space", "Business association") shown on its Ecosystem card.
alter table public.organizations add column if not exists type text not null default '';

alter table public.organizations enable row level security;

drop policy if exists "organizations are publicly readable" on public.organizations;
create policy "organizations are publicly readable" on public.organizations
  for select using (true);

drop policy if exists "owners manage their organizations" on public.organizations;
create policy "owners manage their organizations" on public.organizations
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Admins can add/edit/remove ANY organization, same reasoning as startups above.
drop policy if exists "admins manage all organizations" on public.organizations;
create policy "admins manage all organizations" on public.organizations
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  ) with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- ---------------------------------------------------------------------------
-- challenge_submissions: "Create ... innovation challenges" (Post a Challenge)
-- ---------------------------------------------------------------------------
create table if not exists public.challenge_submissions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  org_name text not null,
  org_type text not null default '',
  contact_name text not null default '',
  email text not null default '',
  phone text not null default '',
  title text not null,
  sector text not null default '',
  problem text not null default '',
  scope text not null default '',
  support text not null default '',
  deadline text not null default '',
  created_at timestamptz not null default now()
);

alter table public.challenge_submissions enable row level security;

drop policy if exists "challenge submissions are publicly readable" on public.challenge_submissions;
create policy "challenge submissions are publicly readable" on public.challenge_submissions
  for select using (true);

drop policy if exists "owners manage their challenge submissions" on public.challenge_submissions;
create policy "owners manage their challenge submissions" on public.challenge_submissions
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- challenge_applications: "... or apply to innovation challenges"
-- challenge_id holds either a static challenge slug (app/challenges/data.ts)
-- or a challenge_submissions.id uuid — private to the applicant.
-- ---------------------------------------------------------------------------
create table if not exists public.challenge_applications (
  id uuid primary key default gen_random_uuid(),
  challenge_id text not null,
  applicant_id uuid not null references public.profiles (id) on delete cascade,
  team_name text not null default '',
  contact_name text not null default '',
  email text not null default '',
  phone text not null default '',
  team_size text not null default '',
  affiliation text not null default '',
  role text not null default '',
  course text not null default '',
  approach text not null default '',
  why_you text not null default '',
  created_at timestamptz not null default now()
);

alter table public.challenge_applications enable row level security;

drop policy if exists "applicants manage their own applications" on public.challenge_applications;
create policy "applicants manage their own applications" on public.challenge_applications
  for all using (auth.uid() = applicant_id) with check (auth.uid() = applicant_id);

-- ---------------------------------------------------------------------------
-- storage: startup-logos bucket for "add a way to add a logo"
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('startup-logos', 'startup-logos', true)
on conflict (id) do nothing;

drop policy if exists "startup logos are publicly readable" on storage.objects;
create policy "startup logos are publicly readable" on storage.objects
  for select using (bucket_id = 'startup-logos');

drop policy if exists "authenticated users can upload startup logos" on storage.objects;
create policy "authenticated users can upload startup logos" on storage.objects
  for insert to authenticated with check (bucket_id = 'startup-logos');

drop policy if exists "authenticated users can update startup logos" on storage.objects;
create policy "authenticated users can update startup logos" on storage.objects
  for update to authenticated using (bucket_id = 'startup-logos');

drop policy if exists "authenticated users can delete startup logos" on storage.objects;
create policy "authenticated users can delete startup logos" on storage.objects
  for delete to authenticated using (bucket_id = 'startup-logos');

-- ---------------------------------------------------------------------------
-- storage: mentor-photos bucket for mentor card photos
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('mentor-photos', 'mentor-photos', true)
on conflict (id) do nothing;

drop policy if exists "mentor photos are publicly readable" on storage.objects;
create policy "mentor photos are publicly readable" on storage.objects
  for select using (bucket_id = 'mentor-photos');

drop policy if exists "authenticated users can upload mentor photos" on storage.objects;
create policy "authenticated users can upload mentor photos" on storage.objects
  for insert to authenticated with check (bucket_id = 'mentor-photos');

drop policy if exists "authenticated users can update mentor photos" on storage.objects;
create policy "authenticated users can update mentor photos" on storage.objects
  for update to authenticated using (bucket_id = 'mentor-photos');

drop policy if exists "authenticated users can delete mentor photos" on storage.objects;
create policy "authenticated users can delete mentor photos" on storage.objects
  for delete to authenticated using (bucket_id = 'mentor-photos');

-- ---------------------------------------------------------------------------
-- storage: org-logos bucket for TBI/Corporate/Government/Community/Coworking/Makerspace logos
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('org-logos', 'org-logos', true)
on conflict (id) do nothing;

drop policy if exists "org logos are publicly readable" on storage.objects;
create policy "org logos are publicly readable" on storage.objects
  for select using (bucket_id = 'org-logos');

drop policy if exists "authenticated users can upload org logos" on storage.objects;
create policy "authenticated users can upload org logos" on storage.objects
  for insert to authenticated with check (bucket_id = 'org-logos');

drop policy if exists "authenticated users can update org logos" on storage.objects;
create policy "authenticated users can update org logos" on storage.objects
  for update to authenticated using (bucket_id = 'org-logos');

drop policy if exists "authenticated users can delete org logos" on storage.objects;
create policy "authenticated users can delete org logos" on storage.objects
  for delete to authenticated using (bucket_id = 'org-logos');
