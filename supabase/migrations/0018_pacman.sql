-- Sección "Laberinto tipo Pacman" (slug de visibilidad).
insert into public.topic_visibility (slug, visible) values
  ('pacman', false)
on conflict (slug) do nothing;
