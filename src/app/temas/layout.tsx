"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { useVisibility } from "@/components/VisibilityProvider";

/**
 * Guarda de acceso para todas las páginas de tema. Como la app es un export
 * estático, las páginas existen en disco y son accesibles por URL directa;
 * por eso el control de visibilidad debe hacerse en el cliente, acá.
 *
 * El profesor (logueado) ve siempre todo. El estudiante solo ve un tema si
 * está habilitado en Supabase; si no, ve un mensaje en lugar del contenido.
 */
export default function TemasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { canSee, loading, isAdmin } = useVisibility();

  // pathname tipo "/temas/pilas/" (trailingSlash) → slug = "pilas".
  const slug = pathname.split("/").filter(Boolean)[1] ?? "";

  // Mientras carga el estado, no mostramos el contenido a un estudiante (para
  // no filtrar un tema oculto por un instante). El profesor ve todo enseguida.
  if (!isAdmin && loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-zinc-400">Cargando…</p>
      </div>
    );
  }

  if (!canSee(slug)) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Tema no disponible todavía
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Este tema se habilita cuando lo vemos en clase. Volvé al inicio para
            ver los temas disponibles.
          </p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
