"use client";

import { useMemo, useRef, useState } from "react";
import {
  borderSegs,
  castSensor,
  computeVisibility,
  intersectRay,
  rectToSegs,
  type Pt,
  type Seg,
} from "@/lib/visibility/visibility";

// ── Helpers compartidos ──────────────────────────────────────────────────────

type Rect = { x: number; y: number; w: number; h: number };

function localXY(svg: SVGSVGElement | null, e: { clientX: number; clientY: number }): Pt | null {
  if (!svg) return null;
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
  return { x: p.x, y: p.y };
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const toPath = (pts: Pt[]): string =>
  pts.length ? `M ${pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ")} Z` : "";

const cornersOf = (obs: Rect[]): Pt[] => {
  const m = new Map<string, Pt>();
  for (const r of obs)
    for (const p of [
      { x: r.x, y: r.y },
      { x: r.x + r.w, y: r.y },
      { x: r.x + r.w, y: r.y + r.h },
      { x: r.x, y: r.y + r.h },
    ])
      m.set(`${p.x},${p.y}`, p);
  return [...m.values()];
};

function ToggleBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

const W = 400;
const H = 280;
const OBS: Rect[] = [
  { x: 60, y: 50, w: 60, h: 40 },
  { x: 215, y: 38, w: 44, h: 84 },
  { x: 150, y: 150, w: 100, h: 30 },
  { x: 300, y: 150, w: 58, h: 62 },
];

// ── 1) Ingenuo vs a las esquinas ─────────────────────────────────────────────

export function NaiveVsCorners() {
  const [light, setLight] = useState<Pt>({ x: 120, y: 115 });
  const [mode, setMode] = useState<"esquinas" | "ingenuo">("esquinas");
  const [n, setN] = useState(40);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef(false);

  const segs = useMemo(() => [...borderSegs(W, H), ...OBS.flatMap((r) => rectToSegs(r.x, r.y, r.w, r.h))], []);
  const poly: Pt[] =
    mode === "esquinas" ? computeVisibility(light, segs) : castSensor(light, segs, n, { maxRange: 900 });
  const rayCount = mode === "esquinas" ? poly.length : n;

  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag.current) return;
    const p = localXY(svgRef.current, e);
    if (p) setLight({ x: clamp(p.x, 4, W - 4), y: clamp(p.y, 4, H - 4) });
  };

  return (
    <div className="my-4 flex flex-col items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-zinc-500">
        <div className="flex gap-1 rounded-md border border-zinc-200 p-0.5 dark:border-zinc-800">
          <ToggleBtn active={mode === "ingenuo"} onClick={() => setMode("ingenuo")}>en todas direcciones</ToggleBtn>
          <ToggleBtn active={mode === "esquinas"} onClick={() => setMode("esquinas")}>a las esquinas</ToggleBtn>
        </div>
        {mode === "ingenuo" && (
          <label className="flex items-center gap-1.5">
            rayos
            <input type="range" min={8} max={240} value={n} onChange={(e) => setN(Number(e.target.value))} className="h-1 w-24 accent-amber-500" />
          </label>
        )}
        <span>rayos usados: <strong className="text-zinc-700 dark:text-zinc-300">{rayCount}</strong></span>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-md cursor-crosshair touch-none rounded-lg"
        onPointerDown={(e) => {
          drag.current = true;
          try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* test */ }
          move(e);
        }}
        onPointerMove={move}
        onPointerUp={() => (drag.current = false)}
        onPointerLeave={() => (drag.current = false)}
      >
        <rect x={0} y={0} width={W} height={H} fill="#0b0f1a" />
        <path d={toPath(poly)} fill="#fbbf24" fillOpacity={0.28} />
        {poly.map((p, i) => (
          <line key={i} x1={light.x} y1={light.y} x2={p.x} y2={p.y} stroke="#fcd34d" strokeOpacity={0.3} strokeWidth={0.7} />
        ))}
        {OBS.map((r, i) => (
          <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill="#1e293b" stroke="#334155" strokeWidth={1} />
        ))}
        <rect x={0} y={0} width={W} height={H} fill="none" stroke="#334155" strokeWidth={2} />
        <circle cx={light.x} cy={light.y} r={4.5} fill="#fffbeb" stroke="#f59e0b" strokeWidth={1.5} />
      </svg>
      <p className="text-center text-[11px] text-zinc-400">
        {mode === "ingenuo"
          ? "En todas las direcciones: muchos rayos y el borde queda dentado si son pocos."
          : "A las esquinas: pocos rayos (3 por esquina) y el polígono es exacto."}
      </p>
    </div>
  );
}

// ── 2) Barrido angular (sweep) ───────────────────────────────────────────────

export function SweepDemo() {
  const [deg, setDeg] = useState(90);
  const light: Pt = { x: 160, y: 140 };
  const segs = useMemo(() => [...borderSegs(W, H), ...OBS.flatMap((r) => rectToSegs(r.x, r.y, r.w, r.h))], []);
  const corners = useMemo(() => cornersOf(OBS), []);

  const theta = (deg / 360) * Math.PI * 2 - Math.PI; // [-π, π]

  // Puntos del polígono con su ángulo, ordenados; parcial hasta theta.
  const full = useMemo(() => {
    const pts = computeVisibility(light, segs).map((p) => ({ ...p, ang: Math.atan2(p.y - light.y, p.x - light.x) }));
    return pts.sort((a, b) => a.ang - b.ang);
  }, [segs]);
  const parcial = full.filter((p) => p.ang <= theta);

  // Rayo de barrido: choque más cercano + segmento golpeado.
  const dx = Math.cos(theta), dy = Math.sin(theta);
  let hit: { x: number; y: number; dist: number } | null = null;
  let hitSeg: Seg | null = null;
  for (const s of segs) {
    const h = intersectRay(light.x, light.y, dx, dy, s);
    if (h && (!hit || h.dist < hit.dist)) { hit = h; hitSeg = s; }
  }

  const fan = parcial.length ? `M ${light.x} ${light.y} L ${parcial.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ")} Z` : "";

  return (
    <div className="my-4 flex flex-col items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
      <label className="flex items-center gap-2 text-[11px] text-zinc-500">
        ángulo de barrido
        <input type="range" min={0} max={360} value={deg} onChange={(e) => setDeg(Number(e.target.value))} className="h-1 w-40 accent-sky-500" />
        <span className="w-9 font-mono text-zinc-600 dark:text-zinc-300">{deg}°</span>
      </label>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md rounded-lg">
        <rect x={0} y={0} width={W} height={H} fill="#0b0f1a" />
        {/* zona ya barrida */}
        <path d={fan} fill="#38bdf8" fillOpacity={0.22} />
        {/* segmento más cercano resaltado */}
        {hitSeg && (
          <line x1={hitSeg.a.x} y1={hitSeg.a.y} x2={hitSeg.b.x} y2={hitSeg.b.y} stroke="#ffffff" strokeWidth={3} strokeLinecap="round" />
        )}
        {OBS.map((r, i) => (
          <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill="#1e293b" stroke="#334155" strokeWidth={1} />
        ))}
        {/* rayo de barrido */}
        {hit && <line x1={light.x} y1={light.y} x2={hit.x} y2={hit.y} stroke="#38bdf8" strokeWidth={1.5} />}
        {/* esquinas: verdes las ya pasadas, grises las que faltan */}
        {corners.map((c, i) => {
          const a = Math.atan2(c.y - light.y, c.x - light.x);
          return <circle key={i} cx={c.x} cy={c.y} r={2.6} fill={a <= theta ? "#34d399" : "#64748b"} />;
        })}
        <rect x={0} y={0} width={W} height={H} fill="none" stroke="#334155" strokeWidth={2} />
        <circle cx={light.x} cy={light.y} r={4.5} fill="#fffbeb" stroke="#f59e0b" strokeWidth={1.5} />
      </svg>
      <p className="text-center text-[11px] text-zinc-400">
        El barrido gira y va llenando el área visible. La pared <strong>más cercana</strong> al rayo va en blanco; las esquinas ya pasadas, en verde.
      </p>
    </div>
  );
}

// ── 3) Campo de visión: alcance y cono ───────────────────────────────────────

export function FieldOfView() {
  const [obs, setObs] = useState<Pt>({ x: 150, y: 140 });
  const [aim, setAim] = useState(0); // dirección del cono (rad)
  const [mode, setMode] = useState<"alcance" | "cono">("cono");
  const [range, setRange] = useState(170);
  const [half, setHalf] = useState(0.5); // media apertura del cono (rad)
  const svgRef = useRef<SVGSVGElement>(null);
  const dragObs = useRef(false);

  const segs = useMemo(() => [...borderSegs(W, H), ...OBS.flatMap((r) => rectToSegs(r.x, r.y, r.w, r.h))], []);
  const poly = computeVisibility(obs, segs);

  const down = (e: React.PointerEvent<SVGSVGElement>) => {
    const p = localXY(svgRef.current, e);
    if (!p) return;
    dragObs.current = Math.hypot(p.x - obs.x, p.y - obs.y) < 16;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* test */ }
    if (!dragObs.current) setAim(Math.atan2(p.y - obs.y, p.x - obs.x));
  };
  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    const p = localXY(svgRef.current, e);
    if (!p) return;
    if (dragObs.current) setObs({ x: clamp(p.x, 6, W - 6), y: clamp(p.y, 6, H - 6) });
    else setAim(Math.atan2(p.y - obs.y, p.x - obs.x));
  };

  // Recorte: círculo (alcance) o cuña (cono).
  const clipId = "fov-clip";
  const wedge = () => {
    const a0 = aim - half, a1 = aim + half;
    const p0 = { x: obs.x + range * Math.cos(a0), y: obs.y + range * Math.sin(a0) };
    const p1 = { x: obs.x + range * Math.cos(a1), y: obs.y + range * Math.sin(a1) };
    const large = 2 * half > Math.PI ? 1 : 0;
    return `M ${obs.x} ${obs.y} L ${p0.x.toFixed(1)} ${p0.y.toFixed(1)} A ${range} ${range} 0 ${large} 1 ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} Z`;
  };

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-zinc-500">
        <div className="flex gap-1 rounded-md border border-zinc-200 p-0.5 dark:border-zinc-800">
          <ToggleBtn active={mode === "alcance"} onClick={() => setMode("alcance")}>alcance (círculo)</ToggleBtn>
          <ToggleBtn active={mode === "cono"} onClick={() => setMode("cono")}>cono (linterna)</ToggleBtn>
        </div>
        <label className="flex items-center gap-1.5">alcance<input type="range" min={60} max={320} value={range} onChange={(e) => setRange(Number(e.target.value))} className="h-1 w-24 accent-amber-500" /></label>
        {mode === "cono" && (
          <label className="flex items-center gap-1.5">apertura<input type="range" min={10} max={90} value={Math.round((half * 180) / Math.PI)} onChange={(e) => setHalf((Number(e.target.value) * Math.PI) / 180)} className="h-1 w-20 accent-amber-500" /></label>
        )}
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-xl cursor-crosshair touch-none rounded-lg"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={() => (dragObs.current = false)}
        onPointerLeave={() => (dragObs.current = false)}
      >
        <defs>
          <radialGradient id="fov-luz" gradientUnits="userSpaceOnUse" cx={obs.x} cy={obs.y} r={range}>
            <stop offset="0%" stopColor="#fde68a" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#fbbf24" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.03" />
          </radialGradient>
          <clipPath id={clipId}>
            {mode === "alcance" ? <circle cx={obs.x} cy={obs.y} r={range} /> : <path d={wedge()} />}
          </clipPath>
        </defs>

        <rect x={0} y={0} width={W} height={H} fill="#0b0f1a" />
        <g clipPath={`url(#${clipId})`}>
          <path d={toPath(poly)} fill="url(#fov-luz)" />
        </g>
        {OBS.map((r, i) => (
          <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill="#1e293b" stroke="#334155" strokeWidth={1} />
        ))}
        <rect x={0} y={0} width={W} height={H} fill="none" stroke="#334155" strokeWidth={2} />
        <circle cx={obs.x} cy={obs.y} r={9} fill="#fde68a" fillOpacity={0.2} />
        <circle cx={obs.x} cy={obs.y} r={5} fill="#fffbeb" stroke="#f59e0b" strokeWidth={1.5} />
      </svg>
      <p className="max-w-lg text-center text-[11px] text-zinc-400">
        Arrastrá el observador (el punto). En modo <strong>cono</strong>, movés el mouse para apuntar la linterna. La visibilidad se recorta con un círculo (alcance) o una cuña (cono).
      </p>
    </div>
  );
}

// ── 4) Varias luces + playground ─────────────────────────────────────────────

export function Playground() {
  const [lights, setLights] = useState<Pt[]>([
    { x: 110, y: 90 },
    { x: 300, y: 190 },
  ]);
  const [rects, setRects] = useState<Rect[]>([
    { x: 175, y: 60, w: 50, h: 40 },
    { x: 90, y: 175, w: 60, h: 34 },
    { x: 260, y: 90, w: 40, h: 70 },
  ]);
  const svgRef = useRef<SVGSVGElement>(null);
  const grab = useRef<{ kind: "light" | "rect"; i: number; ox: number; oy: number } | null>(null);

  const segs = useMemo(() => [...borderSegs(W, H), ...rects.flatMap((r) => rectToSegs(r.x, r.y, r.w, r.h))], [rects]);
  const polys = lights.map((l) => computeVisibility(l, segs));

  const down = (e: React.PointerEvent<SVGSVGElement>) => {
    const p = localXY(svgRef.current, e);
    if (!p) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* test */ }
    const li = lights.findIndex((l) => Math.hypot(l.x - p.x, l.y - p.y) < 14);
    if (li >= 0) { grab.current = { kind: "light", i: li, ox: 0, oy: 0 }; return; }
    const ri = rects.findIndex((r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h);
    if (ri >= 0) { grab.current = { kind: "rect", i: ri, ox: p.x - rects[ri].x, oy: p.y - rects[ri].y }; }
  };
  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    const g = grab.current;
    if (!g) return;
    const p = localXY(svgRef.current, e);
    if (!p) return;
    if (g.kind === "light") {
      setLights((ls) => ls.map((l, i) => (i === g.i ? { x: clamp(p.x, 4, W - 4), y: clamp(p.y, 4, H - 4) } : l)));
    } else {
      setRects((rs) => rs.map((r, i) => (i === g.i ? { ...r, x: clamp(p.x - g.ox, 0, W - r.w), y: clamp(p.y - g.oy, 0, H - r.h) } : r)));
    }
  };

  const COLORS = ["#fbbf24", "#38bdf8"];

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-3">
      <p className="text-[11px] text-zinc-500">Arrastrá las <strong className="text-amber-500">luces</strong> o los obstáculos. Donde se cruzan dos luces, brilla más (unión).</p>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-xl cursor-move touch-none rounded-lg"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={() => (grab.current = null)}
        onPointerLeave={() => (grab.current = null)}
      >
        <rect x={0} y={0} width={W} height={H} fill="#0b0f1a" />
        {polys.map((poly, i) => (
          <path key={i} d={toPath(poly)} fill={COLORS[i % COLORS.length]} fillOpacity={0.4} style={{ mixBlendMode: "screen" }} />
        ))}
        {rects.map((r, i) => (
          <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill="#1e293b" stroke="#475569" strokeWidth={1} />
        ))}
        <rect x={0} y={0} width={W} height={H} fill="none" stroke="#334155" strokeWidth={2} />
        {lights.map((l, i) => (
          <g key={i}>
            <circle cx={l.x} cy={l.y} r={9} fill={COLORS[i % COLORS.length]} fillOpacity={0.25} />
            <circle cx={l.x} cy={l.y} r={4.5} fill="#fffbeb" stroke={COLORS[i % COLORS.length]} strokeWidth={1.5} />
          </g>
        ))}
      </svg>
    </div>
  );
}
