"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Crown } from "lucide-react";
import { transitions } from "@/lib/transitions";
import type { QueensState } from "@/lib/ejercicios/ochoReinas";

/**
 * Tablero de ajedrez n×n para el problema de las reinas. Dibuja las reinas ya
 * colocadas, resalta la casilla en prueba (ámbar / roja si hay conflicto) y
 * marca las reinas que la atacan. Cuando el tablero queda resuelto, todo pasa
 * a verde.
 */
export function QueensBoard({ state }: { state: QueensState }) {
  const reduced = useReducedMotion();
  const { n, queens, trying, conflict, attackers = [], solved } = state;

  const isAttacker = (c: number, r: number) =>
    attackers.some((a) => a.col === c && a.row === r);

  const placedCount = queens.filter((r) => r >= 0).length;

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <div className="flex w-full items-center justify-between text-xs text-zinc-500">
        <span>
          Reinas colocadas:{" "}
          <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
            {placedCount}/{n}
          </span>
        </span>
        {solved && (
          <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            ¡Resuelto!
          </span>
        )}
      </div>

      <div
        className={[
          "grid overflow-hidden rounded-lg border-2",
          solved
            ? "border-emerald-400 dark:border-emerald-500/60"
            : "border-zinc-300 dark:border-zinc-700",
        ].join(" ")}
        style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: n }).map((_, r) =>
          Array.from({ length: n }).map((__, c) => {
            const dark = (r + c) % 2 === 1;
            const hasQueen = queens[c] === r;
            const isTrying = trying?.col === c && trying?.row === r;
            const attacker = isAttacker(c, r);

            return (
              <div
                key={`${r}-${c}`}
                className={[
                  "relative flex aspect-square items-center justify-center",
                  dark
                    ? "bg-zinc-300 dark:bg-zinc-700"
                    : "bg-zinc-100 dark:bg-zinc-800",
                ].join(" ")}
              >
                {/* Resaltado de la casilla en prueba */}
                {isTrying && (
                  <motion.div
                    layoutId="trying-cell"
                    transition={transitions.springStiff}
                    className={[
                      "absolute inset-0.5 rounded-sm ring-2",
                      conflict
                        ? "bg-rose-400/30 ring-rose-500"
                        : "bg-amber-400/30 ring-amber-500",
                    ].join(" ")}
                  />
                )}
                {/* Marca de reina atacante */}
                {attacker && (
                  <div className="absolute inset-0.5 rounded-sm ring-2 ring-rose-400/70" />
                )}

                {/* Reina */}
                <AnimatePresence>
                  {hasQueen && (
                    <motion.div
                      key={`q-${c}-${r}`}
                      initial={reduced ? false : { scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={reduced ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                      transition={transitions.springBouncy}
                      className="relative z-10"
                    >
                      <Crown
                        className={[
                          "h-5 w-5",
                          solved
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-zinc-900 dark:text-zinc-100",
                        ].join(" ")}
                        strokeWidth={2.2}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }),
        )}
      </div>

      <p className="text-center text-xs text-zinc-400">
        Ámbar: casilla en prueba · Rojo: conflicto con una reina existente
      </p>
    </div>
  );
}
