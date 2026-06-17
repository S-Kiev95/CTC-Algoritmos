"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Terminal, X } from "lucide-react";
import { transitions } from "@/lib/transitions";

export type FlowState = {
  /** Condición evaluada en este paso (if / while). */
  condition?: { label: string; value: boolean } | null;
  /** Iterable que se recorre (for). */
  items?: string[];
  /** Índice resaltado dentro de `items`. */
  cursor?: number | null;
  /** Índice salteado por `continue` (se atenúa). */
  skipped?: number | null;
  /** Variables en juego (i, contador, fruta…). */
  vars?: { name: string; value: string }[];
  /** Salida acumulada. */
  output: string[];
};

/**
 * Visualización para control de flujo: una badge de condición (True/False),
 * una tira con el iterable y el cursor actual, chips de variables y la consola.
 * Cada parte es opcional según lo que tenga el paso.
 */
export function FlowView({ state }: { state: FlowState }) {
  const reduced = useReducedMotion();
  const { condition, items, cursor, skipped, vars, output } = state;

  return (
    <div className="flex w-full max-w-2xl flex-col gap-5">
      {vars && vars.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {vars.map((v) => (
            <motion.span
              key={v.name}
              layout={!reduced}
              transition={transitions.snappy}
              className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 font-mono text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              {v.name} = <span className="font-semibold">{v.value}</span>
            </motion.span>
          ))}
        </div>
      )}

      {condition && (
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-zinc-600 dark:text-zinc-400">
            {condition.label}
          </span>
          <motion.span
            key={`${condition.label}-${condition.value}`}
            initial={{ scale: reduced ? 1 : 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={transitions.springBouncy}
            className={[
              "flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
              condition.value
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
            ].join(" ")}
          >
            {condition.value ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
            {condition.value ? "True" : "False"}
          </motion.span>
        </div>
      )}

      {items && items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => {
            const isCursor = cursor === i;
            const isSkipped = skipped === i;
            return (
              <motion.div
                key={`${i}-${item}`}
                layout={!reduced}
                animate={{ scale: isCursor ? 1.06 : 1 }}
                transition={transitions.spring}
                className={[
                  "rounded-lg border px-3 py-2 font-mono text-sm transition-colors",
                  isCursor
                    ? "border-amber-400 bg-amber-100 text-amber-900 ring-2 ring-amber-400/30 dark:border-amber-500/60 dark:bg-amber-950/40 dark:text-amber-100"
                    : isSkipped
                      ? "border-zinc-200 bg-zinc-50 text-zinc-400 line-through dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-600"
                      : "border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300",
                ].join(" ")}
              >
                {item}
              </motion.div>
            );
          })}
        </div>
      )}

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          <Terminal className="h-3.5 w-3.5" />
          Consola
        </p>
        <div className="min-h-[3.5rem] rounded-lg border border-zinc-800 bg-zinc-950 p-3 font-mono text-sm text-zinc-100">
          {output.length === 0 ? (
            <span className="text-zinc-600">— sin salida todavía —</span>
          ) : (
            <AnimatePresence initial={false}>
              {output.map((line, i) => (
                <motion.div
                  key={`${i}-${line}`}
                  initial={{ opacity: 0, x: reduced ? 0 : -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={transitions.smooth}
                >
                  {line}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
