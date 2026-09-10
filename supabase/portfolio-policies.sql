-- Replace the UUID below with the Auth user id for the site owner.
-- Find it in Supabase Dashboard > Authentication > Users.

alter table public.projects enable row level security;

create policy "Anyone can view projects"
on public.projects
for select
to anon, authenticated
using (true);

create policy "Owner can insert projects"
on public.projects
for insert
to authenticated
with check ((select auth.uid()) = 'YOUR_ADMIN_USER_ID'::uuid);

create policy "Anyone can view portfolio images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'portfolio-images');

create policy "Owner can upload portfolio images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'portfolio-images'
  and (select auth.uid()) = 'YOUR_ADMIN_USER_ID'::uuid
);