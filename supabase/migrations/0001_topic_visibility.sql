-- Visibilidad de temas del curso.
--
-- Una fila por tema. Los estudiantes (rol anon) pueden LEER; las escrituras
-- van únicamente por el RPC `set_topic_visibility`, que exige la contraseña
-- del profesor del lado del servidor. Así, aunque la anon key sea pública,
-- un estudiante no puede habilitar temas a mano.

create table if not exists public.topic_visibility (
  slug       text primary key,
  visible    boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.topic_visibility enable row level security;

-- Lectura pública (estudiantes + profesor).
drop policy if exists "anon can read visibility" on public.topic_visibility;
create policy "anon can read visibility"
  on public.topic_visibility
  for select
  to anon, authenticated
  using (true);

-- No hay políticas de INSERT/UPDATE/DELETE: con RLS activo, eso bloquea
-- cualquier escritura directa vía PostgREST. El único camino es el RPC.

-- Cambia la visibilidad de un tema. SECURITY DEFINER para poder escribir
-- saltando RLS, pero solo si el secreto coincide con la contraseña del profesor.
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

-- Semilla: todos los temas arrancan ocultos. Se habilitan desde la app.
insert into public.topic_visibility (slug, visible) values
  ('notacion-big-o',   false),
  ('recursividad',     false),
  ('arreglos',         false),
  ('ordenacion',       false),
  ('listas-enlazadas', false),
  ('pilas',            false),
  ('colas',            false),
  ('tablas-hash',      false),
  ('arboles',          false),
  ('arboles-binarios', false),
  ('heap',             false),
  ('grafos',           false)
on conflict (slug) do nothing;
