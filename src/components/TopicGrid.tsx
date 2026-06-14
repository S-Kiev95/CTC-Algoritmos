"use client";

import Link from "next/link";
import { ArrowRight, EyeOff } from "lucide-react";
import { TOPICS } from "@/lib/topics";
import { useVisibility } from "./VisibilityProvider";

/**
 * Grilla de temas de la página de inicio. Filtra según la visibilidad:
 * los estudiantes solo ven los temas habilitados; el profesor ve todos, con
 * los ocultos marcados visualmente.
 */
export function TopicGrid() {
  const { isAdmin, canSee, loading, visibility } = useVisibility();

  const topics = isAdmin ? TOPICS : TOPICS.filter((t) => canSee(t.slug));

  if (!isAdmin && loading) {
    return <p className="text-sm text-zinc-400">Cargando temas…</p>;
  }

  if (!isAdmin && topics.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Todavía no hay temas habilitados. Aparecerán acá a medida que avancemos
        en el curso.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {topics.map((topic) => {
        const Icon = topic.icon;
        const hidden = isAdmin && visibility[topic.slug] !== true;
        return (
          <li key={topic.slug}>
            <Link
              href={`/temas/${topic.slug}`}
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
                {topic.title}
              </h3>
              <p className="mt-0.5 text-sm text-zinc-500">{topic.short}</p>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                {topic.description}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
