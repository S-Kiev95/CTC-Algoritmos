"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { TatetiBoard } from "./TatetiBoard";
import { bestMove, winnerInfo, type Board } from "@/lib/minimax/tateti";

const EMPTY: Board = Array(9).fill(null);

/**
 * Tateti jugable contra la IA. El usuario es X y juega primero; la IA es O y
 * responde con la jugada óptima (Minimax). Es imbatible: a lo sumo se empata.
 */
export function TatetiGame() {
  const [board, setBoard] = useState<Board>(EMPTY);
  const info = winnerInfo(board);
  const over = info.result !== null;

  function play(i: number) {
    if (over || board[i] !== null) return;
    const nb = [...board];
    nb[i] = "X";
    // Si la jugada del usuario no termina el juego, responde la IA (O).
    if (winnerInfo(nb).result === null) {
      const m = bestMove([...nb], "O");
      nb[m] = "O";
    }
    setBoard(nb);
  }

  const status =
    info.result === "X"
      ? "¡Ganaste! 🎉"
      : info.result === "O"
        ? "Ganó la IA (O)"
        : info.result === "draw"
          ? "Empate 🤝"
          : "Tu turno — sos las X";

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 p-6">
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{status}</p>

      <TatetiBoard board={board} winLine={info.line} onCell={play} size={72} />

      <button
        onClick={() => setBoard(EMPTY)}
        className="flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <RotateCcw className="h-4 w-4" />
        Reiniciar
      </button>

      <p className="max-w-md text-center text-xs text-zinc-500 dark:text-zinc-400">
        La IA usa <strong>Minimax</strong>: evalúa todas las jugadas posibles y
        elige siempre la mejor. No se le puede ganar — lo máximo que podés lograr
        es un <strong>empate</strong> jugando perfecto.
      </p>
    </div>
  );
}
