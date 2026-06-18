"use client";

import { motion, useReducedMotion } from "framer-motion";
import { transitions } from "@/lib/transitions";
import type { MazeState } from "@/lib/ejercicios/mazeKruskal";

const CELL = 48; // px

function wallKey(a: number, b: number) {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

/**
 * Tablero del laberinto de Kruskal. Cada celda se pinta según su grupo
 * (Union-Find): mismo color = mismo grupo. Los muros internos son los bordes
 * de las celdas; cuando se "tira" un muro, el borde desaparece (pasaje). El
 * muro que se evalúa en el paso actual resalta sus dos celdas.
 */
export function MazeBoard({ state }: { state: MazeState }) {
  const reduced = useReducedMotion();
  const { rows, cols, comp, carved, current, decision, groups, done } = state;

  const carvedSet = new Set(carved.map(([a, b]) => wallKey(a, b)));

  // Color por grupo: hue estable por root (ángulo áureo para separar matices).
  const hueOf = (root: number) => (root * 137.508) % 360;

  const ringClass =
    decision === "carve"
      ? "ring-emerald-500"
      : decision === "keep"
        ? "ring-rose-500"
        : "ring-amber-500";

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <div className="flex w-full items-center justify-between text-xs text-zinc-500">
        <span>
          Grupos:{" "}
          <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
            {groups}
          </span>
        </span>
        {done && (
          <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            ¡Laberinto perfecto!
          </span>
        )}
      </div>

      <div
        className={[
          "grid border-2",
          done
            ? "border-emerald-400 dark:border-emerald-500/60"
            : "border-zinc-400 dark:border-zinc-500",
        ].join(" ")}
        style={{ gridTemplateColumns: `repeat(${cols}, ${CELL}px)` }}
      >
        {Array.from({ length: rows * cols }).map((_, i) => {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const rightWall = c < cols - 1 && !carvedSet.has(wallKey(i, i + 1));
          const bottomWall = r < rows - 1 && !carvedSet.has(wallKey(i, i + cols));
          const isCurrent = !!current && (current.a === i || current.b === i);
          const hue = hueOf(comp[i]);

          return (
            <motion.div
              key={i}
              animate={{
                backgroundColor: done
                  ? "rgba(16,185,129,0.12)"
                  : `hsla(${hue}, 65%, 65%, 0.45)`,
              }}
              transition={reduced ? { duration: 0 } : transitions.smooth}
              className={[
                "relative",
                rightWall
                  ? "border-r-2 border-r-zinc-400 dark:border-r-zinc-500"
                  : "border-r-2 border-r-transparent",
                bottomWall
                  ? "border-b-2 border-b-zinc-400 dark:border-b-zinc-500"
                  : "border-b-2 border-b-transparent",
              ].join(" ")}
              style={{ width: CELL, height: CELL }}
            >
              {isCurrent && (
                <motion.div
                  initial={false}
                  animate={{ scale: 1 }}
                  className={[
                    "absolute inset-1 rounded-sm ring-2",
                    ringClass,
                  ].join(" ")}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      <p className="text-center text-xs text-zinc-400">
        Mismo color = mismo grupo. Al unir dos grupos se abre el paso entre sus
        celdas.
      </p>
    </div>
  );
}
