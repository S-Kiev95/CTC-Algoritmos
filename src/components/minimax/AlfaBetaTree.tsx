"use client";

import { useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { transitions } from "@/lib/transitions";
import type { AbNode } from "@/lib/minimax/alfabeta";

const moveName = (m: number) => `${Math.floor(m / 3)},${m % 3}`;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const fmtVal = (v: number) => (v > 0 ? "+1" : v < 0 ? "−1" : "0");
const fmtBound = (v: number) =>
  v === Infinity ? "+∞" : v === -Infinity ? "−∞" : v > 0 ? "+1" : v < 0 ? "−1" : "0";

/**
 * Árbol de decisión con **poda alfa-beta**. Igual que el de Minimax (capas MAX/MIN,
 * camino óptimo en dorado) pero además: cada nodo interno muestra sus cotas α/β y
 * las ramas podadas salen **grises y punteadas con una tijera**. Se puede
 * **arrastrar** para moverse y hacer **zoom**.
 */
export function AlfaBetaTree({
  tree,
  revealed,
  current,
  values,
  bounds,
  pruned,
}: {
  tree: AbNode[];
  revealed: number;
  current: number;
  values: Record<number, number>;
  bounds: Record<number, { alpha: number; beta: number }>;
  pruned: number[];
}) {
  const reduced = useReducedMotion();
  const shown = tree.filter((n) => n.id < revealed);
  const prunedSet = useMemo(() => new Set(pruned), [pruned]);
  // Ids que tienen al menos un hijo (para saber dónde mostrar α/β).
  const hasChildren = useMemo(() => {
    const s = new Set<number>();
    for (const n of tree) if (n.parent !== null) s.add(n.parent);
    return s;
  }, [tree]);

  const maxX = Math.max(1, ...tree.map((n) => n.x));
  const maxDepth = Math.max(1, ...tree.map((n) => n.depth));
  const W = 560;
  const H = 340;
  const PAD = 34;
  const tx = (x: number) => PAD + (maxX === 0 ? W / 2 : (x / maxX) * (W - 2 * PAD));
  const ty = (d: number) => PAD + (d / maxDepth) * (H - 2 * PAD);
  const byId = new Map(tree.map((n) => [n.id, n]));

  // Pan + zoom (persisten entre pasos porque el componente no se desmonta).
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const drag = useRef<{ x: number; y: number } | null>(null);

  function onDown(e: React.PointerEvent<SVGSVGElement>) {
    drag.current = { x: e.clientX, y: e.clientY };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // pointerId inválido (p. ej. en tests): el drag funciona igual.
    }
  }
  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!drag.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const f = W / rect.width;
    setView((v) => ({
      ...v,
      x: v.x + (e.clientX - drag.current!.x) * f,
      y: v.y + (e.clientY - drag.current!.y) * f,
    }));
    drag.current = { x: e.clientX, y: e.clientY };
  }
  function onUp() {
    drag.current = null;
  }
  const zoom = (factor: number) =>
    setView((v) => ({ ...v, k: clamp(v.k * factor, 0.5, 3) }));
  const reset = () => setView({ x: 0, y: 0, k: 1 });

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-2">
      <div className="relative w-full">
        <div className="absolute right-1 top-1 z-10 flex gap-1">
          <CtrlBtn onClick={() => zoom(1.2)} title="Acercar">
            <ZoomIn className="h-3.5 w-3.5" />
          </CtrlBtn>
          <CtrlBtn onClick={() => zoom(1 / 1.2)} title="Alejar">
            <ZoomOut className="h-3.5 w-3.5" />
          </CtrlBtn>
          <CtrlBtn onClick={reset} title="Centrar">
            <Maximize2 className="h-3.5 w-3.5" />
          </CtrlBtn>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          className="w-full cursor-grab touch-none rounded-lg border border-zinc-200 bg-white active:cursor-grabbing dark:border-zinc-800 dark:bg-zinc-950"
        >
          <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
            {/* Aristas + etiqueta de jugada */}
            {shown.map((n) => {
              if (n.parent === null) return null;
              const p = byId.get(n.parent)!;
              const isPruned = prunedSet.has(n.id);
              const onBest = n.onBest && p.onBest;
              const mx = (tx(p.x) + tx(n.x)) / 2;
              const my = (ty(p.depth) + ty(n.depth)) / 2;
              return (
                <g key={`e${n.id}`}>
                  <line
                    x1={tx(p.x)}
                    y1={ty(p.depth)}
                    x2={tx(n.x)}
                    y2={ty(n.depth)}
                    className={
                      isPruned
                        ? "stroke-zinc-300 dark:stroke-zinc-700"
                        : onBest
                          ? "stroke-amber-400"
                          : "stroke-zinc-300 dark:stroke-zinc-700"
                    }
                    strokeWidth={onBest && !isPruned ? 2.5 : 1.2}
                    strokeDasharray={isPruned ? "4 3" : undefined}
                  />
                  {isPruned ? (
                    <text
                      x={mx}
                      y={my + 3}
                      textAnchor="middle"
                      className="fill-zinc-400 text-[11px]"
                    >
                      ✂
                    </text>
                  ) : (
                    n.move !== null && (
                      <text
                        x={mx}
                        y={my - 2}
                        textAnchor="middle"
                        className="fill-zinc-400 text-[8px]"
                      >
                        {moveName(n.move)}
                      </text>
                    )
                  )}
                </g>
              );
            })}
            {/* Nodos */}
            {shown.map((n) => {
              const isMax = n.kind === "max";
              const isPruned = prunedSet.has(n.id);
              const hasVal = n.id in values;
              const isCurrent = n.id === current;
              const b = bounds[n.id];
              const showBounds = !isPruned && !!b && hasChildren.has(n.id);
              return (
                <g key={`n${n.id}`}>
                  {isCurrent && !isPruned && (
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
                      isPruned
                        ? "fill-zinc-300 dark:fill-zinc-700"
                        : isMax
                          ? "fill-sky-500"
                          : "fill-rose-500",
                      n.onBest && !isPruned ? "stroke-amber-400" : "",
                    ].join(" ")}
                    strokeWidth={n.onBest && !isPruned ? 2.5 : 0}
                    opacity={isPruned ? 0.7 : 1}
                  />
                  <text
                    x={tx(n.x)}
                    y={ty(n.depth) + 3}
                    textAnchor="middle"
                    className={[
                      "text-[9px] font-bold",
                      isPruned ? "fill-zinc-500 dark:fill-zinc-400" : "fill-white",
                    ].join(" ")}
                  >
                    {isPruned ? "✂" : hasVal ? fmtVal(values[n.id]) : "?"}
                  </text>
                  {showBounds && (
                    <text
                      x={tx(n.x)}
                      y={ty(n.depth) + 22}
                      textAnchor="middle"
                      className="fill-zinc-500 text-[7.5px] dark:fill-zinc-400"
                    >
                      α{fmtBound(b.alpha)} β{fmtBound(b.beta)}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] text-zinc-400">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-500" /> MAX (X)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500" /> MIN (O)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" /> ✂ podado
        </span>
        <span>dorado = mejor jugada</span>
      </div>
    </div>
  );
}

function CtrlBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 bg-white/90 text-zinc-600 shadow-sm transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      {children}
    </button>
  );
}
