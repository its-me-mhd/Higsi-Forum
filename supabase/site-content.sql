create extension if not exists pgcrypto;

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

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  image_url text not null,
  project_url text not null,
  category text not null,
  created_at timestamptz not null default now()
);

alter table public.site_content enable row level security;
alter table public.projects enable row level security;

drop policy if exists "Public can read site content" on public.site_content;
drop policy if exists "Owner can insert site content" on public.site_content;
drop policy if exists "Owner can update site content" on public.site_content;
drop policy if exists "Public can read projects" on public.projects;
drop policy if exists "Owner can insert projects" on public.projects;
drop policy if exists "Owner can delete projects" on public.projects;

create policy "Public can read site content"
on public.site_content for select
to anon, authenticated using (true);

create policy "Owner can insert site content"
on public.site_content for insert
to authenticated
with check ((select auth.uid()) = 'be944c66-8626-4f97-90da-60892b9168e7'::uuid);

create policy "Owner can update site content"
on public.site_content for update
to authenticated
using ((select auth.uid()) = 'be944c66-8626-4f97-90da-60892b9168e7'::uuid)
with check ((select auth.uid()) = 'be944c66-8626-4f97-90da-60892b9168e7'::uuid);

create policy "Public can read projects"
on public.projects for select
to anon, authenticated using (true);

create policy "Owner can insert projects"
on public.projects for insert
to authenticated
with check ((select auth.uid()) = 'be944c66-8626-4f97-90da-60892b9168e7'::uuid);

create policy "Owner can delete projects"
on public.projects for delete
to authenticated
using ((select auth.uid()) = 'be944c66-8626-4f97-90da-60892b9168e7'::uuid);

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
  and (select auth.uid()) = 'be944c66-8626-4f97-90da-60892b9168e7'::uuid
);

create policy "Owner can delete site assets"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'site-assets'
  and (select auth.uid()) = 'be944c66-8626-4f97-90da-60892b9168e7'::uuid
);