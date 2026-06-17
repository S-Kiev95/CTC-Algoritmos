"use client";

import { useState, type ReactNode } from "react";
import { BookOpen } from "lucide-react";
import { ResizableTopicShell } from "@/components/ResizableTopicShell";
import { Teoria } from "@/components/Teoria";
import type { ComponentProps } from "react";

type TeoriaProps = ComponentProps<typeof Teoria>;

export type LessonDemo = {
  id: string;
  label: string;
  icon: ReactNode;
  render: () => ReactNode;
};

/**
 * Shell reutilizable para una lección de la sección Python: header con icono,
 * título y subtítulo, una pestaña "Teoría" (material de lectura) y una o más
 * pestañas de demo animada. Evita repetir el mismo armado en cada página.
 */
export function PythonLesson({
  icon,
  title,
  subtitle,
  teoria,
  demos,
}: {
  icon: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
  teoria: TeoriaProps;
  demos: LessonDemo[];
}) {
  const [active, setActive] = useState<string>("teoria");

  const header = (
    <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Python · Fundamentos
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </h1>
          <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex flex-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
          <TabButton
            active={active === "teoria"}
            onClick={() => setActive("teoria")}
            icon={<BookOpen className="h-3.5 w-3.5" />}
          >
            Teoría
          </TabButton>
          {demos.map((demo) => (
            <TabButton
              key={demo.id}
              active={active === demo.id}
              onClick={() => setActive(demo.id)}
              icon={demo.icon}
            >
              {demo.label}
            </TabButton>
          ))}
        </div>
      </div>
    </header>
  );

  const activeDemo = demos.find((d) => d.id === active);

  return (
    <ResizableTopicShell header={header}>
      {active === "teoria" ? <Teoria {...teoria} /> : activeDemo?.render()}
    </ResizableTopicShell>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
      ].join(" ")}
    >
      {icon}
      {children}
    </button>
  );
}
