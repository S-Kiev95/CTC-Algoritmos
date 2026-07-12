"use client";

import { useRef, useState } from "react";
import { Crosshair, MapPin, Trash2 } from "lucide-react";
import { hasLineOfSight, type Pt } from "@/lib/line/line";

const COLS = 13;
const ROWS = 9;
const CELL = 32;
const W = COLS * CELL;
const H = ROWS * CELL;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const c = (v: number) => v * CELL;
const cc = (v: number) => (v + 0.5) * CELL;

function localCell(svg: SVGSVGElement | null, e: { clientX: number; clientY: number }): Pt | null {
  if (!svg) return null;
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
  return { x: clamp(Math.floor(p.x / CELL), 0, COLS - 1), y: clamp(Math.floor(p.y / CELL), 0, ROWS - 1) };
}

function emptyGrid(): number[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function initialGrid(): number[][] {
  const g = emptyGrid();
  [[6, 2], [6, 3], [6, 4], [9, 5], [9, 6], [3, 6]].forEach(([x, y]) => (g[y][x] = 1));
  return g;
}

/**
 * Ataque a distancia / línea de visión: el tirador dispara a un objetivo que se
 * arrastra; si un muro cruza la línea (supercover), el disparo se bloquea.
 */
export function RangedAttack() {
  const shooter: Pt = { x: 1, y: 4 };
  const [target, setTarget] = useState<Pt>({ x: 11, y: 4 });
  const [grid, setGrid] = useState<number[][]>(initialGrid);
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingTarget = useRef(false);

  const los = hasLineOfSight(grid, shooter, target);

  const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const cell = localCell(svgRef.current, e);
    if (!cell) return;
    if (cell.x === target.x && cell.y === target.y) {
      draggingTarget.current = true;
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* test */ }
      return;
    }
    if (cell.x === shooter.x && cell.y === shooter.y) return;
    // Poner/sacar muro.
    setGrid((g) => {
      const ng = g.map((row) => [...row]);
      ng[cell.y][cell.x] = ng[cell.y][cell.x] === 1 ? 0 : 1;
      return ng;
    });
  };
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingTarget.current) return;
    const cell = localCell(svgRef.current, e);
    if (cell && !(cell.x === shooter.x && cell.y === shooter.y)) setTarget(cell);
  };
  const onUp = () => (draggingTarget.current = false);

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-zinc-500">
        <span className={los.clear ? "font-semibold text-emerald-500" : "font-semibold text-rose-500"}>
          {los.clear ? "¡línea de tiro libre — impacto!" : "bloqueado por un muro"}
        </span>
        <button onClick={() => setGrid(emptyGrid())} className="flex items-center gap-1 rounded-md border border-zinc-200 px-2 py-1 text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900">
          <Trash2 className="h-3 w-3" /> Limpiar muros
        </button>
      </div>

      <svg
        ref={svgRef}
        viewBox={`-1 -1 ${W + 2} ${H + 2}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        className="w-full max-w-xl cursor-pointer touch-none rounded-lg"
      >
        <rect x={0} y={0} width={W} height={H} fill="#0b0f1a" />

        {/* Celdas de la trayectoria */}
        {los.cells.map((p, i) => (
          <rect key={i} x={c(p.x)} y={c(p.y)} width={CELL} height={CELL} fill={los.clear ? "#10b981" : "#ef4444"} fillOpacity={0.25} />
        ))}

        {/* Muros */}
        {grid.map((row, y) => row.map((v, x) => (v === 1 ? <rect key={`${x}-${y}`} x={c(x)} y={c(y)} width={CELL} height={CELL} fill="#334155" rx={2} /> : null)))}

        {/* Grilla */}
        {Array.from({ length: COLS + 1 }).map((_, i) => (
          <line key={`v${i}`} x1={c(i)} y1={0} x2={c(i)} y2={H} className="stroke-zinc-800" strokeWidth={1} />
        ))}
        {Array.from({ length: ROWS + 1 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={c(i)} x2={W} y2={c(i)} className="stroke-zinc-800" strokeWidth={1} />
        ))}

        {/* Muro donde se bloquea */}
        {los.blockedAt && (
          <rect x={c(los.blockedAt.x)} y={c(los.blockedAt.y)} width={CELL} height={CELL} fill="none" stroke="#ef4444" strokeWidth={2} rx={2} />
        )}

        {/* Línea de tiro */}
        <line x1={cc(shooter.x)} y1={cc(shooter.y)} x2={cc(target.x)} y2={cc(target.y)} stroke={los.clear ? "#34d399" : "#f87171"} strokeWidth={2} />

        {/* Tirador y objetivo */}
        <g transform={`translate(${cc(shooter.x) - 8} ${cc(shooter.y) - 8})`} className="text-emerald-400">
          <MapPin width={16} height={16} strokeWidth={2.5} />
        </g>
        <g transform={`translate(${cc(target.x) - 8} ${cc(target.y) - 8})`} className="text-rose-400">
          <Crosshair width={16} height={16} strokeWidth={2.5} />
        </g>
      </svg>

      <p className="max-w-lg text-center text-[11px] text-zinc-400">
        Arrastrá el <span className="text-rose-400">objetivo</span> y hacé clic para
        poner <strong>muros</strong>. La trayectoria se calcula con{" "}
        <strong>supercover</strong>: si un muro toca la línea, el disparo queda{" "}
        <strong>bloqueado</strong>. Es la base de la <strong>línea de visión</strong> en
        los juegos.
      </p>
    </div>
  );
}
