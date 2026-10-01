-- ===========================================================================
-- 2026-10-04 (part A): security hardening from the October audit.
-- See SECURITY_AUDIT.md for the full write-up.
--
-- Run this FIRST, then deploy the code, then run part B
-- (2026-10-04b-lock-public-tables.sql). Everything here is additive or
-- tightens writes only, so it is safe with both the old and the new code.
--
-- Safe to re-run.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1. profiles: block self-granted admin/mentor on INSERT too.
--
-- The 2026-09-08 trigger only ran BEFORE UPDATE. The policy "users can insert
-- their own profile" lets a signed-in user insert their own row, so anyone
-- whose profile row was ever missing could insert it with is_admin = true.
-- ---------------------------------------------------------------------------
create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_site_admin() then
    if tg_op = 'INSERT' then
      new.is_admin  := false;
      new.is_mentor := false;
    else
      new.is_admin  := old.is_admin;
      new.is_mentor := old.is_mentor;
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.protect_profile_privileges() from public;

drop trigger if exists protect_profile_privileges on public.profiles;
create trigger protect_profile_privileges
  before insert or update on public.profiles
  for each row execute function public.protect_profile_privileges();


-- ---------------------------------------------------------------------------
-- 2. challenge_applications: applicants could set their own review outcome.
--
-- "applicants manage their own applications" is FOR ALL with no column
-- limits, so an applicant could update status to 'accepted' and write their
-- own review_note. Review fields are now admin-only.
-- ---------------------------------------------------------------------------
create or replace function public.protect_challenge_application_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_site_admin() then
    if tg_op = 'INSERT' then
      new.status      := 'new';
      new.review_note := '';
      new.reviewed_at := null;
    else
      new.status       := old.status;
      new.review_note  := old.review_note;
      new.reviewed_at  := old.reviewed_at;
      new.applicant_id := old.applicant_id;
      new.challenge_id := old.challenge_id;
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.protect_challenge_application_review() from public;

drop trigger if exists protect_challenge_application_review on public.challenge_applications;
create trigger protect_challenge_application_review
  before insert or update on public.challenge_applications
  for each row execute function public.protect_challenge_application_review();


-- ---------------------------------------------------------------------------
-- 3. Public form inserts could set moderation / system fields.
--
-- These policies were WITH CHECK (true), so a direct API call could submit an
-- event already marked 'approved' (it then appears on the public calendar,
-- skipping review), or pre-set newsletter bookkeeping columns. Each insert is
-- now limited to the state the real form produces.
-- ---------------------------------------------------------------------------
drop policy if exists "anyone can submit an event" on public.event_submissions;
create policy "anyone can submit an event" on public.event_submissions
  for insert with check (
    status = 'pending'
    and (owner_id is null or owner_id = auth.uid())
  );

drop policy if exists "anyone can submit an ecosystem signup" on public.ecosystem_signups;
create policy "anyone can submit an ecosystem signup" on public.ecosystem_signups
  for insert with check (status = 'pending');

drop policy if exists "anyone can submit a contact message" on public.contact_messages;
create policy "anyone can submit a contact message" on public.contact_messages
  for insert with check (status = 'new');

drop policy if exists "anyone can subscribe to the newsletter" on public.newsletter_subscribers;
create policy "anyone can subscribe to the newsletter" on public.newsletter_subscribers
  for insert with check (
    status = 'subscribed'
    and welcomed_at is null
    and welcome_sent_at is null
    and beehiiv_claimed_at is null
    and beehiiv_synced_at is null
  );


-- ---------------------------------------------------------------------------
-- 4. organizations: duplicate flag is computed by the database, not the browser.
--
-- New organizations publish immediately by design, with flagged_duplicate
-- marking likely copies for admin review. The flag was computed in the
-- browser, so a direct API call could send false and slip a look-alike
-- organization past review. Admin-only fields are also reset on insert.
-- ---------------------------------------------------------------------------
create or replace function public.protect_organization_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_site_admin() then
    new.flagged_duplicate := exists (
      select 1 from public.organizations o
      where lower(o.name) like '%' || lower(trim(new.name)) || '%'
         or lower(trim(new.name)) like '%' || lower(o.name) || '%'
    );
    new.pending_name := null;
    new.name_change_requested_at := null;
  end if;
  return new;
end;
$$;

revoke all on function public.protect_organization_insert() from public;

drop trigger if exists protect_organization_insert on public.organizations;
create trigger protect_organization_insert
  before insert on public.organizations
  for each row execute function public.protect_organization_insert();


-- ---------------------------------------------------------------------------
-- 5. Public views without private contact details.
--
-- organizations and challenge_submissions are readable by anyone with the
-- public key, every column included. That handed out organizations' private
-- emails and phone numbers (even when the owner chose "contact not public")
-- and the name, email, and phone of everyone who posted a community
-- challenge. Public pages now read these views; part B then removes public
-- access to the tables themselves. Same pattern as public_events.
-- ---------------------------------------------------------------------------
create or replace view public.public_organizations
with (security_invoker = off) as
  select
    id, name, org_type, type, description, short_description,
    website, facebook_url, social_url, logo_url, cover_url, slug,
    case when contact_public then contact_email else '' end as contact_email,
    case when contact_public then phone else '' end as phone,
    contact_public,
    address, city, province, region, country, latitude, longitude,
    sectors, expertise, can_offer, looking_for,
    approval_status, is_public, created_at, updated_at
  from public.organizations
  where is_public = true;

grant select on public.public_organizations to anon, authenticated;

create or replace view public.public_challenge_submissions
with (security_invoker = off) as
  select
    id, org_name, org_type, title, sector, problem, scope, support,
    deadline, organization_id, created_at
  from public.challenge_submissions;

grant select on public.public_challenge_submissions to anon, authenticated;


-- ---------------------------------------------------------------------------
-- 6. Read access that keeps working after part B.
-- Owners, organization members, and admins still read the full rows.
-- ---------------------------------------------------------------------------
drop policy if exists "owners members and admins read organizations" on public.organizations;
create policy "owners members and admins read organizations" on public.organizations
  for select using (
    auth.uid() = owner_id
    or public.is_org_member(id)
    or public.is_site_admin()
  );

drop policy if exists "owners members and admins read challenge submissions" on public.challenge_submissions;
create policy "owners members and admins read challenge submissions" on public.challenge_submissions
  for select using (
    auth.uid() = owner_id
    or (organization_id is not null and public.is_org_member(organization_id))
    or public.is_site_admin()
  );
