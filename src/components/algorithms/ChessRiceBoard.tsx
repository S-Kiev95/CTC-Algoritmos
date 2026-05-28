"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Layers, Sparkles, Wheat } from "lucide-react";
import { transitions } from "@/lib/transitions";
import { cellKey, type ChessRiceState } from "@/lib/algorithms/arrays/types";

type Props = {
  state: ChessRiceState;
};

/**
 * Tablero de ajedrez con celdas que se "llenan" a medida que la recursión
 * las visita. Cada celda muestra 2^k como exponente. El total acumulado se
 * destaca abajo. La profundidad del stack se muestra a la derecha.
 */
export function ChessRiceBoard({ state }: Props) {
  const reduced = useReducedMotion();
  const { size, grains, cursor, total, depth, currentExponent, done } = state;

  const totalFormatted = formatBigString(total);

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-3">
      {/* Cabecera con métricas */}
      <div className="grid w-full grid-cols-3 gap-2">
        <Metric
          label="Casilla actual"
          value={
            cursor ? `(${cursor.row}, ${cursor.col})` : done ? "—" : "—"
          }
          tone="amber"
        />
        <Metric
          label="Granos en esta llamada"
          value={
            currentExponent !== undefined ? `2^${currentExponent}` : "—"
          }
          icon={<Wheat className="h-3.5 w-3.5" />}
          tone="zinc"
        />
        <Metric
          label="Profundidad del stack"
          value={String(depth)}
          icon={<Layers className="h-3.5 w-3.5" />}
          tone="zinc"
        />
      </div>

      {/* Tablero */}
      <div className="inline-block rounded-lg bg-amber-900/90 p-1.5 shadow-lg dark:bg-amber-950">
        <div
          className="grid gap-px overflow-hidden rounded-md"
          style={{ gridTemplateColumns: `repeat(${size}, 2.25rem)` }}
        >
          {Array.from({ length: size }).map((_, row) =>
            Array.from({ length: size }).map((_, col) => {
              const isLight = (row + col) % 2 === 0;
              const isCursor = cursor?.row === row && cursor.col === col;
              const k = cellKey(row, col);
              const hasGrain = grains[k] !== undefined;
              const exponent = row * size + col;

              return (
                <motion.div
                  key={k}
                  layout={!reduced}
                  className={[
                    "relative flex h-9 w-9 items-center justify-center text-[10px] font-semibold transition-colors",
                    isLight
                      ? "bg-amber-50 text-amber-900"
                      : "bg-amber-800 text-amber-100",
                    isCursor && "ring-2 ring-amber-400 ring-offset-1 ring-offset-amber-900",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <AnimatePresence>
                    {hasGrain && (
                      <motion.span
                        key="grain"
                        initial={
                          reduced
                            ? false
                            : { opacity: 0, scale: 0.5, y: -8 }
                        }
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={transitions.springBouncy}
                        className="font-mono leading-none"
                      >
                        2<sup className="text-[8px]">{exponent}</sup>
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isCursor && !hasGrain && (
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute inset-1 rounded bg-amber-400/30"
                    />
                  )}
                </motion.div>
              );
            }),
          )}
        </div>
      </div>

      {/* Total acumulado */}
      <motion.div
        layout={!reduced}
        className={[
          "flex w-full max-w-2xl flex-col items-center gap-1 rounded-xl border px-6 py-3 transition-colors",
          done
            ? "border-emerald-400 bg-emerald-50 dark:border-emerald-500/60 dark:bg-emerald-950/40"
            : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
        ].join(" ")}
      >
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          {done ? (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              Total final
            </>
          ) : (
            "Total acumulado"
          )}
        </div>
        <motion.div
          key={total}
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transitions.snappy}
          className={[
            "break-all text-center font-mono text-lg font-semibold tabular-nums",
            done
              ? "text-emerald-700 dark:text-emerald-300"
              : "text-zinc-900 dark:text-zinc-100",
          ].join(" ")}
        >
          {totalFormatted}
        </motion.div>
        {done && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-1 max-w-prose text-center text-xs text-zinc-600 dark:text-zinc-400"
          >
            Eso es 2{<sup className="text-[10px]">{size * size}</sup>} − 1
            granos. Más arroz del que se ha cosechado en toda la historia
            humana.
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

function Metric({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  tone: "amber" | "zinc";
}) {
  return (
    <div
      className={[
        "flex flex-col gap-0.5 rounded-lg border px-3 py-1.5",
        tone === "amber"
          ? "border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30"
          : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
      ].join(" ")}
    >
      <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
        {icon}
        {label}
      </span>
      <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {value}
      </span>
    </div>
  );
}

/**
 * Formatea un BigInt almacenado como string con separadores de miles.
 * Si el número tiene > 24 dígitos, lo abrevia con notación científica.
 */
function formatBigString(s: string): string {
  if (!s) return "0";
  try {
    const n = BigInt(s);
    if (s.length > 24) {
      // Demasiado largo: usar notación científica aproximada
      const exp = s.length - 1;
      const mantissa = (Number(s.slice(0, 4)) / 1000).toFixed(3);
      return `${mantissa} × 10^${exp}`;
    }
    return n.toLocaleString("es-AR");
  } catch {
    return s;
  }
}
