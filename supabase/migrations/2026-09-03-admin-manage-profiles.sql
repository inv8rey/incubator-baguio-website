-- 2026-09-03: let admins update any profile (needed for the new Members
-- admin tab to toggle is_mentor / is_admin on someone else's account).
--
-- profiles had no admin-update policy at all before this -- only "users can
-- update their own profile" (auth.uid() = id). Routed through
-- public.is_site_admin() rather than an inline
-- `exists (select 1 from public.profiles where ...)` subquery: an inline
-- self-referencing subquery on this exact table caused a production
-- 42P17 infinite recursion once already (see
-- 2026-08-28b-fix-profiles-recursion.sql) because Postgres re-enters the
-- same policy it's evaluating. is_site_admin() is `security definer`, so it
-- reads profiles.is_admin without re-triggering this table's own policies.

drop policy if exists "admins update any profile" on public.profiles;
create policy "admins update any profile" on public.profiles
  for update using (public.is_site_admin())
  with check (public.is_site_admin());
