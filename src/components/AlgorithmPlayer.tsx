"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { useStepPlayer } from "@/hooks/useStepPlayer";
import { CodePanel } from "./CodePanel";
import { PlayerControls } from "./PlayerControls";
import { WatchPanel } from "./WatchPanel";
import type { Step } from "@/lib/types";

type Props<TState> = {
  /** Código que se muestra en el panel derecho. */
  code: string;
  /** Lista de pasos precomputados. */
  steps: Step<TState>[];
  /** Render del estado actual: tu visualización del algoritmo. */
  renderVisualization: (step: Step<TState>, index: number) => ReactNode;
  /** Título opcional encima de la animación. */
  title?: string;
  /**
   * Disposición de los paneles:
   * - "side-by-side" (default): visualización a la izquierda, código a la derecha.
   * - "stacked": visualización arriba (ancho completo), código + watch abajo
   *   en grilla horizontal. Útil para visualizaciones anchas como grafos.
   */
  layout?: "side-by-side" | "stacked";
};

/**
 * Layout reutilizable para cualquier algoritmo. Solo necesitás darle
 * code + steps + cómo renderizar el estado. Opcionalmente podés cambiar
 * la disposición visual con `layout`.
 */
export function AlgorithmPlayer<TState>({
  code,
  steps,
  renderVisualization,
  title,
  layout = "side-by-side",
}: Props<TState>) {
  const player = useStepPlayer(steps.length);
  const current = steps[player.index];
  const activeLine = current?.line ?? 0;
  const isStacked = layout === "stacked";

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      if (e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        player.next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        player.prev();
      } else if (e.key === " ") {
        e.preventDefault();
        player.togglePlay();
      } else if (e.key === "r" || e.key === "R") {
        player.reset();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [player]);

  const visualization = useMemo(
    () => (current ? renderVisualization(current, player.index) : null),
    [current, player.index, renderVisualization],
  );

  const hasWatch = current?.watch && current.watch.length > 0;

  return (
    <div className="grid h-full grid-rows-[1fr_auto]">
      <div
        className={
          isStacked
            ? "grid min-h-0 grid-rows-[1fr_minmax(220px,38%)]"
            : "grid min-h-0 grid-cols-1 lg:grid-cols-[1fr_minmax(360px,42%)]"
        }
      >
        {/* Sección de visualización */}
        <section
          className={[
            "flex min-h-0 flex-col",
            isStacked
              ? "border-b border-zinc-200 dark:border-zinc-800"
              : "border-b border-zinc-200 lg:border-b-0 lg:border-r dark:border-zinc-800",
          ].join(" ")}
        >
          {title && (
            <div className="border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {title}
              </h2>
              {current?.note && (
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  {current.note}
                </p>
              )}
            </div>
          )}
          <div
            className={[
              "flex min-h-0 flex-1",
              isStacked
                ? "overflow-hidden p-3"
                : "justify-center overflow-auto p-6",
            ].join(" ")}
          >
            {visualization ?? (
              <p className="text-sm text-zinc-500">Sin pasos cargados.</p>
            )}
          </div>
        </section>

        {/* Sección de código + watch */}
        <section
          className={[
            "min-h-0 bg-zinc-950 text-zinc-100",
            isStacked && hasWatch
              ? "grid grid-cols-1 lg:grid-cols-[1fr_minmax(260px,38%)]"
              : "flex flex-col",
          ].join(" ")}
        >
          <div
            className={[
              "flex min-h-0 flex-col",
              !isStacked && "flex-1",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <CodePanel code={code} activeLine={activeLine} />
          </div>
          {hasWatch && (
            <div
              className={[
                "overflow-auto border-zinc-800",
                isStacked
                  ? "border-t lg:border-l lg:border-t-0"
                  : "max-h-[40%] border-t",
              ].join(" ")}
            >
              <WatchPanel entries={current!.watch!} />
            </div>
          )}
        </section>
      </div>

      <PlayerControls player={player} />
    </div>
  );
}
