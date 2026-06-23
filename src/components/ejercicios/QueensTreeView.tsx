"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Crown } from "lucide-react";
import { transitions } from "@/lib/transitions";
import type { Queens4State, TreeNode } from "@/lib/ejercicios/reinas4";

const CELL = 40;

const NODE_FILL: Record<TreeNode["status"], string> = {
  root: "#71717a",
  deadend: "#ef4444",
  valid: "#a1a1aa",
  onpath: "#10b981",
  solution: "#10b981",
};

/**
 * Vista para el 4×4: a la izquierda el tablero coloreando las casillas según se
 * pueda (azul) o no (rojo) poner una reina dado lo ya colocado; a la derecha el
 * árbol de decisión del backtracking, resaltando el nodo actual.
 */
export function QueensTreeView({
  state,
  tree,
}: {
  state: Queens4State;
  tree: TreeNode[];
}) {
  const reduced = useReducedMotion();
  const { n, queens, depth, trying, revealed, current, solved } = state;

  const attacked = (r: number, c: number) => {
    for (let qc = 0; qc < depth; qc++) {
      const q = queens[qc];
      if (q < 0) continue;
      if (q === r || qc === c || Math.abs(q - r) === Math.abs(qc - c)) return true;
    }
    return false;
  };

  // Layout del árbol.
  const shown = tree.filter((t) => t.id < revealed);
  const maxX = Math.max(1, ...tree.map((t) => t.x));
  const maxDepth = Math.max(1, ...tree.map((t) => t.depth));
  const TW = 320;
  const TH = 230;
  const PAD = 20;
  const tx = (x: number) => PAD + (maxX === 0 ? TW / 2 : (x / maxX) * (TW - 2 * PAD));
  const ty = (d: number) => PAD + (d / maxDepth) * (TH - 2 * PAD);
  const byId = new Map(tree.map((t) => [t.id, t]));

  return (
    <div className="flex w-full max-w-3xl flex-wrap items-start justify-center gap-6">
      {/* Tablero 4×4 */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Tablero {solved ? "· ¡resuelto!" : ""}
        </p>
        <div
          className={[
            "grid overflow-hidden rounded-md border-2",
            solved ? "border-emerald-400" : "border-zinc-400 dark:border-zinc-500",
          ].join(" ")}
          style={{ gridTemplateColumns: `repeat(${n}, ${CELL}px)` }}
        >
          {Array.from({ length: n * n }).map((_, i) => {
            const r = Math.floor(i / n);
            const c = i % n;
            const hasQueen = c < depth && queens[c] === r;
            const isTrying = trying?.col === c && trying?.row === r;
            const att = attacked(r, c);
            const bg = hasQueen
              ? "bg-emerald-200 dark:bg-emerald-900/50"
              : att
                ? "bg-rose-200 dark:bg-rose-950/50"
                : "bg-sky-100 dark:bg-sky-950/40";
            return (
              <div
                key={i}
                className={[
                  "relative flex items-center justify-center border border-zinc-200 dark:border-zinc-800",
                  bg,
                ].join(" ")}
                style={{ width: CELL, height: CELL }}
              >
                {hasQueen && (
                  <Crown className="h-5 w-5 text-emerald-700 dark:text-emerald-300" strokeWidth={2.2} />
                )}
                {isTrying && (
                  <span className="absolute inset-1 rounded-sm ring-2 ring-amber-500" />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex gap-3 text-[11px] text-zinc-400">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-sky-300" /> se puede
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-rose-400" /> atacada
          </span>
        </div>
      </div>

      {/* Árbol de decisión */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Árbol de decisión
        </p>
        <svg viewBox={`0 0 ${TW} ${TH}`} className="w-[320px] max-w-full">
          {/* Aristas */}
          {shown.map((nd) => {
            if (nd.parent === null) return null;
            const p = byId.get(nd.parent)!;
            return (
              <line
                key={`e${nd.id}`}
                x1={tx(p.x)}
                y1={ty(p.depth)}
                x2={tx(nd.x)}
                y2={ty(nd.depth)}
                className="stroke-zinc-300 dark:stroke-zinc-700"
                strokeWidth={1.5}
              />
            );
          })}
          {/* Nodos */}
          {shown.map((nd) => {
            const isCurrent = nd.id === current;
            return (
              <g key={`n${nd.id}`}>
                {isCurrent && (
                  <motion.circle
                    cx={tx(nd.x)}
                    cy={ty(nd.depth)}
                    r={11}
                    fill="none"
                    className="stroke-amber-500"
                    strokeWidth={2}
                    initial={reduced ? false : { scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={transitions.snappy}
                  />
                )}
                <circle cx={tx(nd.x)} cy={ty(nd.depth)} r={nd.status === "solution" ? 8 : 7} fill={NODE_FILL[nd.status]} />
                {nd.row !== null && (
                  <text
                    x={tx(nd.x)}
                    y={ty(nd.depth) + 3}
                    textAnchor="middle"
                    className="fill-white text-[9px] font-semibold"
                  >
                    {nd.row}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        <div className="flex flex-wrap justify-center gap-3 text-[11px] text-zinc-400">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500" /> sin salida
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" /> camino solución
          </span>
          <span>el número = fila elegida</span>
        </div>
      </div>
    </div>
  );
}
