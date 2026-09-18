"use client";

import { motion, useReducedMotion } from "framer-motion";
import { transitions } from "@/lib/transitions";
import type { PrimState } from "@/lib/ejercicios/mazePrim";

const CELL = 48; // px

function wallKey(a: number, b: number) {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

const COLOR = {
  inside: "rgba(16,185,129,0.35)", // ya es parte del laberinto
  frontier: "rgba(245,158,11,0.40)", // toca el laberinto, todavía afuera
  outside: "rgba(113,113,122,0.12)", // todavía no alcanzada
  done: "rgba(16,185,129,0.12)",
};

/**
 * Tablero del laberinto de Prim. En vez de colores por grupo (como Kruskal),
 * muestra cómo crece un único árbol: verde = adentro, ámbar = frontera,
 * gris = todavía sin alcanzar. El muro evaluado resalta sus dos celdas.
 */
export function PrimMazeBoard({ state }: { state: PrimState }) {
  const reduced = useReducedMotion();
  const { rows, cols, inMaze, frontier, carved, current, decision, pending, start, done } =
    state;

  const carvedSet = new Set(carved.map(([a, b]) => wallKey(a, b)));
  const frontierSet = new Set(frontier);
  const inside = inMaze.filter(Boolean).length;

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
          Adentro:{" "}
          <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
            {inside}/{rows * cols}
          </span>
        </span>
        <span>
          Muros en la frontera:{" "}
          <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
            {pending}
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
          const fill = done
            ? COLOR.done
            : inMaze[i]
              ? COLOR.inside
              : frontierSet.has(i)
                ? COLOR.frontier
                : COLOR.outside;

          return (
            <motion.div
              key={i}
              animate={{ backgroundColor: fill }}
              transition={reduced ? { duration: 0 } : transitions.smooth}
              className={[
                "relative flex items-center justify-center",
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
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                  inicio
                </span>
              )}
              {isCurrent && (
                <motion.div
                  initial={false}
                  animate={{ scale: 1 }}
                  className={["absolute inset-1 rounded-sm ring-2", ringClass].join(" ")}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-zinc-400">
        <Legend color={COLOR.inside} label="adentro" />
        <Legend color={COLOR.frontier} label="frontera" />
        <Legend color={COLOR.outside} label="sin alcanzar" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
