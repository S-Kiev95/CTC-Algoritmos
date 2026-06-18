"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Flag, MapPin } from "lucide-react";
import { transitions } from "@/lib/transitions";
import type { CellMark, PathState } from "@/lib/pathfinding/types";

const CELL = 40;

function wallKey(a: number, b: number) {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

const MARK_BG: Record<CellMark, string> = {
  visitedA: "bg-sky-200 dark:bg-sky-900/50",
  frontierA: "bg-amber-200 dark:bg-amber-900/40",
  visitedB: "bg-violet-200 dark:bg-violet-900/50",
  frontierB: "bg-fuchsia-200 dark:bg-fuchsia-900/40",
  current: "bg-amber-300 dark:bg-amber-700/60",
  path: "bg-yellow-300 dark:bg-yellow-500/60",
  meet: "bg-emerald-300 dark:bg-emerald-600/60",
};

/**
 * Tablero de recorrido: dibuja el laberinto (muros desde `carved`) y pinta cada
 * celda según su estado en la búsqueda. Inicio y meta tienen icono propio.
 * Sirve para Dijkstra, bidireccional y A* (comparten PathState).
 */
export function PathBoard({ state }: { state: PathState }) {
  const reduced = useReducedMotion();
  const { rows, cols, carved, start, goal, marks, explored, found, pathLen } =
    state;
  const carvedSet = new Set(carved.map(([a, b]) => wallKey(a, b)));

  const cellBg = (i: number): string => {
    if (i === start) return "bg-emerald-400 dark:bg-emerald-500";
    if (i === goal) return "bg-rose-400 dark:bg-rose-500";
    const mk = marks[i];
    return mk ? MARK_BG[mk] : "bg-white dark:bg-zinc-900";
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <div className="flex w-full items-center justify-between text-xs text-zinc-500">
        <span>
          Celdas exploradas:{" "}
          <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
            {explored}
          </span>
        </span>
        {found && pathLen != null && (
          <span className="rounded-md bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300">
            Camino: {pathLen} pasos
          </span>
        )}
      </div>

      <div
        className={[
          "grid border-2",
          found
            ? "border-yellow-400 dark:border-yellow-500/60"
            : "border-zinc-400 dark:border-zinc-500",
        ].join(" ")}
        style={{ gridTemplateColumns: `repeat(${cols}, ${CELL}px)` }}
      >
        {Array.from({ length: rows * cols }).map((_, i) => {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const rightWall = c < cols - 1 && !carvedSet.has(wallKey(i, i + 1));
          const bottomWall = r < rows - 1 && !carvedSet.has(wallKey(i, i + cols));
          const isCurrent = marks[i] === "current" || marks[i] === "meet";

          return (
            <div
              key={i}
              className={[
                "relative flex items-center justify-center transition-colors duration-200",
                cellBg(i),
                rightWall
                  ? "border-r-2 border-r-zinc-400 dark:border-r-zinc-500"
                  : "border-r-2 border-r-transparent",
                bottomWall
                  ? "border-b-2 border-b-zinc-400 dark:border-b-zinc-500"
                  : "border-b-2 border-b-transparent",
              ].join(" ")}
              style={{ width: CELL, height: CELL }}
            >
              {i === start && (
                <MapPin className="h-4 w-4 text-white" strokeWidth={2.5} />
              )}
              {i === goal && (
                <Flag className="h-4 w-4 text-white" strokeWidth={2.5} />
              )}
              {isCurrent && i !== start && i !== goal && (
                <motion.div
                  initial={false}
                  animate={{ scale: reduced ? 1 : [1, 1.15, 1] }}
                  transition={reduced ? { duration: 0 } : transitions.snappy}
                  className="absolute inset-1 rounded-sm ring-2 ring-amber-500"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-zinc-400">
        <Legend className="bg-emerald-400" label="inicio" />
        <Legend className="bg-rose-400" label="meta" />
        <Legend className="bg-sky-200 dark:bg-sky-900/50" label="visitado" />
        <Legend className="bg-amber-200 dark:bg-amber-900/40" label="frontera" />
        <Legend className="bg-yellow-300 dark:bg-yellow-500/60" label="camino" />
      </div>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={["inline-block h-2.5 w-2.5 rounded-sm", className].join(" ")} />
      {label}
    </span>
  );
}
