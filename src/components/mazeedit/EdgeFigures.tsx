"use client";

import { useRef, useState, type ReactNode } from "react";
import { idx, pickCell, pickEdge, rc, wkey } from "@/lib/mazeedit/editor";

/**
 * Figuras interactivas ORIGINALES que explican el modelo de aristas de una
 * grilla, siguiendo el mismo hilo pedagógico que redblobgames/grids/edges pero
 * reimplementadas desde cero (código y dibujos propios).
 */

const C = 40; // px por celda en las figuras

function localXY(svg: SVGSVGElement | null, e: { clientX: number; clientY: number }): [number, number] | null {
  if (!svg) return null;
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
  return [p.x, p.y];
}

const center = (i: number, cols: number): [number, number] => {
  const [r, c] = rc(i, cols);
  return [(c + 0.5) * C, (r + 0.5) * C];
};

function FigFrame({
  title,
  hint,
  controls,
  children,
}: {
  title: string;
  hint?: ReactNode;
  controls?: ReactNode;
  children: ReactNode;
}) {
  return (
    <figure className="my-4 rounded-lg border border-zinc-200 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
      <figcaption className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</span>
        {controls}
      </figcaption>
      <div className="flex justify-center">{children}</div>
      {hint && <p className="mt-2 text-center text-[11px] text-zinc-400">{hint}</p>}
    </figure>
  );
}

/** Líneas finas de grilla + borde. */
function GridLines({ rows, cols }: { rows: number; cols: number }) {
  return (
    <>
      {Array.from({ length: cols + 1 }).map((_, c) => (
        <line key={`v${c}`} x1={c * C} y1={0} x2={c * C} y2={rows * C} className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth={1} />
      ))}
      {Array.from({ length: rows + 1 }).map((_, r) => (
        <line key={`h${r}`} x1={0} y1={r * C} x2={cols * C} y2={r * C} className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth={1} />
      ))}
    </>
  );
}

/** Dibuja una línea sobre la arista descrita por la clave `a-b`. */
function edgeLine(key: string, cols: number, className: string, width: number, extra?: object) {
  const [a, b] = key.split("-").map(Number);
  const [ra, ca] = rc(a, cols);
  const [rb, cb] = rc(b, cols);
  if (ra === rb) {
    const x = Math.max(ca, cb) * C;
    return <line key={key} x1={x} y1={ra * C} x2={x} y2={(ra + 1) * C} className={className} strokeWidth={width} strokeLinecap="round" {...extra} />;
  }
  const y = Math.max(ra, rb) * C;
  return <line key={key} x1={ca * C} y1={y} x2={(ca + 1) * C} y2={y} className={className} strokeWidth={width} strokeLinecap="round" {...extra} />;
}

// ── Figura 1: paredes gruesas vs finas ───────────────────────────────────────

export function FigThickVsThin() {
  const [thickCells, setThickCells] = useState<Set<number>>(() => new Set([7]));
  const [thinWalls, setThinWalls] = useState<Set<string>>(() => new Set([wkey(7, 8)]));
  const R = 4, Cn = 4;
  const gridSvg = useRef<SVGSVGElement>(null);
  const thinSvg = useRef<SVGSVGElement>(null);

  return (
    <FigFrame
      title="Pared gruesa vs pared fina"
      hint="Izquierda: la pared ocupa una celda entera. Derecha: la pared vive en la arista y no gasta ninguna celda."
    >
      <div className="flex flex-wrap items-start justify-center gap-6">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[11px] text-zinc-500">gruesa (celda-muro)</span>
          <svg
            ref={gridSvg}
            viewBox={`-1 -1 ${Cn * C + 2} ${R * C + 2}`}
            className="w-40 cursor-pointer touch-none"
            onPointerDown={(e) => {
              const xy = localXY(gridSvg.current, e);
              if (!xy) return;
              const cell = pickCell(xy[0], xy[1], R, Cn, C);
              setThickCells((p) => {
                const n = new Set(p);
                n.has(cell) ? n.delete(cell) : n.add(cell);
                return n;
              });
            }}
          >
            {[...thickCells].map((i) => {
              const [r, c] = rc(i, Cn);
              return <rect key={i} x={c * C} y={r * C} width={C} height={C} className="fill-zinc-700 dark:fill-zinc-300" />;
            })}
            <GridLines rows={R} cols={Cn} />
            <rect x={0} y={0} width={Cn * C} height={R * C} fill="none" className="stroke-zinc-400 dark:stroke-zinc-600" strokeWidth={1.5} />
          </svg>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-[11px] text-zinc-500">fina (arista-muro)</span>
          <svg
            ref={thinSvg}
            viewBox={`-1 -1 ${Cn * C + 2} ${R * C + 2}`}
            className="w-40 cursor-crosshair touch-none"
            onPointerDown={(e) => {
              const xy = localXY(thinSvg.current, e);
              if (!xy) return;
              const edge = pickEdge(xy[0], xy[1], R, Cn, C);
              if (!edge) return;
              const key = wkey(edge[0], edge[1]);
              setThinWalls((p) => {
                const n = new Set(p);
                n.has(key) ? n.delete(key) : n.add(key);
                return n;
              });
            }}
          >
            <GridLines rows={R} cols={Cn} />
            {[...thinWalls].map((k) => edgeLine(k, Cn, "stroke-zinc-700 dark:stroke-zinc-300", 4))}
            <rect x={0} y={0} width={Cn * C} height={R * C} fill="none" className="stroke-zinc-400 dark:stroke-zinc-600" strokeWidth={1.5} />
          </svg>
        </div>
      </div>
    </FigFrame>
  );
}

// ── Figuras 2-4: primario/secundario (OR / AND / XOR) ────────────────────────

type Logic = "or" | "and" | "xor";

function LogicFig({
  logic,
  title,
  hint,
  tileClass,
  initial,
}: {
  logic: Logic;
  title: string;
  hint: ReactNode;
  tileClass: string;
  initial: number[];
}) {
  const R = 4, Cn = 5;
  const [tiles, setTiles] = useState<Set<number>>(() => new Set(initial));
  const svgRef = useRef<SVGSVGElement>(null);

  const on = (i: number) => tiles.has(i);
  const interiorEdges: string[] = [];
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < Cn; c++) {
      const i = idx(r, c, Cn);
      if (c + 1 < Cn) interiorEdges.push(wkey(i, i + 1));
      if (r + 1 < R) interiorEdges.push(wkey(i, i + Cn));
    }
  }

  const active = (key: string): boolean => {
    const [a, b] = key.split("-").map(Number);
    if (logic === "or") return on(a) || on(b);
    if (logic === "and") return on(a) && on(b);
    return on(a) !== on(b); // xor
  };

  // Para XOR también consideramos el borde exterior (fuera = apagado).
  const xorBorder: { x1: number; y1: number; x2: number; y2: number }[] = [];
  if (logic === "xor") {
    for (const i of tiles) {
      const [r, c] = rc(i, Cn);
      if (r === 0) xorBorder.push({ x1: c * C, y1: 0, x2: (c + 1) * C, y2: 0 });
      if (r === R - 1) xorBorder.push({ x1: c * C, y1: R * C, x2: (c + 1) * C, y2: R * C });
      if (c === 0) xorBorder.push({ x1: 0, y1: r * C, x2: 0, y2: (r + 1) * C });
      if (c === Cn - 1) xorBorder.push({ x1: Cn * C, y1: r * C, x2: Cn * C, y2: (r + 1) * C });
    }
  }

  return (
    <FigFrame title={title} hint={hint}>
      <svg
        ref={svgRef}
        viewBox={`-2 -2 ${Cn * C + 4} ${R * C + 4}`}
        className="w-64 cursor-pointer touch-none"
        onPointerDown={(e) => {
          const xy = localXY(svgRef.current, e);
          if (!xy) return;
          const cell = pickCell(xy[0], xy[1], R, Cn, C);
          setTiles((p) => {
            const n = new Set(p);
            n.has(cell) ? n.delete(cell) : n.add(cell);
            return n;
          });
        }}
      >
        {/* Celdas marcadas */}
        {[...tiles].map((i) => {
          const [r, c] = rc(i, Cn);
          if (logic === "and") return null; // en AND se marcan como tanques (círculos)
          return <rect key={i} x={c * C} y={r * C} width={C} height={C} className={tileClass} />;
        })}
        <GridLines rows={R} cols={Cn} />

        {/* Secundario derivado */}
        {logic === "and"
          ? interiorEdges.filter(active).map((k) => {
              const [a, b] = k.split("-").map(Number);
              const [ax, ay] = center(a, Cn);
              const [bx, by] = center(b, Cn);
              return <line key={`p${k}`} x1={ax} y1={ay} x2={bx} y2={by} className="stroke-sky-500" strokeWidth={5} strokeLinecap="round" />;
            })
          : interiorEdges.filter(active).map((k) =>
              edgeLine(k, Cn, logic === "or" ? "stroke-amber-400" : "stroke-rose-500", logic === "or" ? 4 : 4.5),
            )}
        {logic === "xor" &&
          xorBorder.map((s, i) => (
            <line key={`b${i}`} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} className="stroke-rose-500" strokeWidth={4.5} strokeLinecap="round" />
          ))}

        {/* En AND: tanques como círculos */}
        {logic === "and" &&
          [...tiles].map((i) => {
            const [cx, cy] = center(i, Cn);
            return <circle key={`t${i}`} cx={cx} cy={cy} r={9} className="fill-sky-500" />;
          })}
      </svg>
    </FigFrame>
  );
}

export function FigOr() {
  return (
    <LogicFig
      logic="or"
      title="Iluminación (OR)"
      tileClass="fill-amber-200 dark:fill-amber-900/50"
      initial={[6, 12]}
      hint="Las celdas son el dato primario. Una arista se ilumina si CUALQUIERA de sus dos celdas está encendida (A o B)."
    />
  );
}

export function FigAnd() {
  return (
    <LogicFig
      logic="and"
      title="Tuberías (AND)"
      tileClass="fill-sky-200"
      initial={[6, 7, 12]}
      hint="Marcás tanques. Hay caño entre dos celdas solo si AMBAS están marcadas (A y B)."
    />
  );
}

export function FigXor() {
  return (
    <LogicFig
      logic="xor"
      title="Contorno de una región (XOR)"
      tileClass="fill-zinc-300 dark:fill-zinc-700"
      initial={[6, 7, 11, 12]}
      hint="Aparece una pared fina donde EXACTAMENTE una de las dos celdas vecinas es sólida (A distinto de B). Es el contorno de la zona."
    />
  );
}

// ── Figura 5: coordenadas de aristas ─────────────────────────────────────────

export function FigCoords() {
  const R = 3, Cn = 4;
  const [sel, setSel] = useState<number>(idx(1, 1, Cn));
  const svgRef = useRef<SVGSVGElement>(null);
  const [r, c] = rc(sel, Cn);

  return (
    <FigFrame
      title="Cómo se nombra una arista"
      hint="Tocá una celda. Sus 4 aristas se nombran con la convención Norte/Oeste: la celda (q,r) toca q,r,N · q,r,O · q,r+1,N · q+1,r,O."
    >
      <svg
        ref={svgRef}
        viewBox={`-16 -16 ${Cn * C + 60} ${R * C + 32}`}
        className="w-72 cursor-pointer touch-none"
        onPointerDown={(e) => {
          const xy = localXY(svgRef.current, e);
          if (!xy) return;
          setSel(pickCell(xy[0], xy[1], R, Cn, C));
        }}
      >
        <GridLines rows={R} cols={Cn} />
        <rect x={c * C} y={r * C} width={C} height={C} className="fill-sky-100 dark:fill-sky-950/60" />

        {/* Coordenadas de cada celda */}
        {Array.from({ length: R * Cn }).map((_, i) => {
          const [ri, ci] = rc(i, Cn);
          return (
            <text key={i} x={ci * C + C / 2} y={ri * C + C / 2 + 3} textAnchor="middle" className="fill-zinc-400 text-[9px]">
              {ci},{ri}
            </text>
          );
        })}

        {/* Aristas N (arriba) y O (izquierda) de la celda elegida, resaltadas */}
        <line x1={c * C} y1={r * C} x2={(c + 1) * C} y2={r * C} className="stroke-emerald-500" strokeWidth={3} />
        <line x1={c * C} y1={(r + 1) * C} x2={(c + 1) * C} y2={(r + 1) * C} className="stroke-emerald-500" strokeWidth={3} />
        <line x1={c * C} y1={r * C} x2={c * C} y2={(r + 1) * C} className="stroke-violet-500" strokeWidth={3} />
        <line x1={(c + 1) * C} y1={r * C} x2={(c + 1) * C} y2={(r + 1) * C} className="stroke-violet-500" strokeWidth={3} />

        <text x={c * C + C / 2} y={r * C - 4} textAnchor="middle" className="fill-emerald-600 text-[8px] font-semibold dark:fill-emerald-400">
          {c},{r},N
        </text>
        <text x={c * C + C / 2} y={(r + 1) * C + 10} textAnchor="middle" className="fill-emerald-600 text-[8px] font-semibold dark:fill-emerald-400">
          {c},{r + 1},N
        </text>
        <text x={c * C - 3} y={r * C + C / 2} textAnchor="end" className="fill-violet-600 text-[8px] font-semibold dark:fill-violet-400">
          {c},{r},O
        </text>
        <text x={(c + 1) * C + 3} y={r * C + C / 2} textAnchor="start" className="fill-violet-600 text-[8px] font-semibold dark:fill-violet-400">
          {c + 1},{r},O
        </text>
      </svg>
    </FigFrame>
  );
}

// ── Figura 6: pixel lookup (celda vs arista) ─────────────────────────────────

export function FigPixelLookup() {
  const R = 4, Cn = 5;
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const [bias, setBias] = useState(0); // <0 favorece celda, >0 favorece arista
  const svgRef = useRef<SVGSVGElement>(null);

  let pick: { kind: "cell"; cell: number } | { kind: "edge"; key: string } | null = null;
  if (hover) {
    const cell = pickCell(hover.x, hover.y, R, Cn, C);
    const [cr, cc] = rc(cell, Cn);
    const dCell = Math.hypot(hover.x - (cc + 0.5) * C, hover.y - (cr + 0.5) * C);
    const edge = pickEdge(hover.x, hover.y, R, Cn, C);
    // distancia al lado más cercano de la celda = distancia a la arista
    const fx = hover.x - cc * C, fy = hover.y - cr * C;
    const dEdge = Math.min(fx, C - fx, fy, C - fy);
    if (edge && dEdge + bias < dCell) pick = { kind: "edge", key: wkey(edge[0], edge[1]) };
    else pick = { kind: "cell", cell };
  }

  return (
    <FigFrame
      title="¿Tocaste una celda o una arista?"
      hint="Pasá el mouse por la grilla. Se resalta si estás más cerca del centro de una celda o de una arista."
      controls={
        <label className="flex items-center gap-2 text-[11px] text-zinc-500">
          celda
          <input type="range" min={-12} max={12} value={bias} onChange={(e) => setBias(Number(e.target.value))} className="h-1 w-24 accent-sky-500" />
          arista
        </label>
      }
    >
      <svg
        ref={svgRef}
        viewBox={`-2 -2 ${Cn * C + 4} ${R * C + 4}`}
        className="w-72 touch-none"
        onPointerMove={(e) => {
          const xy = localXY(svgRef.current, e);
          if (xy) setHover({ x: xy[0], y: xy[1] });
        }}
        onPointerLeave={() => setHover(null)}
      >
        {pick?.kind === "cell" &&
          (() => {
            const [pr, pc] = rc(pick.cell, Cn);
            return <rect x={pc * C} y={pr * C} width={C} height={C} className="fill-sky-200 dark:fill-sky-900/60" />;
          })()}
        <GridLines rows={R} cols={Cn} />
        {pick?.kind === "edge" && edgeLine(pick.key, Cn, "stroke-rose-500", 5)}
        <rect x={0} y={0} width={Cn * C} height={R * C} fill="none" className="stroke-zinc-400 dark:stroke-zinc-600" strokeWidth={1.5} />
        {hover && <circle cx={hover.x} cy={hover.y} r={2.5} className="fill-zinc-900 dark:fill-zinc-100" />}
      </svg>
    </FigFrame>
  );
}

// ── Figura 7: piezas de esquina (bitmask en un arreglo) ───────────────────────

type Elem = { type: "corner" | "north" | "west" | "tile"; gx: number; gy: number; ax: number; ay: number; code: string };

export function FigCornerBitmask() {
  const [t, setT] = useState(0); // 0 = grilla, 1 = arreglo
  const TQ = 2, TR = 2; // 2x2 celdas
  const elems: Elem[] = [];
  for (let q = 0; q <= TQ; q++) {
    for (let r = 0; r <= TR; r++) {
      // esquina q,r
      elems.push({ type: "corner", gx: q * C, gy: r * C, ax: 2 * q, ay: 2 * r, code: "00" });
      // arista Norte q,r (arriba de la celda) — existe si q < TQ
      if (q < TQ) elems.push({ type: "north", gx: q * C + C / 2, gy: r * C, ax: 2 * q + 1, ay: 2 * r, code: "10" });
      // arista Oeste q,r (izquierda de la celda) — existe si r < TR
      if (r < TR) elems.push({ type: "west", gx: q * C, gy: r * C + C / 2, ax: 2 * q, ay: 2 * r + 1, code: "01" });
      // celda q,r — existe si q<TQ y r<TR
      if (q < TQ && r < TR) elems.push({ type: "tile", gx: q * C + C / 2, gy: r * C + C / 2, ax: 2 * q + 1, ay: 2 * r + 1, code: "11" });
    }
  }
  const AW = 2 * TQ + 1, AH = 2 * TR + 1;
  const CA = 30; // px por celda del arreglo
  const offX = TQ * C + 40; // el arreglo se dibuja a la derecha

  const fill: Record<Elem["type"], string> = {
    corner: "fill-zinc-400",
    north: "fill-emerald-400",
    west: "fill-violet-400",
    tile: "fill-sky-400",
  };

  return (
    <FigFrame
      title="Guardar todo en un arreglo (bitmask)"
      hint="Celdas, aristas y esquinas entran en un mismo arreglo 2D. El bit bajo de x e y dice el tipo: 00 esquina · 01 Oeste · 10 Norte · 11 celda."
      controls={
        <label className="flex items-center gap-2 text-[11px] text-zinc-500">
          grilla
          <input type="range" min={0} max={100} value={t * 100} onChange={(e) => setT(Number(e.target.value) / 100)} className="h-1 w-24 accent-sky-500" />
          arreglo
        </label>
      }
    >
      <svg viewBox={`-16 -16 ${offX + AW * CA + 40} ${Math.max(TR * C, AH * CA) + 32}`} className="w-full max-w-md">
        {/* grilla de referencia (se desvanece) */}
        <g opacity={1 - t}>
          <GridLines rows={TR} cols={TQ} />
        </g>
        {/* marco del arreglo (aparece) */}
        <g opacity={t}>
          {Array.from({ length: AW + 1 }).map((_, i) => (
            <line key={`av${i}`} x1={offX + i * CA} y1={0} x2={offX + i * CA} y2={AH * CA} className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth={1} />
          ))}
          {Array.from({ length: AH + 1 }).map((_, i) => (
            <line key={`ah${i}`} x1={offX} y1={i * CA} x2={offX + AW * CA} y2={i * CA} className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth={1} />
          ))}
        </g>

        {elems.map((el, i) => {
          const gx = el.gx, gy = el.gy;
          const tx = offX + el.ax * CA + CA / 2;
          const ty = el.ay * CA + CA / 2;
          const x = gx + (tx - gx) * t;
          const y = gy + (ty - gy) * t;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={t < 0.5 ? 6 : 9} className={fill[el.type]} />
              <text x={x} y={y + 2.5} textAnchor="middle" className="fill-white text-[7px] font-bold" opacity={t}>
                {el.code}
              </text>
            </g>
          );
        })}
      </svg>
    </FigFrame>
  );
}
