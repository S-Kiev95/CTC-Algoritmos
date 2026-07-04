"use client";

import { useMemo, useRef, useState } from "react";
import { borderSegs, computeVisibility, rectToSegs, type Pt, type Seg } from "@/lib/visibility/visibility";

type Rect = { x: number; y: number; w: number; h: number };

const W = 440;
const H = 300;

const OBSTACULOS: Rect[] = [
  { x: 70, y: 55, w: 74, h: 42 },
  { x: 250, y: 35, w: 48, h: 92 },
  { x: 165, y: 165, w: 120, h: 34 },
  { x: 335, y: 185, w: 62, h: 66 },
  { x: 55, y: 200, w: 55, h: 50 },
];

function localXY(svg: SVGSVGElement | null, e: { clientX: number; clientY: number }): Pt | null {
  if (!svg) return null;
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
  return { x: p.x, y: p.y };
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * Demo interactiva de visibilidad 2D: una luz que se arrastra y el polígono de lo
 * que se ve desde ahí (calculado lanzando rayos a las esquinas de las paredes).
 * Reimplementación propia inspirada en el artículo de Red Blob Games.
 */
export function VisibilityLight() {
  const [light, setLight] = useState<Pt>({ x: 210, y: 130 });
  const [showRays, setShowRays] = useState(true);
  const [showCorners, setShowCorners] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const segments: Seg[] = useMemo(
    () => [...borderSegs(W, H), ...OBSTACULOS.flatMap((r) => rectToSegs(r.x, r.y, r.w, r.h))],
    [],
  );

  const poly = useMemo(() => computeVisibility(light, segments), [light, segments]);
  const path = poly.length
    ? `M ${poly.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ")} Z`
    : "";

  const corners = useMemo(() => {
    const set = new Map<string, Pt>();
    for (const r of OBSTACULOS) {
      for (const p of [
        { x: r.x, y: r.y },
        { x: r.x + r.w, y: r.y },
        { x: r.x + r.w, y: r.y + r.h },
        { x: r.x, y: r.y + r.h },
      ]) {
        set.set(`${p.x},${p.y}`, p);
      }
    }
    return [...set.values()];
  }, []);

  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    const p = localXY(svgRef.current, e);
    if (p) setLight({ x: clamp(p.x, 4, W - 4), y: clamp(p.y, 4, H - 4) });
  };

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-zinc-500">
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={showRays} onChange={(e) => setShowRays(e.target.checked)} className="accent-amber-500" />
          mostrar rayos
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={showCorners} onChange={(e) => setShowCorners(e.target.checked)} className="accent-emerald-500" />
          mostrar esquinas
        </label>
        <span>{poly.length} vértices</span>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-xl cursor-crosshair touch-none rounded-lg"
        onPointerDown={(e) => {
          dragging.current = true;
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            // pointerId inválido (tests): el drag igual funciona.
          }
          move(e);
        }}
        onPointerMove={move}
        onPointerUp={() => (dragging.current = false)}
        onPointerLeave={() => (dragging.current = false)}
      >
        <defs>
          <radialGradient id="luz" gradientUnits="userSpaceOnUse" cx={light.x} cy={light.y} r={320}>
            <stop offset="0%" stopColor="#fde68a" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#fbbf24" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
          </radialGradient>
        </defs>

        {/* Fondo oscuro = lo NO visible */}
        <rect x={0} y={0} width={W} height={H} fill="#0b0f1a" />

        {/* Área visible (polígono de visibilidad) */}
        {path && <path d={path} fill="url(#luz)" />}

        {/* Rayos a los vértices */}
        {showRays &&
          poly.map((p, i) => (
            <line
              key={i}
              x1={light.x}
              y1={light.y}
              x2={p.x}
              y2={p.y}
              stroke="#fcd34d"
              strokeOpacity={0.28}
              strokeWidth={0.8}
            />
          ))}

        {/* Obstáculos (paredes) */}
        {OBSTACULOS.map((r, i) => (
          <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill="#1e293b" stroke="#334155" strokeWidth={1} />
        ))}

        {/* Esquinas */}
        {showCorners &&
          corners.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r={2.5} fill="#34d399" />)}

        {/* Borde del escenario */}
        <rect x={0} y={0} width={W} height={H} fill="none" stroke="#334155" strokeWidth={2} />

        {/* La luz */}
        <circle cx={light.x} cy={light.y} r={9} fill="#fde68a" fillOpacity={0.25} />
        <circle cx={light.x} cy={light.y} r={4.5} fill="#fffbeb" stroke="#f59e0b" strokeWidth={1.5} />
      </svg>

      <p className="max-w-lg text-center text-[11px] text-zinc-400">
        Arrastrá la luz por el escenario. El área iluminada es el{" "}
        <strong>polígono de visibilidad</strong>: todo lo que se ve desde ese punto.
        Las paredes proyectan sombras.
      </p>
    </div>
  );
}
