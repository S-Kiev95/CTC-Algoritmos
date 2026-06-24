-- Librerías: SQLModel (slug de visibilidad).
insert into public.topic_visibility (slug, visible) values
  ('lib:sqlmodel', false)
on conflict (slug) do nothing;
