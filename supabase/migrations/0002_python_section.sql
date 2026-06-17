-- Sección "Python" (fundamentos) — visibilidad como un solo grupo.
--
-- Toda la sección Python se muestra/oculta con UN solo toggle. Usamos un slug
-- especial `python` que representa al grupo entero; el sidebar y la guarda de
-- /python gatean con canSee('python').

insert into public.topic_visibility (slug, visible) values
  ('python', false)
on conflict (slug) do nothing;
