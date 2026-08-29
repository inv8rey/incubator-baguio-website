-- ===========================================================================
-- Funded project partner logo — 28 Aug 2026
-- Lets a funded project reference one of the existing Ecosystem Partners
-- (name + logo already managed in the admin Partners tab) so that partner's
-- logo can display on the project's card instead of a generic initials
-- avatar.
--
-- A reference rather than a duplicate upload: the same partner is often
-- attached to more than one funded project, and reusing ecosystem_partners
-- means updating the logo once updates every project that references it.
--
-- Safe to re-run.
-- ===========================================================================

alter table public.funded_projects
  add column if not exists partner_id uuid references public.ecosystem_partners (id) on delete set null;
