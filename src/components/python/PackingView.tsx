"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Terminal } from "lucide-react";
import { transitions } from "@/lib/transitions";

export type PackingState = {
  /** Llamada que se está analizando. */
  call?: string;
  /** Posicionales empaquetados por *args (tupla). */
  argsTuple?: string[];
  /** Nombrados empaquetados por **kwargs (dict). */
  kwargsDict?: { k: string; v: string }[];
  /** Fase del wrapper de un decorador. */
  decorator?: { phase: "before" | "call" | "after" };
  output: string[];
  result?: string;
  caption?: string;
};

const PHASES: { id: "before" | "call" | "after"; label: string }[] = [
  { id: "before", label: 'print("antes")' },
  { id: "call", label: "func(*args, **kwargs)" },
  { id: "after", label: 'print("despues")' },
];

export function PackingView({ state }: { state: PackingState }) {
  const reduced = useReducedMotion();
  const { call, argsTuple, kwargsDict, decorator, output, result, caption } =
    state;

  return (
    <div className="flex w-full max-w-2xl flex-col gap-5">
      {caption && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{caption}</p>
      )}

      {call && (
        <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono text-sm text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
          {call}
        </div>
      )}

      {argsTuple && (
        <div>
          <p className="mb-1.5 font-mono text-xs text-zinc-500">
            *args → tupla
          </p>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-zinc-400">(</span>
            <AnimatePresence initial={false} mode="popLayout">
              {argsTuple.map((v, i) => (
                <motion.span
                  key={`${i}-${v}`}
                  layout={!reduced}
                  initial={{ opacity: 0, scale: reduced ? 1 : 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={transitions.spring}
                  className="rounded-md border border-sky-300 bg-sky-50 px-2.5 py-1 font-mono text-sm text-sky-800 dark:border-sky-500/50 dark:bg-sky-950/40 dark:text-sky-200"
                >
                  {v}
                </motion.span>
              ))}
            </AnimatePresence>
            <span className="font-mono text-zinc-400">)</span>
          </div>
        </div>
      )}

      {kwargsDict && (
        <div>
          <p className="mb-1.5 font-mono text-xs text-zinc-500">
            **kwargs → dict
          </p>
          <div className="flex flex-wrap gap-1.5">
            <AnimatePresence initial={false} mode="popLayout">
              {kwargsDict.map((row) => (
                <motion.span
                  key={row.k}
                  layout={!reduced}
                  initial={{ opacity: 0, scale: reduced ? 1 : 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={transitions.spring}
                  className="rounded-md border border-violet-300 bg-violet-50 px-2.5 py-1 font-mono text-sm text-violet-800 dark:border-violet-500/50 dark:bg-violet-950/40 dark:text-violet-200"
                >
                  {row.k}: {row.v}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {decorator && (
        <div>
          <p className="mb-1.5 font-mono text-xs text-zinc-500">
            envoltura(...)
          </p>
          <div className="flex flex-col gap-1.5 rounded-xl border-2 border-dashed border-amber-300 p-3 dark:border-amber-500/40">
            {PHASES.map((p) => {
              const isActive = decorator.phase === p.id;
              return (
                <motion.div
                  key={p.id}
                  animate={{ scale: isActive ? 1.02 : 1 }}
                  transition={transitions.snappy}
                  className={[
                    "rounded-md px-3 py-1.5 font-mono text-sm transition-colors",
                    isActive
                      ? "bg-amber-100 text-amber-900 ring-1 ring-amber-400/40 dark:bg-amber-950/40 dark:text-amber-100"
                      : "text-zinc-500 dark:text-zinc-400",
                    p.id === "call"
                      ? "border border-zinc-200 dark:border-zinc-700"
                      : "",
                  ].join(" ")}
                >
                  {p.label}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {result && (
        <div className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
          resultado:{" "}
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {result}
          </span>
        </div>
      )}

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
