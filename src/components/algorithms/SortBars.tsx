"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowLeftRight, ArrowRightLeft } from "lucide-react";
import { useMemo } from "react";
import { transitions } from "@/lib/transitions";
import type {
  MarkerTone,
  SortMarker,
  SortState,
} from "@/lib/algorithms/sorting/types";

type Props = {
  state: SortState;
};

const BAR_WIDTH = 56;
const BAR_GAP = 8;
const TOTAL_WIDTH = (n: number) => n * BAR_WIDTH + (n - 1) * BAR_GAP;
const MAX_BAR_HEIGHT = 200;
const MIN_BAR_HEIGHT = 30;

/**
 * Visualización de un arreglo de números como barras.
 *
 * - Cada elemento tiene un id estable → `layout` anima los swaps.
 * - Markers (i, j, pivote, ...) son labels animados arriba.
 * - Estado de cada barra: comparando (ámbar), swapping (rosa), pivote
 *   (púrpura), sorted (verde), fuera de rango activo (atenuado).
 * - Contadores arriba: comparaciones e intercambios acumulados.
 */
export function SortBars({ state }: Props) {
  const reduced = useReducedMotion();
  const {
    elements,
    comparing,
    swapping,
    sortedRange,
    activeRange,
    leftRange,
    rightRange,
    pivotIndex,
    markers,
    comparisons,
    swaps,
  } = state;

  const maxValue = useMemo(
    () => Math.max(1, ...elements.map((e) => e.value)),
    [elements],
  );

  const containerWidth = TOTAL_WIDTH(elements.length);

  function inRange(idx: number, range?: [number, number]): boolean {
    if (!range) return false;
    return idx >= range[0] && idx <= range[1];
  }

  function barTone(idx: number): {
    bg: string;
    text: string;
    border: string;
  } {
    if (swapping?.includes(idx)) {
      return {
        bg: "bg-rose-300 dark:bg-rose-700/70",
        text: "text-rose-950 dark:text-rose-50",
        border: "border-rose-500",
      };
    }
    if (comparing?.includes(idx)) {
      return {
        bg: "bg-amber-300 dark:bg-amber-600/80",
        text: "text-amber-950 dark:text-amber-50",
        border: "border-amber-500",
      };
    }
    if (pivotIndex === idx) {
      return {
        bg: "bg-purple-300 dark:bg-purple-700/80",
        text: "text-purple-950 dark:text-purple-50",
        border: "border-purple-500",
      };
    }
    if (inRange(idx, sortedRange)) {
      return {
        bg: "bg-emerald-300 dark:bg-emerald-700/80",
        text: "text-emerald-950 dark:text-emerald-50",
        border: "border-emerald-500",
      };
    }
    const dimmed = activeRange && !inRange(idx, activeRange);
    if (dimmed) {
      return {
        bg: "bg-zinc-100 dark:bg-zinc-800/40",
        text: "text-zinc-400 dark:text-zinc-600",
        border: "border-zinc-200 dark:border-zinc-800",
      };
    }
    if (inRange(idx, leftRange)) {
      return {
        bg: "bg-sky-200 dark:bg-sky-800/60",
        text: "text-sky-950 dark:text-sky-50",
        border: "border-sky-400",
      };
    }
    if (inRange(idx, rightRange)) {
      return {
        bg: "bg-fuchsia-200 dark:bg-fuchsia-800/60",
        text: "text-fuchsia-950 dark:text-fuchsia-50",
        border: "border-fuchsia-400",
      };
    }
    return {
      bg: "bg-zinc-200 dark:bg-zinc-700",
      text: "text-zinc-900 dark:text-zinc-100",
      border: "border-zinc-300 dark:border-zinc-600",
    };
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* Contadores */}
      <div className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-1.5">
          <ArrowRightLeft className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-xs text-zinc-500">Comparaciones</span>
          <span className="font-mono font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {comparisons}
          </span>
        </div>
        <span className="text-zinc-300 dark:text-zinc-700">·</span>
        <div className="flex items-center gap-1.5">
          <ArrowLeftRight className="h-3.5 w-3.5 text-rose-500" />
          <span className="text-xs text-zinc-500">Intercambios</span>
          <span className="font-mono font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {swaps}
          </span>
        </div>
      </div>

      {/* Markers (punteros con nombre) */}
      <div
        className="relative h-12"
        style={{ width: containerWidth }}
      >
        {markers?.map((m) => (
          <MarkerLabel
            key={m.name}
            marker={m}
            barWidth={BAR_WIDTH}
            gap={BAR_GAP}
            reduced={!!reduced}
          />
        ))}
      </div>

      {/* Barras */}
      <div
        className="flex items-end gap-2"
        style={{ width: containerWidth }}
      >
        {elements.map((el, idx) => {
          const height =
            ((el.value / maxValue) * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT)) +
            MIN_BAR_HEIGHT;
          const tone = barTone(idx);
          return (
            <motion.div
              key={el.id}
              layout={!reduced}
              transition={transitions.spring}
              className="flex flex-col items-center gap-1"
              style={{ width: BAR_WIDTH }}
            >
              <motion.div
                layout={!reduced}
                animate={{
                  height,
                }}
                transition={transitions.spring}
                className={[
                  "flex w-full items-end justify-center rounded-t-md border-2 pb-1.5 font-mono text-sm font-bold transition-colors",
                  tone.bg,
                  tone.text,
                  tone.border,
                ].join(" ")}
              >
                {el.value}
              </motion.div>
              <span className="font-mono text-[10px] text-zinc-400">
                [{idx}]
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function MarkerLabel({
  marker,
  barWidth,
  gap,
  reduced,
}: {
  marker: SortMarker;
  barWidth: number;
  gap: number;
  reduced: boolean;
}) {
  if (marker.index < 0) return null;
  const x = marker.index * (barWidth + gap);
  const toneClasses = toneToClasses(marker.tone ?? "amber");

  return (
    <motion.div
      layout={!reduced}
      animate={{ x }}
      transition={transitions.spring}
      className="absolute top-0 flex flex-col items-center"
      style={{ width: barWidth, left: 0 }}
    >
      <span
        className={[
          "rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold",
          toneClasses,
        ].join(" ")}
      >
        {marker.name}
      </span>
      <ArrowDown className={`h-4 w-4 ${toneToArrow(marker.tone ?? "amber")}`} />
    </motion.div>
  );
}

function toneToClasses(tone: MarkerTone): string {
  switch (tone) {
    case "sky":
      return "bg-sky-500 text-white";
    case "purple":
      return "bg-purple-500 text-white";
    case "rose":
      return "bg-rose-500 text-white";
    case "emerald":
      return "bg-emerald-500 text-white";
    case "amber":
    default:
      return "bg-amber-500 text-white";
  }
}

function toneToArrow(tone: MarkerTone): string {
  switch (tone) {
    case "sky":
      return "text-sky-500";
    case "purple":
      return "text-purple-500";
    case "rose":
      return "text-rose-500";
    case "emerald":
      return "text-emerald-500";
    case "amber":
    default:
      return "text-amber-500";
  }
}
