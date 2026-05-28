"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Cog, LogOut } from "lucide-react";
import { transitions } from "@/lib/transitions";
import type { WatchEntry } from "@/lib/types";

type Props = {
  entries: WatchEntry[];
};

/**
 * Panel de variables tipo debugger que se monta debajo del código.
 * Agrupa entradas en tres categorías visuales: input (parámetro), computed
 * (variable local), output (return). Cada entrada se resalta cuando cambia.
 */
export function WatchPanel({ entries }: Props) {
  const reduced = useReducedMotion();

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center px-4 py-3 text-xs text-zinc-500">
        Sin variables en este paso.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 px-4 py-3">
      <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
        <span>Entradas y salidas</span>
        <span className="font-mono normal-case tracking-normal text-zinc-600">
          {entries.length} var{entries.length === 1 ? "" : "s"}
        </span>
      </div>

      <AnimatePresence initial={false} mode="popLayout">
        {entries.map((entry) => (
          <motion.div
            key={entry.name}
            layout={!reduced}
            initial={reduced ? false : { opacity: 0, x: -8 }}
            animate={{
              opacity: 1,
              x: 0,
              backgroundColor: entry.changed
                ? "rgb(180 83 9 / 0.15)"
                : "rgba(0,0,0,0)",
            }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: 8 }}
            transition={transitions.snappy}
            className="flex items-baseline gap-2 rounded px-2 py-1 font-mono text-[12px]"
          >
            <KindIcon kind={entry.kind} />
            <span
              className={[
                "min-w-[3.5rem] truncate",
                entry.kind === "output"
                  ? "text-emerald-300"
                  : entry.kind === "computed"
                    ? "text-sky-300"
                    : "text-zinc-300",
              ].join(" ")}
            >
              {entry.name}
            </span>
            <span className="text-zinc-500">=</span>
            <motion.span
              key={entry.value}
              initial={
                reduced || !entry.changed
                  ? false
                  : { opacity: 0.4, y: -2 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={transitions.snappy}
              className={[
                "flex-1 break-all text-zinc-100",
                entry.changed && "font-semibold text-amber-200",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {entry.value}
            </motion.span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function KindIcon({ kind }: { kind?: WatchEntry["kind"] }) {
  if (kind === "output") {
    return <LogOut className="h-3 w-3 shrink-0 text-emerald-400" />;
  }
  if (kind === "computed") {
    return <Cog className="h-3 w-3 shrink-0 text-sky-400" />;
  }
  return <ArrowRight className="h-3 w-3 shrink-0 text-zinc-500" />;
}
