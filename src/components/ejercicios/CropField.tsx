"use client";

import { motion, useReducedMotion } from "framer-motion";
import { transitions } from "@/lib/transitions";
import type { CropState } from "@/lib/ejercicios/cropPlague";

const CELL = 32; // px

/**
 * Campo de cultivo: grilla de plantas (verde sanas, rojo infectadas). En la
 * fase de recorrido resalta la fila actual; en la fase de hull dibuja, encima
 * de la grilla, el polígono del convex hull de las infectadas + el área.
 */
export function CropField({ state }: { state: CropState }) {
  const reduced = useReducedMotion();
  const { rows, cols, infected, scanRow, found, graham, phase, area } = state;

  const width = cols * CELL;
  const height = rows * CELL;
  const center = (cell: number) => ({
    cx: (cell % cols) * CELL + CELL / 2,
    cy: Math.floor(cell / cols) * CELL + CELL / 2,
  });

  // Polígono del casco (coords de celda → píxeles).
  const g = graham;
  const hullStr =
    g && g.hull.length >= 2
      ? g.hull
          .map((i) => {
            const p = g.points[i];
            return `${p.x * CELL + CELL / 2},${p.y * CELL + CELL / 2}`;
          })
          .join(" ")
      : "";

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3">
      <div className="flex w-full items-center justify-between text-xs text-zinc-500">
        <span>
          Infectadas:{" "}
          <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">
            {found.length}
          </span>
        </span>
        {phase === "done" && (
          <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            Área afectada ≈ {(area ?? 0).toFixed(1)} celdas²
          </span>
        )}
      </div>

      <div className="relative" style={{ width, height }}>
        {/* Grilla de plantas */}
        <div
          className="grid overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800"
          style={{ gridTemplateColumns: `repeat(${cols}, ${CELL}px)` }}
        >
          {Array.from({ length: rows * cols }).map((_, i) => {
            const r = Math.floor(i / cols);
            const isInfected = infected[i];
            const inRow = phase === "scan" && scanRow === r;
            return (
              <div
                key={i}
                className={[
                  "flex items-center justify-center border-[0.5px] border-zinc-100 dark:border-zinc-900",
                  inRow ? "bg-amber-200/50 dark:bg-amber-500/20" : "",
                ].join(" ")}
                style={{ width: CELL, height: CELL }}
              >
                <span
                  className={[
                    "rounded-full",
                    isInfected
                      ? "bg-rose-500"
                      : "bg-emerald-500/70 dark:bg-emerald-500/50",
                  ].join(" ")}
                  style={{
                    width: isInfected ? 12 : 7,
                    height: isInfected ? 12 : 7,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Overlay del convex hull */}
        {g && g.hull.length >= 2 && (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="pointer-events-none absolute inset-0"
            width={width}
            height={height}
          >
            {g.closed ? (
              <motion.polygon
                points={hullStr}
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={transitions.smooth}
                className="fill-amber-400/25 stroke-amber-500"
                strokeWidth={2.5}
                strokeLinejoin="round"
              />
            ) : (
              <polyline
                points={hullStr}
                fill="none"
                className="stroke-amber-500"
                strokeWidth={2.5}
                strokeLinejoin="round"
              />
            )}
            {/* candidato */}
            {!g.closed && g.current != null && (
              <circle
                {...center(found[g.current] ?? 0)}
                r={7}
                className="fill-none stroke-amber-500"
                strokeWidth={2}
              />
            )}
          </svg>
        )}
      </div>

      <p className="text-center text-xs text-zinc-400">
        Verde: planta sana · rojo: infectada · polígono: zona afectada (convex hull)
      </p>
    </div>
  );
}
