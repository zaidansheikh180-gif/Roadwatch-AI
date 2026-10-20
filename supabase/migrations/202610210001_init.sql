-- RoadWatch AI MVP schema. Apply with: supabase db push
-- The public view deliberately omits tracking_token_hash and internal review notes.

create extension if not exists pgcrypto;

do $$ begin
  create type public.report_status as enum ('Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.verification_status as enum ('Unverified', 'Reviewed', 'Confirmed', 'Disputed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.screening_status as enum ('Pending', 'Completed', 'Uncertain', 'Failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.app_role as enum ('citizen', 'admin');
exception when duplicate_object then null; end $$;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid references auth.users(id) on delete set null,
  tracking_token_hash text,
  description text not null default '' check (char_length(description) <= 1000),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  location_label text not null default 'Pinned location' check (char_length(location_label) <= 160),
  photo_storage_path text not null,
  lifecycle_status public.report_status not null default 'Submitted',
  verification_status public.verification_status not null default 'Unverified',
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint report_has_reporter_mechanism check (reporter_user_id is not null or tracking_token_hash is not null)
);

create table if not exists public.ai_screenings (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  screening_status public.screening_status not null,
  suggested_damage_type text,
  suggested_severity text,
  confidence_score real check (confidence_score is null or confidence_score between 0 and 1),
  model_name text,
  model_version text,
  error_code text,
  error_summary text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'citizen',
  created_at timestamptz not null default now()
);

create table if not exists public.report_status_history (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  change_type text not null check (change_type in ('lifecycle', 'verification')),
  old_value text,
  new_value text not null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.report_reviews (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  reviewer_user_id uuid references auth.users(id) on delete set null,
  decision text not null check (decision in ('Reviewed', 'Confirmed', 'Disputed', 'Rejected')),
  corrected_damage_type text,
  corrected_severity text,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists reports_created_at_idx on public.reports (created_at desc);
create index if not exists reports_location_idx on public.reports (latitude, longitude);
create index if not exists reports_public_status_idx on public.reports (lifecycle_status, created_at desc);
create index if not exists ai_screenings_report_idx on public.ai_screenings (report_id, started_at desc);

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists reports_touch_updated_at on public.reports;
create trigger reports_touch_updated_at before update on public.reports
for each row execute function public.touch_updated_at();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin')
$$;

alter table public.reports enable row level security;
alter table public.ai_screenings enable row level security;
alter table public.user_roles enable row level security;
alter table public.report_status_history enable row level security;
alter table public.report_reviews enable row level security;

revoke all on public.reports from anon, authenticated;
revoke all on public.ai_screenings from anon, authenticated;
revoke all on public.report_status_history from anon, authenticated;
revoke all on public.report_reviews from anon, authenticated;
grant select on public.user_roles to authenticated;

drop policy if exists "Users can read their own role" on public.user_roles;
create policy "Users can read their own role" on public.user_roles
for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- Views run with their owner's table privileges; this view deliberately returns only public fields.
create or replace view public.public_reports as
select
  r.id, r.description, r.latitude, r.longitude, r.location_label, r.photo_storage_path,
  r.lifecycle_status, r.verification_status, r.is_sample, r.created_at,
  latest.screening_status, latest.suggested_damage_type, latest.suggested_severity, latest.confidence_score
from public.reports r
left join lateral (
  select a.screening_status, a.suggested_damage_type, a.suggested_severity, a.confidence_score
  from public.ai_screenings a where a.report_id = r.id order by a.started_at desc limit 1
) latest on true
where r.lifecycle_status <> 'Rejected';

grant select on public.public_reports to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('road-photos', 'road-photos', true, 8388608, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- No browser upload policy is created. The submit-report Edge Function validates and uploads files.
