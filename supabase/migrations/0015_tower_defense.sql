-- Sección "Tower Defense" (slug de visibilidad).
insert into public.topic_visibility (slug, visible) values
  ('tower-defense', false)
on conflict (slug) do nothing;
