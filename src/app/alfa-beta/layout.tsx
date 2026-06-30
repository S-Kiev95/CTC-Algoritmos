"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useVisibility } from "@/components/VisibilityProvider";

/** Guarda de la sección Poda alfa-beta (slug `alfa-beta`). */
export default function AlfaBetaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { canSee, loading, isAdmin } = useVisibility();

  if (!isAdmin && loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-zinc-400">Cargando…</p>
      </div>
    );
  }

  if (!canSee("alfa-beta")) {
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
            Esta sección se habilita cuando la vemos en clase.
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
