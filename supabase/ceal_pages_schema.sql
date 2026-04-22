create table if not exists public.questions (
  id text primary key,
  created_at timestamptz not null default now(),
  category text not null,
  category_label text not null,
  question text not null,
  source text not null default 'web',
  status text not null default 'received',
  stored_in text not null default 'supabase'
);

create table if not exists public.reports (
  id text primary key,
  created_at timestamptz not null default now(),
  problem_type text not null,
  problem_type_label text not null,
  curriculum text not null,
  curriculum_label text not null,
  subject text not null,
  subject_key text,
  subject_other text,
  incident_date date not null,
  description text not null,
  follow_up boolean not null default false,
  source text not null default 'web',
  status text not null default 'received',
  stored_in text not null default 'supabase'
);

create table if not exists public.report_evidence (
  id text primary key,
  report_id text not null references public.reports(id) on delete cascade,
  created_at timestamptz not null default now(),
  original_name text not null,
  mime_type text,
  size_bytes bigint,
  stored text not null default 'supabase_storage',
  stored_path text not null,
  reason text not null default 'user_attachment'
);

alter table public.questions enable row level security;
alter table public.reports enable row level security;
alter table public.report_evidence enable row level security;

drop policy if exists "anon_insert_questions" on public.questions;
create policy "anon_insert_questions"
on public.questions
for insert
to anon
with check (true);

drop policy if exists "anon_insert_reports" on public.reports;
create policy "anon_insert_reports"
on public.reports
for insert
to anon
with check (true);

drop policy if exists "anon_insert_report_evidence" on public.report_evidence;
create policy "anon_insert_report_evidence"
on public.report_evidence
for insert
to anon
with check (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ceal-evidence',
  'ceal-evidence',
  false,
  10485760,
  array[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[]
)
on conflict (id) do update
set file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "anon_upload_ceal_evidence" on storage.objects;
create policy "anon_upload_ceal_evidence"
on storage.objects
for insert
to anon
with check (bucket_id = 'ceal-evidence');
