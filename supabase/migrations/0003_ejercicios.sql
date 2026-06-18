-- Sección "Ejercicios prácticos" — visibilidad en 3 niveles independientes.
--
-- El profe controla por separado: la sección entera, cada ejercicio, y la
-- solución de cada ejercicio (para dar el enunciado primero y revelar la
-- resolución después). Cada nivel es un slug en topic_visibility.

insert into public.topic_visibility (slug, visible) values
  ('ejercicios',            false),  -- la sección entera
  ('ej:8-reinas',           false),  -- el ejercicio (enunciado + pistas)
  ('ej:8-reinas:sol',       false),  -- la solución (tabs Solución + Animación)
  ('ej:laberinto-kruskal',  false)   -- demo de laberinto (sin solución aparte)
on conflict (slug) do nothing;
