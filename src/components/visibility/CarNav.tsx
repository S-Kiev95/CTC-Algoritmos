"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCw } from "lucide-react";
import { frontSensor, randomScene, type Scene } from "@/lib/visibility/carnav";

const CELL = 26;

const cx = (x: number) => x * CELL;

/**
 * Auto autónomo 2D: navega una matriz con obstáculos aleatorios desde un origen
 * hasta una meta, siguiendo un camino (A*) y mostrando los sensores de su frente
 * que detectan los obstáculos. Se reinicia solo con un escenario nuevo al azar.
 */
export function CarNav() {
  const [scene, setScene] = useState<Scene>(() => randomScene());
  const [, setFrame] = useState(0);
  const car = useRef({ x: 0.5, y: 0.5, dir: 0 });
  const idx = useRef(0);
  const arrived = useRef(false);
  const regenAt = useRef<number | null>(null);

  // (Re)iniciar cuando cambia el escenario.
  useEffect(() => {
    car.current = { x: scene.start.c + 0.5, y: scene.start.r + 0.5, dir: 0 };
    idx.current = 1;
    arrived.current = false;
    regenAt.current = null;
  }, [scene]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      step(dt, now);
      setFrame((f) => (f + 1) % 1000000);
      raf = requestAnimationFrame(loop);
    };
    const step = (dt: number, now: number) => {
      const p = scene.path;
      const c = car.current;
      if (arrived.current) {
        if (regenAt.current && now >= regenAt.current) setScene(randomScene());
        return;
      }
      const target = p[Math.min(idx.current, p.length - 1)];
      const tx = target.c + 0.5;
      const ty = target.r + 0.5;
      const ddx = tx - c.x;
      const ddy = ty - c.y;
      const dist = Math.hypot(ddx, ddy);
      // Girar el volante hacia el objetivo.
      const want = Math.atan2(ddy, ddx);
      let diff = want - c.dir;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      c.dir += Math.max(-6 * dt, Math.min(6 * dt, diff));
      // Avanzar.
      const speed = 3.2 * dt;
      if (dist > 0.05) {
        c.x += Math.cos(c.dir) * Math.min(speed, dist);
        c.y += Math.sin(c.dir) * Math.min(speed, dist);
      }
      if (dist < 0.18) {
        if (idx.current >= p.length - 1) {
          arrived.current = true;
          regenAt.current = now + 1100;
        } else {
          idx.current++;
        }
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [scene]);

  const { rows, cols, grid, start, goal, path } = scene;
  const c = car.current;

  // Sensores del frente (3 rayos).
  const sensors = [-0.55, 0, 0.55].map((off) => {
    const a = c.dir + off;
    const d = frontSensor(grid, c.x, c.y, a, 6);
    return { a, d, x: c.x + Math.cos(a) * d, y: c.y + Math.sin(a) * d, hit: d < 6 };
  });

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-3">
      <button
        onClick={() => setScene(randomScene())}
        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
      >
        <RotateCw className="h-3.5 w-3.5" /> Nuevo escenario
      </button>

      <svg viewBox={`0 0 ${cols * CELL} ${rows * CELL}`} className="w-full max-w-xl rounded-lg">
        <rect x={0} y={0} width={cols * CELL} height={rows * CELL} fill="#0b0f1a" />

        {/* Grilla + obstáculos */}
        {grid.map((row, r) =>
          row.map((v, col) =>
            v === 1 ? (
              <rect key={`${r}-${col}`} x={cx(col)} y={cx(r)} width={CELL} height={CELL} fill="#334155" stroke="#0b0f1a" strokeWidth={1} rx={3} />
            ) : null,
          ),
        )}

        {/* Camino */}
        <polyline
          points={path.map((p) => `${cx(p.c + 0.5)},${cx(p.r + 0.5)}`).join(" ")}
          fill="none"
          stroke="#fbbf24"
          strokeOpacity={0.35}
          strokeWidth={2}
          strokeDasharray="4 4"
        />

        {/* Origen y meta */}
        <circle cx={cx(start.c + 0.5)} cy={cx(start.r + 0.5)} r={7} fill="#10b981" />
        <rect x={cx(goal.c + 0.5) - 7} y={cx(goal.r + 0.5) - 7} width={14} height={14} fill="#f43f5e" rx={2} />

        {/* Sensores del frente */}
        {sensors.map((s, i) => (
          <g key={i}>
            <line x1={cx(c.x)} y1={cx(c.y)} x2={cx(s.x)} y2={cx(s.y)} stroke={s.hit ? "#f87171" : "#34d399"} strokeOpacity={0.7} strokeWidth={1.2} />
            {s.hit && <circle cx={cx(s.x)} cy={cx(s.y)} r={2.5} fill="#f87171" />}
          </g>
        ))}

        {/* El auto (triángulo apuntando a dir) */}
        <g transform={`translate(${cx(c.x)} ${cx(c.y)}) rotate(${(c.dir * 180) / Math.PI})`}>
          <polygon points="9,0 -6,-6 -6,6" fill="#60a5fa" stroke="#1d4ed8" strokeWidth={1.5} />
        </g>
      </svg>

      <p className="max-w-lg text-center text-[11px] text-zinc-400">
        El auto navega de <span className="text-emerald-400">origen</span> a{" "}
        <span className="text-rose-400">meta</span> esquivando obstáculos. Los rayos
        verdes/rojos son sus <strong>sensores de proximidad al frente</strong>. Al
        llegar, se genera un escenario nuevo al azar (o tocá <em>Nuevo escenario</em>).
      </p>
    </div>
  );
}
