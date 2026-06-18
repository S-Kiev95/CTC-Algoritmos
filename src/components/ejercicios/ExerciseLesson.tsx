"use client";

import { useState, type ReactNode } from "react";
import { BookText, Eye, EyeOff, Lightbulb, Code2, Play } from "lucide-react";
import { ResizableTopicShell } from "@/components/ResizableTopicShell";
import { useVisibility } from "@/components/VisibilityProvider";
import type { Exercise } from "@/lib/ejercicios/exercises";

type TabId = "enunciado" | "pistas" | "solucion" | "animacion";

/**
 * Shell de una página de ejercicio. Tabs: Enunciado, Pistas, Solución y
 * (opcional) Animación. Las dos últimas solo se muestran si la solución está
 * habilitada (`canSee(exercise.solutionSlug)`); el profe/admin las ve siempre,
 * más un toggle para revelarlas a los estudiantes.
 */
export function ExerciseLesson({
  exercise,
  subtitle,
  enunciado,
  pistas,
  solucion,
  animacion,
}: {
  exercise: Exercise;
  subtitle: ReactNode;
  enunciado: ReactNode;
  pistas: ReactNode[];
  solucion: ReactNode;
  animacion?: () => ReactNode;
}) {
  const { isAdmin, canSee, visibility, toggleTopic } = useVisibility();
  const [tab, setTab] = useState<TabId>("enunciado");

  const Icon = exercise.icon;
  // ExerciseLesson se usa para ejercicios "problema" (con solución). Si faltara
  // el slug, derivamos uno por convención para no romper tipos.
  const solSlug = exercise.solutionSlug ?? `${exercise.visibilitySlug}:sol`;
  const showSolution = isAdmin || canSee(solSlug);
  const solutionVisible = visibility[solSlug] === true;

  const header = (
    <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Ejercicio práctico
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {exercise.title}
          </h1>
          <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
            {subtitle}
          </p>
        </div>
        {/* Toggle de solución (solo profe) */}
        {isAdmin && (
          <button
            onClick={() => void toggleTopic(solSlug, !solutionVisible)}
            className={[
              "flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
              solutionVisible
                ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700/50 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                : "border-zinc-300 text-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800",
            ].join(" ")}
            title="Mostrar/ocultar la solución a los estudiantes"
          >
            {solutionVisible ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
            Solución {solutionVisible ? "visible" : "oculta"}
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex flex-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
          <TabButton active={tab === "enunciado"} onClick={() => setTab("enunciado")} icon={<BookText className="h-3.5 w-3.5" />}>
            Enunciado
          </TabButton>
          <TabButton active={tab === "pistas"} onClick={() => setTab("pistas")} icon={<Lightbulb className="h-3.5 w-3.5" />}>
            Pistas
          </TabButton>
          {showSolution && (
            <TabButton active={tab === "solucion"} onClick={() => setTab("solucion")} icon={<Code2 className="h-3.5 w-3.5" />}>
              Solución
            </TabButton>
          )}
          {showSolution && animacion && (
            <TabButton active={tab === "animacion"} onClick={() => setTab("animacion")} icon={<Play className="h-3.5 w-3.5" />}>
              Animación
            </TabButton>
          )}
        </div>
      </div>
    </header>
  );

  // Si la solución está oculta y el usuario cae en una tab de solución, lo
  // mandamos al enunciado.
  const effectiveTab: TabId =
    !showSolution && (tab === "solucion" || tab === "animacion")
      ? "enunciado"
      : tab;

  return (
    <ResizableTopicShell header={header}>
      {effectiveTab === "enunciado" && <ReadingPane>{enunciado}</ReadingPane>}
      {effectiveTab === "pistas" && <PistasPane pistas={pistas} />}
      {effectiveTab === "solucion" && showSolution && (
        <ReadingPane>{solucion}</ReadingPane>
      )}
      {effectiveTab === "animacion" && showSolution && animacion && animacion()}
    </ResizableTopicShell>
  );
}

function ReadingPane({ children }: { children: ReactNode }) {
  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-3xl px-6 py-8 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 [&_code]:rounded [&_code]:bg-zinc-200/60 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12px] [&_code]:text-zinc-800 dark:[&_code]:bg-zinc-800 dark:[&_code]:text-zinc-200 [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-zinc-900 dark:[&_h2]:text-zinc-50 [&_p]:mb-3 [&_strong]:text-zinc-900 dark:[&_strong]:text-zinc-50">
        {children}
      </div>
    </div>
  );
}

/** Pistas reveladas de a una. */
function PistasPane({ pistas }: { pistas: ReactNode[] }) {
  const [revealed, setRevealed] = useState(0);

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          Intentá resolverlo solo primero. Si te trabás, revelá las pistas de a
          una.
        </p>
        <ol className="space-y-3">
          {pistas.map((pista, i) => (
            <li key={i}>
              {i < revealed ? (
                <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-[13px] leading-relaxed text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-100">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <span className="font-semibold">Pista {i + 1}:</span> {pista}
                  </div>
                </div>
              ) : i === revealed ? (
                <button
                  onClick={() => setRevealed((r) => r + 1)}
                  className="flex w-full items-center gap-2 rounded-lg border border-dashed border-zinc-300 px-3 py-2.5 text-sm text-zinc-500 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
                >
                  <Lightbulb className="h-4 w-4" />
                  Mostrar pista {i + 1}
                </button>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </div>
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
