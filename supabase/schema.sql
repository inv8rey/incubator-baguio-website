-- Incubator Baguio Website — Supabase schema
-- Run this once in your Supabase project's SQL editor (Project > SQL Editor > New query).
-- Safe to re-run: every statement is guarded with IF NOT EXISTS / OR REPLACE.

create extension if not exists pgcrypto;
create extension if not exists vector;

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
-- consultation_feedback: private feedback from /evaluation visitors
-- ---------------------------------------------------------------------------
create table if not exists public.consultation_feedback (
  id uuid primary key default gen_random_uuid(),
  visitor_type text not null default '',
  visitor_type_other text not null default '',
  visit_purpose text not null default '',
  visit_purpose_other text not null default '',
  startup_name text not null default '',
  respondent_role text not null default '',
  organization_contact text not null default '',
  startup_sector text not null default '',
  startup_stage text not null default '',
  ratings jsonb not null default '{}'::jsonb,
  liked_most text not null default '',
  takeaway text not null default '',
  improvements text not null default '',
  would_recommend text not null default '',
  wants_updates boolean not null default false,
  email text not null default '',
  created_at timestamptz not null default now()
);

alter table public.consultation_feedback add column if not exists startup_name text not null default '';
alter table public.consultation_feedback add column if not exists respondent_role text not null default '';
alter table public.consultation_feedback add column if not exists organization_contact text not null default '';
alter table public.consultation_feedback add column if not exists startup_sector text not null default '';
alter table public.consultation_feedback add column if not exists startup_stage text not null default '';
alter table public.consultation_feedback add column if not exists liked_most text not null default '';

alter table public.consultation_feedback enable row level security;

drop policy if exists "visitors can submit consultation feedback" on public.consultation_feedback;
create policy "visitors can submit consultation feedback" on public.consultation_feedback
  for insert with check (true);

drop policy if exists "admins can read consultation feedback" on public.consultation_feedback;
create policy "admins can read consultation feedback" on public.consultation_feedback
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
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
-- challenges: admin-curated Innovation Challenges shown on the main
-- /challenges page (distinct from challenge_submissions, which are posted
-- directly by logged-in members). problem/scope/support are stored as
-- newline-separated text and split into paragraphs/bullets in the UI.
-- ---------------------------------------------------------------------------
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'Environmental Action' check (
    category in (
      'Environmental Action',
      'Social Protection & Inclusivity',
      'Economic Expansion',
      'Smart City',
      'Resilience',
      'Good Governance'
    )
  ),
  summary text not null default '',
  problem text not null default '',
  scope text not null default '',
  support text not null default '',
  org_name text not null default '',
  org_full text not null default '',
  org_type text not null default 'Government' check (org_type in ('Government', 'Academe', 'Private Sector', 'Community')),
  org_color text not null default '#141417',
  org_initials text not null default '',
  contact_email text not null default '',
  scope_region text not null default 'Baguio City',
  status text not null default 'Open' check (status in ('Open', 'Closed')),
  deadline_date date,
  shortlist_date date,
  pitch_date date,
  pilot_date date,
  created_at timestamptz not null default now()
);

alter table public.challenges enable row level security;

drop policy if exists "challenges are publicly readable" on public.challenges;
create policy "challenges are publicly readable" on public.challenges
  for select using (true);

drop policy if exists "admins manage challenges" on public.challenges;
create policy "admins manage challenges" on public.challenges
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  ) with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

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
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'challenges'
  ) then
    alter publication supabase_realtime add table public.challenges;
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
-- storage: event-submission-posters bucket for the no-login "Submit an
-- event" form (app/calendar/CalendarClient.tsx SubmitEventModal). Deliberately
-- its own bucket rather than reusing event-posters, whose insert policy is
-- authenticated-only for the admin flow -- same reasoning as
-- ecosystem-signup-logos below: keep the anonymous-upload policy isolated to
-- the one bucket that actually needs it.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('event-submission-posters', 'event-submission-posters', true)
on conflict (id) do nothing;

drop policy if exists "event submission posters are publicly readable" on storage.objects;
create policy "event submission posters are publicly readable" on storage.objects
  for select using (bucket_id = 'event-submission-posters');

drop policy if exists "anyone can upload event submission posters" on storage.objects;
create policy "anyone can upload event submission posters" on storage.objects
  for insert with check (bucket_id = 'event-submission-posters');

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

-- ---------------------------------------------------------------------------
-- knowledge_resources: admin-managed library for the Knowledge Hub
-- (app/knowledge). Each resource is either an uploaded file (file_url) or an
-- external link (link_url) filed under one of four fixed categories.
-- ---------------------------------------------------------------------------
create table if not exists public.knowledge_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'Startup Resources' check (
    category in ('Startup Resources', 'Research & Innovation', 'Funding & Opportunities', 'Policies & Reports')
  ),
  description text not null default '',
  file_url text not null default '',
  link_url text not null default '',
  source text not null default '',
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.knowledge_resources add column if not exists featured boolean not null default false;

alter table public.knowledge_resources enable row level security;

drop policy if exists "knowledge resources are publicly readable" on public.knowledge_resources;
create policy "knowledge resources are publicly readable" on public.knowledge_resources
  for select using (true);

drop policy if exists "admins manage knowledge resources" on public.knowledge_resources;
create policy "admins manage knowledge resources" on public.knowledge_resources
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  ) with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- ---------------------------------------------------------------------------
-- storage: knowledge-files bucket for uploaded Knowledge Hub resource files.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('knowledge-files', 'knowledge-files', true)
on conflict (id) do nothing;

drop policy if exists "knowledge files are publicly readable" on storage.objects;
create policy "knowledge files are publicly readable" on storage.objects
  for select using (bucket_id = 'knowledge-files');

drop policy if exists "authenticated users can upload knowledge files" on storage.objects;
create policy "authenticated users can upload knowledge files" on storage.objects
  for insert to authenticated with check (bucket_id = 'knowledge-files');

drop policy if exists "authenticated users can update knowledge files" on storage.objects;
create policy "authenticated users can update knowledge files" on storage.objects
  for update to authenticated using (bucket_id = 'knowledge-files');

drop policy if exists "authenticated users can delete knowledge files" on storage.objects;
create policy "authenticated users can delete knowledge files" on storage.objects
  for delete to authenticated using (bucket_id = 'knowledge-files');

-- ---------------------------------------------------------------------------
-- program_step_images: admin-uploaded photo for each of the 4 "Our Programs"
-- pillars (Founder Development / Ecosystem Building / Open Innovation /
-- Ecosystem Intelligence) shown on the homepage and /programs sticky card
-- deck (app/programs/EcosystemModel.tsx). One row per pillar.
-- ---------------------------------------------------------------------------
create table if not exists public.program_step_images (
  step text primary key check (step in ('founder-development', 'ecosystem-building', 'open-innovation', 'ecosystem-intelligence')),
  image_url text not null default '',
  updated_at timestamptz not null default now()
);

-- One-time migration: the pillars were renamed from Enable/Engage/Expand/Evolve
-- to their current names, but this table (and the admin uploader) kept the old
-- keys, so uploaded photos never matched the homepage cards. The constraint
-- must be dropped BEFORE the renames below -- the old check still forbids the
-- new key values, so renaming into it first (as an earlier version of this
-- migration did) fails with a check-constraint violation. Re-running this on
-- an already-migrated database is a no-op, since no rows will match the old keys.
alter table public.program_step_images drop constraint if exists program_step_images_step_check;

update public.program_step_images set step = 'founder-development' where step = 'enable';
update public.program_step_images set step = 'ecosystem-building' where step = 'engage';
update public.program_step_images set step = 'open-innovation' where step = 'expand';
update public.program_step_images set step = 'ecosystem-intelligence' where step = 'evolve';

alter table public.program_step_images add constraint program_step_images_step_check
  check (step in ('founder-development', 'ecosystem-building', 'open-innovation', 'ecosystem-intelligence'));

alter table public.program_step_images enable row level security;

drop policy if exists "program step images are publicly readable" on public.program_step_images;
create policy "program step images are publicly readable" on public.program_step_images
  for select using (true);

drop policy if exists "admins manage program step images" on public.program_step_images;
create policy "admins manage program step images" on public.program_step_images
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  ) with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- ---------------------------------------------------------------------------
-- storage: program-images bucket for the 4 Our Programs step photos.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('program-images', 'program-images', true)
on conflict (id) do nothing;

drop policy if exists "program images are publicly readable" on storage.objects;
create policy "program images are publicly readable" on storage.objects
  for select using (bucket_id = 'program-images');

drop policy if exists "authenticated users can upload program images" on storage.objects;
create policy "authenticated users can upload program images" on storage.objects
  for insert to authenticated with check (bucket_id = 'program-images');

drop policy if exists "authenticated users can update program images" on storage.objects;
create policy "authenticated users can update program images" on storage.objects
  for update to authenticated using (bucket_id = 'program-images');

drop policy if exists "authenticated users can delete program images" on storage.objects;
create policy "authenticated users can delete program images" on storage.objects
  for delete to authenticated using (bucket_id = 'program-images');

-- ---------------------------------------------------------------------------
-- funded_projects: admin-curated research/innovation projects shown on the
-- Ecosystem directory's "Funded Projects" tab.
-- ---------------------------------------------------------------------------
create table if not exists public.funded_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  funding_agency text not null default '',
  lead_institution text not null default '',
  duration text not null default '',
  status text not null default 'Ongoing' check (status in ('Ongoing', 'Completed', 'Upcoming')),
  created_at timestamptz not null default now()
);

alter table public.funded_projects enable row level security;

drop policy if exists "funded projects are publicly readable" on public.funded_projects;
create policy "funded projects are publicly readable" on public.funded_projects
  for select using (true);

drop policy if exists "admins manage funded projects" on public.funded_projects;
create policy "admins manage funded projects" on public.funded_projects
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  ) with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'program_step_images'
  ) then
    alter publication supabase_realtime add table public.program_step_images;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'knowledge_resources'
  ) then
    alter publication supabase_realtime add table public.knowledge_resources;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'consultation_feedback'
  ) then
    alter publication supabase_realtime add table public.consultation_feedback;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'challenge_applications'
  ) then
    alter publication supabase_realtime add table public.challenge_applications;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'ecosystem_partners'
  ) then
    alter publication supabase_realtime add table public.ecosystem_partners;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'funded_projects'
  ) then
    alter publication supabase_realtime add table public.funded_projects;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- chat_rate_limits: per-IP request counting for the chatbot's Workers AI
-- calls, so a single visitor (or script) can't run up the (paid) Workers AI
-- bill. Written only by the server route using the anon key; there is no
-- legitimate public write path, but the table carries no PII (hashed key
-- only), so an open policy is acceptable here the same way it is for every
-- other table in this file.
-- ---------------------------------------------------------------------------
create table if not exists public.chat_rate_limits (
  id uuid primary key default gen_random_uuid(),
  client_key text not null,
  window_start timestamptz not null,
  request_count integer not null default 1,
  created_at timestamptz not null default now()
);

create unique index if not exists chat_rate_limits_client_window_idx
  on public.chat_rate_limits (client_key, window_start);

alter table public.chat_rate_limits enable row level security;

drop policy if exists "chat rate limit rows are usable by anon" on public.chat_rate_limits;
create policy "chat rate limit rows are usable by anon" on public.chat_rate_limits
  for all using (true) with check (true);

-- Atomic increment-and-return for one counter bucket. The route previously did
-- a select-then-update, which loses counts when two requests land together --
-- tolerable for a per-IP throttle, not for the shared daily budget, where an
-- undercount means overspending the Workers AI allowance. Returns the post
-- increment value so the caller can compare it against its own cap.
create or replace function public.bump_chat_usage(
  p_client_key text,
  p_window_start timestamptz
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  insert into public.chat_rate_limits (client_key, window_start, request_count)
  values (p_client_key, p_window_start, 1)
  on conflict (client_key, window_start)
  do update set request_count = chat_rate_limits.request_count + 1
  returning chat_rate_limits.request_count into new_count;
  return new_count;
end;
$$;

revoke all on function public.bump_chat_usage(text, timestamptz) from public;
grant execute on function public.bump_chat_usage(text, timestamptz) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- chatbot_documents / chatbot_document_chunks: a PRIVATE, admin-only document
-- knowledge base the chatbot can search (RAG), separate from the public
-- Knowledge Hub (knowledge_resources). Neither table has a public read
-- policy — the chat route reads chunk content only through the
-- match_chatbot_chunks() security-definer RPC below, never via direct
-- select, so an anonymous visitor can never browse/list these documents.
-- ---------------------------------------------------------------------------
create table if not exists public.chatbot_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  original_filename text not null,
  storage_path text not null, -- path inside the private chatbot-documents bucket, not a public URL
  uploaded_by uuid references public.profiles (id) on delete set null,
  status text not null default 'pending' check (
    status in ('pending', 'processing', 'ready', 'error')
  ),
  error_message text not null default '',
  chunk_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.chatbot_documents enable row level security;

drop policy if exists "admins manage chatbot documents" on public.chatbot_documents;
create policy "admins manage chatbot documents" on public.chatbot_documents
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  ) with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Embedding model is Cloudflare Workers AI's @cf/baai/bge-base-en-v1.5 (768 dims).
create table if not exists public.chatbot_document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.chatbot_documents (id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  char_count integer not null,
  embedding vector(768),
  created_at timestamptz not null default now(),
  unique (document_id, chunk_index)
);

create index if not exists chatbot_document_chunks_document_id_idx
  on public.chatbot_document_chunks (document_id);

-- No ANN index (ivfflat/hnsw) yet: row counts are expected to stay in the
-- hundreds/low-thousands initially, where a plain seq scan on
-- `embedding <=> query` is fast and exact. Add
--   create index on public.chatbot_document_chunks
--     using hnsw (embedding vector_cosine_ops);
-- once chunk volume grows into the tens of thousands and query latency
-- becomes measurable (hnsw preferred over ivfflat here — no retrain step,
-- better for an insert-heavy admin-driven table).

alter table public.chatbot_document_chunks enable row level security;

drop policy if exists "admins manage chatbot document chunks" on public.chatbot_document_chunks;
create policy "admins manage chatbot document chunks" on public.chatbot_document_chunks
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  ) with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Similarity search RPC: raw `<=>` (cosine distance) queries aren't
-- expressible through the JS query builder, and the chunks table is
-- intentionally admin-only in RLS, so the public chat route calls this
-- security-definer function instead of selecting the table directly. It only
-- ever returns chunk content/metadata for documents whose processing
-- finished successfully ('ready'), nothing else about the tables is exposed.
-- Dropped rather than replaced: document_title was added to the return table,
-- and create-or-replace cannot change a function's return type.
drop function if exists public.match_chatbot_chunks(vector, int);

create function public.match_chatbot_chunks(
  query_embedding vector(768),
  match_count int default 5
)
returns table (
  id uuid,
  document_id uuid,
  chunk_index int,
  content text,
  document_title text,
  similarity float
)
language sql stable
security definer
set search_path = public
as $$
  select
    c.id,
    c.document_id,
    c.chunk_index,
    c.content,
    d.title as document_title,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.chatbot_document_chunks c
  join public.chatbot_documents d on d.id = c.document_id
  where d.status = 'ready'
  order by c.embedding <=> query_embedding
  limit least(match_count, 20);
$$;

revoke all on function public.match_chatbot_chunks(vector, int) from public;
grant execute on function public.match_chatbot_chunks(vector, int) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- storage: chatbot-documents bucket for the private knowledge base PDFs.
-- Unlike every other bucket in this file, this one is NOT public — no
-- anonymous select policy at all, since these documents must never be
-- reachable from the public site.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('chatbot-documents', 'chatbot-documents', false)
on conflict (id) do nothing;

drop policy if exists "admins read chatbot documents" on storage.objects;
create policy "admins read chatbot documents" on storage.objects
  for select using (
    bucket_id = 'chatbot-documents'
    and exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

drop policy if exists "admins upload chatbot documents" on storage.objects;
create policy "admins upload chatbot documents" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'chatbot-documents'
    and exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

drop policy if exists "admins delete chatbot documents" on storage.objects;
create policy "admins delete chatbot documents" on storage.objects
  for delete to authenticated using (
    bucket_id = 'chatbot-documents'
    and exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

do $$ begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chatbot_documents'
  ) then
    alter publication supabase_realtime add table public.chatbot_documents;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- gallery_photos: admin-curated photos of ecosystem activities shown in the
-- homepage "From the ecosystem" gallery (app/HomeGallery.tsx). Publicly
-- readable; only admins can add/edit/remove. `sort_order` drives the display
-- order so the gallery can be arranged without renaming or re-uploading.
-- ---------------------------------------------------------------------------
create table if not exists public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text not null default '',
  credit text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists gallery_photos_sort_idx on public.gallery_photos (sort_order, created_at desc);

alter table public.gallery_photos enable row level security;

drop policy if exists "gallery photos are publicly readable" on public.gallery_photos;
create policy "gallery photos are publicly readable" on public.gallery_photos
  for select using (true);

drop policy if exists "admins manage gallery photos" on public.gallery_photos;
create policy "admins manage gallery photos" on public.gallery_photos
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  ) with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- ---------------------------------------------------------------------------
-- storage: gallery-photos bucket for the homepage gallery images.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('gallery-photos', 'gallery-photos', true)
on conflict (id) do nothing;

drop policy if exists "gallery photo files are publicly readable" on storage.objects;
create policy "gallery photo files are publicly readable" on storage.objects
  for select using (bucket_id = 'gallery-photos');

drop policy if exists "authenticated users can upload gallery photos" on storage.objects;
create policy "authenticated users can upload gallery photos" on storage.objects
  for insert to authenticated with check (bucket_id = 'gallery-photos');

drop policy if exists "authenticated users can update gallery photos" on storage.objects;
create policy "authenticated users can update gallery photos" on storage.objects
  for update to authenticated using (bucket_id = 'gallery-photos');

drop policy if exists "authenticated users can delete gallery photos" on storage.objects;
create policy "authenticated users can delete gallery photos" on storage.objects
  for delete to authenticated using (bucket_id = 'gallery-photos');

do $$ begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'gallery_photos'
  ) then
    alter publication supabase_realtime add table public.gallery_photos;
  end if;
end $$;
