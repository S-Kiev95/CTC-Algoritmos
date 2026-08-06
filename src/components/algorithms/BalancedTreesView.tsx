"use client";

import { motion, useReducedMotion } from "framer-motion";
import { transitions } from "@/lib/transitions";
import type { BalancedState, SnapNode } from "@/lib/algorithms/binary-tree/balanced";

type Placed = { node: SnapNode; x: number; depth: number; parent: { x: number; depth: number } | null };

/** Coloca los nodos: x = posición en el recorrido inorden, y = profundidad. */
function layout(root: SnapNode | null): Placed[] {
  const out: Placed[] = [];
  let i = 0;
  const walk = (n: SnapNode | null, depth: number, parent: { x: number; depth: number } | null) => {
    if (!n) return;
    // Reservamos el x del padre después de recorrer la izquierda.
    const leftFirst = () => walk(n.left, depth + 1, null);
    const before = out.length;
    leftFirst();
    const x = i++;
    const me = { node: n, x, depth, parent };
    out.push(me);
    // Reasignamos el padre de los hijos izquierdos ya colocados en este subárbol.
    for (let k = before; k < out.length - 1; k++) {
      if (out[k].parent === null && out[k].depth === depth + 1) out[k].parent = { x, depth };
    }
    const rightStart = out.length;
    walk(n.right, depth + 1, null);
    for (let k = rightStart; k < out.length; k++) {
      if (out[k].parent === null && out[k].depth === depth + 1) out[k].parent = { x, depth };
    }
  };
  walk(root, 0, null);
  return out;
}

function Tree({
  root,
  title,
  subtitle,
  highlight,
  kind,
}: {
  root: SnapNode | null;
  title: string;
  subtitle: string;
  highlight: number | null;
  kind: "avl" | "rb";
}) {
  const reduced = useReducedMotion();
  const placed = layout(root);
  const cols = Math.max(1, placed.length);
  const depth = Math.max(1, ...placed.map((p) => p.depth + 1));

  const GAP_X = 40;
  const GAP_Y = 52;
  const PAD = 26;
  const W = Math.max(220, (cols - 1) * GAP_X + PAD * 2);
  const H = (depth - 1) * GAP_Y + PAD * 2;
  const tx = (x: number) => PAD + x * GAP_X;
  const ty = (d: number) => PAD + d * GAP_Y;

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</p>
      <p className="text-[11px] text-zinc-400">{subtitle}</p>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="w-full" style={{ maxHeight: "min(38vh, 260px)" }}>
        {/* aristas */}
        {placed.map((p) =>
          p.parent ? (
            <line
              key={`e${p.node.value}`}
              x1={tx(p.parent.x)}
              y1={ty(p.parent.depth)}
              x2={tx(p.x)}
              y2={ty(p.depth)}
              className="stroke-zinc-300 dark:stroke-zinc-700"
              strokeWidth={1.4}
            />
          ) : null,
        )}
        {/* nodos */}
        {placed.map((p) => {
          const isNew = highlight !== null && p.node.value === highlight;
          const fill =
            kind === "rb"
              ? p.node.color === "R"
                ? "#ef4444"
                : "#3f3f46"
              : "#0ea5e9";
          return (
            <g key={`n${p.node.value}`}>
              {isNew && (
                <motion.circle
                  cx={tx(p.x)}
                  cy={ty(p.depth)}
                  r={17}
                  fill="none"
                  className="stroke-amber-500"
                  strokeWidth={2}
                  initial={reduced ? false : { scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={transitions.snappy}
                />
              )}
              <circle cx={tx(p.x)} cy={ty(p.depth)} r={13} fill={fill} />
              <text
                x={tx(p.x)}
                y={ty(p.depth) + 4}
                textAnchor="middle"
                className="fill-white text-[10px] font-bold"
              >
                {p.node.value}
              </text>
              {/* Factor de balance del AVL, arriba a la derecha del nodo */}
              {kind === "avl" && p.node.balance !== undefined && (
                <text
                  x={tx(p.x) + 14}
                  y={ty(p.depth) - 9}
                  textAnchor="middle"
                  className={[
                    "text-[8px] font-semibold",
                    Math.abs(p.node.balance) > 1 ? "fill-rose-500" : "fill-zinc-400",
                  ].join(" ")}
                >
                  {p.node.balance > 0 ? `+${p.node.balance}` : p.node.balance}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** Dos árboles lado a lado (AVL y Rojo-Negro) con las mismas inserciones. */
export function BalancedTreesView({ state }: { state: BalancedState }) {
  const { avl, rb, inserted, avlOp, rbOp, avlRots, rbFixes, avlHeight, rbHeight } = state;

  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-3">
      <div className="flex w-full flex-col gap-4 sm:flex-row">
        <Tree
          root={avl}
          title="AVL"
          subtitle={`altura ${avlHeight} · ${avlRots} rotaciones`}
          highlight={inserted}
          kind="avl"
        />
        <div className="hidden w-px shrink-0 bg-zinc-200 dark:bg-zinc-800 sm:block" />
        <Tree
          root={rb}
          title="Rojo-Negro"
          subtitle={`altura ${rbHeight} · ${rbFixes} arreglos`}
          highlight={inserted}
          kind="rb"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-zinc-400">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-500" /> AVL (el número es el factor de balance)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500" /> rojo
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-zinc-600" /> negro
        </span>
      </div>

      {(avlOp || rbOp) && (
        <div className="flex w-full max-w-2xl flex-wrap justify-center gap-2 text-[11px]">
          {avlOp && (
            <span className="rounded-md bg-sky-50 px-2 py-1 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
              AVL: {avlOp}
            </span>
          )}
          {rbOp && (
            <span className="rounded-md bg-rose-50 px-2 py-1 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
              Rojo-Negro: {rbOp}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
