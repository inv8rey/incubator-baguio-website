-- ===========================================================================
-- 2026-10-03: File type and size limits on every storage bucket.
--
-- Two buckets (event-submission-posters, ecosystem-signup-logos) accept
-- uploads from anyone, without logging in, because the public event
-- submission and ecosystem signup forms need them. Until now no bucket
-- restricted what could be uploaded, so a stranger could host any file
-- (an HTML or SVG phishing page, a huge video) on this project's storage.
--
-- Supabase enforces these limits on upload, for every role. SVG is left out
-- of the image types on purpose: an SVG can carry script.
--
-- Safe to re-run.
-- ===========================================================================

-- Image buckets: raster images only, 5 MB each.
update storage.buckets
set allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    file_size_limit = 5242880
where id in (
  'startup-logos', 'mentor-photos', 'org-logos', 'org-covers', 'partner-logos',
  'ecosystem-signup-logos', 'program-images', 'knowledge-resource-covers'
);

-- Posters and gallery photos can be larger, 10 MB.
update storage.buckets
set allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    file_size_limit = 10485760
where id in ('event-posters', 'event-submission-posters', 'gallery-photos');

-- Knowledge Hub documents: PDF and common office formats, 25 MB.
update storage.buckets
set allowed_mime_types = array[
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'text/plain'
    ],
    file_size_limit = 26214400
where id = 'knowledge-files';

-- Chatbot knowledge base (admin-only, private): PDF, 20 MB.
update storage.buckets
set allowed_mime_types = array['application/pdf'],
    file_size_limit = 20971520
where id = 'chatbot-documents';

-- Check the result:
--   select id, public, file_size_limit, allowed_mime_types from storage.buckets order by id;
