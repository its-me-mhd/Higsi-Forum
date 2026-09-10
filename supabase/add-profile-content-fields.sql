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

alter table public.site_content alter column github_url drop not null;
alter table public.site_content alter column linkedin_url drop not null;
alter table public.site_content drop column if exists github_url;
alter table public.site_content alter column bio_text drop not null;
alter table public.site_content alter column avatar_url drop not null;
alter table public.site_content alter column cv_url drop not null;

notify pgrst, 'reload schema';