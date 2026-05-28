"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Ruler, Sigma, Terminal } from "lucide-react";
import { useMemo } from "react";
import { transitions } from "@/lib/transitions";
import {
  collectEdges,
  flattenNodes,
  layoutTree,
  type TreeState,
} from "@/lib/algorithms/tree/types";

type Props = {
  state: TreeState;
};

const NODE_RADIUS = 24;
const X_SPACING = 70;
const Y_SPACING = 84;
const PADDING = 32;

/**
 * Dibujo clásico de árbol con SVG: nodos como círculos conectados por
 * aristas. Layout calculado automáticamente: cada hoja toma un slot
 * horizontal, cada padre se centra entre el primer y el último hijo.
 *
 * Estado visual:
 * - Cursor (nodo siendo procesado ahora): círculo ámbar con ring
 * - Visitados: círculo verde claro
 * - Hojas tienen un borde más fino (no es estructural, solo estilo)
 *
 * Debajo del árbol, un panel de output con lo que vaya emitiendo el
 * algoritmo (lista de valores, conteo, altura, etc.).
 */
export function TreeView({ state }: Props) {
  const reduced = useReducedMotion();
  const { root, cursor, visited, output, count, height, subtreeHeights } =
    state;

  const layout = useMemo(() => layoutTree(root), [root]);
  const allNodes = useMemo(() => flattenNodes(root), [root]);
  const edges = useMemo(() => collectEdges(root), [root]);
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
    <div className="flex w-full max-w-3xl flex-col items-center gap-4">
      {/* Árbol SVG */}
      <div className="w-full overflow-x-auto rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
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
          {/* Aristas primero (debajo de los nodos) */}
          {edges.map(({ parentId, childId }) => (
            <line
              key={`${parentId}-${childId}`}
              x1={nodeX(parentId)}
              y1={nodeY(parentId)}
              x2={nodeX(childId)}
              y2={nodeY(childId)}
              stroke="currentColor"
              strokeOpacity={0.35}
              strokeWidth={1.5}
            />
          ))}

          {/* Nodos */}
          {allNodes.map((node) => {
            const isCursor = cursor === node.id;
            const isVisited = visitedSet.has(node.id);
            const isLeaf = !node.children || node.children.length === 0;
            const subtreeHeight = subtreeHeights?.[node.id];

            const fill = isCursor
              ? "rgb(254, 243, 199)" // amber-100
              : isVisited
                ? "rgb(220, 252, 231)" // emerald-100
                : "rgb(244, 244, 245)"; // zinc-100

            const stroke = isCursor
              ? "rgb(245, 158, 11)" // amber-500
              : isVisited
                ? "rgb(16, 185, 129)" // emerald-500
                : isLeaf
                  ? "rgb(161, 161, 170)" // zinc-400
                  : "rgb(82, 82, 91)"; // zinc-600

            const textColor = isCursor
              ? "rgb(120, 53, 15)" // amber-900
              : isVisited
                ? "rgb(6, 78, 59)" // emerald-900
                : "rgb(24, 24, 27)"; // zinc-900

            return (
              <motion.g
                key={node.id}
                animate={{
                  scale: isCursor ? 1.08 : 1,
                }}
                transition={transitions.spring}
                style={{
                  transformOrigin: `${nodeX(node.id)}px ${nodeY(node.id)}px`,
                  transformBox: "fill-box",
                }}
              >
                {isCursor && (
                  <motion.circle
                    cx={nodeX(node.id)}
                    cy={nodeY(node.id)}
                    r={NODE_RADIUS + 5}
                    fill="rgb(245, 158, 11)"
                    fillOpacity={0.25}
                    initial={reduced ? false : { scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={transitions.spring}
                  />
                )}
                <motion.circle
                  cx={nodeX(node.id)}
                  cy={nodeY(node.id)}
                  r={NODE_RADIUS}
                  animate={{
                    fill,
                    stroke,
                  }}
                  transition={transitions.snappy}
                  strokeWidth={2.5}
                />
                <motion.text
                  x={nodeX(node.id)}
                  y={nodeY(node.id) + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  animate={{ fill: textColor }}
                  transition={transitions.snappy}
                  className="text-[16px] font-bold"
                  style={{ fontFamily: "ui-monospace, monospace" }}
                >
                  {node.value}
                </motion.text>

                {/* Altura del subárbol (solo cuando se está computando) */}
                {subtreeHeight !== undefined && (
                  <motion.g
                    initial={reduced ? false : { opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={transitions.springBouncy}
                  >
                    <rect
                      x={nodeX(node.id) + NODE_RADIUS - 4}
                      y={nodeY(node.id) - NODE_RADIUS - 8}
                      width={20}
                      height={16}
                      rx={3}
                      fill="rgb(16, 185, 129)"
                    />
                    <text
                      x={nodeX(node.id) + NODE_RADIUS + 6}
                      y={nodeY(node.id) - NODE_RADIUS + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      className="text-[10px] font-bold"
                      style={{ fontFamily: "ui-monospace, monospace" }}
                    >
                      h={subtreeHeight}
                    </text>
                  </motion.g>
                )}
              </motion.g>
            );
          })}
        </svg>

        {/* Vocabulario rápido */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-[11px] text-zinc-500">
          <span>
            <strong>raíz</strong> = "{root.value}"
          </span>
          <span>
            <strong>hojas</strong> = nodos sin hijos
          </span>
        </div>
      </div>

      {/* Output / resultado */}
      {(output.length > 0 ||
        count !== undefined ||
        height !== undefined) && (
        <motion.div
          layout={!reduced}
          transition={transitions.snappy}
          className="w-full max-w-md rounded-lg border border-zinc-300 bg-zinc-950 px-4 py-3 text-zinc-100"
        >
          {output.length > 0 && (
            <>
              <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                <Terminal className="h-3 w-3" />
                Output (DFS)
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
            </>
          )}

          {count !== undefined && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                <Sigma className="h-3 w-3" />
                Cantidad de nodos
              </span>
              <motion.span
                initial={reduced ? false : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={transitions.springBouncy}
                className="font-mono text-lg font-bold text-emerald-300"
              >
                {count}
              </motion.span>
            </div>
          )}

          {height !== undefined && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                <Ruler className="h-3 w-3" />
                Altura del árbol
              </span>
              <motion.span
                initial={reduced ? false : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={transitions.springBouncy}
                className="font-mono text-lg font-bold text-emerald-300"
              >
                {height}
              </motion.span>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
