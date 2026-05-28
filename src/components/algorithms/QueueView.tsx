"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeftToLine, ArrowRightToLine, Eye, Terminal, Users } from "lucide-react";
import { transitions } from "@/lib/transitions";
import type { QueueState } from "@/lib/algorithms/queue/types";

type Props = {
  state: QueueState;
};

/**
 * Cola horizontal (FIFO). Frente a la izquierda (de ahí sale dequeue),
 * fondo a la derecha (ahí entra enqueue).
 *
 * Entradas: items entran desde la derecha. Salidas: front sale hacia la
 * izquierda. Etiquetas FRENTE / FONDO siempre visibles para que se
 * entienda la dirección.
 */
export function QueueView({ state }: Props) {
  const reduced = useReducedMotion();
  const { items, operation, flying, newId, highlightId, returned, isEmpty } =
    state;

  const frontId = items.length > 0 ? items[0].id : null;
  const backId = items.length > 0 ? items[items.length - 1].id : null;

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-3">
      {/* Operación actual */}
      <div className="flex min-h-[44px] items-center gap-3">
        {operation === "enqueue" && flying && (
          <FlyingBadge
            key={`enq-${flying.id}`}
            tone="emerald"
            icon={<ArrowRightToLine className="h-3.5 w-3.5" />}
            label="encolar →"
            value={flying.value}
          />
        )}
        {operation === "dequeue" && flying && (
          <FlyingBadge
            key={`deq-${flying.id}`}
            tone="rose"
            icon={<ArrowLeftToLine className="h-3.5 w-3.5" />}
            label="← desencolar"
            value={flying.value}
          />
        )}
        {operation === "peek" && returned !== null && returned !== undefined && (
          <FlyingBadge
            key={`peek-${returned}`}
            tone="sky"
            icon={<Eye className="h-3.5 w-3.5" />}
            label="próximo"
            value={returned}
          />
        )}
        {operation === "size-check" && returned !== undefined && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitions.snappy}
            className="flex items-center gap-2 rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <Users className="h-3.5 w-3.5" />
            cantidad_esperando ={" "}
            <span className="font-mono text-zinc-900 dark:text-zinc-100">{returned}</span>
          </motion.div>
        )}
      </div>

      {/* La cola */}
      <div className="flex w-full items-center justify-center gap-2 px-2">
        <div className="flex flex-col items-center gap-1 shrink-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            ← frente
          </span>
          <span className="text-[10px] text-zinc-500">(sale)</span>
        </div>

        <div className="flex min-h-[60px] flex-1 items-center justify-start gap-2 overflow-x-auto rounded-lg border border-dashed border-zinc-300 bg-zinc-50/50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900/40">
          <AnimatePresence initial={false} mode="popLayout">
            {items.length === 0 && (
              <motion.span
                key="empty"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-mono text-xs text-zinc-400"
              >
                (cola vacía)
              </motion.span>
            )}
            {items.map((it) => {
              const isFront = it.id === frontId;
              const isBack = it.id === backId;
              const isNew = it.id === newId;
              const isHighlight = it.id === highlightId;
              return (
                <motion.div
                  key={it.id}
                  layout={!reduced}
                  initial={
                    reduced
                      ? { opacity: 0 }
                      : { opacity: 0, x: 40, scale: 0.85 }
                  }
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: isHighlight || isNew ? 1.05 : 1,
                  }}
                  exit={
                    reduced
                      ? { opacity: 0 }
                      : { opacity: 0, x: -50, scale: 0.7 }
                  }
                  transition={transitions.spring}
                  className={[
                    "shrink-0 rounded-md border-2 px-3 py-2 font-mono text-sm shadow-sm",
                    isHighlight
                      ? "border-rose-400 bg-rose-50 text-rose-900 dark:border-rose-500/70 dark:bg-rose-950/40 dark:text-rose-100"
                      : isNew
                        ? "border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-500/70 dark:bg-emerald-950/40 dark:text-emerald-100"
                        : isFront
                          ? "border-emerald-300 bg-emerald-50/70 text-emerald-900 dark:border-emerald-500/50 dark:bg-emerald-950/30 dark:text-emerald-100"
                          : isBack
                            ? "border-sky-300 bg-sky-50/70 text-sky-900 dark:border-sky-500/50 dark:bg-sky-950/30 dark:text-sky-100"
                            : "border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200",
                  ].join(" ")}
                >
                  {it.value}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-center gap-1 shrink-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            fondo →
          </span>
          <span className="text-[10px] text-zinc-500">(entra)</span>
        </div>
      </div>

      {/* Métricas */}
      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <span>
          tamaño ={" "}
          <span className="font-mono text-zinc-900 dark:text-zinc-200">
            {items.length}
          </span>
        </span>
        {returned !== undefined &&
          (operation === "dequeue" || operation === "peek") && (
            <span className="flex items-center gap-1">
              <Terminal className="h-3 w-3" />
              return ={" "}
              <span className="font-mono text-zinc-900 dark:text-zinc-200">
                {returned === null ? "None" : `"${returned}"`}
              </span>
            </span>
          )}
        {isEmpty && items.length === 0 && (
          <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            vacía
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
