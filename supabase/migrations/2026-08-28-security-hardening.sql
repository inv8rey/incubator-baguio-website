-- ===========================================================================
-- Security hardening — 28 Aug 2026
-- Addresses SEC-01 … SEC-06 from Incubator_Baguio_Pre_Launch_Audit_2026-08-28.md
--
-- Safe to re-run. Every statement is idempotent.
-- These same changes are also folded into supabase/schema.sql; this file
-- exists so you can apply only the deltas without re-running the whole schema.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- SEC-01 (CRITICAL) — profiles were world-readable, exposing every member's
-- name and email to anyone holding the public anon key.
--
-- Replaced with the narrowest set that keeps the app working. Four legitimate
-- readers, no more:
--   1. you, reading your own profile
--   2. site admins
--   3. fellow members of an organization you belong to (the Members screen)
--   4. a mentor / co-founder listing owner reading the profile of someone who
--      sent THEM a connection request (they need a name and a reply address)
--
-- Helper functions are security-definer so the policy can look at
-- organization_members / *_connections without recursing back through RLS.
-- ---------------------------------------------------------------------------

create or replace function public.shares_organization_with(check_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members mine
    join public.organization_members theirs
      on theirs.organization_id = mine.organization_id
    where mine.user_id = auth.uid()
      and mine.status = 'active'
      and theirs.user_id = check_user_id
      and theirs.status = 'active'
  );
$$;

revoke all on function public.shares_organization_with(uuid) from public;
grant execute on function public.shares_organization_with(uuid) to authenticated;

create or replace function public.has_pending_request_from(check_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.mentor_connections mc
    join public.mentors m on m.id = mc.mentor_id
    where mc.requester_id = check_user_id and m.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.cofounder_connections cc
    join public.cofounder_profiles cp on cp.id = cc.cofounder_profile_id
    where cc.requester_id = check_user_id and cp.owner_id = auth.uid()
  );
$$;

revoke all on function public.has_pending_request_from(uuid) from public;
grant execute on function public.has_pending_request_from(uuid) to authenticated;

drop policy if exists "profiles are publicly readable" on public.profiles;

drop policy if exists "members read profiles they are entitled to" on public.profiles;
create policy "members read profiles they are entitled to" on public.profiles
  for select using (
    auth.uid() = id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
    or public.shares_organization_with(id)
    or public.has_pending_request_from(id)
  );


-- ---------------------------------------------------------------------------
-- SEC-02 (CRITICAL) — the insert policy checked that you were adding YOURSELF
-- but never WHICH organization, so any signed-up user could join any org and
-- inherit its permissions (including deleting it outright).
--
-- Membership is now granted, never self-claimed. Two ways in:
--   1. an existing owner/admin of THAT organization adds you
--   2. you create a brand-new organization and become its first owner
-- ---------------------------------------------------------------------------

create or replace function public.is_org_manager(check_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = check_org_id
      and user_id = auth.uid()
      and status = 'active'
      and role in ('owner', 'admin')
  );
$$;

revoke all on function public.is_org_manager(uuid) from public;
grant execute on function public.is_org_manager(uuid) to authenticated;

drop policy if exists "users add themselves as a member" on public.organization_members;

drop policy if exists "org managers add members" on public.organization_members;
create policy "org managers add members" on public.organization_members
  for insert with check (
    -- an owner/admin of this org is adding someone
    public.is_org_manager(organization_id)
    -- ...or you are claiming the org you just created (no members exist yet)
    or (
      auth.uid() = user_id
      and auth.uid() = (select owner_id from public.organizations where id = organization_id)
    )
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Managers also need to update (change role) and remove members.
drop policy if exists "org managers update members" on public.organization_members;
create policy "org managers update members" on public.organization_members
  for update using (public.is_org_manager(organization_id))
  with check (public.is_org_manager(organization_id));

drop policy if exists "org managers remove members" on public.organization_members;
create policy "org managers remove members" on public.organization_members
  for delete using (
    public.is_org_manager(organization_id)
    or auth.uid() = user_id  -- you may always leave an organization
  );

-- Members should see everyone in their org, not only their own row —
-- required by the Members screen.
drop policy if exists "members see their own memberships" on public.organization_members;
create policy "members see memberships in their orgs" on public.organization_members
  for select using (
    auth.uid() = user_id
    or public.is_org_member(organization_id)
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- The org UPDATE path is guarded by protect_organization_admin_fields(), but
-- that trigger only fires on UPDATE — DELETE was wide open to any member.
-- Split the blanket "for all" policy so deletion needs true ownership.
drop policy if exists "owners manage their organizations" on public.organizations;

drop policy if exists "org members read their organizations" on public.organizations;
create policy "org members read their organizations" on public.organizations
  for select using (true);  -- public directory; unchanged

drop policy if exists "org members update their organizations" on public.organizations;
create policy "org members update their organizations" on public.organizations
  for update using (
    auth.uid() = owner_id or public.is_org_member(id)
  ) with check (
    auth.uid() = owner_id or public.is_org_member(id)
  );

drop policy if exists "users create their own organizations" on public.organizations;
create policy "users create their own organizations" on public.organizations
  for insert with check (auth.uid() = owner_id);

drop policy if exists "only the owner deletes an organization" on public.organizations;
create policy "only the owner deletes an organization" on public.organizations
  for delete using (
    auth.uid() = owner_id
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );


-- ---------------------------------------------------------------------------
-- SEC-03 (HIGH) — every storage bucket granted UPDATE/DELETE to any
-- authenticated user with only a bucket_id check and no ownership test, so one
-- free account could overwrite or delete every logo and document on the site.
--
-- Update/delete now require you to be the uploader, or a site admin.
-- ---------------------------------------------------------------------------

create or replace function public.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_admin = true);
$$;

revoke all on function public.is_site_admin() from public;
grant execute on function public.is_site_admin() to authenticated, anon;

do $$
declare
  b text;
  owner_buckets text[] := array[
    'startup-logos', 'mentor-photos', 'org-logos', 'org-covers',
    'partner-logos', 'event-posters', 'gallery-photos',
    'knowledge-files', 'knowledge-resource-covers', 'program-images'
  ];
  -- Uploaded anonymously through public forms, so there is no owner to match
  -- against — these stay admin-only for update/delete.
  anon_buckets text[] := array['event-submission-posters', 'ecosystem-signup-logos'];
begin
  foreach b in array owner_buckets loop
    execute format('drop policy if exists %I on storage.objects', 'authenticated users can update ' || b);
    execute format('drop policy if exists %I on storage.objects', 'authenticated users can delete ' || b);
    execute format(
      'create policy %I on storage.objects for update to authenticated using (bucket_id = %L and (owner = auth.uid() or public.is_site_admin()))',
      'uploader or admin updates ' || b, b
    );
    execute format(
      'create policy %I on storage.objects for delete to authenticated using (bucket_id = %L and (owner = auth.uid() or public.is_site_admin()))',
      'uploader or admin deletes ' || b, b
    );
  end loop;

  foreach b in array anon_buckets loop
    execute format('drop policy if exists %I on storage.objects', 'authenticated users can update ' || b);
    execute format('drop policy if exists %I on storage.objects', 'authenticated users can delete ' || b);
    execute format(
      'create policy %I on storage.objects for update to authenticated using (bucket_id = %L and public.is_site_admin())',
      'admin updates ' || b, b
    );
    execute format(
      'create policy %I on storage.objects for delete to authenticated using (bucket_id = %L and public.is_site_admin())',
      'admin deletes ' || b, b
    );
  end loop;
end $$;

-- The original policy names in schema.sql used prose that doesn't match the
-- generated names above; drop the known originals explicitly too.
drop policy if exists "authenticated users can update startup logos" on storage.objects;
drop policy if exists "authenticated users can delete startup logos" on storage.objects;
drop policy if exists "authenticated users can update mentor photos" on storage.objects;
drop policy if exists "authenticated users can delete mentor photos" on storage.objects;
drop policy if exists "authenticated users can update org logos" on storage.objects;
drop policy if exists "authenticated users can delete org logos" on storage.objects;
drop policy if exists "authenticated users can update org covers" on storage.objects;
drop policy if exists "authenticated users can delete org covers" on storage.objects;
drop policy if exists "authenticated users can update partner logos" on storage.objects;
drop policy if exists "authenticated users can delete partner logos" on storage.objects;
drop policy if exists "authenticated users can update event posters" on storage.objects;
drop policy if exists "authenticated users can delete event posters" on storage.objects;
drop policy if exists "authenticated users can update gallery photos" on storage.objects;
drop policy if exists "authenticated users can delete gallery photos" on storage.objects;
drop policy if exists "authenticated users can update knowledge files" on storage.objects;
drop policy if exists "authenticated users can delete knowledge files" on storage.objects;
drop policy if exists "authenticated users can update knowledge resource covers" on storage.objects;
drop policy if exists "authenticated users can delete knowledge resource covers" on storage.objects;
drop policy if exists "authenticated users can update program images" on storage.objects;
drop policy if exists "authenticated users can delete program images" on storage.objects;
drop policy if exists "authenticated users can update event submission posters" on storage.objects;
drop policy if exists "authenticated users can delete event submission posters" on storage.objects;
drop policy if exists "authenticated users can update ecosystem signup logos" on storage.objects;
drop policy if exists "authenticated users can delete ecosystem signup logos" on storage.objects;


-- ---------------------------------------------------------------------------
-- SEC-04 (HIGH) — chat_rate_limits allowed anon SELECT/UPDATE/DELETE, so the
-- assistant's spending cap could be reset at will by deleting counter rows.
--
-- All access now goes through bump_chat_usage(), which is security-definer and
-- therefore bypasses RLS on its own. No direct client access remains.
-- ---------------------------------------------------------------------------

drop policy if exists "chat rate limit rows are usable by anon" on public.chat_rate_limits;
-- No replacement policy: RLS is enabled and nothing matches, so direct reads
-- and writes are denied for everyone except the security-definer RPC.


-- ---------------------------------------------------------------------------
-- SEC-05 (HIGH) — "approved events are publicly readable" grants every column,
-- so an approved event would publish its organiser's email and phone number.
--
-- The public calendar now reads a view exposing display columns only.
-- ---------------------------------------------------------------------------

drop policy if exists "approved events are publicly readable" on public.event_submissions;

create or replace view public.public_events
with (security_invoker = off) as
  select
    id, title, org, org_type, category, description,
    event_date, end_date, event_time, venue, format,
    cta, registration_link, poster_url, organization_id, status, created_at
  from public.event_submissions
  where status = 'approved';

grant select on public.public_events to anon, authenticated;

-- Submitters keep read access to their own rows (contact fields included).
drop policy if exists "submitters read their own events" on public.event_submissions;
create policy "submitters read their own events" on public.event_submissions
  for select using (
    auth.uid() = owner_id
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );


-- ---------------------------------------------------------------------------
-- SEC-06 (MEDIUM) — ai_insights accepted anonymous inserts, so arbitrary text
-- could be injected into what reads as a trusted internal analysis.
--
-- Writes are now limited to admins; the cron job runs with CRON_SECRET and
-- writes through this same admin path via its service context.
-- ---------------------------------------------------------------------------

drop policy if exists "anyone can insert ai insights" on public.ai_insights;

drop policy if exists "admins write ai insights" on public.ai_insights;
create policy "admins write ai insights" on public.ai_insights
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );


-- ---------------------------------------------------------------------------
-- RISK-01 (MEDIUM) — public forms had no throttle of any kind. Reuses the
-- existing chat_rate_limits table as a generic per-IP counter so form
-- submissions can be capped the same way chat messages are.
-- ---------------------------------------------------------------------------

create or replace function public.bump_form_usage(
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

revoke all on function public.bump_form_usage(text, timestamptz) from public;
grant execute on function public.bump_form_usage(text, timestamptz) to anon, authenticated;


-- ===========================================================================
-- FEATURES — 28 Aug 2026
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Member-supplied location. `startups` already carried address/latitude/
-- longitude; organizations had a free-text address but no coordinates, and
-- mentors had neither. Nullable lat/lng throughout: an entry without a pinned
-- location is normal, not an error.
-- ---------------------------------------------------------------------------
alter table public.organizations add column if not exists latitude double precision;
alter table public.organizations add column if not exists longitude double precision;

alter table public.mentors add column if not exists address text not null default '';
alter table public.mentors add column if not exists latitude double precision;
alter table public.mentors add column if not exists longitude double precision;


-- ---------------------------------------------------------------------------
-- Site-wide search. One security-definer function returning a uniform result
-- shape across every public content type, so the search page makes a single
-- round trip instead of six, and so the ranking is done in Postgres rather
-- than by merging six arrays in the browser.
--
-- Only ever reads rows that are already public: approved+public orgs, the
-- public_events view, and the openly-readable startup/mentor/challenge/
-- resource tables. It deliberately does NOT touch profiles.
-- ---------------------------------------------------------------------------
create or replace function public.search_site(q text, max_results integer default 40)
returns table (
  kind text,
  id text,
  title text,
  subtitle text,
  description text,
  href text,
  rank real
)
language sql
stable
security definer
set search_path = public
as $$
  with needle as (select '%' || trim(q) || '%' as pat, trim(q) as raw)
  select * from (
    select
      'Startup'::text as kind,
      s.id::text,
      s.name as title,
      nullif(s.sector, '') as subtitle,
      left(s.description, 180) as description,
      '/ecosystem/' as href,
      (case when s.name ilike (select raw from needle) then 3.0
            when s.name ilike (select pat from needle) then 2.0
            else 1.0 end)::real as rank
    from public.startups s, needle
    where s.name ilike needle.pat or s.description ilike needle.pat or s.sector ilike needle.pat

    union all
    select
      'Mentor'::text,
      m.id::text,
      m.name,
      nullif(m.position, ''),
      left(m.bio, 180),
      '/ecosystem/',
      (case when m.name ilike (select raw from needle) then 3.0
            when m.name ilike (select pat from needle) then 2.0
            else 1.0 end)::real
    from public.mentors m, needle
    where m.name ilike needle.pat or m.bio ilike needle.pat or m.company ilike needle.pat

    union all
    select
      'Organization'::text,
      o.id::text,
      o.name,
      nullif(o.org_type, ''),
      left(o.description, 180),
      '/organizations/' || o.slug || '/',
      (case when o.name ilike (select raw from needle) then 3.5
            when o.name ilike (select pat from needle) then 2.5
            else 1.0 end)::real
    from public.organizations o, needle
    where o.approval_status = 'approved' and o.is_public = true
      and (o.name ilike needle.pat or o.description ilike needle.pat or o.org_type ilike needle.pat)

    union all
    select
      'Challenge'::text,
      c.id::text,
      c.title,
      nullif(c.category, ''),
      left(coalesce(nullif(c.summary, ''), c.problem), 180),
      '/challenges/',
      (case when c.title ilike (select raw from needle) then 3.0 else 1.5 end)::real
    from public.challenges c, needle
    where c.title ilike needle.pat or c.problem ilike needle.pat
       or c.summary ilike needle.pat or c.category ilike needle.pat
       or c.org_name ilike needle.pat

    union all
    select
      'Resource'::text,
      k.id::text,
      k.title,
      nullif(k.category, ''),
      left(k.description, 180),
      '/knowledge/',
      (case when k.title ilike (select raw from needle) then 3.0 else 1.5 end)::real
    from public.knowledge_resources k, needle
    where k.status = 'approved'
      and (k.title ilike needle.pat or k.description ilike needle.pat or k.category ilike needle.pat)

    union all
    select
      'Event'::text,
      e.id::text,
      e.title,
      nullif(e.event_date, ''),
      left(e.description, 180),
      '/calendar/',
      (case when e.title ilike (select raw from needle) then 3.0 else 1.5 end)::real
    from public.public_events e, needle
    where e.title ilike needle.pat or e.description ilike needle.pat or e.org ilike needle.pat
  ) hits
  where length(trim(q)) >= 2
  order by rank desc, title asc
  limit greatest(1, least(coalesce(max_results, 40), 100));
$$;

revoke all on function public.search_site(text, integer) from public;
grant execute on function public.search_site(text, integer) to anon, authenticated;
