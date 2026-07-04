"use client";

import { useMemo, useRef, useState } from "react";
import { borderSegs, castSensor, rectToSegs, type Pt, type Seg } from "@/lib/visibility/visibility";

type Rect = { x: number; y: number; w: number; h: number };

const W = 440;
const H = 300;

const OBSTACULOS: Rect[] = [
  { x: 90, y: 60, w: 46, h: 46 },
  { x: 230, y: 45, w: 60, h: 60 },
  { x: 340, y: 120, w: 52, h: 52 },
  { x: 150, y: 190, w: 70, h: 40 },
  { x: 40, y: 175, w: 44, h: 66 },
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
 * Sensor de rango tipo LIDAR: un "robot" que se arrastra y lanza N rayos en 360°,
 * midiendo hasta el primer obstáculo. Es el mismo ray casting de la visibilidad,
 * pero usado para percibir el entorno (como en un robot autónomo).
 */
export function RaycastSensor() {
  const [robot, setRobot] = useState<Pt>({ x: 210, y: 140 });
  const [count, setCount] = useState(64);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const segments: Seg[] = useMemo(
    () => [...borderSegs(W, H), ...OBSTACULOS.flatMap((r) => rectToSegs(r.x, r.y, r.w, r.h))],
    [],
  );

  const rays = useMemo(
    () => castSensor(robot, segments, count, { maxRange: 600 }),
    [robot, segments, count],
  );

  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    const p = localXY(svgRef.current, e);
    if (p) setRobot({ x: clamp(p.x, 6, W - 6), y: clamp(p.y, 6, H - 6) });
  };

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-zinc-500">
        <label className="flex items-center gap-2">
          rayos
          <input type="range" min={12} max={180} value={count} onChange={(e) => setCount(Number(e.target.value))} className="h-1 w-32 accent-emerald-500" />
          <span className="w-6 font-mono text-zinc-600 dark:text-zinc-300">{count}</span>
        </label>
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
        <rect x={0} y={0} width={W} height={H} fill="#0b0f1a" />

        {/* Rayos del sensor */}
        {rays.map((r, i) => (
          <line key={i} x1={robot.x} y1={robot.y} x2={r.x} y2={r.y} stroke="#34d399" strokeOpacity={0.4} strokeWidth={0.7} />
        ))}

        {/* Obstáculos */}
        {OBSTACULOS.map((r, i) => (
          <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill="#1e293b" stroke="#334155" strokeWidth={1} />
        ))}

        {/* Puntos detectados (la "nube de puntos" del sensor) */}
        {rays.map((r, i) => (r.hit ? <circle key={i} cx={r.x} cy={r.y} r={1.8} fill="#f87171" /> : null))}

        <rect x={0} y={0} width={W} height={H} fill="none" stroke="#334155" strokeWidth={2} />

        {/* El robot */}
        <circle cx={robot.x} cy={robot.y} r={7} fill="#60a5fa" stroke="#1d4ed8" strokeWidth={1.5} />
      </svg>

      <p className="max-w-lg text-center text-[11px] text-zinc-400">
        Arrastrá el robot. Cada rayo mide la distancia hasta el primer obstáculo; los
        puntos rojos son la <strong>nube de puntos</strong> detectada — como el LIDAR
        de un auto autónomo. Con más rayos, mejor &ldquo;ve&rdquo; el entorno.
      </p>
    </div>
  );
}
