-- Add editable Higsi Forum public-site content fields.
-- Safe to run after the existing site-content.sql migration.
alter table public.site_content
  add column if not exists hero_eyebrow text not null default 'Development & Community Empowerment Organization',
  add column if not exists about_supporting_text text not null default '',
  add column if not exists vision_text text not null default '',
  add column if not exists mission_text text not null default '',
  add column if not exists programs_heading text not null default 'Practical programs. Meaningful progress.',
  add column if not exists programs_text text not null default '',
  add column if not exists impact_heading text not null default 'Creating opportunities. Building capacity. Inspiring change.',
  add column if not exists impact_text text not null default '',
  add column if not exists partnerships_heading text not null default 'Let''s build the next chapter together.',
  add column if not exists partnerships_text text not null default '',
  add column if not exists collaboration_heading text not null default 'Collaboration areas',
  add column if not exists collaboration_items text not null default '',
  add column if not exists impact_youth text not null default '320+',
  add column if not exists impact_women text not null default '180+',
  add column if not exists impact_teachers text not null default '200+',
  add column if not exists impact_communities text not null default '15+',
  add column if not exists impact_partnerships text not null default '12';

notify pgrst, 'reload schema';
