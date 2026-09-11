-- Give a registered solver team their own inbox for "Collaborate" requests
-- from the challenge detail page, instead of routing everything through the
-- admin's Contact Messages inbox with no visibility for the team itself.
--
-- Applying to a challenge already requires login (ApplyForm.tsx stores
-- applicant_id: user.id on challenge_applications), so every solver team is
-- a real account -- this rides on that instead of inventing a new identity
-- concept.
--
-- All access goes through SECURITY DEFINER functions rather than table RLS
-- policies for anon/authenticated: it keeps the validation (does this
-- application exist? is it accepted? does the caller actually own it?) in
-- one place instead of duplicated across policy expressions, and matches
-- the pattern already used for public_challenge_solvers() and
-- discoverable_members().

create table if not exists public.challenge_collaboration_requests (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.challenge_applications (id) on delete cascade,
  requester_name text not null,
  requester_email text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read')),
  created_at timestamptz not null default now()
);

create index if not exists challenge_collaboration_requests_application_idx
  on public.challenge_collaboration_requests (application_id, created_at desc);

alter table public.challenge_collaboration_requests enable row level security;

-- No direct anon/authenticated policies -- reads, writes, and the ownership
-- check all go through the functions below. Admins keep blanket access for
-- moderation/spam cleanup, same as every other table in this app.
drop policy if exists "admins manage collaboration requests" on public.challenge_collaboration_requests;
create policy "admins manage collaboration requests" on public.challenge_collaboration_requests
  for all using (public.is_site_admin()) with check (public.is_site_admin());

-- Called from the public challenge page's "Collaborate" modal. Re-validates
-- the application is real and accepted server-side rather than trusting the
-- client -- the public page only ever shows accepted teams, but the function
-- shouldn't assume the caller went through that UI.
create or replace function public.request_challenge_collaboration(
  p_application_id uuid,
  p_requester_name text,
  p_requester_email text,
  p_message text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.challenge_applications
    where id = p_application_id and status = 'accepted'
  ) then
    raise exception 'This team is not open for collaboration requests.';
  end if;

  if trim(p_requester_name) = '' or trim(p_requester_email) = '' or trim(p_message) = '' then
    raise exception 'Name, email, and message are all required.';
  end if;

  insert into public.challenge_collaboration_requests (application_id, requester_name, requester_email, message)
  values (p_application_id, trim(p_requester_name), trim(p_requester_email), trim(p_message));
end;
$$;

revoke all on function public.request_challenge_collaboration(uuid, text, text, text) from public;
grant execute on function public.request_challenge_collaboration(uuid, text, text, text) to anon, authenticated;

-- The signed-in team's own inbox: every collaboration request against any
-- application they own, newest first, with just enough challenge context
-- (title, team name) to render without a second round trip.
create or replace function public.my_collaboration_requests()
returns table (
  id uuid,
  application_id uuid,
  team_name text,
  challenge_title text,
  requester_name text,
  requester_email text,
  message text,
  status text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select r.id, r.application_id, a.team_name, coalesce(c.title, ''), r.requester_name, r.requester_email, r.message, r.status, r.created_at
  from public.challenge_collaboration_requests r
  join public.challenge_applications a on a.id = r.application_id
  left join public.challenges c on c.id::text = a.challenge_id
  where a.applicant_id = auth.uid()
  order by r.created_at desc;
$$;

revoke all on function public.my_collaboration_requests() from public;
grant execute on function public.my_collaboration_requests() to authenticated;

-- Marks one request read -- only for the team that owns the underlying
-- application, so one user can't mark another's inbox read.
create or replace function public.mark_collaboration_request_read(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.challenge_collaboration_requests r
  set status = 'read'
  from public.challenge_applications a
  where r.id = p_id
    and a.id = r.application_id
    and a.applicant_id = auth.uid();
end;
$$;

revoke all on function public.mark_collaboration_request_read(uuid) from public;
grant execute on function public.mark_collaboration_request_read(uuid) to authenticated;
