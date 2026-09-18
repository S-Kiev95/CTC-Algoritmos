-- Ejercicio "Laberinto (Prim)": arranca oculto.
insert into public.topic_visibility (slug, visible) values
  ('ej:laberinto-prim', false)
on conflict (slug) do nothing;
