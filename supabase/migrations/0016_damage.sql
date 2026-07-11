-- Sección "Daño en juegos" (slug de visibilidad).
insert into public.topic_visibility (slug, visible) values
  ('damage', false)
on conflict (slug) do nothing;
