"use client";

import type { Board } from "@/lib/minimax/tateti";

/**
 * Tablero de tateti 3×3. Pinta X (celeste) y O (rosa). Puede resaltar la línea
 * ganadora y una casilla (la jugada en evaluación), y ser clickable.
 */
export function TatetiBoard({
  board,
  winLine = null,
  highlight = null,
  onCell,
  size = 56,
}: {
  board: Board;
  winLine?: number[] | null;
  highlight?: number | null;
  onCell?: (i: number) => void;
  size?: number;
}) {
  const win = new Set(winLine ?? []);
  return (
    <div
      className="grid overflow-hidden rounded-lg border-2 border-zinc-400 dark:border-zinc-500"
      style={{ gridTemplateColumns: `repeat(3, ${size}px)` }}
    >
      {board.map((cell, i) => {
        const clickable = !!onCell && cell === null;
        return (
          <button
            key={i}
            disabled={!clickable}
            onClick={() => clickable && onCell?.(i)}
            className={[
              "flex items-center justify-center border border-zinc-200 font-bold dark:border-zinc-700",
              win.has(i) ? "bg-emerald-200 dark:bg-emerald-900/50" : "bg-white dark:bg-zinc-900",
              i === highlight ? "ring-2 ring-amber-500 ring-inset" : "",
              clickable ? "cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800" : "cursor-default",
            ].join(" ")}
            style={{ width: size, height: size, fontSize: size * 0.5 }}
          >
            <span
              className={
                cell === "X"
                  ? "text-sky-600 dark:text-sky-400"
                  : "text-rose-600 dark:text-rose-400"
              }
            >
              {cell}
            </span>
          </button>
        );
      })}
    </div>
  );
}
