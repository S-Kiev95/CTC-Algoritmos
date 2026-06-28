"use client";

import { motion, useReducedMotion } from "framer-motion";
import { transitions } from "@/lib/transitions";
import type { MmNode } from "@/lib/minimax/tateti";

const moveName = (m: number) => `${Math.floor(m / 3)},${m % 3}`;

/**
 * Árbol de decisión de Minimax. Las capas alternan MAX (X, celeste, busca el
 * máximo) y MIN (O, rosa, busca el mínimo). Cada nodo muestra su valor cuando se
 * calcula; el nodo actual lleva un anillo y el camino óptimo va en dorado.
 */
export function MinimaxTree({
  tree,
  revealed,
  current,
  values,
}: {
  tree: MmNode[];
  revealed: number;
  current: number;
  values: Record<number, number>;
}) {
  const reduced = useReducedMotion();
  const shown = tree.filter((n) => n.id < revealed);
  const maxX = Math.max(1, ...tree.map((n) => n.x));
  const maxDepth = Math.max(1, ...tree.map((n) => n.depth));
  const W = 520;
  const H = 300;
  const PAD = 26;
  const tx = (x: number) => PAD + (maxX === 0 ? W / 2 : (x / maxX) * (W - 2 * PAD));
  const ty = (d: number) => PAD + (d / maxDepth) * (H - 2 * PAD);
  const byId = new Map(tree.map((n) => [n.id, n]));

  const fmt = (v: number) => (v > 0 ? "+1" : v < 0 ? "−1" : "0");

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* Aristas + etiqueta de jugada */}
        {shown.map((n) => {
          if (n.parent === null) return null;
          const p = byId.get(n.parent)!;
          const onBest = n.onBest && p.onBest;
          return (
            <g key={`e${n.id}`}>
              <line
                x1={tx(p.x)}
                y1={ty(p.depth)}
                x2={tx(n.x)}
                y2={ty(n.depth)}
                className={onBest ? "stroke-amber-400" : "stroke-zinc-300 dark:stroke-zinc-700"}
                strokeWidth={onBest ? 2.5 : 1.2}
              />
              {n.move !== null && (
                <text
                  x={(tx(p.x) + tx(n.x)) / 2}
                  y={(ty(p.depth) + ty(n.depth)) / 2 - 2}
                  textAnchor="middle"
                  className="fill-zinc-400 text-[8px]"
                >
                  {moveName(n.move)}
                </text>
              )}
            </g>
          );
        })}
        {/* Nodos */}
        {shown.map((n) => {
          const isMax = n.kind === "max";
          const hasVal = n.id in values;
          const isCurrent = n.id === current;
          return (
            <g key={`n${n.id}`}>
              {isCurrent && (
                <motion.circle
                  cx={tx(n.x)}
                  cy={ty(n.depth)}
                  r={15}
                  fill="none"
                  className="stroke-amber-500"
                  strokeWidth={2}
                  initial={reduced ? false : { scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={transitions.snappy}
                />
              )}
              <circle
                cx={tx(n.x)}
                cy={ty(n.depth)}
                r={11}
                className={[
                  isMax ? "fill-sky-500" : "fill-rose-500",
                  n.onBest ? "stroke-amber-400" : "",
                ].join(" ")}
                strokeWidth={n.onBest ? 2.5 : 0}
              />
              <text
                x={tx(n.x)}
                y={ty(n.depth) + 3}
                textAnchor="middle"
                className="fill-white text-[9px] font-bold"
              >
                {hasVal ? fmt(values[n.id]) : "?"}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] text-zinc-400">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-500" /> MAX (X) — mayor
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500" /> MIN (O) — menor
        </span>
        <span>dorado = mejor jugada · +1 gana X, −1 gana O, 0 empate</span>
      </div>
    </div>
  );
}
