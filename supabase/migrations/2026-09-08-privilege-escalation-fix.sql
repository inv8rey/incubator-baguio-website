-- ===========================================================================
-- 2026-09-08 — SEC-03 (CRITICAL): any signed-in user could make themselves
-- a site admin.
--
-- public.profiles carried this policy from the original schema:
--
--     create policy "users can update their own profile" on public.profiles
--       for update using (auth.uid() = id);
--
-- An UPDATE policy with no WITH CHECK falls back to reusing its USING
-- expression as the check on the NEW row. That only constrains `id`, so the
-- row still had to belong to the caller — but nothing stopped the caller
-- from flipping their own is_admin to true:
--
--     supabase.from('profiles').update({ is_admin: true }).eq('id', myId)
--
-- The anon key is public by design (NEXT_PUBLIC_SUPABASE_ANON_KEY), so this
-- was reachable from any browser console by anyone with an account. It
-- granted the full admin panel (lib/requireAdmin.ts trusts this exact flag)
-- plus admin write access on every table whose policies call is_site_admin().
--
-- Fixed with a BEFORE UPDATE trigger rather than a WITH CHECK clause: the
-- check would need to compare against the row's current is_admin, and a
-- subquery reading public.profiles from inside a policy ON public.profiles
-- re-enters that policy and aborts with 42P17 — the exact production
-- incident 2026-08-28b-fix-profiles-recursion.sql was written to undo.
-- A SECURITY DEFINER trigger sidesteps policy evaluation entirely.
--
-- Non-admins keep updating their own profile normally; the privileged
-- columns are simply held at their existing values instead of erroring, so
-- a legitimate "save profile" that posts the whole row still succeeds.
--
-- Safe to re-run.
-- ===========================================================================

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- is_site_admin() is itself security definer (see the 08-28b hotfix), so
  -- calling it here does not re-enter the profiles policies.
  if not public.is_site_admin() then
    new.is_admin  := old.is_admin;
    new.is_mentor := old.is_mentor;
  end if;
  return new;
end;
$$;

revoke all on function public.protect_profile_privileges() from public;

drop trigger if exists protect_profile_privileges on public.profiles;
create trigger protect_profile_privileges
  before update on public.profiles
  for each row execute function public.protect_profile_privileges();


-- ---------------------------------------------------------------------------
-- SEC-04 (HIGH) — every storage bucket let ANY signed-in user overwrite or
-- delete ANY file in it, not just their own uploads:
--
--     for update to authenticated using (bucket_id = 'startup-logos')
--     for delete to authenticated using (bucket_id = 'startup-logos')
--
-- There is no owner comparison, so one account could replace every startup
-- logo, org cover, mentor photo and gallery image on the site, or delete
-- them outright. Uploads (INSERT) stay open as before — this only narrows
-- who may modify a file that already exists.
--
-- storage.objects.owner is the uploader's uid. Admins keep full control so
-- the existing moderation screens keep working.
--
-- NOTE: files uploaded before this migration may have a null owner (e.g.
-- anything inserted with the service role). Those become admin-only to
-- replace. If a non-admin flow needs to overwrite such a file, backfill
-- `owner` for that object rather than widening the policy again.
-- ---------------------------------------------------------------------------

do $$
declare
  b text;
  label text;
  buckets text[] := array[
    'startup-logos', 'org-logos', 'org-covers', 'mentor-photos',
    'gallery-photos', 'event-posters', 'knowledge-files',
    'knowledge-resource-covers', 'partner-logos', 'program-images'
  ];
begin
  foreach b in array buckets loop
    -- The existing policies are named after the bucket in words, not by its
    -- id: bucket 'startup-logos' is guarded by "...can update startup logos".
    -- Dropping by the id instead would silently miss, leaving the permissive
    -- policy in place next to the new one — and RLS ORs permissive policies
    -- together, so the old one would still allow everything.
    label := replace(b, '-', ' ');
    execute format(
      'drop policy if exists %I on storage.objects',
      'authenticated users can update ' || label
    );
    execute format(
      'drop policy if exists %I on storage.objects',
      'authenticated users can delete ' || label
    );
    -- ...and the replacements too, so this migration stays re-runnable.
    execute format(
      'drop policy if exists %I on storage.objects',
      'owner or admin updates ' || label
    );
    execute format(
      'drop policy if exists %I on storage.objects',
      'owner or admin deletes ' || label
    );
    execute format($f$
      create policy %I on storage.objects
        for update to authenticated
        using  (bucket_id = %L and (owner = auth.uid() or public.is_site_admin()))
        with check (bucket_id = %L and (owner = auth.uid() or public.is_site_admin()))
    $f$, 'owner or admin updates ' || label, b, b);
    execute format($f$
      create policy %I on storage.objects
        for delete to authenticated
        using (bucket_id = %L and (owner = auth.uid() or public.is_site_admin()))
    $f$, 'owner or admin deletes ' || label, b);
  end loop;
end $$;


-- ---------------------------------------------------------------------------
-- SEC-05 (LOW) — the two connection tables' UPDATE policies also omit
-- WITH CHECK, so the implicit fallback lets the row be edited into any shape
-- that still passes the USING test. Stating the check explicitly keeps a
-- listing owner from rewriting a request's contents while responding to it.
-- ---------------------------------------------------------------------------

drop policy if exists "mentor can update connection status" on public.mentor_connections;
create policy "mentor can update connection status" on public.mentor_connections
  for update
  using (auth.uid() = (select owner_id from public.mentors where id = mentor_id))
  with check (auth.uid() = (select owner_id from public.mentors where id = mentor_id));

drop policy if exists "profile owner can update cofounder connection status" on public.cofounder_connections;
create policy "profile owner can update cofounder connection status" on public.cofounder_connections
  for update
  using (auth.uid() = (select owner_id from public.cofounder_profiles where id = cofounder_profile_id))
  with check (auth.uid() = (select owner_id from public.cofounder_profiles where id = cofounder_profile_id));
