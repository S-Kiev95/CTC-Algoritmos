"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCw } from "lucide-react";
import { LIBRE, generateMaze, isConnected } from "@/lib/pacman/recursiveDivision";
import { PacmanMaze } from "./PacmanMaze";

/** Tamaños (siempre impares, que es lo que necesita la paridad de los muros). */
const SIZES = [
  { label: "chico", rows: 15, cols: 21 },
  { label: "mediano", rows: 21, cols: 29 },
  { label: "grande", rows: 25, cols: 37 },
];

type Pac = { r: number; c: number; dr: number; dc: number; t: number };

/**
 * Generador de laberintos estilo Pacman: botón para generar otro, tamaño,
 * puntitos y un Pacman que recorre los pasillos.
 */
export function PacmanGenerator() {
  const [sizeIdx, setSizeIdx] = useState(1);
  const [seed, setSeed] = useState(0);
  const [dots, setDots] = useState(true);
  const [runPac, setRunPac] = useState(true);
  const [, setTick] = useState(0);

  const { rows, cols } = SIZES[sizeIdx];
  const grid = useMemo(() => generateMaze(rows, cols), [rows, cols, seed]);
  const conectado = useMemo(() => isConnected(grid), [grid]);

  const pac = useRef<Pac>({ r: 1, c: 1, dr: 0, dc: 1, t: 0 });

  // Reubicar el Pacman al cambiar de laberinto.
  useEffect(() => {
    outer: for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        if (grid[r][c] === LIBRE) {
          pac.current = { r, c, dr: 0, dc: 1, t: 0 };
          break outer;
        }
      }
    }
  }, [grid, rows, cols]);

  // Movimiento: avanza de celda en celda; en las intersecciones elige al azar
  // (sin volver por donde vino, salvo que sea callejón sin salida).
  useEffect(() => {
    if (!runPac) return;
    let raf = 0;
    let last = performance.now();
    const libre = (r: number, c: number) => grid[r]?.[c] === LIBRE;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const p = pac.current;
      p.t += dt * 4.5;
      while (p.t >= 1) {
        p.t -= 1;
        const nr = p.r + p.dr;
        const nc = p.c + p.dc;
        if (libre(nr, nc)) {
          p.r = nr;
          p.c = nc;
        }
        // Elegir próxima dirección.
        const dirs: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        const opciones = dirs.filter(([dr, dc]) => libre(p.r + dr, p.c + dc));
        const sinVolver = opciones.filter(([dr, dc]) => !(dr === -p.dr && dc === -p.dc));
        const elegibles = sinVolver.length > 0 ? sinVolver : opciones;
        // Seguir derecho si se puede y no hay bifurcación interesante.
        const derecho = elegibles.find(([dr, dc]) => dr === p.dr && dc === p.dc);
        const pick =
          derecho && elegibles.length === 1
            ? derecho
            : elegibles[Math.floor(Math.random() * elegibles.length)];
        if (pick) {
          p.dr = pick[0];
          p.dc = pick[1];
        }
      }
      setTick((t) => (t + 1) % 1000000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [grid, runPac]);

  const cell = sizeIdx === 2 ? 12 : sizeIdx === 1 ? 15 : 18;
  const p = pac.current;
  const px = (p.c + 0.5 + p.dc * p.t) * cell;
  const py = (p.r + 0.5 + p.dr * p.t) * cell;
  const ang = Math.atan2(p.dr, p.dc) * (180 / Math.PI);

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-zinc-500">
        <button
          onClick={() => setSeed((s) => s + 1)}
          className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-amber-400"
        >
          <RotateCw className="h-3.5 w-3.5" /> Generar otro
        </button>
        <div className="flex gap-1 rounded-md border border-zinc-200 p-0.5 dark:border-zinc-800">
          {SIZES.map((s, i) => (
            <button
              key={s.label}
              onClick={() => setSizeIdx(i)}
              className={[
                "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                sizeIdx === i
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
              ].join(" ")}
            >
              {s.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={dots} onChange={(e) => setDots(e.target.checked)} className="accent-amber-500" />
          puntitos
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={runPac} onChange={(e) => setRunPac(e.target.checked)} className="accent-amber-500" />
          Pacman
        </label>
      </div>

      <div className="relative w-full max-w-2xl">
        <PacmanMaze grid={grid} dots={dots} cell={cell} />
        {runPac && (
          <svg
            viewBox={`0 0 ${cols * cell} ${rows * cell}`}
            className="pointer-events-none absolute inset-0 w-full"
          >
            <g transform={`translate(${px} ${py}) rotate(${ang})`}>
              <path
                d={`M 0 0 L ${cell * 0.42} ${-cell * 0.3} A ${cell * 0.42} ${cell * 0.42} 0 1 1 ${cell * 0.42} ${cell * 0.3} Z`}
                fill="#ffe100"
              />
            </g>
          </svg>
        )}
      </div>

      <p className="max-w-lg text-center text-[11px] text-zinc-400">
        Cada laberinto se genera con <strong>división recursiva</strong>:
        siempre queda <strong>{conectado ? "todo conectado" : "algo desconectado"}</strong> y
        sin zonas aisladas. Probá <em>Generar otro</em> y cambiá el tamaño.
      </p>
    </div>
  );
}
