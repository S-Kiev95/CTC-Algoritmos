"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Terminal } from "lucide-react";
import { transitions } from "@/lib/transitions";
import type { VariablesState } from "@/lib/python/variablesTipos";

/** Color del badge de tipo según el tipo de Python. */
const TYPE_STYLES: Record<string, string> = {
  int: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  float: "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
  str: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  bool: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
};

/**
 * "Memoria" de variables: cada variable es una caja con nombre, badge de tipo
 * y valor. Las nuevas entran animadas y la modificada en este paso se resalta.
 * Debajo, una consola con la salida acumulada de los print().
 */
export function VariablesView({ state }: { state: VariablesState }) {
  const reduced = useReducedMotion();
  const { vars, active, output } = state;

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Memoria
        </p>
        <div className="flex flex-wrap gap-3">
          <AnimatePresence mode="popLayout">
            {vars.map((v) => {
              const isActive = v.name === active;
              return (
                <motion.div
                  key={v.name}
                  layout={!reduced}
                  initial={{ opacity: 0, scale: reduced ? 1 : 0.8, y: reduced ? 0 : 8 }}
                  animate={{
                    opacity: 1,
                    scale: isActive ? 1.04 : 1,
                    y: 0,
                  }}
                  exit={{ opacity: 0, scale: reduced ? 1 : 0.8 }}
                  transition={transitions.spring}
                  className={[
                    "flex min-w-[8.5rem] flex-col gap-1.5 rounded-lg border p-3",
                    isActive
                      ? "border-amber-400 bg-amber-50 ring-2 ring-amber-400/30 dark:border-amber-500/60 dark:bg-amber-950/30"
                      : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {v.name}
                    </span>
                    <span
                      className={[
                        "rounded px-1.5 py-0.5 font-mono text-[10px] font-medium",
                        TYPE_STYLES[v.type] ??
                          "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
                      ].join(" ")}
                    >
                      {v.type}
                    </span>
                  </div>
                  <span className="font-mono text-base text-zinc-700 dark:text-zinc-300">
                    {v.value}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Consola */}
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
