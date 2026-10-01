-- ===========================================================================
-- 2026-10-04 (part B): remove public read access to private columns.
--
-- RUN ONLY AFTER part A has been run AND the matching code is deployed.
-- The new code reads public_organizations / public_challenge_submissions for
-- public pages. If this runs before that code is live, the Ecosystem
-- directory, organization pages, and community challenges would show empty.
--
-- After this, anonymous visitors and ordinary signed-in users can no longer
-- read organizations' private contact fields or challenge submitters' contact
-- details. Owners, organization members, and admins keep full access through
-- the policies added in part A.
--
-- Safe to re-run.
-- ===========================================================================

drop policy if exists "organizations are publicly readable" on public.organizations;
-- Despite its name, this policy was "using (true)", i.e. public too.
drop policy if exists "org members read their organizations" on public.organizations;

drop policy if exists "challenge submissions are publicly readable" on public.challenge_submissions;

-- Check: run as an anonymous visitor (e.g. the public REST API) and confirm
-- `select contact_email from organizations` returns no rows, while
-- `select * from public_organizations` still lists the public directory.
