"use client";

import { useRef, useState } from "react";
import { diagonalDistance, line, supercover, type Pt } from "@/lib/line/line";

const COLS = 13;
const ROWS = 9;
const CELL = 32;
const W = COLS * CELL;
const H = ROWS * CELL;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function localCell(svg: SVGSVGElement | null, e: { clientX: number; clientY: number }): Pt | null {
  if (!svg) return null;
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
  return { x: clamp(Math.floor(p.x / CELL), 0, COLS - 1), y: clamp(Math.floor(p.y / CELL), 0, ROWS - 1) };
}

const c = (v: number) => v * CELL;
const cc = (v: number) => (v + 0.5) * CELL;

/** Traza una línea entre dos celdas arrastrables, por interpolación o supercover. */
export function LineGrid() {
  const [a, setA] = useState<Pt>({ x: 1, y: 6 });
  const [b, setB] = useState<Pt>({ x: 11, y: 2 });
  const [method, setMethod] = useState<"lerp" | "super">("lerp");
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<"a" | "b" | null>(null);

  const cells = method === "super" ? supercover(a, b) : line(a, b);
  const cellSet = new Set(cells.map((p) => `${p.x},${p.y}`));

  const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const cell = localCell(svgRef.current, e);
    if (!cell) return;
    const da = Math.hypot(cell.x - a.x, cell.y - a.y);
    const db = Math.hypot(cell.x - b.x, cell.y - b.y);
    drag.current = da <= db ? "a" : "b";
    if (drag.current === "a") setA(cell);
    else setB(cell);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* test */ }
  };
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag.current) return;
    const cell = localCell(svgRef.current, e);
    if (!cell) return;
    if (drag.current === "a") setA(cell);
    else setB(cell);
  };
  const onUp = () => (drag.current = null);

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-zinc-500">
        <div className="flex gap-1 rounded-md border border-zinc-200 p-0.5 dark:border-zinc-800">
          <button onClick={() => setMethod("lerp")} className={btn(method === "lerp")}>interpolación</button>
          <button onClick={() => setMethod("super")} className={btn(method === "super")}>supercover</button>
        </div>
        <span>distancia diagonal (N): <strong className="text-zinc-700 dark:text-zinc-300">{diagonalDistance(a, b)}</strong></span>
        <span>celdas: <strong className="text-zinc-700 dark:text-zinc-300">{cells.length}</strong></span>
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

        {/* Celdas de la línea */}
        {cells.map((p, i) => (
          <rect key={i} x={c(p.x)} y={c(p.y)} width={CELL} height={CELL} fill="#0ea5e9" fillOpacity={0.4} />
        ))}

        {/* Grilla */}
        {Array.from({ length: COLS + 1 }).map((_, i) => (
          <line key={`v${i}`} x1={c(i)} y1={0} x2={c(i)} y2={H} className="stroke-zinc-800" strokeWidth={1} />
        ))}
        {Array.from({ length: ROWS + 1 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={c(i)} x2={W} y2={c(i)} className="stroke-zinc-800" strokeWidth={1} />
        ))}

        {/* Segmento real A→B */}
        <line x1={cc(a.x)} y1={cc(a.y)} x2={cc(b.x)} y2={cc(b.y)} className="stroke-amber-400" strokeWidth={1.5} strokeDasharray="4 3" />

        {/* Extremos */}
        <circle cx={cc(a.x)} cy={cc(a.y)} r={7} fill="#10b981" stroke="#065f46" strokeWidth={1.5} />
        <circle cx={cc(b.x)} cy={cc(b.y)} r={7} fill="#f43f5e" stroke="#881337" strokeWidth={1.5} />
      </svg>

      <p className="max-w-lg text-center text-[11px] text-zinc-400">
        Arrastrá los extremos. <strong>Interpolación</strong>: una celda por paso
        (líneas finas). <strong>Supercover</strong>: <em>todas</em> las celdas que la
        línea toca (para línea de visión). El {cellSet.size > 0 ? "" : ""}segmento
        amarillo es la línea &ldquo;real&rdquo;.
      </p>
    </div>
  );
}

function btn(active: boolean) {
  return [
    "rounded-md px-2 py-1 text-xs font-medium transition-colors",
    active ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
  ].join(" ");
}
