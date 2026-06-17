"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Layers, Terminal } from "lucide-react";
import { transitions } from "@/lib/transitions";

export type PyFrame = {
  id: string;
  fn: string;
  args: string[];
  returnValue?: string;
  status: "active" | "returning";
};

export type CallStackState = {
  stack: PyFrame[];
  vars?: { name: string; value: string }[];
  output: string[];
};

/**
 * Pila de llamadas para funciones (no recursivas necesariamente): cada llamada
 * agrega un frame; cuando retorna, se ilumina en verde con su valor y luego se
 * desapila. Pensada para mostrar la mecánica de llamar y retornar.
 */
export function CallStackView({ state }: { state: CallStackState }) {
  const reduced = useReducedMotion();
  const { stack, vars, output } = state;

  return (
    <div className="flex w-full max-w-xl flex-col gap-5">
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

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          <Layers className="h-3.5 w-3.5" />
          Pila de llamadas
        </p>
        <div className="flex min-h-[80px] flex-col gap-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900/40">
          <AnimatePresence initial={false} mode="popLayout">
            {stack.map((frame) => (
              <motion.div
                key={frame.id}
                layout={!reduced}
                initial={reduced ? false : { opacity: 0, y: -16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.95 }}
                transition={transitions.spring}
                className={[
                  "flex items-center justify-between rounded-lg border px-4 py-2.5 font-mono text-sm shadow-sm",
                  frame.status === "returning"
                    ? "border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-500/60 dark:bg-emerald-950/60 dark:text-emerald-100"
                    : "border-amber-400 bg-amber-50 text-amber-900 ring-2 ring-amber-400/30 dark:border-amber-500/60 dark:bg-amber-950/40 dark:text-amber-100",
                ].join(" ")}
              >
                <span>
                  {frame.fn}({frame.args.join(", ")})
                </span>
                {frame.returnValue !== undefined ? (
                  <span className="font-semibold">→ {frame.returnValue}</span>
                ) : (
                  <span className="text-xs uppercase tracking-wider text-zinc-400">
                    ejecutando
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {stack.length === 0 && (
            <p className="py-3 text-center text-sm text-zinc-400">
              Sin llamadas activas
            </p>
          )}
        </div>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          <Terminal className="h-3.5 w-3.5" />
          Consola
        </p>
        <div className="min-h-[3rem] rounded-lg border border-zinc-800 bg-zinc-950 p-3 font-mono text-sm text-zinc-100">
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
