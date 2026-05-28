"use client";

import { motion, useReducedMotion } from "framer-motion";
import { transitions } from "@/lib/transitions";
import { cellKey, type Array2DState } from "@/lib/algorithms/arrays/types";

type Props = {
  state: Array2DState;
};

/**
 * Visualización de una matriz 2D con cursor de celda activa y
 * coloreo de celdas ya visitadas. Usada para el recorrido row-major.
 */
export function Grid2D({ state }: Props) {
  const reduced = useReducedMotion();
  const { rows, cols, values, cursor, visited } = state;
  const visitedSet = new Set(visited);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <span>
          matriz{" "}
          <span className="font-mono text-zinc-700 dark:text-zinc-300">
            {rows} × {cols}
          </span>
        </span>
        {cursor && (
          <span className="font-mono text-amber-600 dark:text-amber-400">
            [{cursor.row}][{cursor.col}]
          </span>
        )}
        <span className="font-mono">
          visitadas: {visited.length} / {rows * cols}
        </span>
      </div>

      <div className="inline-block rounded-lg border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${cols}, 3.5rem)`,
          }}
        >
          {Array.from({ length: rows }).map((_, i) =>
            Array.from({ length: cols }).map((_, j) => {
              const isCursor = cursor?.row === i && cursor.col === j;
              const isVisited = visitedSet.has(cellKey(i, j));
              const value = values?.[i]?.[j];
              return (
                <motion.div
                  key={`${i}-${j}`}
                  layout={!reduced}
                  animate={{
                    scale: isCursor ? 1.08 : 1,
                  }}
                  transition={transitions.spring}
                  className={[
                    "relative flex h-14 w-14 items-center justify-center rounded-md border font-mono text-base font-semibold transition-colors",
                    isCursor
                      ? "border-amber-400 bg-amber-100 text-amber-900 ring-2 ring-amber-400/30 dark:border-amber-500/60 dark:bg-amber-950/40 dark:text-amber-100"
                      : isVisited
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/40 dark:bg-emerald-950/30 dark:text-emerald-300"
                        : "border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400",
                  ].join(" ")}
                >
                  {value !== undefined ? value : ""}
                  <span className="absolute -top-1 -left-1 hidden font-mono text-[10px] text-zinc-400 sm:block">
                    {i},{j}
                  </span>
                </motion.div>
              );
            }),
          )}
        </div>
      </div>

      <p className="text-xs text-zinc-500">
        Recorrido <span className="font-mono">row-major</span>: para cada fila
        recorro todas sus columnas antes de pasar a la siguiente.
      </p>
    </div>
  );
}
