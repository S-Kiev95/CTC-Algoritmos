-- Sección "Recorrer el laberinto" (Dijkstra / bidireccional / A*).
-- Un solo toggle de visibilidad para toda la sección.

insert into public.topic_visibility (slug, visible) values
  ('recorrido', false)
on conflict (slug) do nothing;
