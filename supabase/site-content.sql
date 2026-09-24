create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  id uuid primary key
);

create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  job_title text not null,
  bio_text text not null,
  avatar_url text not null,
  cv_url text not null,
  email text not null,
  github_url text not null,
  linkedin_url text not null
);

alter table public.site_content add column if not exists home_text text not null default '';
alter table public.site_content add column if not exists about_text text not null default '';
alter table public.site_content add column if not exists address text not null default '';
alter table public.site_content add column if not exists phone text not null default '';
alter table public.site_content add column if not exists facebook_url text;
alter table public.site_content add column if not exists instagram_url text;
alter table public.site_content add column if not exists whatsapp_url text;
alter table public.site_content add column if not exists services_text text not null default '';
alter table public.site_content add column if not exists contact_text text not null default '';
alter table public.site_content add column if not exists experience_text text not null default '';
alter table public.site_content add column if not exists projects_completed_text text not null default '';
alter table public.site_content add column if not exists happy_clients_text text not null default '';
alter table public.site_content add column if not exists site_name text not null default '';
alter table public.site_content add column if not exists home_heading text not null default '';
alter table public.site_content add column if not exists about_heading text not null default '';
alter table public.site_content add column if not exists services_heading text not null default 'What I do?';
alter table public.site_content add column if not exists contact_heading text not null default '';
alter table public.site_content add column if not exists contact_left_heading text not null default '';
alter table public.site_content add column if not exists contact_right_heading text not null default '';
alter table public.site_content alter column github_url drop not null;
alter table public.site_content alter column linkedin_url drop not null;
alter table public.site_content drop column if exists github_url;
alter table public.site_content alter column bio_text drop not null;
alter table public.site_content alter column avatar_url drop not null;
alter table public.site_content alter column cv_url drop not null;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  image_url text not null,
  project_url text not null,
  category text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.site_content enable row level security;
alter table public.projects enable row level security;
alter table public.services enable row level security;

drop policy if exists "Public can read site content" on public.site_content;
drop policy if exists "Owner can insert site content" on public.site_content;
drop policy if exists "Owner can update site content" on public.site_content;
drop policy if exists "Public can read projects" on public.projects;
drop policy if exists "Owner can insert projects" on public.projects;
drop policy if exists "Owner can delete projects" on public.projects;
drop policy if exists "Public can read services" on public.services;
drop policy if exists "Owner can insert services" on public.services;
drop policy if exists "Owner can update services" on public.services;
drop policy if exists "Owner can delete services" on public.services;

create policy "Public can read site content"
on public.site_content for select
to anon, authenticated using (true);

create policy "Owner can insert site content"
on public.site_content for insert
to authenticated
with check ((select auth.uid()) in (select id from public.admin_users));

create policy "Owner can update site content"
on public.site_content for update
to authenticated
using ((select auth.uid()) in (select id from public.admin_users))
with check ((select auth.uid()) in (select id from public.admin_users));

create policy "Public can read projects"
on public.projects for select
to anon, authenticated using (true);

create policy "Owner can insert projects"
on public.projects for insert
to authenticated
with check ((select auth.uid()) in (select id from public.admin_users));

create policy "Owner can delete projects"
on public.projects for delete
to authenticated
using ((select auth.uid()) in (select id from public.admin_users));

create policy "Public can read services"
on public.services for select
to anon, authenticated using (true);

create policy "Owner can insert services"
on public.services for insert
to authenticated
with check ((select auth.uid()) in (select id from public.admin_users));

create policy "Owner can update services"
on public.services for update
to authenticated
using ((select auth.uid()) in (select id from public.admin_users))
with check ((select auth.uid()) in (select id from public.admin_users));

create policy "Owner can delete services"
on public.services for delete
to authenticated
using ((select auth.uid()) in (select id from public.admin_users));

insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

drop policy if exists "Public can read site assets" on storage.objects;
drop policy if exists "Owner can upload site assets" on storage.objects;
drop policy if exists "Owner can delete site assets" on storage.objects;

create policy "Public can read site assets"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'site-assets');

create policy "Owner can upload site assets"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'site-assets'
  and (select auth.uid()) in (select id from public.admin_users)
);

create policy "Owner can delete site assets"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'site-assets'
  and (select auth.uid()) in (select id from public.admin_users)
);