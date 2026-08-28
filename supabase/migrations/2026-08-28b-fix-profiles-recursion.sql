-- ===========================================================================
-- HOTFIX — 28 Aug 2026
-- Run this immediately after 2026-08-28-security-hardening.sql.
--
-- That migration's profiles SELECT policy checked for admin with an inline
--     exists (select 1 from public.profiles p where p.id = auth.uid() ...)
-- Evaluating a policy ON profiles that itself reads profiles re-enters the
-- same policy, so Postgres aborts with:
--     42P17 infinite recursion detected in policy for relation "profiles"
-- which made every profile read fail — including the one AuthProvider does on
-- page load, so sign-in appeared broken across the whole site.
--
-- The fix is to reach the admin flag through a SECURITY DEFINER function,
-- which runs as its owner and so does not re-enter the policy. Same reason
-- is_org_member() already exists in this schema.
--
-- Safe to re-run.
-- ===========================================================================

-- Defined in the previous migration, repeated here so this file stands alone.
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


-- The recursive policy, rewritten. Same four readers as before.
drop policy if exists "members read profiles they are entitled to" on public.profiles;
create policy "members read profiles they are entitled to" on public.profiles
  for select using (
    auth.uid() = id
    or public.is_site_admin()
    or public.shares_organization_with(id)
    or public.has_pending_request_from(id)
  );


-- Every other policy added in that migration used the same inline pattern.
-- None of them recursed (they sit on other tables), but each one forced an
-- extra evaluation of the profiles policy on every row check. Route them all
-- through the same function.

drop policy if exists "org managers add members" on public.organization_members;
create policy "org managers add members" on public.organization_members
  for insert with check (
    public.is_org_manager(organization_id)
    or (
      auth.uid() = user_id
      and auth.uid() = (select owner_id from public.organizations where id = organization_id)
    )
    or public.is_site_admin()
  );

drop policy if exists "members see memberships in their orgs" on public.organization_members;
create policy "members see memberships in their orgs" on public.organization_members
  for select using (
    auth.uid() = user_id
    or public.is_org_member(organization_id)
    or public.is_site_admin()
  );

drop policy if exists "only the owner deletes an organization" on public.organizations;
create policy "only the owner deletes an organization" on public.organizations
  for delete using (
    auth.uid() = owner_id
    or public.is_site_admin()
  );

drop policy if exists "submitters read their own events" on public.event_submissions;
create policy "submitters read their own events" on public.event_submissions
  for select using (
    auth.uid() = owner_id
    or public.is_site_admin()
  );

drop policy if exists "admins write ai insights" on public.ai_insights;
create policy "admins write ai insights" on public.ai_insights
  for insert with check (public.is_site_admin());

drop policy if exists "admins can delete consultation feedback" on public.consultation_feedback;
create policy "admins can delete consultation feedback" on public.consultation_feedback
  for delete using (public.is_site_admin());

drop policy if exists "admins can read challenge applications" on public.challenge_applications;
create policy "admins can read challenge applications" on public.challenge_applications
  for select using (public.is_site_admin());
