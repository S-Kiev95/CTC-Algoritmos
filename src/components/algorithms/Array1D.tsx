"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Check, X } from "lucide-react";
import { transitions } from "@/lib/transitions";
import type { Array1DState } from "@/lib/algorithms/arrays/types";

type Props = {
  state: Array1DState;
};

/**
 * Visualización de un arreglo 1D: celdas con índice arriba y valor adentro.
 * Un puntero animado se desliza sobre el cursor actual.
 * Cuando se encuentra el target, esa celda se ilumina verde.
 */
export function Array1D({ state }: Props) {
  const reduced = useReducedMotion();
  const { values, cursor, target, found, exhausted } = state;

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-6">
      {target !== undefined && (
        <div className="flex items-center gap-3 rounded-lg bg-zinc-100 px-4 py-2 text-sm dark:bg-zinc-800">
          <span className="text-zinc-500">Buscando</span>
          <span className="font-mono text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {target}
          </span>
          {found !== undefined && (
            <span className="ml-2 flex items-center gap-1.5 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Check className="h-3.5 w-3.5" />
              en índice {found}
            </span>
          )}
          {exhausted && (
            <span className="ml-2 flex items-center gap-1.5 rounded-md bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              <X className="h-3.5 w-3.5" />
              no está
            </span>
          )}
        </div>
      )}

      <div className="relative">
        {/* Puntero arriba de la celda activa */}
        {cursor !== null && cursor !== undefined && (
          <motion.div
            layout={!reduced}
            initial={false}
            animate={{
              x: cursor * 64,
            }}
            transition={transitions.spring}
            className="absolute -top-9 left-0 flex w-16 flex-col items-center"
          >
            <span className="font-mono text-xs font-semibold text-amber-600 dark:text-amber-400">
              i = {cursor}
            </span>
            <ArrowDown className="h-4 w-4 text-amber-500" />
          </motion.div>
        )}

        <div className="flex">
          {values.map((value, i) => {
            const isCursor = cursor === i;
            const isFound = found === i;
            return (
              <div key={i} className="flex w-16 flex-col items-center">
                <motion.div
                  layout={!reduced}
                  animate={{
                    scale: isCursor || isFound ? 1.08 : 1,
                  }}
                  transition={transitions.spring}
                  className={[
                    "flex h-16 w-16 items-center justify-center border font-mono text-lg font-semibold transition-colors",
                    i === 0 ? "rounded-l-lg" : "",
                    i === values.length - 1 ? "rounded-r-lg" : "",
                    i > 0 ? "border-l-0" : "",
                    isFound
                      ? "border-emerald-400 bg-emerald-100 text-emerald-900 dark:border-emerald-500/60 dark:bg-emerald-950/60 dark:text-emerald-100"
                      : isCursor
                        ? "border-amber-400 bg-amber-100 text-amber-900 ring-2 ring-amber-400/30 dark:border-amber-500/60 dark:bg-amber-950/40 dark:text-amber-100"
                        : "border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100",
                  ].join(" ")}
                >
                  {value}
                </motion.div>
                <span className="mt-1.5 font-mono text-xs text-zinc-400">
                  {i}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-zinc-500">
        Cada celda ocupa un espacio en memoria contigua. Acceder por índice es{" "}
        <span className="font-mono text-zinc-700 dark:text-zinc-300">O(1)</span>
        .
      </p>
    </div>
  );
}
