"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Flag, MapPin, Trash2 } from "lucide-react";
import { bfsField, flowDir, type Cell, type Grid } from "@/lib/towerdefense/towerdefense";
import { playSound } from "@/lib/sound";

const ROWS = 10;
const COLS = 14;
const CELL = 30;
const W = COLS * CELL;
const H = ROWS * CELL;

const SPAWN: Cell = { r: 5, c: 0 };
const GOAL: Cell = { r: 4, c: COLS - 1 };

type Unit = { x: number; y: number };

function emptyGrid(): Grid {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

/** Laberinto inicial: paredes en serpentina para que el campo de flujo tenga que
 *  rodearlas (y los enemigos no vayan derecho). "Limpiar torres" lo vacía. */
function initialGrid(): Grid {
  const g = emptyGrid();
  const wall = (c: number, rows: number[]) => rows.forEach((r) => (g[r][c] = 1));
  wall(3, [0, 1, 2, 3, 4, 5, 6]);
  wall(6, [3, 4, 5, 6, 7, 8, 9]);
  wall(9, [0, 1, 2, 3, 4, 5, 6]);
  wall(11, [3, 4, 5, 6, 7, 8, 9]);
  g[SPAWN.r][SPAWN.c] = 0;
  g[GOAL.r][GOAL.c] = 0;
  return g;
}

/** Color de calor por distancia (cerca de la meta = cálido). */
function heat(d: number, max: number): string {
  const t = max > 0 ? d / max : 0;
  const r = Math.round(250 - t * 210);
  const g = Math.round(210 - t * 150);
  const b = Math.round(80 + t * 140);
  return `rgb(${r},${g},${b})`;
}

/**
 * Sandbox de Tower Defense: hacé clic para poner/sacar torres; el campo de flujo
 * (flechas) se recalcula con un solo BFS desde la meta, y todos los enemigos lo
 * siguen. Reimplementación propia del artículo de Red Blob Games.
 */
export function TowerDefense() {
  const [grid, setGrid] = useState<Grid>(initialGrid);
  const [showDist, setShowDist] = useState(true);
  const [showArrows, setShowArrows] = useState(true);
  const [, setTick] = useState(0);
  const units = useRef<Unit[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  const field = useMemo(() => bfsField(grid, GOAL), [grid]);
  const maxDist = useMemo(() => {
    let m = 1;
    for (const row of field.dist) for (const d of row) if (isFinite(d)) m = Math.max(m, d);
    return m;
  }, [field]);

  // Alcanzable desde el spawn?
  const spawnReachable = isFinite(field.dist[SPAWN.r][SPAWN.c]);

  // Bucle de animación: aparecen enemigos y siguen el campo de flujo.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let sinceSpawn = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      sinceSpawn += dt;
      if (sinceSpawn > 0.7 && units.current.length < 60) {
        sinceSpawn = 0;
        units.current.push({ x: SPAWN.c + 0.5, y: SPAWN.r + 0.5 });
      }
      const speed = 3 * dt;
      const alive: Unit[] = [];
      for (const u of units.current) {
        const r = Math.floor(u.y);
        const c = Math.floor(u.x);
        if (r === GOAL.r && c === GOAL.c) continue; // llegó
        const d = flowDir(field, r, c, COLS);
        if (d) {
          u.x += d[1] * speed;
          u.y += d[0] * speed;
        }
        alive.push(u);
      }
      units.current = alive;
      setTick((t) => (t + 1) % 1000000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [field]);

  const toggleTower = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    const c = Math.floor(p.x / CELL);
    const r = Math.floor(p.y / CELL);
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
    if ((r === SPAWN.r && c === SPAWN.c) || (r === GOAL.r && c === GOAL.c)) return;
    setGrid((g) => {
      const ng = g.map((row) => [...row]);
      ng[r][c] = ng[r][c] === 1 ? 0 : 1;
      return ng;
    });
    playSound("tick");
  };

  const cxp = (v: number) => v * CELL;

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-zinc-500">
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={showDist} onChange={(e) => setShowDist(e.target.checked)} className="accent-sky-500" />
          distancias
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={showArrows} onChange={(e) => setShowArrows(e.target.checked)} className="accent-amber-500" />
          flechas
        </label>
        <button
          onClick={() => setGrid(emptyGrid())}
          className="flex items-center gap-1 rounded-md border border-zinc-200 px-2 py-1 text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          <Trash2 className="h-3 w-3" /> Limpiar torres
        </button>
        {!spawnReachable && <span className="font-medium text-rose-500">¡bloqueaste el paso!</span>}
      </div>

      <svg
        ref={svgRef}
        viewBox={`-1 -1 ${W + 2} ${H + 2}`}
        onPointerDown={toggleTower}
        className="w-full max-w-xl cursor-pointer touch-none rounded-lg"
      >
        <rect x={0} y={0} width={W} height={H} fill="#0b0f1a" />

        {/* Celdas */}
        {Array.from({ length: ROWS * COLS }).map((_, i) => {
          const r = Math.floor(i / COLS);
          const c = i % COLS;
          const isWall = grid[r][c] === 1;
          const d = field.dist[r][c];
          const fill = isWall ? "#334155" : showDist && isFinite(d) ? heat(d, maxDist) : "#0f172a";
          return (
            <rect key={i} x={cxp(c)} y={cxp(r)} width={CELL} height={CELL} fill={fill} stroke="#0b0f1a" strokeWidth={1} rx={2} />
          );
        })}

        {/* Flechas del campo de flujo */}
        {showArrows &&
          Array.from({ length: ROWS * COLS }).map((_, i) => {
            const r = Math.floor(i / COLS);
            const c = i % COLS;
            if (grid[r][c] === 1) return null;
            if (r === GOAL.r && c === GOAL.c) return null;
            const dir = flowDir(field, r, c, COLS);
            if (!dir) return null;
            const cx = cxp(c + 0.5);
            const cy = cxp(r + 0.5);
            const ang = Math.atan2(dir[0], dir[1]) * (180 / Math.PI);
            return (
              <g key={`a${i}`} transform={`translate(${cx} ${cy}) rotate(${ang})`} opacity={0.55}>
                <line x1={-7} y1={0} x2={5} y2={0} stroke="#e5e7eb" strokeWidth={1.4} />
                <polygon points="5,-3 10,0 5,3" fill="#e5e7eb" />
              </g>
            );
          })}

        {/* Enemigos */}
        {units.current.map((u, i) => (
          <circle key={i} cx={cxp(u.x)} cy={cxp(u.y)} r={4} fill="#ef4444" stroke="#7f1d1d" strokeWidth={1} />
        ))}

        {/* Spawn y meta */}
        <g transform={`translate(${cxp(SPAWN.c + 0.5) - 7} ${cxp(SPAWN.r + 0.5) - 7})`} className="text-emerald-400">
          <MapPin width={14} height={14} strokeWidth={2.5} />
        </g>
        <g transform={`translate(${cxp(GOAL.c + 0.5) - 7} ${cxp(GOAL.r + 0.5) - 7})`} className="text-rose-500">
          <Flag width={14} height={14} strokeWidth={2.5} />
        </g>

        <rect x={0} y={0} width={W} height={H} fill="none" stroke="#334155" strokeWidth={2} />
      </svg>

      <p className="max-w-lg text-center text-[11px] text-zinc-400">
        Hacé clic para poner o sacar <strong>torres</strong>. Con un solo BFS desde la{" "}
        <span className="text-rose-400">meta</span> se arma el <strong>campo de flujo</strong>{" "}
        (flechas) y <strong>todos</strong> los enemigos lo siguen. Al mover una torre, el
        campo se recalcula solo.
      </p>
    </div>
  );
}
