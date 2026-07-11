"use client";

import { Flag } from "lucide-react";
import type { BfsState } from "@/lib/towerdefense/towerdefense";
import { idx } from "@/lib/towerdefense/towerdefense";

const CELL = 34;

/** Color de "mapa de calor" según distancia a la meta (cerca = cálido). */
function heat(d: number, max: number): string {
  const t = max > 0 ? d / max : 0;
  const r = Math.round(250 - t * 210);
  const g = Math.round(210 - t * 150);
  const b = Math.round(80 + t * 140);
  return `rgb(${r},${g},${b})`;
}

/** Grilla que muestra el avance del BFS: frontera, celda actual y las distancias
 *  ya descubiertas (mapa de distancias). */
export function BfsGrid({ state }: { state: BfsState }) {
  const { rows, cols, grid, goal, dist, frontier, current, reached } = state;
  const W = cols * CELL;
  const H = rows * CELL;
  const frontierSet = new Set(frontier);
  const reachedSet = new Set(reached);
  const maxDist = Math.max(1, ...Object.values(dist).filter((d) => isFinite(d)));

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <svg viewBox={`-1 -1 ${W + 2} ${H + 2}`} className="w-full max-w-xl">
        {Array.from({ length: rows * cols }).map((_, i) => {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const cell = idx(r, c, cols);
          const isGoal = r === goal.r && c === goal.c;
          const isWall = grid[r][c] === 1;
          const isCurrent = cell === current;
          const inFrontier = frontierSet.has(cell);
          const known = reachedSet.has(cell) && cell in dist;

          let fill = "#0f172a";
          if (isWall) fill = "#334155";
          else if (isCurrent) fill = "#f59e0b";
          else if (inFrontier) fill = "#fbbf24";
          else if (known) fill = heat(dist[cell], maxDist);

          return (
            <g key={i}>
              <rect
                x={c * CELL}
                y={r * CELL}
                width={CELL}
                height={CELL}
                fill={fill}
                stroke="#0b0f1a"
                strokeWidth={1}
                rx={3}
              />
              {known && !isWall && !isGoal && (
                <text
                  x={c * CELL + CELL / 2}
                  y={r * CELL + CELL / 2 + 4}
                  textAnchor="middle"
                  className="fill-zinc-900 text-[11px] font-semibold"
                >
                  {dist[cell]}
                </text>
              )}
              {isGoal && (
                <g transform={`translate(${c * CELL + CELL / 2 - 7} ${r * CELL + CELL / 2 - 7})`} className="text-rose-600">
                  <Flag width={14} height={14} strokeWidth={2.5} />
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] text-zinc-400">
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "#f59e0b" }} /> actual</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "#fbbf24" }} /> frontera</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-zinc-600" /> torre</span>
        <span>número = distancia a la meta</span>
      </div>
    </div>
  );
}
