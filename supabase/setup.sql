-- ============================================================================
-- SETUP COMPLETO — pegá TODO este archivo en el SQL Editor de un proyecto
-- Supabase nuevo y ejecutalo una sola vez. Deja la base lista para la app.
--
-- Es la suma de todas las migraciones de supabase/migrations/, así que sirve
-- para levantar el proyecto de cero (por ejemplo, al mudarlo de cuenta).
-- Se puede volver a correr sin romper nada (todo es idempotente).
-- ============================================================================

-- 1) Tabla de visibilidad: una fila por sección del curso.
create table if not exists public.topic_visibility (
  slug       text primary key,
  visible    boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.topic_visibility enable row level security;

-- 2) Lectura pública (estudiantes y profesor).
drop policy if exists "anon can read visibility" on public.topic_visibility;
create policy "anon can read visibility"
  on public.topic_visibility
  for select
  to anon, authenticated
  using (true);

-- No hay políticas de INSERT/UPDATE/DELETE: con RLS activo eso bloquea
-- cualquier escritura directa. El único camino es el RPC de abajo.

-- 3) Escritura protegida por contraseña del profesor.
--    SECURITY DEFINER para poder escribir saltando RLS, pero solo si el
--    secreto coincide. Si cambiás la contraseña, cambiala también en
--    src/lib/auth.ts (ADMIN_PASSWORD).
create or replace function public.set_topic_visibility(
  p_slug    text,
  p_visible boolean,
  p_secret  text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_secret is distinct from '$Kiev1995' then
    raise exception 'No autorizado';
  end if;

  insert into public.topic_visibility (slug, visible, updated_at)
  values (p_slug, p_visible, now())
  on conflict (slug)
  do update set visible = excluded.visible, updated_at = now();
end;
$$;

grant execute on function public.set_topic_visibility(text, boolean, text)
  to anon, authenticated;

-- 4) Semilla: TODAS las secciones arrancan ocultas. Se habilitan desde la app
--    con el toggle del ojo (logueado como profesor).
insert into public.topic_visibility (slug, visible) values
  -- Temas
  ('notacion-big-o',       false),
  ('recursividad',         false),
  ('arreglos',             false),
  ('ordenacion',           false),
  ('listas-enlazadas',     false),
  ('pilas',                false),
  ('colas',                false),
  ('tablas-hash',          false),
  ('arboles',              false),
  ('arboles-binarios',     false),
  ('heap',                 false),
  ('grafos',               false),
  -- Python (un solo toggle para toda la sección)
  ('python',               false),
  -- Ejercicios (sección + cada ejercicio + sus soluciones)
  ('ejercicios',           false),
  ('ej:8-reinas',          false),
  ('ej:8-reinas:sol',      false),
  ('ej:laberinto-kruskal', false),
  ('ej:graham',            false),
  ('ej:graham:sol',        false),
  -- Secciones de algoritmos
  ('recorrido',            false),
  ('minimax',              false),
  ('alfa-beta',            false),
  ('aristas',              false),
  ('visibilidad',          false),
  ('tower-defense',        false),
  ('damage',               false),
  ('line-drawing',         false),
  ('pacman',               false),
  -- Mapas (sección + cada ciudad)
  ('mapas',                false),
  ('mapa:salto',           false),
  ('mapa:buenos-aires',    false),
  ('mapa:nueva-york',      false),
  ('mapa:roma',            false),
  -- Librerías (sección + cada librería)
  ('librerias',            false),
  ('lib:streamlit',        false),
  ('lib:fastapi',          false),
  ('lib:sqlmodel',         false),
  ('lib:pygame',           false)
on conflict (slug) do nothing;

-- 5) Chequeo: deberías ver 38 filas.
select count(*) as secciones_registradas from public.topic_visibility;
