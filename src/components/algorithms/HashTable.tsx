"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, Hash, Search, X } from "lucide-react";
import { transitions } from "@/lib/transitions";
import type { HashTableState } from "@/lib/algorithms/hash-table/types";

type Props = {
  state: HashTableState;
};

/**
 * Tabla hash dibujada como tabla "de verdad": columna de índices a la
 * izquierda y columna de contenido del bucket a la derecha, con filas
 * separadas por bordes. En chaining, los chains se extienden
 * horizontalmente dentro de la fila correspondiente.
 *
 * El "pending entry" se renderiza arriba con la misma `layoutId` que
 * tendrá su réplica dentro del bucket — Framer Motion se encarga del vuelo
 * cruzando el espacio de la tabla.
 */
export function HashTable({ state }: Props) {
  const reduced = useReducedMotion();
  const {
    size,
    mode,
    buckets,
    pendingEntry,
    hashBreakdown,
    targetBucket,
    probeBucket,
    probedBuckets,
    placedAt,
    comparingEntryId,
    foundEntryId,
    notFound,
  } = state;

  const probedSet = new Set(probedBuckets ?? []);

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-5">
      {/* Cabecera: pending entry + cálculo del hash */}
      <div className="flex min-h-[120px] flex-col items-center justify-end gap-2">
        <AnimatePresence mode="popLayout">
          {pendingEntry && (
            <motion.div
              key={pendingEntry.id}
              layoutId={`entry-${pendingEntry.id}`}
              initial={reduced ? false : { opacity: 0, y: -20, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
              transition={transitions.spring}
              className="flex items-baseline gap-1.5 rounded-lg border-2 border-emerald-400 bg-emerald-50 px-3 py-1.5 font-mono text-sm shadow-sm dark:border-emerald-500/60 dark:bg-emerald-950/40"
            >
              <span className="font-semibold text-emerald-900 dark:text-emerald-100">
                {pendingEntry.key}
              </span>
              <span className="text-emerald-500">→</span>
              <span className="text-emerald-700 dark:text-emerald-200">
                {pendingEntry.value}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {hashBreakdown && (
          <motion.div
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-0.5"
          >
            <div className="flex items-center gap-1.5 font-mono text-xs text-zinc-500">
              <Hash className="h-3 w-3" />
              {hashBreakdown}
            </div>
            {targetBucket !== undefined && (
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <ArrowDown className="h-3 w-3 text-amber-500" />
                <span>
                  bucket{" "}
                  <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                    [{targetBucket}]
                  </span>
                </span>
              </div>
            )}
          </motion.div>
        )}

        {notFound && (
          <div className="flex items-center gap-1.5 rounded-md bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
            <X className="h-3.5 w-3.5" />
            no encontrado
          </div>
        )}
        {foundEntryId && (
          <div className="flex items-center gap-1.5 rounded-md bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <Search className="h-3.5 w-3.5" />
            encontrado
          </div>
        )}
      </div>

      {/* Tabla en formato vertical */}
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-zinc-300 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        {/* Encabezado de columnas */}
        <div className="grid grid-cols-[3.5rem_1fr] border-b border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/60">
          <div className="border-r border-zinc-300 px-3 py-1.5 text-center font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-700">
            índice
          </div>
          <div className="px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            {mode === "chaining" ? "chain" : "slot"}
          </div>
        </div>

        {/* Filas (una por bucket) */}
        {Array.from({ length: size }).map((_, i) => {
          const isTarget = targetBucket === i;
          const isProbe = probeBucket === i;
          const wasProbed = probedSet.has(i);
          const justPlaced = placedAt === i;
          const isLast = i === size - 1;

          return (
            <motion.div
              key={i}
              layout={!reduced}
              transition={transitions.spring}
              className={[
                "grid grid-cols-[3.5rem_1fr] transition-colors",
                !isLast && "border-b border-zinc-200 dark:border-zinc-800",
                wasProbed
                  ? "bg-rose-50/70 dark:bg-rose-950/30"
                  : isProbe
                    ? "bg-amber-50 dark:bg-amber-950/40"
                    : isTarget
                      ? "bg-amber-50/60 dark:bg-amber-950/20"
                      : justPlaced
                        ? "bg-emerald-50 dark:bg-emerald-950/30"
                        : "bg-white dark:bg-zinc-900",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* Columna de índice */}
              <div
                className={[
                  "flex items-center justify-center border-r font-mono text-sm font-semibold transition-colors",
                  isProbe || isTarget
                    ? "border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-700/50 dark:bg-amber-900/40 dark:text-amber-100"
                    : wasProbed
                      ? "border-rose-300 bg-rose-100 text-rose-800 dark:border-rose-700/50 dark:bg-rose-900/40 dark:text-rose-200"
                      : justPlaced
                        ? "border-emerald-300 bg-emerald-100 text-emerald-900 dark:border-emerald-700/50 dark:bg-emerald-900/40 dark:text-emerald-100"
                        : "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/30 dark:text-zinc-400",
                ].join(" ")}
              >
                [{i}]
              </div>

              {/* Columna de contenido */}
              <div className="flex min-h-12 items-center gap-1.5 px-2 py-1.5">
                <AnimatePresence initial={false}>
                  {buckets[i]?.map((entry, idx) => {
                    const isComparing = comparingEntryId === entry.id;
                    const isFound = foundEntryId === entry.id;
                    return (
                      <motion.div
                        key={entry.id}
                        layoutId={`entry-${entry.id}`}
                        layout={!reduced}
                        initial={
                          reduced
                            ? false
                            : { opacity: 0, scale: 0.6, x: -16 }
                        }
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={
                          reduced ? { opacity: 0 } : { opacity: 0, scale: 0.4 }
                        }
                        transition={transitions.spring}
                        className="flex items-center gap-1.5"
                      >
                        <div
                          className={[
                            "flex items-baseline gap-1 rounded-md border px-2 py-1 font-mono text-[12px] leading-tight transition-colors",
                            isFound
                              ? "border-emerald-400 bg-emerald-100 text-emerald-900 ring-2 ring-emerald-400/40 dark:border-emerald-500/60 dark:bg-emerald-950/60 dark:text-emerald-100"
                              : isComparing
                                ? "border-amber-400 bg-amber-100 text-amber-900 ring-2 ring-amber-400/40 dark:border-amber-500/60 dark:bg-amber-950/40 dark:text-amber-100"
                                : "border-zinc-300 bg-white text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200",
                          ].join(" ")}
                        >
                          <span className="font-semibold">{entry.key}</span>
                          <span className="text-zinc-400">:</span>
                          <span className="text-zinc-600 dark:text-zinc-300">
                            {entry.value}
                          </span>
                        </div>
                        {mode === "chaining" && idx < buckets[i].length - 1 && (
                          <ArrowRight className="h-3 w-3 shrink-0 text-zinc-400" />
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {buckets[i]?.length === 0 && (
                  <span className="font-mono text-xs italic text-zinc-400">
                    —
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-zinc-500">
        <Legend color="amber" label="objetivo / sondeo actual" />
        {mode === "openAddressing" && (
          <Legend color="rose" label="sondeado, estaba ocupado" />
        )}
        <Legend color="emerald" label="recién colocado / encontrado" />
        <span className="ml-auto font-mono text-zinc-400">
          {mode === "chaining" ? "encadenamiento" : "sondeo lineal"}
        </span>
      </div>
    </div>
  );
}

function Legend({
  color,
  label,
}: {
  color: "amber" | "rose" | "emerald";
  label: string;
}) {
  const cls =
    color === "amber"
      ? "bg-amber-400"
      : color === "rose"
        ? "bg-rose-400"
        : "bg-emerald-400";
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-sm ${cls}`} />
      {label}
    </span>
  );
}
