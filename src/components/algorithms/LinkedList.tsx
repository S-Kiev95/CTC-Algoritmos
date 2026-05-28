"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { transitions } from "@/lib/transitions";
import type { LinkedListState } from "@/lib/algorithms/linked-list/types";

type Props = {
  state: LinkedListState;
};

/**
 * Cadena horizontal de nodos para visualizar listas enlazadas simples.
 *
 * Cada nodo es un motion.div con `layout`, por lo que al insertar o
 * eliminar elementos del array, el resto se reacomoda con una transición
 * suave. AnimatePresence se encarga de entradas/salidas.
 *
 * Las "variables" (actual, anterior...) se dibujan como etiquetas con
 * flecha sobre el nodo al que apuntan, y se mueven con `layoutId` para
 * que el salto entre nodos se anime en lugar de "teletransportar".
 */
export function LinkedList({ state }: Props) {
  const reduced = useReducedMotion();
  const { nodes, cursor, newNodeId, removingId, variables } = state;

  // Agrupar variables por nodo destino para apilar varias etiquetas si hace falta.
  const variablesByNode = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const v of variables ?? []) {
      const key = v.nodeId ?? "__null__";
      (map[key] ??= []).push(v.name);
    }
    return map;
  }, [variables]);

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-6">
      <div className="flex min-h-[120px] items-center gap-2">
        {/* head label */}
        <div className="flex flex-col items-center gap-1">
          <span className="rounded-md bg-zinc-900 px-2 py-1 font-mono text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
            head
          </span>
          <ArrowRight className="h-4 w-4 text-zinc-400" />
        </div>

        <AnimatePresence initial={false} mode="popLayout">
          {nodes.map((node, i) => {
            const isCursor = cursor === node.id;
            const isNew = newNodeId === node.id;
            const isRemoving = removingId === node.id;
            const isLast = i === nodes.length - 1;
            const labels = variablesByNode[node.id] ?? [];

            return (
              <motion.div
                key={node.id}
                layout={!reduced}
                initial={
                  reduced
                    ? false
                    : { opacity: 0, y: -28, scale: 0.7 }
                }
                animate={{
                  opacity: isRemoving ? 0.45 : 1,
                  y: 0,
                  scale: isCursor || isNew ? 1.05 : 1,
                }}
                exit={
                  reduced
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.4, y: 24 }
                }
                transition={transitions.spring}
                className="relative flex items-center gap-2"
              >
                {/* Variables apuntando a este nodo */}
                {labels.length > 0 && (
                  <div className="absolute -top-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-0.5">
                    {labels.map((name) => (
                      <span
                        key={name}
                        className="rounded bg-sky-100 px-1.5 py-0.5 font-mono text-[11px] font-medium text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
                      >
                        {name} ↓
                      </span>
                    ))}
                  </div>
                )}

                {/* "nuevo" badge */}
                {isNew && (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={transitions.springBouncy}
                    className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-emerald-500 px-1.5 py-0.5 font-mono text-[10px] font-medium text-white"
                  >
                    nuevo
                  </motion.span>
                )}

                {/* Caja del nodo */}
                <div
                  className={[
                    "flex h-14 min-w-14 items-center justify-center rounded-lg border-2 px-3 font-mono text-lg font-semibold transition-colors",
                    isRemoving
                      ? "border-rose-400 bg-rose-50 text-rose-700 line-through dark:border-rose-500/60 dark:bg-rose-950/40 dark:text-rose-300"
                      : isNew
                        ? "border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-500/60 dark:bg-emerald-950/40 dark:text-emerald-100"
                        : isCursor
                          ? "border-amber-400 bg-amber-50 text-amber-900 ring-2 ring-amber-400/30 dark:border-amber-500/60 dark:bg-amber-950/40 dark:text-amber-100"
                          : "border-zinc-200 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100",
                  ].join(" ")}
                >
                  {node.value}
                </div>

                {/* Flecha hacia el siguiente */}
                <ArrowRight
                  className={[
                    "h-4 w-4 transition-colors",
                    !isLast && removingId === nodes[i + 1]?.id
                      ? "text-rose-400"
                      : "text-zinc-400",
                  ].join(" ")}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Sentinel null */}
        <div className="flex flex-col items-center gap-1">
          {variablesByNode["__null__"]?.map((name) => (
            <span
              key={name}
              className="absolute -translate-y-10 rounded bg-sky-100 px-1.5 py-0.5 font-mono text-[11px] font-medium text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
            >
              {name} ↓
            </span>
          ))}
          <span className="rounded-md border border-dashed border-zinc-300 px-2 py-1 font-mono text-xs text-zinc-500 dark:border-zinc-700">
            None
          </span>
        </div>
      </div>

      <p className="max-w-prose text-center text-xs text-zinc-500">
        Cada nodo almacena un valor y una referencia (
        <span className="font-mono">.siguiente</span>) al siguiente. La lista
        termina cuando un nodo apunta a <span className="font-mono">None</span>.
      </p>
    </div>
  );
}
