-- Librerías: FastAPI (slug de visibilidad).
insert into public.topic_visibility (slug, visible) values
  ('lib:fastapi', false)
on conflict (slug) do nothing;
