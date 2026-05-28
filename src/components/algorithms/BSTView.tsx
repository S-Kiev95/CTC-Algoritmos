"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Sparkles, Terminal, X } from "lucide-react";
import { useMemo } from "react";
import { transitions } from "@/lib/transitions";
import {
  collectBstEdges,
  flattenBst,
  layoutBst,
  type BstState,
} from "@/lib/algorithms/binary-tree/types";

type Props = {
  state: BstState;
};

const NODE_RADIUS = 20;
const X_SPACING = 56;
const Y_SPACING = 62;
const PADDING = 22;

/**
 * BST dibujado con SVG. Layout por inorden: izquierda < raíz < derecha
 * se traduce a "izquierda físicamente a la izquierda".
 *
 * Estado visual:
 * - Cursor: ámbar con halo, scale 1.08
 * - Nodos visitados (path): verde claro
 * - Found: emerald con ring
 * - newNodeId: emerald con pulse de inserción
 * - Bubble "pending value" arriba del árbol durante insert/search
 * - Badge de dirección (← o →) al lado del cursor según comparación
 */
export function BSTView({ state }: Props) {
  const reduced = useReducedMotion();
  const {
    root,
    cursor,
    visited,
    pendingValue,
    newNodeId,
    found,
    notFound,
    output,
    direction,
  } = state;

  const layout = useMemo(() => layoutBst(root), [root]);
  const allNodes = useMemo(() => flattenBst(root), [root]);
  const edges = useMemo(() => collectBstEdges(root), [root]);
  const visitedSet = new Set(visited);

  const svgWidth =
    Math.max(1, layout.width - 1) * X_SPACING + 2 * PADDING + NODE_RADIUS * 2;
  const svgHeight =
    Math.max(1, layout.height - 1) * Y_SPACING + 2 * PADDING + NODE_RADIUS * 2;

  function nodeX(id: string): number {
    const p = layout.positions.get(id)!;
    return PADDING + NODE_RADIUS + p.x * X_SPACING;
  }
  function nodeY(id: string): number {
    const p = layout.positions.get(id)!;
    return PADDING + NODE_RADIUS + p.y * Y_SPACING;
  }

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-3">
      {/* Pending value bubble + comparación */}
      <div className="flex min-h-[40px] items-center gap-3">
        <AnimatePresence mode="popLayout">
          {pendingValue !== undefined && (
            <motion.div
              key={`pending-${pendingValue}`}
              initial={reduced ? false : { opacity: 0, y: -10, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
              transition={transitions.spring}
              className="flex items-center gap-2 rounded-lg border-2 border-sky-400 bg-sky-50 px-3 py-1.5 dark:border-sky-500/60 dark:bg-sky-950/40"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                {found ? "buscando" : notFound ? "buscando" : newNodeId ? "insertando" : "valor"}
              </span>
              <span className="font-mono text-lg font-bold text-sky-900 dark:text-sky-100">
                {pendingValue}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {direction && cursor && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={transitions.springBouncy}
            className={[
              "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold",
              direction === "left"
                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                : direction === "right"
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                  : direction === "match"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
            ].join(" ")}
          >
            {direction === "left" && (
              <>
                <ArrowLeft className="h-3 w-3" /> izquierda
              </>
            )}
            {direction === "right" && (
              <>
                <ArrowRight className="h-3 w-3" /> derecha
              </>
            )}
            {direction === "match" && (
              <>
                <Check className="h-3 w-3" /> match
              </>
            )}
            {direction === "null" && (
              <>
                <X className="h-3 w-3" /> None
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* SVG del árbol */}
      <div className="w-full overflow-x-auto rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
        {root === null ? (
          <div className="flex h-32 items-center justify-center font-mono text-sm text-zinc-400">
            (árbol vacío)
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{
              width: "100%",
              maxWidth: svgWidth,
              height: "auto",
              display: "block",
              margin: "0 auto",
            }}
            className="text-zinc-700 dark:text-zinc-300"
          >
            {/* Aristas */}
            {edges.map(({ parentId, childId, side }) => {
              const x1 = nodeX(parentId);
              const y1 = nodeY(parentId);
              const x2 = nodeX(childId);
              const y2 = nodeY(childId);
              const onPath =
                visitedSet.has(parentId) && visitedSet.has(childId);
              return (
                <motion.line
                  key={`${parentId}-${childId}`}
                  initial={false}
                  animate={{
                    x1,
                    y1,
                    x2,
                    y2,
                    stroke: onPath
                      ? side === "left"
                        ? "rgb(245, 158, 11)" // amber-500
                        : "rgb(168, 85, 247)" // purple-500
                      : "currentColor",
                    strokeOpacity: onPath ? 0.7 : 0.35,
                  }}
                  transition={transitions.spring}
                  strokeWidth={onPath ? 2 : 1.5}
                />
              );
            })}

            {/* Nodos */}
            {allNodes.map((node) => {
              const isCursor = cursor === node.id;
              const isVisited = visitedSet.has(node.id);
              const isFound = found === node.id;
              const isNew = newNodeId === node.id;

              const fill = isFound
                ? "rgb(167, 243, 208)" // emerald-200
                : isCursor
                  ? "rgb(254, 243, 199)" // amber-100
                  : isNew
                    ? "rgb(220, 252, 231)" // emerald-100
                    : isVisited
                      ? "rgb(252, 231, 207)" // amber-100 más claro
                      : "rgb(244, 244, 245)"; // zinc-100

              const stroke = isFound
                ? "rgb(16, 185, 129)" // emerald-500
                : isCursor
                  ? "rgb(245, 158, 11)" // amber-500
                  : isNew
                    ? "rgb(16, 185, 129)"
                    : isVisited
                      ? "rgb(217, 119, 6)" // amber-600
                      : "rgb(82, 82, 91)"; // zinc-600

              const textColor = isFound
                ? "rgb(6, 78, 59)" // emerald-900
                : isCursor
                  ? "rgb(120, 53, 15)" // amber-900
                  : isNew
                    ? "rgb(6, 78, 59)"
                    : "rgb(24, 24, 27)";

              return (
                <motion.g
                  key={node.id}
                  initial={
                    reduced ? false : { opacity: 0, scale: 0.5 }
                  }
                  animate={{
                    opacity: 1,
                    scale: isCursor || isFound ? 1.08 : 1,
                  }}
                  transition={transitions.spring}
                  style={{
                    transformOrigin: `${nodeX(node.id)}px ${nodeY(node.id)}px`,
                    transformBox: "fill-box",
                  }}
                >
                  {(isCursor || isFound || isNew) && (
                    <motion.circle
                      initial={
                        reduced ? false : { opacity: 0, scale: 0.7 }
                      }
                      animate={{ opacity: 1, scale: 1 }}
                      transition={transitions.spring}
                      cx={nodeX(node.id)}
                      cy={nodeY(node.id)}
                      r={NODE_RADIUS + 6}
                      fill={
                        isFound || isNew
                          ? "rgb(16, 185, 129)"
                          : "rgb(245, 158, 11)"
                      }
                      fillOpacity={0.2}
                    />
                  )}
                  <motion.circle
                    initial={false}
                    animate={{
                      cx: nodeX(node.id),
                      cy: nodeY(node.id),
                      fill,
                      stroke,
                    }}
                    transition={transitions.spring}
                    r={NODE_RADIUS}
                    strokeWidth={2.5}
                  />
                  <motion.text
                    initial={false}
                    animate={{
                      x: nodeX(node.id),
                      y: nodeY(node.id) + 1,
                      fill: textColor,
                    }}
                    transition={transitions.spring}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[14px] font-bold"
                    style={{ fontFamily: "ui-monospace, monospace" }}
                  >
                    {node.value}
                  </motion.text>
                </motion.g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Status indicators */}
      <div className="flex flex-wrap items-center justify-center gap-2 min-h-[28px]">
        {found && (
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={transitions.springBouncy}
            className="flex items-center gap-1.5 rounded-md bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
          >
            <Check className="h-3.5 w-3.5" />
            encontrado
          </motion.div>
        )}
        {notFound && (
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={transitions.springBouncy}
            className="flex items-center gap-1.5 rounded-md bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
          >
            <X className="h-3.5 w-3.5" />
            no encontrado
          </motion.div>
        )}
        {newNodeId && (
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={transitions.springBouncy}
            className="flex items-center gap-1.5 rounded-md bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
          >
            <Sparkles className="h-3.5 w-3.5" />
            insertado
          </motion.div>
        )}
      </div>

      {/* Output panel para inorden */}
      {output.length > 0 && (
        <motion.div
          layout={!reduced}
          transition={transitions.snappy}
          className="w-full max-w-md rounded-lg border border-zinc-300 bg-zinc-950 px-4 py-3 text-zinc-100"
        >
          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            <Terminal className="h-3 w-3" />
            Output (inorden)
          </div>
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-sm">
            {output.map((val, i) => (
              <motion.span
                key={i}
                initial={reduced ? false : { opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={transitions.springBouncy}
                className="rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-300"
              >
                {val}
              </motion.span>
            ))}
          </div>
          {output.length > 1 && (
            <p className="mt-2 text-[10px] text-zinc-500">
              Notá cómo los valores salen <strong>ordenados</strong> de menor a
              mayor — esa es la propiedad clave del inorden en BST.
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
