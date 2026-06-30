-- Sección "Poda alfa-beta" (slug de visibilidad).
insert into public.topic_visibility (slug, visible) values
  ('alfa-beta', false)
on conflict (slug) do nothing;
