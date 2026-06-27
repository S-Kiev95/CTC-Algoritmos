"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Panel, PanelGroup } from "react-resizable-panels";
import { useStepPlayer } from "@/hooks/useStepPlayer";
import { playSound } from "@/lib/sound";
import { CodePanel } from "./CodePanel";
import { PlayerControls } from "./PlayerControls";
import { ResizeHandle } from "./ResizeHandle";
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
 * code + steps + cómo renderizar el estado.
 *
 * Los paneles son **redimensionables** arrastrando los divisores. El
 * tamaño preferido se persiste en localStorage por cada disposición
 * mediante `autoSaveId` de react-resizable-panels.
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

  // Efectos de sonido: un sonido al avanzar a un paso nuevo (success al llegar
  // al final). No suena al montar ni al retroceder/reiniciar.
  const prevIndexRef = useRef(player.index);
  useEffect(() => {
    const i = player.index;
    const prev = prevIndexRef.current;
    if (i > prev) {
      if (player.isLast) playSound("success");
      else playSound(steps[i]?.sound ?? "tick");
    }
    prevIndexRef.current = i;
  }, [player.index, player.isLast, steps]);
  const isStacked = layout === "stacked";
  const isLarge = useIsLargeScreen();

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

  const hasWatch = !!current?.watch && current.watch.length > 0;

  // Dirección del split principal:
  // - stacked: siempre vertical (vis arriba, código abajo)
  // - side-by-side en pantalla grande: horizontal
  // - side-by-side en pantalla chica: caemos a vertical para que no quede
  //   apretado.
  const mainDirection: "horizontal" | "vertical" =
    isStacked || !isLarge ? "vertical" : "horizontal";

  // En el contenedor de código, si hay watch:
  // - stacked + pantalla grande: split horizontal (código | watch)
  // - resto: split vertical (código encima de watch)
  const codeDirection: "horizontal" | "vertical" =
    isStacked && isLarge ? "horizontal" : "vertical";

  const visualizationSection = (
    <section className="flex h-full min-h-0 flex-col">
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
          // items-start evita que el hijo se estire a la altura del panel
          // (default align-items: stretch). Sin esto, el contenido interno
          // del hijo se corta y el scroll del padre nunca se activa.
          isStacked
            ? "items-start overflow-hidden p-3"
            : "items-start justify-center overflow-auto p-6",
        ].join(" ")}
      >
        {visualization ?? (
          <p className="text-sm text-zinc-500">Sin pasos cargados.</p>
        )}
      </div>
    </section>
  );

  const codeSection = (
    <div className="flex h-full min-h-0 flex-col bg-zinc-950 text-zinc-100">
      {hasWatch ? (
        <PanelGroup
          direction={codeDirection}
          autoSaveId={`algoplayer-code-${codeDirection}`}
          className="flex-1"
        >
          <Panel defaultSize={60} minSize={25} className="flex min-h-0 flex-col">
            <CodePanel code={code} activeLine={activeLine} />
          </Panel>
          <ResizeHandle direction={codeDirection} variant="onCode" />
          <Panel defaultSize={40} minSize={15} className="min-h-0 overflow-auto">
            <WatchPanel entries={current!.watch!} />
          </Panel>
        </PanelGroup>
      ) : (
        <CodePanel code={code} activeLine={activeLine} />
      )}
    </div>
  );

  return (
    <div className="grid h-full grid-rows-[1fr_auto]">
      <PanelGroup
        direction={mainDirection}
        autoSaveId={`algoplayer-main-${layout}-${mainDirection}`}
        className="min-h-0"
      >
        <Panel
          defaultSize={isStacked ? 72 : 58}
          minSize={25}
          className="min-h-0"
        >
          {visualizationSection}
        </Panel>
        <ResizeHandle direction={mainDirection} />
        <Panel defaultSize={isStacked ? 28 : 42} minSize={20} className="min-h-0">
          {codeSection}
        </Panel>
      </PanelGroup>

      <PlayerControls player={player} />
    </div>
  );
}

/**
 * Hook para detectar pantalla ≥ lg (1024px). Sirve para decidir si el
 * split principal va horizontal o vertical. Default `true` para que el
 * HTML estático del export pre-renderice el caso desktop.
 */
function useIsLargeScreen(): boolean {
  const [isLarge, setIsLarge] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsLarge(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isLarge;
}
