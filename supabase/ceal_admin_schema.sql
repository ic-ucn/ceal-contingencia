create extension if not exists pgcrypto;

create or replace function public.ceal_editor_email()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''))
$$;

create or replace function public.ceal_has_domain_access()
returns boolean
language sql
stable
as $$
  select public.ceal_editor_email() like '%@ucn.cl'
$$;

create table if not exists public.admin_members (
  email text primary key,
  full_name text not null default '',
  role text not null default 'editor',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.ceal_is_admin()
returns boolean
language sql
stable
as $$
  select
    public.ceal_has_domain_access()
    or exists (
      select 1
      from public.admin_members member
      where lower(member.email) = public.ceal_editor_email()
        and member.is_active = true
    )
$$;

create table if not exists public.site_status (
  id text primary key,
  hero_eyebrow text not null default '',
  hero_title text not null default '',
  hero_lead text not null default '',
  active_badge_label text not null default '',
  active_badge_tone text not null default 'review',
  source_badge_label text not null default '',
  source_badge_tone text not null default 'confirmed',
  update_label text not null default '',
  current_kicker text not null default '',
  current_title text not null default '',
  current_summary text not null default '',
  current_status_label text not null default '',
  current_status_tone text not null default 'review',
  events_kicker text not null default '',
  events_title text not null default '',
  events_json jsonb not null default '[]'::jsonb,
  last_update_kicker text not null default '',
  last_update_title text not null default '',
  last_update_body text not null default '',
  faq_title text not null default 'FAQ',
  faq_intro text not null default '',
  channels_kicker text not null default 'Fuentes',
  channels_title text not null default '',
  channels_intro text not null default '',
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.faq_entries (
  id text primary key,
  category text not null,
  question text not null,
  answer text not null,
  status text not null default 'review',
  updated_label text not null default '',
  source_label text not null default '',
  display_order integer not null default 100,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agreement_entries (
  id text primary key,
  area text not null default 'General',
  title text not null,
  summary text not null,
  status text not null default 'review',
  date_label text not null default '',
  source_label text not null default '',
  display_order integer not null default 100,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.channel_links (
  id text primary key,
  label text not null,
  meta text not null default '',
  href text not null default '',
  display_order integer not null default 100,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.source_documents (
  id text primary key,
  title text not null,
  document_kind text not null default 'otro',
  notes text not null default '',
  storage_bucket text not null,
  storage_path text not null,
  mime_type text not null default 'application/octet-stream',
  file_size bigint not null default 0,
  uploaded_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.update_jobs (
  id text primary key,
  target_type text not null default 'mixed',
  action_mode text not null default 'sumar',
  status text not null default 'queued',
  title text not null,
  instructions text not null,
  source_document_ids jsonb not null default '[]'::jsonb,
  requested_by text not null default '',
  result_summary text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_members enable row level security;
alter table public.site_status enable row level security;
alter table public.faq_entries enable row level security;
alter table public.agreement_entries enable row level security;
alter table public.channel_links enable row level security;
alter table public.source_documents enable row level security;
alter table public.update_jobs enable row level security;

drop policy if exists "admin_members_select" on public.admin_members;
create policy "admin_members_select"
on public.admin_members
for select
to authenticated
using (public.ceal_is_admin());

drop policy if exists "admin_members_manage" on public.admin_members;
create policy "admin_members_manage"
on public.admin_members
for all
to authenticated
using (public.ceal_is_admin())
with check (public.ceal_is_admin());

drop policy if exists "public_read_site_status" on public.site_status;
create policy "public_read_site_status"
on public.site_status
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "admin_manage_site_status" on public.site_status;
create policy "admin_manage_site_status"
on public.site_status
for all
to authenticated
using (public.ceal_is_admin())
with check (public.ceal_is_admin());

drop policy if exists "public_read_faq_entries" on public.faq_entries;
create policy "public_read_faq_entries"
on public.faq_entries
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "admin_manage_faq_entries" on public.faq_entries;
create policy "admin_manage_faq_entries"
on public.faq_entries
for all
to authenticated
using (public.ceal_is_admin())
with check (public.ceal_is_admin());

drop policy if exists "public_read_agreement_entries" on public.agreement_entries;
create policy "public_read_agreement_entries"
on public.agreement_entries
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "admin_manage_agreement_entries" on public.agreement_entries;
create policy "admin_manage_agreement_entries"
on public.agreement_entries
for all
to authenticated
using (public.ceal_is_admin())
with check (public.ceal_is_admin());

drop policy if exists "public_read_channel_links" on public.channel_links;
create policy "public_read_channel_links"
on public.channel_links
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "admin_manage_channel_links" on public.channel_links;
create policy "admin_manage_channel_links"
on public.channel_links
for all
to authenticated
using (public.ceal_is_admin())
with check (public.ceal_is_admin());

drop policy if exists "admin_select_source_documents" on public.source_documents;
create policy "admin_select_source_documents"
on public.source_documents
for select
to authenticated
using (public.ceal_is_admin());

drop policy if exists "admin_manage_source_documents" on public.source_documents;
create policy "admin_manage_source_documents"
on public.source_documents
for all
to authenticated
using (public.ceal_is_admin())
with check (public.ceal_is_admin());

drop policy if exists "admin_select_update_jobs" on public.update_jobs;
create policy "admin_select_update_jobs"
on public.update_jobs
for select
to authenticated
using (public.ceal_is_admin());

drop policy if exists "admin_manage_update_jobs" on public.update_jobs;
create policy "admin_manage_update_jobs"
on public.update_jobs
for all
to authenticated
using (public.ceal_is_admin())
with check (public.ceal_is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ceal-admin-sources',
  'ceal-admin-sources',
  false,
  26214400,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'image/png',
    'image/jpeg',
    'image/webp'
  ]::text[]
)
on conflict (id) do update
set file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admin_read_ceal_admin_sources" on storage.objects;
create policy "admin_read_ceal_admin_sources"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'ceal-admin-sources'
  and public.ceal_is_admin()
);

drop policy if exists "admin_upload_ceal_admin_sources" on storage.objects;
create policy "admin_upload_ceal_admin_sources"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'ceal-admin-sources'
  and public.ceal_is_admin()
);

drop policy if exists "admin_update_ceal_admin_sources" on storage.objects;
create policy "admin_update_ceal_admin_sources"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'ceal-admin-sources'
  and public.ceal_is_admin()
)
with check (
  bucket_id = 'ceal-admin-sources'
  and public.ceal_is_admin()
);

drop policy if exists "admin_delete_ceal_admin_sources" on storage.objects;
create policy "admin_delete_ceal_admin_sources"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'ceal-admin-sources'
  and public.ceal_is_admin()
);
