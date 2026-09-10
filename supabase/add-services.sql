create extension if not exists pgcrypto;

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.services enable row level security;

drop policy if exists "Public can read services" on public.services;
drop policy if exists "Owner can insert services" on public.services;
drop policy if exists "Owner can update services" on public.services;
drop policy if exists "Owner can delete services" on public.services;

create policy "Public can read services"
on public.services for select
to anon, authenticated
using (true);

create policy "Owner can insert services"
on public.services for insert
to authenticated
with check ((select auth.uid()) = 'be944c66-8626-4f97-90da-60892b9168e7'::uuid);

create policy "Owner can update services"
on public.services for update
to authenticated
using ((select auth.uid()) = 'be944c66-8626-4f97-90da-60892b9168e7'::uuid)
with check ((select auth.uid()) = 'be944c66-8626-4f97-90da-60892b9168e7'::uuid);

create policy "Owner can delete services"
on public.services for delete
to authenticated
using ((select auth.uid()) = 'be944c66-8626-4f97-90da-60892b9168e7'::uuid);

notify pgrst, 'reload schema';
