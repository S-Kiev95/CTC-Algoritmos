-- Sección "Librerías de utilidad" (contenido de referencia).
--
-- Visibilidad: la sección entera con `librerias`, y cada librería con
-- `lib:<slug>`. Por ahora solo Streamlit.

insert into public.topic_visibility (slug, visible) values
  ('librerias',     false),
  ('lib:streamlit', false)
on conflict (slug) do nothing;
