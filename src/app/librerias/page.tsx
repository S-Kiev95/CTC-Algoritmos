"use client";

import Link from "next/link";
import { ArrowRight, Clock, EyeOff } from "lucide-react";
import { LIBRARIES } from "@/lib/librerias/libraries";
import { useVisibility } from "@/components/VisibilityProvider";

export default function LibreriasLanding() {
  const { isAdmin, canSee, visibility } = useVisibility();
  const visibles = isAdmin
    ? LIBRARIES
    : LIBRARIES.filter((l) => canSee(l.visibilitySlug));

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-5xl px-8 py-10">
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Herramientas
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Librerías de utilidad
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
            Librerías de Python que vas a usar para tus proyectos: qué son, cómo
            se instalan y sus componentes principales, con ejemplos de código.
          </p>
        </header>

        {visibles.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Todavía no hay librerías habilitadas.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {visibles.map((l) => {
              const Icon = l.icon;
              const hidden = isAdmin && visibility[l.visibilitySlug] !== true;
              if (!l.ready) {
                return (
                  <li key={l.slug}>
                    <div className="flex h-full cursor-not-allowed flex-col rounded-xl border border-dashed border-zinc-200 bg-zinc-50/60 p-5 opacity-70 dark:border-zinc-800 dark:bg-zinc-900/40">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-medium text-zinc-400">
                          <Clock className="h-3.5 w-3.5" />
                          Pronto
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-zinc-500 dark:text-zinc-400">
                        {l.title}
                      </h3>
                      <p className="mt-0.5 text-sm text-zinc-400">{l.short}</p>
                    </div>
                  </li>
                );
              }
              return (
                <li key={l.slug}>
                  <Link
                    href={`/librerias/${l.slug}`}
                    className={[
                      "group flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700",
                      hidden ? "opacity-50" : "",
                    ].join(" ")}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      {hidden ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-zinc-400">
                          <EyeOff className="h-3.5 w-3.5" />
                          Oculto
                        </span>
                      ) : (
                        <ArrowRight className="h-4 w-4 text-zinc-400 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {l.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-zinc-500">{l.short}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
