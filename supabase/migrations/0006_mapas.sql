-- Sección "Mapas" (rutas en ciudades reales).
--
-- Visibilidad: la sección entera con `mapas`, y cada ciudad con `mapa:<slug>`.
-- Solo Salto está implementada; las demás se habilitarán cuando se construyan.

insert into public.topic_visibility (slug, visible) values
  ('mapas',              false),
  ('mapa:salto',         false),
  ('mapa:buenos-aires',  false),
  ('mapa:nueva-york',    false),
  ('mapa:roma',          false)
on conflict (slug) do nothing;
