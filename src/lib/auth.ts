/**
 * Login del profesor (lado cliente). La app es personal, así que las
 * credenciales están hardcodeadas. NO es seguridad real: cualquiera con ganas
 * puede leer el bundle. Sirve solo para que el panel de administración no esté
 * a la vista de los estudiantes y para evitar cambios accidentales.
 *
 * La misma contraseña se usa como "secreto" del RPC que escribe en Supabase
 * (ver lib/supabase.ts y la migración SQL). Por eso vive acá en un único lugar.
 */

export const ADMIN_USER = "zeek";
export const ADMIN_PASSWORD = "$Kiev1995";

const ADMIN_FLAG_KEY = "algoritmos-admin";

export function checkCredentials(user: string, password: string): boolean {
  return user === ADMIN_USER && password === ADMIN_PASSWORD;
}

/** Lee si la sesión actual de este browser está logueada como profesor. */
export function readAdminFlag(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ADMIN_FLAG_KEY) === "1";
}

export function writeAdminFlag(isAdmin: boolean): void {
  if (typeof window === "undefined") return;
  if (isAdmin) window.localStorage.setItem(ADMIN_FLAG_KEY, "1");
  else window.localStorage.removeItem(ADMIN_FLAG_KEY);
}
