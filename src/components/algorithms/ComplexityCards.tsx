"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Clock } from "lucide-react";
import {
  COMPLEXITIES,
  formatOps,
  formatTime,
  type ComplexityKey,
} from "@/lib/algorithms/big-o/complexities";
import { transitions } from "@/lib/transitions";

type Props = {
  n: number;
  enabled?: Set<ComplexityKey>;
};

/**
 * Grilla de tarjetas, una por clase de complejidad, mostrando para el `n`
 * actual cuántas operaciones requiere y cuánto tiempo tomaría a 1 GHz.
 *
 * El segundo número es el que más impacta: en O(2ⁿ) con n=64 ya supera la
 * edad del universo. Ese contraste es el corazón pedagógico del tema.
 */
export function ComplexityCards({ n, enabled }: Props) {
  const reduced = useReducedMotion();

  return (
    <div className="grid w-full max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {COMPLEXITIES.filter((c) => !enabled || enabled.has(c.key)).map((c) => {
        const ops = c.fn(n);
        const opsStr = formatOps(ops);
        const timeStr = formatTime(ops);

        return (
          <motion.div
            key={c.key}
            layout={!reduced}
            transition={transitions.spring}
            className="overflow-hidden rounded-xl border bg-white dark:bg-zinc-900"
            style={{ borderColor: c.color + "60" }}
          >
            {/* Header con label y nombre */}
            <div
              className="flex items-baseline justify-between gap-2 px-4 py-2.5"
              style={{ backgroundColor: c.colorSoft }}
            >
              <div>
                <p className="font-mono text-sm font-bold" style={{ color: c.color }}>
                  {c.label}
                </p>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  {c.name}
                </p>
              </div>
              <div
                className="h-2 w-12 shrink-0 rounded-full"
                style={{ backgroundColor: c.color }}
              />
            </div>

            {/* Métricas */}
            <div className="px-4 py-3">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Operaciones
                </span>
                <motion.span
                  key={`ops-${c.key}-${n}`}
                  initial={reduced ? false : { opacity: 0.4, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={transitions.snappy}
                  className="break-all font-mono text-base font-semibold tabular-nums text-zinc-900 dark:text-zinc-100"
                >
                  {opsStr}
                </motion.span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  <Clock className="h-3 w-3" />
                  A 1 GHz
                </span>
                <motion.span
                  key={`time-${c.key}-${n}`}
                  initial={reduced ? false : { opacity: 0.4, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={transitions.snappy}
                  className="break-all font-mono text-sm tabular-nums text-zinc-700 dark:text-zinc-300"
                >
                  {timeStr}
                </motion.span>
              </div>
            </div>

            {/* Ejemplos */}
            <div className="border-t border-zinc-200 px-4 py-2 dark:border-zinc-800">
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Ejemplos
              </p>
              <ul className="text-[12px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                {c.examples.map((ex, i) => (
                  <li key={i}>• {ex}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
