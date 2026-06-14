"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ADMIN_PASSWORD,
  checkCredentials,
  readAdminFlag,
  writeAdminFlag,
} from "@/lib/auth";
import {
  fetchVisibility,
  setVisibilityRemote,
  type VisibilityMap,
} from "@/lib/supabase";

type VisibilityContextValue = {
  /** Mapa slug → visible tal cual viene de Supabase. */
  visibility: VisibilityMap;
  /** True mientras se carga el estado inicial. */
  loading: boolean;
  /** Mensaje de error si la carga/escritura falló (o null). */
  error: string | null;
  /** ¿La sesión de este browser está logueada como profesor? */
  isAdmin: boolean;
  /** ¿El estudiante puede ver este tema? El profesor siempre ve todo. */
  canSee: (slug: string) => boolean;
  /** Intenta loguear. Devuelve true si las credenciales son correctas. */
  login: (user: string, password: string) => boolean;
  logout: () => void;
  /** Cambia la visibilidad de un tema (solo profesor). */
  toggleTopic: (slug: string, visible: boolean) => Promise<void>;
  /** Vuelve a leer el estado desde Supabase. */
  refresh: () => void;
};

const VisibilityContext = createContext<VisibilityContextValue | null>(null);

export function VisibilityProvider({ children }: { children: ReactNode }) {
  const [visibility, setVisibility] = useState<VisibilityMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchVisibility()
      .then((map) => setVisibility(map))
      .catch((e: unknown) => {
        // Ante un fallo, por seguridad dejamos todo oculto (no filtramos temas
        // futuros). Mostramos el error para que el profesor lo note.
        setVisibility({});
        setError(e instanceof Error ? e.message : "Error desconocido");
      })
      .finally(() => setLoading(false));
  }, []);

  // Carga inicial + lectura del flag de admin (solo en cliente).
  useEffect(() => {
    setIsAdmin(readAdminFlag());
    load();
  }, [load]);

  const canSee = useCallback(
    (slug: string) => isAdmin || visibility[slug] === true,
    [isAdmin, visibility],
  );

  const login = useCallback((user: string, password: string) => {
    if (!checkCredentials(user, password)) return false;
    writeAdminFlag(true);
    setIsAdmin(true);
    return true;
  }, []);

  const logout = useCallback(() => {
    writeAdminFlag(false);
    setIsAdmin(false);
  }, []);

  const toggleTopic = useCallback(
    async (slug: string, visible: boolean) => {
      // Optimista: actualizamos la UI y revertimos si el servidor rechaza.
      const previous = visibility[slug];
      setVisibility((v) => ({ ...v, [slug]: visible }));
      setError(null);
      try {
        await setVisibilityRemote(slug, visible, ADMIN_PASSWORD);
      } catch (e: unknown) {
        setVisibility((v) => ({ ...v, [slug]: previous ?? false }));
        setError(e instanceof Error ? e.message : "Error al guardar");
        throw e;
      }
    },
    [visibility],
  );

  const value = useMemo<VisibilityContextValue>(
    () => ({
      visibility,
      loading,
      error,
      isAdmin,
      canSee,
      login,
      logout,
      toggleTopic,
      refresh: load,
    }),
    [visibility, loading, error, isAdmin, canSee, login, logout, toggleTopic, load],
  );

  return (
    <VisibilityContext.Provider value={value}>
      {children}
    </VisibilityContext.Provider>
  );
}

export function useVisibility(): VisibilityContextValue {
  const ctx = useContext(VisibilityContext);
  if (!ctx) {
    throw new Error("useVisibility debe usarse dentro de <VisibilityProvider>");
  }
  return ctx;
}
