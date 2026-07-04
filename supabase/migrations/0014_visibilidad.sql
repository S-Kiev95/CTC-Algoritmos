-- Sección "Visibilidad 2D" (slug de visibilidad).
insert into public.topic_visibility (slug, visible) values
  ('visibilidad', false)
on conflict (slug) do nothing;
