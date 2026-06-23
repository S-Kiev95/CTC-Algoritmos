"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { useVisibility } from "@/components/VisibilityProvider";
import { MAPS_SECTION_SLUG, getCity } from "@/lib/mapas/cities";

/** Guarda de la sección Mapas: gatea por `mapas` y por `mapa:<ciudad>`. */
export default function MapasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { canSee, loading, isAdmin } = useVisibility();

  const slug = pathname.split("/").filter(Boolean)[1];
  const city = slug ? getCity(slug) : undefined;
  const allowed =
    canSee(MAPS_SECTION_SLUG) && (!city || canSee(city.visibilitySlug));

  if (!isAdmin && loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-zinc-400">Cargando…</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            No disponible todavía
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Este mapa se habilita cuando lo vemos en clase.
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
