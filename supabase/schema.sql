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

-- One row per founder: [{ "name": "Juan Dela Cruz", "status": "Student" | "Professional" }, ...]
alter table public.startups add column if not exists founders jsonb not null default '[]'::jsonb;

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

-- Sector only applies to "Industry Experts" mentors; social_link is a single
-- Facebook/LinkedIn/website URL shown alongside their card.
alter table public.mentors add column if not exists sector text not null default '';
alter table public.mentors add column if not exists social_link text not null default '';

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
  org_type text not null check (org_type in ('TBIs', 'Companies', 'Service Providers', 'Government', 'Community', 'Coworking Spaces', 'Makerspaces & Labs')),
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
-- Banner/cover photo shown on Coworking Spaces & Makerspaces & Labs cards (OrgPhotoCard), separate from logo_url.
alter table public.organizations add column if not exists cover_url text not null default '';

-- "Corporate" renamed to "Companies", plus a new "Service Providers" category.
update public.organizations set org_type = 'Companies' where org_type = 'Corporate';
alter table public.organizations drop constraint if exists organizations_org_type_check;
alter table public.organizations add constraint organizations_org_type_check
  check (org_type in ('TBIs', 'Companies', 'Service Providers', 'Government', 'Community', 'Coworking Spaces', 'Makerspaces & Labs'));

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
-- storage: org-logos bucket for TBI/Companies/Service Providers/Government/Community/Coworking/Makerspace logos
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

-- storage: org-covers bucket for Coworking Spaces & Makerspaces & Labs banner photos
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('org-covers', 'org-covers', true)
on conflict (id) do nothing;

drop policy if exists "org covers are publicly readable" on storage.objects;
create policy "org covers are publicly readable" on storage.objects
  for select using (bucket_id = 'org-covers');

drop policy if exists "authenticated users can upload org covers" on storage.objects;
create policy "authenticated users can upload org covers" on storage.objects
  for insert to authenticated with check (bucket_id = 'org-covers');

drop policy if exists "authenticated users can update org covers" on storage.objects;
create policy "authenticated users can update org covers" on storage.objects
  for update to authenticated using (bucket_id = 'org-covers');

drop policy if exists "authenticated users can delete org covers" on storage.objects;
create policy "authenticated users can delete org covers" on storage.objects
  for delete to authenticated using (bucket_id = 'org-covers');

-- ---------------------------------------------------------------------------
-- ecosystem_partners: logos for the homepage's scrolling "Ecosystem partners"
-- marquee (universities, agencies, chambers, etc). Admin-managed only — no
-- owner_id, since these aren't self-published by founders.
-- ---------------------------------------------------------------------------
create table if not exists public.ecosystem_partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text not null default '',
  created_at timestamptz not null default now()
);

alter table public.ecosystem_partners enable row level security;

drop policy if exists "ecosystem partners are publicly readable" on public.ecosystem_partners;
create policy "ecosystem partners are publicly readable" on public.ecosystem_partners
  for select using (true);

drop policy if exists "admins manage ecosystem partners" on public.ecosystem_partners;
create policy "admins manage ecosystem partners" on public.ecosystem_partners
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  ) with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- ---------------------------------------------------------------------------
-- storage: partner-logos bucket for the ecosystem partners marquee
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('partner-logos', 'partner-logos', true)
on conflict (id) do nothing;

drop policy if exists "partner logos are publicly readable" on storage.objects;
create policy "partner logos are publicly readable" on storage.objects
  for select using (bucket_id = 'partner-logos');

drop policy if exists "authenticated users can upload partner logos" on storage.objects;
create policy "authenticated users can upload partner logos" on storage.objects
  for insert to authenticated with check (bucket_id = 'partner-logos');

drop policy if exists "authenticated users can update partner logos" on storage.objects;
create policy "authenticated users can update partner logos" on storage.objects
  for update to authenticated using (bucket_id = 'partner-logos');

drop policy if exists "authenticated users can delete partner logos" on storage.objects;
create policy "authenticated users can delete partner logos" on storage.objects
  for delete to authenticated using (bucket_id = 'partner-logos');

-- ---------------------------------------------------------------------------
-- realtime: lets the admin Dashboard tab subscribe to live inserts/updates/
-- deletes on these tables (via supabase.channel().on('postgres_changes', ...))
-- so its KPIs, charts, and activity feed update without a page reload.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'startups'
  ) then
    alter publication supabase_realtime add table public.startups;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'mentors'
  ) then
    alter publication supabase_realtime add table public.mentors;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'organizations'
  ) then
    alter publication supabase_realtime add table public.organizations;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'profiles'
  ) then
    alter publication supabase_realtime add table public.profiles;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'challenge_submissions'
  ) then
    alter publication supabase_realtime add table public.challenge_submissions;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'event_submissions'
  ) then
    alter publication supabase_realtime add table public.event_submissions;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- newsletter_subscribers: homepage + calendar "Subscribe" email capture.
-- Anyone can subscribe; only admins can read the list (it's PII).
-- ---------------------------------------------------------------------------
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default '',
  created_at timestamptz not null default now(),
  unique (email)
);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "anyone can subscribe to the newsletter" on public.newsletter_subscribers;
create policy "anyone can subscribe to the newsletter" on public.newsletter_subscribers
  for insert with check (true);

drop policy if exists "admins manage newsletter subscribers" on public.newsletter_subscribers;
create policy "admins manage newsletter subscribers" on public.newsletter_subscribers
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  ) with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- ---------------------------------------------------------------------------
-- event_submissions: "Submit an event" on the Calendar page. No login
-- required (any organizer can submit). Goes live only after an admin
-- approves it — mirrors the moderation gate the user asked for, unlike
-- challenge_submissions which publishes immediately.
-- ---------------------------------------------------------------------------
create table if not exists public.event_submissions (
  id uuid primary key default gen_random_uuid(),
  contact_name text not null default '',
  email text not null default '',
  phone text not null default '',
  org text not null default '',
  org_type text not null default '',
  title text not null,
  category text not null default 'Other',
  event_date text not null,
  end_date text not null default '',
  event_time text not null default '',
  venue text not null default '',
  format text not null default 'In-Person',
  description text not null default '',
  cta text not null default 'Register',
  registration_link text not null default '',
  poster_url text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.event_submissions add column if not exists registration_link text not null default '';
alter table public.event_submissions add column if not exists poster_url text not null default '';

alter table public.event_submissions enable row level security;

drop policy if exists "anyone can submit an event" on public.event_submissions;
create policy "anyone can submit an event" on public.event_submissions
  for insert with check (true);

drop policy if exists "approved events are publicly readable" on public.event_submissions;
create policy "approved events are publicly readable" on public.event_submissions
  for select using (status = 'approved');

drop policy if exists "admins manage event submissions" on public.event_submissions;
create policy "admins manage event submissions" on public.event_submissions
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  ) with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- ---------------------------------------------------------------------------
-- storage: event-posters bucket for admin-added event poster images.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('event-posters', 'event-posters', true)
on conflict (id) do nothing;

drop policy if exists "event posters are publicly readable" on storage.objects;
create policy "event posters are publicly readable" on storage.objects
  for select using (bucket_id = 'event-posters');

drop policy if exists "authenticated users can upload event posters" on storage.objects;
create policy "authenticated users can upload event posters" on storage.objects
  for insert to authenticated with check (bucket_id = 'event-posters');

drop policy if exists "authenticated users can update event posters" on storage.objects;
create policy "authenticated users can update event posters" on storage.objects
  for update to authenticated using (bucket_id = 'event-posters');

drop policy if exists "authenticated users can delete event posters" on storage.objects;
create policy "authenticated users can delete event posters" on storage.objects
  for delete to authenticated using (bucket_id = 'event-posters');

-- ---------------------------------------------------------------------------
-- ecosystem_signups: TEMPORARY no-login signup form (app/ecosystem-signup)
-- for people to submit themselves as a startup, mentor, or organization
-- without needing an account. Purely a moderation staging table — it has
-- no public read policy because approved rows are materialized directly
-- into the real startups/mentors/organizations tables (see the admin
-- "Signups" tab), not read from here. Safe to drop this whole table (and
-- delete app/ecosystem-signup + app/admin/tabs/EcosystemSignupsTab.tsx)
-- once the temporary signup period is over.
--
-- Expected `payload` shape per entity_type:
--   startup:      { name, sector, stage, description, website }
--   mentor:       { name, position, company, bio, specializations: string[] }
--   organization: { name, org_type, type, description, website }
-- ---------------------------------------------------------------------------
create table if not exists public.ecosystem_signups (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('startup', 'mentor', 'organization')),
  contact_name text not null default '',
  email text not null default '',
  phone text not null default '',
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.ecosystem_signups enable row level security;

drop policy if exists "anyone can submit an ecosystem signup" on public.ecosystem_signups;
create policy "anyone can submit an ecosystem signup" on public.ecosystem_signups
  for insert with check (true);

drop policy if exists "admins manage ecosystem signups" on public.ecosystem_signups;
create policy "admins manage ecosystem signups" on public.ecosystem_signups
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  ) with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- ---------------------------------------------------------------------------
-- storage: ecosystem-signup-logos bucket for the no-login ecosystem signup
-- form. Deliberately its own bucket (not startup-logos/mentor-photos/
-- org-logos) since this is the only place anonymous uploads are allowed —
-- keeps that looser policy isolated from the buckets used by authenticated
-- flows, and makes it easy to drop alongside the rest of this temporary
-- feature later.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('ecosystem-signup-logos', 'ecosystem-signup-logos', true)
on conflict (id) do nothing;

drop policy if exists "ecosystem signup logos are publicly readable" on storage.objects;
create policy "ecosystem signup logos are publicly readable" on storage.objects
  for select using (bucket_id = 'ecosystem-signup-logos');

drop policy if exists "anyone can upload ecosystem signup logos" on storage.objects;
create policy "anyone can upload ecosystem signup logos" on storage.objects
  for insert with check (bucket_id = 'ecosystem-signup-logos');

drop policy if exists "admins can delete ecosystem signup logos" on storage.objects;
create policy "admins can delete ecosystem signup logos" on storage.objects
  for delete using (
    bucket_id = 'ecosystem-signup-logos'
    and exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- ---------------------------------------------------------------------------
-- ecosystem_signup_visits: a bare page-view counter for /ecosystem-signup,
-- so an admin can see how many people opened the link vs. how many actually
-- submitted (see the "Signups" tab). One row per page load, no PII. Drop
-- alongside the rest of this temporary feature when it's retired.
-- ---------------------------------------------------------------------------
create table if not exists public.ecosystem_signup_visits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.ecosystem_signup_visits enable row level security;

drop policy if exists "anyone can log an ecosystem signup visit" on public.ecosystem_signup_visits;
create policy "anyone can log an ecosystem signup visit" on public.ecosystem_signup_visits
  for insert with check (true);

drop policy if exists "admins can read ecosystem signup visits" on public.ecosystem_signup_visits;
create policy "admins can read ecosystem signup visits" on public.ecosystem_signup_visits
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- ---------------------------------------------------------------------------
-- ai_insights: cached AI Insights text for the admin Dashboard tab.
-- Written by (1) a daily 7:30am Asia/Manila Vercel Cron job hitting
-- /api/ai-insights/cron, and (2) an admin clicking "Regenerate" on the
-- Dashboard. The dashboard always reads the most recent row instead of
-- calling the (paid) Workers AI model on every page load. Insert is open
-- (no service-role key in this project — same tradeoff already made for
-- ecosystem_signup_visits) since a stray row here can only ever mislead an
-- admin's reading of already-public ecosystem stats, not leak or alter data.
-- ---------------------------------------------------------------------------
create table if not exists public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  insights text[] not null default '{}',
  source text not null default 'cron' check (source in ('cron', 'manual')),
  generated_at timestamptz not null default now()
);

alter table public.ai_insights enable row level security;

drop policy if exists "anyone can insert ai insights" on public.ai_insights;
create policy "anyone can insert ai insights" on public.ai_insights
  for insert with check (true);

drop policy if exists "admins can read ai insights" on public.ai_insights;
create policy "admins can read ai insights" on public.ai_insights
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- ---------------------------------------------------------------------------
-- cofounder_profiles: opt-in "looking for a co-founder" listing shown in the
-- user dashboard's Co-Founder Finder tab. One row per user (owner_id unique),
-- same shape as mentors/startups: real name + editable pitch fields.
-- ---------------------------------------------------------------------------
create table if not exists public.cofounder_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid unique not null references public.profiles (id) on delete cascade,
  name text not null,
  building text not null default '',
  role_needed text not null default 'Any' check (role_needed in ('Technical', 'Business/Marketing', 'Design', 'Any')),
  sector text not null default '',
  commitment text not null default 'Full-time' check (commitment in ('Full-time', 'Part-time', 'Advisor')),
  looking_for text not null default '',
  contact_email text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.cofounder_profiles enable row level security;

drop policy if exists "active cofounder profiles are publicly readable" on public.cofounder_profiles;
create policy "active cofounder profiles are publicly readable" on public.cofounder_profiles
  for select using (is_active = true or auth.uid() = owner_id);

drop policy if exists "owners manage their cofounder profile" on public.cofounder_profiles;
create policy "owners manage their cofounder profile" on public.cofounder_profiles
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "admins manage all cofounder profiles" on public.cofounder_profiles;
create policy "admins manage all cofounder profiles" on public.cofounder_profiles
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  ) with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- ---------------------------------------------------------------------------
-- cofounder_connections: "Connect" requests sent to a cofounder_profiles row,
-- mirrors mentor_connections exactly.
-- ---------------------------------------------------------------------------
create table if not exists public.cofounder_connections (
  id uuid primary key default gen_random_uuid(),
  cofounder_profile_id uuid not null references public.cofounder_profiles (id) on delete cascade,
  requester_id uuid not null references public.profiles (id) on delete cascade,
  message text not null default '',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now()
);

alter table public.cofounder_connections enable row level security;

drop policy if exists "requester or profile owner can read a cofounder connection" on public.cofounder_connections;
create policy "requester or profile owner can read a cofounder connection" on public.cofounder_connections
  for select using (
    auth.uid() = requester_id
    or auth.uid() = (select owner_id from public.cofounder_profiles where id = cofounder_profile_id)
  );

drop policy if exists "authenticated users can request a cofounder connection" on public.cofounder_connections;
create policy "authenticated users can request a cofounder connection" on public.cofounder_connections
  for insert with check (auth.uid() = requester_id);

drop policy if exists "profile owner can update cofounder connection status" on public.cofounder_connections;
create policy "profile owner can update cofounder connection status" on public.cofounder_connections
  for update using (
    auth.uid() = (select owner_id from public.cofounder_profiles where id = cofounder_profile_id)
  );
