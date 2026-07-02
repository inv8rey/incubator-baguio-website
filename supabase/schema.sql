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
  created_at timestamptz not null default now()
);

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

-- ---------------------------------------------------------------------------
-- startups: "Create a startup profile"
-- ---------------------------------------------------------------------------
create table if not exists public.startups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  tagline text not null default '',
  sector text not null default '',
  stage text not null default '',
  description text not null default '',
  website text not null default '',
  contact_email text not null default '',
  created_at timestamptz not null default now()
);

alter table public.startups enable row level security;

drop policy if exists "startups are publicly readable" on public.startups;
create policy "startups are publicly readable" on public.startups
  for select using (true);

drop policy if exists "owners manage their startups" on public.startups;
create policy "owners manage their startups" on public.startups
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- mentors: "Be a mentor" — one mentor profile per user
-- ---------------------------------------------------------------------------
create table if not exists public.mentors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles (id) on delete cascade,
  name text not null,
  expertise text not null default '',
  bio text not null default '',
  tag text not null default '',
  created_at timestamptz not null default now()
);

alter table public.mentors enable row level security;

drop policy if exists "mentors are publicly readable" on public.mentors;
create policy "mentors are publicly readable" on public.mentors
  for select using (true);

drop policy if exists "owners manage their mentor profile" on public.mentors;
create policy "owners manage their mentor profile" on public.mentors
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

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
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  org_type text not null check (org_type in ('TBIs', 'Corporate', 'Government', 'Community', 'Coworking Spaces', 'Makerspaces & Labs')),
  description text not null default '',
  website text not null default '',
  contact_email text not null default '',
  created_at timestamptz not null default now()
);

alter table public.organizations enable row level security;

drop policy if exists "organizations are publicly readable" on public.organizations;
create policy "organizations are publicly readable" on public.organizations
  for select using (true);

drop policy if exists "owners manage their organizations" on public.organizations;
create policy "owners manage their organizations" on public.organizations
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

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
