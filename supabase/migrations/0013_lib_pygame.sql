-- Librería "Pygame" (slug de visibilidad de la librería).
insert into public.topic_visibility (slug, visible) values
  ('lib:pygame', false)
on conflict (slug) do nothing;
