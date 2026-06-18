"use client";

import Link from "next/link";
import { ArrowRight, Clock, EyeOff } from "lucide-react";
import { EXERCISES } from "@/lib/ejercicios/exercises";
import { useVisibility } from "@/components/VisibilityProvider";

export default function EjerciciosLanding() {
  const { isAdmin, canSee, visibility } = useVisibility();

  const visibles = isAdmin
    ? EXERCISES
    : EXERCISES.filter((e) => canSee(e.visibilitySlug));

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-5xl px-8 py-10">
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Práctica
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Ejercicios prácticos
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
            Problemas clásicos para resolver. Cada uno trae el enunciado y pistas;
            la solución explicada y su animación se habilitan cuando lo trabajamos
            en clase.
          </p>
        </header>

        {visibles.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Todavía no hay ejercicios habilitados.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {visibles.map((ex) => {
              const Icon = ex.icon;
              const hidden = isAdmin && visibility[ex.visibilitySlug] !== true;

              if (!ex.ready) {
                return (
                  <li key={ex.slug}>
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
                        {ex.title}
                      </h3>
                      <p className="mt-0.5 text-sm text-zinc-400">{ex.short}</p>
                    </div>
                  </li>
                );
              }

              return (
                <li key={ex.slug}>
                  <Link
                    href={`/ejercicios/${ex.slug}`}
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
                      {ex.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-zinc-500">{ex.short}</p>
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
