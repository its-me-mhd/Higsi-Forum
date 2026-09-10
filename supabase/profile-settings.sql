create table public.profile_settings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text not null,
  bio_text text not null,
  avatar_url text not null,
  cv_url text not null
);

alter table public.profile_settings enable row level security;

create policy "Anyone can view profile settings"
on public.profile_settings
for select
to anon, authenticated
using (true);

create policy "Owner can update profile settings"
on public.profile_settings
for update
to authenticated
using ((select auth.uid()) = 'YOUR_ADMIN_USER_ID'::uuid)
with check ((select auth.uid()) = 'YOUR_ADMIN_USER_ID'::uuid);

create policy "Owner can insert profile settings"
on public.profile_settings
for insert
to authenticated
with check ((select auth.uid()) = 'YOUR_ADMIN_USER_ID'::uuid);