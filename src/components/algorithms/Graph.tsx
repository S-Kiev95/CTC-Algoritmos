"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Layers, ListOrdered, MapPin } from "lucide-react";
import { useMemo } from "react";
import { transitions } from "@/lib/transitions";
import {
  isEdgeInTree,
  type Edge,
  type GraphState,
} from "@/lib/algorithms/graph/types";

function isInPath(
  edge: Edge,
  pathEdges: { from: string; to: string }[] | undefined,
  directed: boolean,
): boolean {
  if (!pathEdges) return false;
  return pathEdges.some(
    (pe) =>
      (pe.from === edge.from && pe.to === edge.to) ||
      (!directed && pe.from === edge.to && pe.to === edge.from),
  );
}

type Props = {
  state: GraphState;
};

const NODE_RADIUS = 22;
const PADDING = 30;

/**
 * Vista única de grafo: SVG arriba ocupando todo el espacio disponible,
 * info strip compacto abajo (cola para BFS/DFS, distancias para Dijkstra).
 *
 * No incluye matriz de adyacencia — eso es referencia separada que vive
 * en el header de la página.
 */
export function Graph({ state }: Props) {
  const reduced = useReducedMotion();
  const {
    graph,
    cursor,
    visited,
    frontier,
    frontierType,
    examiningEdge,
    distances,
    predecessors,
    treeEdges,
    source,
    destination,
    pathEdges,
    pathNodes,
    openSet,
  } = state;
  const pathNodesSet = new Set(pathNodes ?? []);
  const openSetSet = new Set(openSet ?? []);

  const visitedSet = new Set(visited);

  const bbox = useMemo(() => {
    const xs = graph.nodes.map((n) => n.x);
    const ys = graph.nodes.map((n) => n.y);
    return {
      width: Math.max(...xs) + 2 * PADDING,
      height: Math.max(...ys) + 2 * PADDING,
    };
  }, [graph]);

  function isExamining(edge: Edge): boolean {
    if (!examiningEdge) return false;
    return (
      (edge.from === examiningEdge.from && edge.to === examiningEdge.to) ||
      (!graph.directed &&
        edge.from === examiningEdge.to &&
        edge.to === examiningEdge.from)
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-3">
      {/* SVG ocupa todo el alto disponible */}
      <div className="min-h-0 flex-1">
        <svg
          viewBox={`0 0 ${bbox.width} ${bbox.height}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: "100%",
            height: "100%",
            display: "block",
          }}
          className="text-zinc-700 dark:text-zinc-300"
        >
          {/* Aristas */}
          {graph.edges.map((edge, i) => {
            const from = graph.nodes.find((n) => n.id === edge.from)!;
            const to = graph.nodes.find((n) => n.id === edge.to)!;
            const inTree = isEdgeInTree(edge, treeEdges, graph.directed);
            const inPath = isInPath(edge, pathEdges, graph.directed);
            const examining = isExamining(edge);

            const stroke = inPath
              ? "rgb(168, 85, 247)" // purple-500 — camino al destino
              : examining
                ? "rgb(245, 158, 11)"
                : inTree
                  ? "rgb(16, 185, 129)"
                  : "currentColor";
            const opacity = inPath || examining || inTree ? 0.9 : 0.35;
            const strokeWidth = inPath ? 4 : examining ? 3 : inTree ? 2.5 : 1.5;

            const midX = (from.x + to.x) / 2 + PADDING;
            const midY = (from.y + to.y) / 2 + PADDING;

            return (
              <g key={`${edge.from}-${edge.to}-${i}`}>
                <motion.line
                  initial={false}
                  animate={{ stroke, strokeOpacity: opacity, strokeWidth }}
                  transition={transitions.snappy}
                  x1={from.x + PADDING}
                  y1={from.y + PADDING}
                  x2={to.x + PADDING}
                  y2={to.y + PADDING}
                />
                {edge.weight !== undefined && (
                  <g>
                    <rect
                      x={midX - 11}
                      y={midY - 9}
                      width={22}
                      height={16}
                      rx={4}
                      fill={
                        examining
                          ? "rgb(245, 158, 11)"
                          : inTree
                            ? "rgb(16, 185, 129)"
                            : "rgb(244, 244, 245)"
                      }
                      stroke={
                        examining
                          ? "rgb(217, 119, 6)"
                          : inTree
                            ? "rgb(5, 150, 105)"
                            : "rgb(212, 212, 216)"
                      }
                      strokeWidth={1}
                    />
                    <text
                      x={midX}
                      y={midY + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={examining || inTree ? "white" : "rgb(82, 82, 91)"}
                      className="text-[11px] font-bold"
                      style={{ fontFamily: "ui-monospace, monospace" }}
                    >
                      {edge.weight}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Nodos */}
          {graph.nodes.map((node) => {
            const isCursor = cursor === node.id;
            const isVisited = visitedSet.has(node.id);
            const isSource = source === node.id;
            const isDestination = destination === node.id;
            const isInPath = pathNodesSet.has(node.id);
            const isInOpen = openSetSet.has(node.id) && !isVisited;

            const fill = isInPath
              ? "rgb(243, 232, 255)"
              : isCursor
                ? "rgb(254, 243, 199)"
                : isVisited
                  ? "rgb(220, 252, 231)"
                  : isSource
                    ? "rgb(224, 242, 254)"
                    : isDestination
                      ? "rgb(254, 226, 226)"
                      : isInOpen
                        ? "rgb(255, 237, 213)" // orange-100 — open set
                        : "rgb(244, 244, 245)";

            const stroke = isInPath
              ? "rgb(168, 85, 247)"
              : isCursor
                ? "rgb(245, 158, 11)"
                : isVisited
                  ? "rgb(16, 185, 129)"
                  : isSource
                    ? "rgb(14, 165, 233)"
                    : isDestination
                      ? "rgb(244, 63, 94)"
                      : isInOpen
                        ? "rgb(249, 115, 22)" // orange-500
                        : "rgb(82, 82, 91)";

            const textColor = isInPath
              ? "rgb(88, 28, 135)"
              : isCursor
                ? "rgb(120, 53, 15)"
                : isVisited
                  ? "rgb(6, 78, 59)"
                  : isSource
                    ? "rgb(12, 74, 110)"
                    : isDestination
                      ? "rgb(136, 19, 55)"
                      : isInOpen
                        ? "rgb(124, 45, 18)"
                        : "rgb(24, 24, 27)";

            const cx = node.x + PADDING;
            const cy = node.y + PADDING;
            const d = distances?.[node.id];
            // Solo dibujar el badge cuando hay un valor concreto (no ∞).
            // Eso evita el ruido de "∞" sobre cada nodo en grids grandes.
            const showDist = distances !== undefined && d !== null && d !== undefined;

            return (
              <motion.g
                key={node.id}
                animate={{ scale: isCursor ? 1.08 : 1 }}
                transition={transitions.spring}
                style={{
                  transformOrigin: `${cx}px ${cy}px`,
                  transformBox: "fill-box",
                }}
              >
                {(isCursor || isSource || isDestination) && (
                  <motion.circle
                    initial={reduced ? false : { scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={transitions.spring}
                    cx={cx}
                    cy={cy}
                    r={NODE_RADIUS + 6}
                    fill={
                      isCursor
                        ? "rgb(245, 158, 11)"
                        : isDestination
                          ? "rgb(244, 63, 94)"
                          : "rgb(14, 165, 233)"
                    }
                    fillOpacity={0.2}
                  />
                )}
                <motion.circle
                  initial={false}
                  animate={{ fill, stroke }}
                  transition={transitions.snappy}
                  cx={cx}
                  cy={cy}
                  r={NODE_RADIUS}
                  strokeWidth={2.5}
                />
                <motion.text
                  initial={false}
                  animate={{ fill: textColor }}
                  transition={transitions.snappy}
                  x={cx}
                  y={cy + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[14px] font-bold"
                  style={{ fontFamily: "ui-monospace, monospace" }}
                >
                  {node.label}
                </motion.text>

                {showDist && (
                  <motion.g
                    initial={reduced ? false : { opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <rect
                      x={cx - 14}
                      y={cy - NODE_RADIUS - 16}
                      width={28}
                      height={14}
                      rx={3}
                      fill="rgb(16, 185, 129)"
                    />
                    <text
                      x={cx}
                      y={cy - NODE_RADIUS - 8}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      className="text-[10px] font-bold"
                      style={{ fontFamily: "ui-monospace, monospace" }}
                    >
                      {d}
                    </text>
                  </motion.g>
                )}
              </motion.g>
            );
          })}
        </svg>
      </div>

      {/* Info strip compacto al pie del grafo */}
      {frontier !== undefined && frontierType !== "priority" && (
        <FrontierStrip
          items={frontier}
          type={frontierType ?? "queue"}
          reduced={!!reduced}
        />
      )}
      {/* Tabla de distancias solo cuando no hay openSet (A* usa los nodos
          coloreados directamente; agregar otra fila sería ruido). */}
      {distances !== undefined && openSet === undefined && (
        <DistanceStrip
          graph={graph}
          distances={distances}
          predecessors={predecessors ?? {}}
          visited={visitedSet}
          source={source}
          cursor={cursor}
          reduced={!!reduced}
        />
      )}
      {/* Para A*: pequeña leyenda con contadores */}
      {openSet !== undefined && (
        <div className="flex shrink-0 items-center justify-center gap-4 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-[11px] dark:border-zinc-800 dark:bg-zinc-900">
          <LegendDot color="bg-sky-400" label="origen" />
          <LegendDot color="bg-rose-400" label="destino" />
          <LegendDot color="bg-orange-400" label={`abiertos (${openSet.length})`} />
          <LegendDot color="bg-emerald-400" label={`cerrados (${visitedSet.size})`} />
          <LegendDot color="bg-amber-400" label="actual" />
          {state.pathNodes && state.pathNodes.length > 0 && (
            <LegendDot color="bg-purple-400" label="camino final" />
          )}
        </div>
      )}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span>{label}</span>
    </span>
  );
}

/**
 * Cola/Pila como strip horizontal compacto (una sola fila).
 */
function FrontierStrip({
  items,
  type,
  reduced,
}: {
  items: string[];
  type: "queue" | "stack" | "priority";
  reduced: boolean;
}) {
  const label = type === "queue" ? "Cola (FIFO)" : "Pila (LIFO)";
  return (
    <div className="flex shrink-0 items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex shrink-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
        {type === "queue" ? (
          <ListOrdered className="h-3 w-3" />
        ) : (
          <Layers className="h-3 w-3" />
        )}
        {label}
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-1">
        <span className="text-[10px] text-zinc-400">
          {type === "queue" ? "pop ←" : "↓"}
        </span>
        <AnimatePresence initial={false} mode="popLayout">
          {items.length === 0 ? (
            <span className="font-mono text-xs italic text-zinc-400">vacío</span>
          ) : (
            items.map((item, i) => {
              const isNext = type === "queue" ? i === 0 : i === items.length - 1;
              return (
                <motion.span
                  key={`${item}-${i}`}
                  layout={!reduced}
                  initial={reduced ? false : { opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
                  transition={transitions.spring}
                  className={[
                    "rounded px-1.5 py-0.5 font-mono text-xs font-bold",
                    isNext
                      ? "bg-amber-500 text-white"
                      : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200",
                  ].join(" ")}
                >
                  {item.toUpperCase()}
                </motion.span>
              );
            })
          )}
        </AnimatePresence>
        <span className="text-[10px] text-zinc-400">
          {type === "queue" ? "← push" : ""}
        </span>
      </div>
      <span className="shrink-0 font-mono text-[10px] text-zinc-400">
        {items.length} elem.
      </span>
    </div>
  );
}

/**
 * Tabla de distancias como strip horizontal (una columna por nodo).
 * Más compacta que la tabla vertical anterior.
 */
function DistanceStrip({
  graph,
  distances,
  predecessors,
  visited,
  source,
  cursor,
  reduced,
}: {
  graph: GraphState["graph"];
  distances: Record<string, number | null>;
  predecessors: Record<string, string | null>;
  visited: Set<string>;
  source?: string;
  cursor?: string;
  reduced: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex shrink-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
        <MapPin className="h-3 w-3" />
        Dist desde {source?.toUpperCase() ?? "?"}
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-1">
        {graph.nodes.map((node) => {
          const d = distances[node.id];
          const pred = predecessors[node.id];
          const isVisited = visited.has(node.id);
          const isCursor = cursor === node.id;
          return (
            <motion.div
              key={node.id}
              layout={!reduced}
              animate={{
                backgroundColor: isCursor
                  ? "rgba(245, 158, 11, 0.2)"
                  : isVisited
                    ? "rgba(16, 185, 129, 0.15)"
                    : "rgba(244, 244, 245, 1)",
              }}
              transition={transitions.snappy}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[11px] dark:bg-zinc-800"
              title={pred ? `pred = ${pred.toUpperCase()}` : ""}
            >
              <span className="font-bold text-zinc-700 dark:text-zinc-300">
                {node.label}
              </span>
              <span className="text-zinc-400">:</span>
              <motion.span
                key={String(d)}
                initial={reduced ? false : { opacity: 0.5, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={transitions.snappy}
                className={
                  d === null
                    ? "text-zinc-400"
                    : "font-bold text-emerald-700 dark:text-emerald-400"
                }
              >
                {d === null ? "∞" : d}
              </motion.span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
