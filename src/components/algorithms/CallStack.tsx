"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Layers } from "lucide-react";
import { transitions } from "@/lib/transitions";
import type { RecursionState } from "@/lib/algorithms/recursion/types";

type Props = {
  state: RecursionState;
  /** Etiqueta que se muestra arriba de la pila */
  label?: string;
};

/**
 * Visualización animada de una pila de llamadas recursivas.
 *
 * Convenciones visuales:
 * - El primer frame (índice 0) se dibuja arriba, los nuevos se apilan abajo.
 * - El frame "active" (top of stack) tiene un borde acentuado.
 * - "waiting" se muestra atenuado (espera el retorno de su hijo).
 * - "returning" se ilumina en verde con su valor de retorno antes de pop.
 *
 * Cada frame tiene un id estable, así AnimatePresence + layout pueden hacer
 * transiciones suaves sin "saltos" cuando se apila o desapila.
 */
export function CallStack({ state, label = "Pila de llamadas" }: Props) {
  const reduced = useReducedMotion();
  const { stack, finalResult } = state;

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        <Layers className="h-3.5 w-3.5" />
        <span>{label}</span>
        <span className="ml-auto font-mono normal-case tracking-normal text-zinc-400">
          profundidad: {stack.length}
        </span>
      </div>

      <motion.div
        layout={!reduced}
        transition={transitions.spring}
        className="flex min-h-[120px] flex-col gap-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900/40"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {stack.map((frame, i) => {
            const isTop = i === stack.length - 1;
            return (
              <motion.div
                key={frame.id}
                layout={!reduced}
                initial={reduced ? false : { opacity: 0, y: -18, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.94 }}
                transition={transitions.spring}
                className={[
                  "relative flex items-center justify-between rounded-lg border px-4 py-3 font-mono text-sm shadow-sm",
                  frame.status === "returning"
                    ? "border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-500/60 dark:bg-emerald-950/60 dark:text-emerald-100"
                    : frame.status === "active"
                      ? "border-amber-400 bg-amber-50 text-amber-900 ring-2 ring-amber-400/30 dark:border-amber-500/60 dark:bg-amber-950/40 dark:text-amber-100"
                      : "border-zinc-200 bg-white text-zinc-500 opacity-70 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">#{i}</span>
                  <span>
                    {frame.fn}({frame.args.join(", ")})
                  </span>
                </div>
                {frame.returnValue !== undefined ? (
                  <span className="font-semibold">→ {frame.returnValue}</span>
                ) : (
                  <span className="text-xs uppercase tracking-wider text-zinc-400">
                    {frame.status === "waiting" ? "esperando" : "ejecutando"}
                  </span>
                )}
                {isTop && frame.status !== "returning" && (
                  <motion.div
                    layoutId="top-indicator"
                    className="absolute -left-1.5 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-amber-400"
                    transition={transitions.springStiff}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {stack.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-6 text-center">
            {finalResult !== undefined ? (
              <>
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  Resultado final
                </p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={transitions.springBouncy}
                  className="font-mono text-3xl font-semibold text-emerald-600 dark:text-emerald-400"
                >
                  {finalResult}
                </motion.p>
              </>
            ) : (
              <p className="text-sm text-zinc-500">Pila vacía</p>
            )}
          </div>
        )}
      </motion.div>

      {stack.length > 1 && (
        <div className="flex items-center justify-center text-xs text-zinc-400">
          <ArrowDown className="h-3 w-3" />
          <span className="ml-1">crece hacia abajo</span>
        </div>
      )}
    </div>
  );
}
