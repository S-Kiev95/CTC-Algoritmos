-- Sección "Aristas y muros" (slug de visibilidad).
insert into public.topic_visibility (slug, visible) values
  ('aristas', false)
on conflict (slug) do nothing;
