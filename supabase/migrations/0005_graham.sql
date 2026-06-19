-- Ejercicio "Graham Scan" (convex hull) — sección Ejercicios.
--
-- Visibilidad en 2 niveles: el ejercicio y su solución (la sección entera ya se
-- gatea con `ejercicios`). La parte teórica + demo + enunciado se ven con el
-- ejercicio; la solución del campo de cultivo se gatea aparte.

insert into public.topic_visibility (slug, visible) values
  ('ej:graham',      false),  -- el ejercicio (teoría + demo + enunciado + pistas)
  ('ej:graham:sol',  false)   -- la solución (tabs Solución + Animación)
on conflict (slug) do nothing;
