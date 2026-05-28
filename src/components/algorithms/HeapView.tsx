"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useMemo } from "react";
import { transitions } from "@/lib/transitions";
import {
  layoutHeap,
  parentIdx,
  type HeapState,
} from "@/lib/algorithms/heap/types";

type Props = {
  state: HeapState;
};

const NODE_RADIUS = 22;
const ROW_HEIGHT = 70;
const PADDING_X = 28;
const PADDING_Y = 20;

/**
 * Visualización de un min-heap como árbol binario completo. La raíz
 * arriba al centro, hijos abajo. Las aristas conectan padre→hijo.
 *
 * Estados:
 * - cursorId: ámbar — el item que se está moviendo (bubble-up/down).
 * - comparing: dos nodos con halo cyan — pareja siendo comparada.
 * - swapped: dos nodos con flash verde — recién intercambiados.
 * - flying: bubble flotando arriba — item entrante antes de aterrizar.
 * - extracted: tag a la derecha mostrando el item que se extrajo.
 */
export function HeapView({ state }: Props) {
  const reduced = useReducedMotion();
  const {
    items,
    cursorId,
    comparing,
    swapped,
    flying,
    extracted,
    operation,
  } = state;

  const { positions, maxDepth } = useMemo(() => layoutHeap(items), [items]);

  // Ancho del nivel más profundo determina ancho del SVG.
  const colsAtMax = Math.max(1, Math.pow(2, maxDepth));
  const colWidth = 56;
  const svgWidth = Math.max(280, colsAtMax * colWidth + PADDING_X * 2);
  const svgHeight = (maxDepth + 1) * ROW_HEIGHT + PADDING_Y * 2;

  function nodeX(id: string): number {
    const p = positions.get(id);
    if (!p) return svgWidth / 2;
    const colsAtDepth = Math.pow(2, p.depth);
    // Centro de cada columna en su nivel
    const innerWidth = svgWidth - PADDING_X * 2;
    return PADDING_X + (innerWidth * (p.col + 0.5)) / colsAtDepth;
  }
  function nodeY(id: string): number {
    const p = positions.get(id);
    if (!p) return PADDING_Y + NODE_RADIUS;
    return PADDING_Y + NODE_RADIUS + p.depth * ROW_HEIGHT;
  }

  const comparingSet = new Set(comparing ?? []);
  const swappedSet = new Set(swapped ?? []);

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-3">
      {/* Operación + flying + extracted */}
      <div className="flex min-h-[44px] flex-wrap items-center justify-center gap-3">
        {flying && (
          <motion.div
            key={`fly-${flying.id}`}
            initial={{ opacity: 0, y: -12, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={transitions.springBouncy}
            className="flex items-center gap-2 rounded-lg border-2 border-emerald-400 bg-emerald-50 px-3 py-1.5 text-emerald-700 dark:border-emerald-500/70 dark:bg-emerald-950/40 dark:text-emerald-200"
          >
            <ArrowDown className="h-3.5 w-3.5" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              entra
            </span>
            <span className="font-mono text-sm font-bold">
              {flying.label ? `${flying.label} (${flying.key})` : flying.key}
            </span>
          </motion.div>
        )}

        {operation === "bubble-up" && cursorId && !flying && (
          <Tag
            tone="amber"
            icon={<ArrowUp className="h-3.5 w-3.5" />}
            label="bubble-up"
          />
        )}
        {operation === "bubble-down" && cursorId && (
          <Tag
            tone="amber"
            icon={<ArrowDown className="h-3.5 w-3.5" />}
            label="bubble-down"
          />
        )}
        {operation === "pop" && (
          <Tag
            tone="rose"
            icon={<ChevronsUpDown className="h-3.5 w-3.5" />}
            label="extrayendo raíz"
          />
        )}
        {operation === "done" && (
          <Tag
            tone="emerald"
            icon={<Sparkles className="h-3.5 w-3.5" />}
            label="heap válido"
          />
        )}

        {extracted && (
          <motion.div
            key={`ext-${extracted.id}`}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={transitions.springBouncy}
            className="flex items-center gap-2 rounded-lg border-2 border-rose-400 bg-rose-50 px-3 py-1.5 text-rose-700 dark:border-rose-500/70 dark:bg-rose-950/40 dark:text-rose-200"
          >
            <Trophy className="h-3.5 w-3.5" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              sale
            </span>
            <span className="font-mono text-sm font-bold">
              {extracted.label
                ? `${extracted.label} (${extracted.key})`
                : extracted.key}
            </span>
          </motion.div>
        )}
      </div>

      {/* Árbol SVG */}
      <div className="w-full overflow-x-auto rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
        {items.length === 0 ? (
          <div className="flex h-24 items-center justify-center font-mono text-sm text-zinc-400">
            (heap vacío)
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
            {/* Aristas padre→hijo */}
            {items.map((node, i) => {
              if (i === 0) return null;
              const pIdx = parentIdx(i);
              const parent = items[pIdx];
              const isPath =
                comparingSet.has(node.id) && comparingSet.has(parent.id);
              const isSwap =
                swappedSet.has(node.id) && swappedSet.has(parent.id);
              return (
                <motion.line
                  key={`e-${node.id}`}
                  initial={false}
                  animate={{
                    x1: nodeX(parent.id),
                    y1: nodeY(parent.id),
                    x2: nodeX(node.id),
                    y2: nodeY(node.id),
                    stroke: isSwap
                      ? "rgb(16, 185, 129)" // emerald-500
                      : isPath
                        ? "rgb(14, 165, 233)" // sky-500
                        : "currentColor",
                    strokeOpacity: isPath || isSwap ? 0.7 : 0.35,
                  }}
                  transition={transitions.spring}
                  strokeWidth={isPath || isSwap ? 2 : 1.5}
                />
              );
            })}

            {/* Nodos */}
            <AnimatePresence>
              {items.map((node, i) => {
                const isCursor = cursorId === node.id;
                const isComparing = comparingSet.has(node.id);
                const isSwapped = swappedSet.has(node.id);
                const isRoot = i === 0;

                const fill = isSwapped
                  ? "rgb(167, 243, 208)" // emerald-200
                  : isCursor
                    ? "rgb(254, 243, 199)" // amber-100
                    : isComparing
                      ? "rgb(186, 230, 253)" // sky-200
                      : isRoot
                        ? "rgb(254, 226, 226)" // rose-100 — siempre destacar la raíz como "el mínimo"
                        : "rgb(244, 244, 245)"; // zinc-100

                const stroke = isSwapped
                  ? "rgb(16, 185, 129)"
                  : isCursor
                    ? "rgb(245, 158, 11)"
                    : isComparing
                      ? "rgb(14, 165, 233)"
                      : isRoot
                        ? "rgb(244, 63, 94)" // rose-500
                        : "rgb(82, 82, 91)";

                const textColor = isCursor
                  ? "rgb(120, 53, 15)"
                  : isComparing
                    ? "rgb(7, 89, 133)" // sky-900
                    : isRoot
                      ? "rgb(136, 19, 55)" // rose-900
                      : "rgb(24, 24, 27)";

                return (
                  <motion.g
                    key={node.id}
                    layout
                    initial={
                      reduced ? false : { opacity: 0, scale: 0.5 }
                    }
                    animate={{
                      opacity: 1,
                      scale: isCursor ? 1.1 : isComparing ? 1.04 : 1,
                    }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
                    transition={transitions.spring}
                    style={{
                      transformOrigin: `${nodeX(node.id)}px ${nodeY(node.id)}px`,
                      transformBox: "fill-box",
                    }}
                  >
                    {(isCursor || isSwapped) && (
                      <motion.circle
                        initial={reduced ? false : { opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={transitions.spring}
                        cx={nodeX(node.id)}
                        cy={nodeY(node.id)}
                        r={NODE_RADIUS + 6}
                        fill={
                          isSwapped
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
                      className="text-[13px] font-bold"
                      style={{ fontFamily: "ui-monospace, monospace" }}
                    >
                      {node.key}
                    </motion.text>
                    {node.label && (
                      <motion.text
                        initial={false}
                        animate={{
                          x: nodeX(node.id),
                          y: nodeY(node.id) + NODE_RADIUS + 12,
                          fill: "rgb(82, 82, 91)",
                        }}
                        transition={transitions.spring}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-[10px] font-medium"
                      >
                        {node.label}
                      </motion.text>
                    )}
                  </motion.g>
                );
              })}
            </AnimatePresence>
          </svg>
        )}
      </div>

      {/* Array representation debajo del árbol */}
      {items.length > 0 && (
        <div className="flex w-full max-w-2xl flex-col items-center gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            representación como array (BFS)
          </span>
          <div className="flex flex-wrap items-center justify-center gap-1">
            {items.map((it, i) => {
              const isRoot = i === 0;
              const isCursor = cursorId === it.id;
              return (
                <motion.div
                  key={`arr-${it.id}`}
                  layout={!reduced}
                  className={[
                    "flex flex-col items-center rounded border px-2 py-1 font-mono text-xs",
                    isCursor
                      ? "border-amber-400 bg-amber-50 dark:border-amber-500/70 dark:bg-amber-950/40"
                      : isRoot
                        ? "border-rose-300 bg-rose-50 dark:border-rose-500/50 dark:bg-rose-950/30"
                        : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900",
                  ].join(" ")}
                  transition={transitions.spring}
                >
                  <span className="text-[8px] text-zinc-400">[{i}]</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {it.key}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Tag({
  tone,
  icon,
  label,
}: {
  tone: "amber" | "emerald" | "rose";
  icon: React.ReactNode;
  label: string;
}) {
  const styles =
    tone === "amber"
      ? "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-500/70 dark:bg-amber-950/40 dark:text-amber-200"
      : tone === "emerald"
        ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-500/70 dark:bg-emerald-950/40 dark:text-emerald-200"
        : "border-rose-400 bg-rose-50 text-rose-700 dark:border-rose-500/70 dark:bg-rose-950/40 dark:text-rose-200";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={transitions.snappy}
      className={[
        "flex items-center gap-1.5 rounded-md border-2 px-2.5 py-1 text-xs font-semibold",
        styles,
      ].join(" ")}
    >
      {icon}
      {label}
    </motion.div>
  );
}
