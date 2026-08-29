-- ===========================================================================
-- Gallery categories + location — 28 Aug 2026
-- Backs the new /gallery page and its category filter.
--
-- Safe to re-run.
-- ===========================================================================

-- Five real categories; "All" is the unfiltered view, not a stored value.
-- Defaults to 'Ecosystem' so every existing photo lands in a valid bucket
-- rather than an empty string that would fail the check below.
alter table public.gallery_photos
  add column if not exists category text not null default 'Ecosystem';

alter table public.gallery_photos drop constraint if exists gallery_photos_category_check;
alter table public.gallery_photos
  add constraint gallery_photos_category_check
  check (category in ('Workshops', 'Trainings', 'Mentoring', 'Networking', 'Ecosystem'));

-- Shown under each caption on the gallery page, e.g. "Incubator Baguio
-- Office, Baguio City". Free text: venues here are named the way people say
-- them, not picked from a fixed list.
alter table public.gallery_photos
  add column if not exists location text not null default '';

-- The gallery page filters by category and orders by date; both are indexed
-- together since that's how every query on this table reads it.
create index if not exists gallery_photos_category_date_idx
  on public.gallery_photos (category, event_date desc nulls last);
