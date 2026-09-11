-- Run this if Admin reports that founder_image_url is missing.
alter table public.site_content
  add column if not exists founder_image_url text;

notify pgrst, 'reload schema';