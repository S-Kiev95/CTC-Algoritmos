/**
 * Acceso al backend de visibilidad (Supabase Cloud, PostgREST) sin dependencias.
 *
 * La app es 100% estática (`output: "export"`), así que toda la comunicación
 * ocurre en el browser contra la REST API de Supabase usando la `anon key`.
 * La anon key es pública por diseño — no es un secreto. Lo que protege las
 * escrituras es la función RPC `set_topic_visibility`, que exige la contraseña
 * del profesor del lado del servidor (ver migración SQL en supabase/).
 *
 * - Lectura (cualquiera, incluidos estudiantes): GET a la tabla. RLS permite
 *   SELECT a `anon`.
 * - Escritura (solo profesor): POST al RPC con el secreto. RLS niega INSERT/
 *   UPDATE directos; el único camino de escritura es el RPC.
 */

// project_ref=ekqgmplovhcuqdbvdpkb → URL del proyecto cloud.
export const SUPABASE_URL = "https://ekqgmplovhcuqdbvdpkb.supabase.co";

// Publishable key (formato nuevo de Supabase). Es pública por diseño: segura
// de exponer en el bundle. Las escrituras están protegidas por el RPC, no por
// esta clave.
export const SUPABASE_ANON_KEY = "sb_publishable_6oY0oASLwX8uUc4zQ1zY6w_4y40rcxa";

const REST = `${SUPABASE_URL}/rest/v1`;

function baseHeaders(): HeadersInit {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  };
}

export type VisibilityMap = Record<string, boolean>;

/**
 * Trae el estado de visibilidad de todos los temas. Devuelve un mapa
 * slug → visible. Si un slug no tiene fila, se considera oculto.
 */
export async function fetchVisibility(): Promise<VisibilityMap> {
  const res = await fetch(`${REST}/topic_visibility?select=slug,visible`, {
    headers: baseHeaders(),
    // Siempre queremos el estado fresco: el profesor puede haber cambiado algo.
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`No se pudo cargar la visibilidad (HTTP ${res.status})`);
  }
  const rows: { slug: string; visible: boolean }[] = await res.json();
  const map: VisibilityMap = {};
  for (const row of rows) map[row.slug] = row.visible;
  return map;
}

/**
 * Cambia la visibilidad de un tema. Solo funciona con el secreto correcto
 * (la contraseña del profesor); el chequeo ocurre en el servidor dentro del
 * RPC `set_topic_visibility`.
 */
export async function setVisibilityRemote(
  slug: string,
  visible: boolean,
  secret: string,
): Promise<void> {
  const res = await fetch(`${REST}/rpc/set_topic_visibility`, {
    method: "POST",
    headers: {
      ...baseHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_slug: slug, p_visible: visible, p_secret: secret }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `No se pudo guardar el cambio (HTTP ${res.status}). ${detail}`.trim(),
    );
  }
}
