-- Sección "Trazar líneas" (slug de visibilidad).
insert into public.topic_visibility (slug, visible) values
  ('line-drawing', false)
on conflict (slug) do nothing;
