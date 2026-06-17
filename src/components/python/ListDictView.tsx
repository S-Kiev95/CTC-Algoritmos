"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Terminal } from "lucide-react";
import { transitions } from "@/lib/transitions";

export type ListCellState = {
  values: string[];
  /** Índices resaltados (acceso/slicing). */
  highlight?: number[];
  /** Índice con "puntero" (recorrido). */
  cursor?: number | null;
  label?: string;
};

export type ListDictState = {
  /** Lista de origen (ej. la que recorre una comprehension). */
  source?: ListCellState;
  /** Lista principal / resultado. */
  list?: ListCellState;
  /** Diccionario como filas clave → valor. */
  dict?: { key: string; value: string; active?: boolean }[];
  output: string[];
  caption?: string;
};

function ListStrip({ data }: { data: ListCellState }) {
  const reduced = useReducedMotion();
  const highlight = new Set(data.highlight ?? []);
  return (
    <div>
      {data.label && (
        <p className="mb-1.5 font-mono text-xs text-zinc-500">{data.label}</p>
      )}
      <div className="flex flex-wrap gap-1.5">
        <AnimatePresence mode="popLayout" initial={false}>
          {data.values.map((v, i) => {
            const isCursor = data.cursor === i;
            const isHi = highlight.has(i);
            return (
              <motion.div
                key={`${i}-${v}`}
                layout={!reduced}
                initial={{ opacity: 0, scale: reduced ? 1 : 0.8 }}
                animate={{ opacity: 1, scale: isCursor ? 1.08 : 1 }}
                exit={{ opacity: 0, scale: reduced ? 1 : 0.8 }}
                transition={transitions.spring}
                className="flex flex-col items-center"
              >
                <div
                  className={[
                    "flex h-12 w-12 items-center justify-center rounded-lg border font-mono text-base font-semibold",
                    isCursor
                      ? "border-amber-400 bg-amber-100 text-amber-900 ring-2 ring-amber-400/30 dark:border-amber-500/60 dark:bg-amber-950/40 dark:text-amber-100"
                      : isHi
                        ? "border-emerald-400 bg-emerald-100 text-emerald-900 dark:border-emerald-500/60 dark:bg-emerald-950/50 dark:text-emerald-100"
                        : "border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100",
                  ].join(" ")}
                >
                  {v}
                </div>
                <span className="mt-1 font-mono text-[10px] text-zinc-400">
                  {i}
                </span>
              </motion.div>
            );
          })}
          {data.values.length === 0 && (
            <span className="font-mono text-sm text-zinc-400">[]</span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Visualización para listas y diccionarios: tiras de celdas (con índice) para
 * listas, filas clave→valor para diccionarios, y la consola. Soporta una lista
 * de origen + una resultado para animar las comprehensions.
 */
export function ListDictView({ state }: { state: ListDictState }) {
  const reduced = useReducedMotion();
  const { source, list, dict, output, caption } = state;

  return (
    <div className="flex w-full max-w-2xl flex-col gap-5">
      {caption && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{caption}</p>
      )}

      {source && <ListStrip data={source} />}
      {list && <ListStrip data={list} />}

      {dict && dict.length > 0 && (
        <div>
          <p className="mb-1.5 font-mono text-xs text-zinc-500">dict</p>
          <div className="flex flex-col gap-1.5">
            <AnimatePresence initial={false} mode="popLayout">
              {dict.map((row) => (
                <motion.div
                  key={row.key}
                  layout={!reduced}
                  initial={{ opacity: 0, x: reduced ? 0 : -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={transitions.spring}
                  className={[
                    "flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-sm",
                    row.active
                      ? "border-amber-400 bg-amber-50 dark:border-amber-500/60 dark:bg-amber-950/30"
                      : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
                  ].join(" ")}
                >
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {row.key}
                  </span>
                  <span className="text-zinc-400">:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                    {row.value}
                  </span>
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
