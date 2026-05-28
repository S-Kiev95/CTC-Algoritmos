"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUp, Eye, Inbox, Terminal } from "lucide-react";
import { transitions } from "@/lib/transitions";
import type { StackState } from "@/lib/algorithms/stack/types";

type Props = {
  state: StackState;
};

/**
 * Pila vertical (LIFO). El tope visualmente arriba — los elementos nuevos
 * caen desde arriba con un spring corto; los pop salen hacia arriba.
 *
 * Etiqueta "← tope" sobre el último elemento. Una bandeja al fondo
 * representa la base de la pila para que se vea de dónde caen los items
 * incluso cuando hay pocos elementos.
 */
export function StackView({ state }: Props) {
  const reduced = useReducedMotion();
  const { items, operation, flying, newId, highlightId, returned, isEmpty } =
    state;

  // El tope es el último del array → renderizamos invertido para que
  // arriba en pantalla = tope.
  const renderItems = [...items].reverse();
  const topId = items.length > 0 ? items[items.length - 1].id : null;

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-3">
      {/* Operación actual */}
      <div className="flex min-h-[44px] items-center gap-3">
        {operation === "push" && flying && (
          <FlyingBadge
            key={`push-${flying.id}`}
            tone="emerald"
            icon={<ArrowDown className="h-3.5 w-3.5" />}
            label="push"
            value={flying.value}
          />
        )}
        {operation === "pop" && flying && (
          <FlyingBadge
            key={`pop-${flying.id}`}
            tone="rose"
            icon={<ArrowUp className="h-3.5 w-3.5" />}
            label="pop →"
            value={flying.value}
          />
        )}
        {operation === "peek" && returned !== undefined && returned !== null && (
          <FlyingBadge
            key={`peek-${returned}`}
            tone="sky"
            icon={<Eye className="h-3.5 w-3.5" />}
            label="peek"
            value={returned}
          />
        )}
        {operation === "empty-check" && returned !== undefined && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitions.snappy}
            className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold border-zinc-300 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <Inbox className="h-3.5 w-3.5" />
            esta_vacia() ={" "}
            <span
              className={
                returned === "True"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }
            >
              {String(returned)}
            </span>
          </motion.div>
        )}
      </div>

      {/* La pila */}
      <div className="relative flex w-full max-w-[260px] flex-col items-center">
        {/* Tope label */}
        <div className="mb-1 flex h-5 items-center text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          {items.length > 0 ? "↑ tope" : ""}
        </div>

        {/* Contenedor con altura mínima para que la base no salte */}
        <div className="flex w-full flex-col gap-1.5 min-h-[60px]">
          <AnimatePresence initial={false} mode="popLayout">
            {renderItems.map((it) => {
              const isTop = it.id === topId;
              const isNew = it.id === newId;
              const isHighlight = it.id === highlightId;
              return (
                <motion.div
                  key={it.id}
                  layout={!reduced}
                  initial={
                    reduced
                      ? { opacity: 0 }
                      : { opacity: 0, y: -32, scale: 0.85 }
                  }
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: isHighlight || isNew ? 1.04 : 1,
                  }}
                  exit={
                    reduced
                      ? { opacity: 0 }
                      : { opacity: 0, y: -40, scale: 0.7 }
                  }
                  transition={transitions.spring}
                  className={[
                    "flex items-center justify-between rounded-md border-2 px-3 py-2 font-mono text-sm shadow-sm",
                    isHighlight
                      ? "border-rose-400 bg-rose-50 text-rose-900 dark:border-rose-500/70 dark:bg-rose-950/40 dark:text-rose-100"
                      : isNew
                        ? "border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-500/70 dark:bg-emerald-950/40 dark:text-emerald-100"
                        : isTop
                          ? "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/60 dark:bg-amber-950/30 dark:text-amber-100"
                          : "border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200",
                  ].join(" ")}
                >
                  <span className="truncate">{it.value}</span>
                  {isTop && (
                    <span className="ml-2 shrink-0 rounded bg-amber-200/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-900 dark:bg-amber-800/50 dark:text-amber-100">
                      tope
                    </span>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Base de la pila */}
        <div className="mt-1 flex w-full items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            base
          </span>
          <div className="h-1.5 flex-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        </div>

        {isEmpty && items.length === 0 && (
          <p className="mt-3 font-mono text-xs text-zinc-400">(pila vacía)</p>
        )}
      </div>

      {/* Métricas */}
      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <span>
          tamaño = <span className="font-mono text-zinc-900 dark:text-zinc-200">{items.length}</span>
        </span>
        {returned !== undefined && (operation === "pop" || operation === "peek") && (
          <span className="flex items-center gap-1">
            <Terminal className="h-3 w-3" />
            return ={" "}
            <span className="font-mono text-zinc-900 dark:text-zinc-200">
              {returned === null ? "None" : `"${returned}"`}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

function FlyingBadge({
  tone,
  icon,
  label,
  value,
}: {
  tone: "emerald" | "rose" | "sky";
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const styles =
    tone === "emerald"
      ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-500/70 dark:bg-emerald-950/40 dark:text-emerald-200"
      : tone === "rose"
        ? "border-rose-400 bg-rose-50 text-rose-700 dark:border-rose-500/70 dark:bg-rose-950/40 dark:text-rose-200"
        : "border-sky-400 bg-sky-50 text-sky-700 dark:border-sky-500/70 dark:bg-sky-950/40 dark:text-sky-200";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.7 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={transitions.springBouncy}
      className={[
        "flex items-center gap-2 rounded-lg border-2 px-3 py-1.5",
        styles,
      ].join(" ")}
    >
      <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider">
        {icon}
        {label}
      </span>
      <span className="font-mono text-sm font-bold">"{value}"</span>
    </motion.div>
  );
}
