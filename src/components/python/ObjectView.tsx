"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Terminal } from "lucide-react";
import { transitions } from "@/lib/transitions";

export type ObjectState = {
  /** Cadena de herencia, de padre (arriba) a hijo (abajo). */
  chain?: { name: string; parent?: string }[];
  /** Instancias creadas. */
  instances?: {
    name: string;
    className: string;
    attrs: { k: string; v: string }[];
    active?: boolean;
  }[];
  output: string[];
  caption?: string;
};

/**
 * Visualización para POO: la cadena de clases (herencia) y las instancias como
 * tarjetas con sus atributos, más la consola.
 */
export function ObjectView({ state }: { state: ObjectState }) {
  const reduced = useReducedMotion();
  const { chain, instances, output, caption } = state;

  return (
    <div className="flex w-full max-w-2xl flex-col gap-5">
      {caption && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{caption}</p>
      )}

      {chain && chain.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Clases
          </p>
          <div className="flex flex-col items-start gap-1">
            <AnimatePresence initial={false}>
              {chain.map((c, i) => (
                <motion.div
                  key={c.name}
                  initial={{ opacity: 0, y: reduced ? 0 : -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={transitions.spring}
                  className="flex flex-col items-start gap-1"
                >
                  {i > 0 && (
                    <ArrowDown className="ml-3 h-4 w-4 text-zinc-400" />
                  )}
                  <div className="rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1.5 font-mono text-sm font-semibold text-indigo-800 dark:border-indigo-500/50 dark:bg-indigo-950/40 dark:text-indigo-200">
                    {c.name}
                    {c.parent && (
                      <span className="ml-1.5 text-xs font-normal text-indigo-500 dark:text-indigo-400">
                        (hereda de {c.parent})
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {instances && instances.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Instancias
          </p>
          <div className="flex flex-wrap gap-3">
            <AnimatePresence initial={false} mode="popLayout">
              {instances.map((inst) => (
                <motion.div
                  key={inst.name}
                  layout={!reduced}
                  initial={{ opacity: 0, scale: reduced ? 1 : 0.85 }}
                  animate={{ opacity: 1, scale: inst.active ? 1.03 : 1 }}
                  exit={{ opacity: 0 }}
                  transition={transitions.spring}
                  className={[
                    "min-w-[11rem] overflow-hidden rounded-lg border",
                    inst.active
                      ? "border-amber-400 ring-2 ring-amber-400/30"
                      : "border-zinc-200 dark:border-zinc-800",
                  ].join(" ")}
                >
                  <div className="border-b border-zinc-200 bg-zinc-100 px-3 py-1.5 font-mono text-sm dark:border-zinc-800 dark:bg-zinc-800">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {inst.name}
                    </span>
                    <span className="text-zinc-500"> : {inst.className}</span>
                  </div>
                  <div className="flex flex-col gap-1 bg-white p-3 dark:bg-zinc-900">
                    {inst.attrs.map((a) => (
                      <div key={a.k} className="font-mono text-xs">
                        <span className="text-sky-600 dark:text-sky-400">
                          {a.k}
                        </span>
                        <span className="text-zinc-400"> = </span>
                        <span className="text-zinc-800 dark:text-zinc-200">
                          {a.v}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
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
