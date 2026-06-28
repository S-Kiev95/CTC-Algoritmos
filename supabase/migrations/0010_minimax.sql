-- Sección "Minimax" (slug de visibilidad).
insert into public.topic_visibility (slug, visible) values
  ('minimax', false)
on conflict (slug) do nothing;
