"use client";

import { useState, type ReactNode } from "react";
import { ReadingPane } from "@/components/ejercicios/ExerciseLesson";

export type DocTab = { id: string; label: string; icon?: ReactNode; content: ReactNode };

/**
 * Shell de documentación de una librería: header con icono/título/subtítulo y
 * una barra de pestañas; cada pestaña es contenido de lectura (texto + código).
 */
export function LibraryDoc({
  icon,
  title,
  subtitle,
  tabs,
}: {
  icon: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
  tabs: DocTab[];
}) {
  const [active, setActive] = useState(tabs[0]?.id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0 border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Librerías de utilidad
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {title}
            </h1>
            <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={[
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                active === t.id
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
              ].join(" ")}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="min-h-0 flex-1">
        <ReadingPane>{current?.content}</ReadingPane>
      </div>
    </div>
  );
}

/** Bloque de código reutilizable (Python por defecto). */
export function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 font-mono text-[12px] leading-relaxed text-zinc-100">
      <code>{children}</code>
    </pre>
  );
}

/** Marco tipo "captura" para los mini-mockups de los componentes. */
export function Mock({ children }: { children: ReactNode }) {
  return (
    <div className="my-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
        Se ve así
      </p>
      {children}
    </div>
  );
}
