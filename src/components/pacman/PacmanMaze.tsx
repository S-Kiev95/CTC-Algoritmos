"use client";

import { LIBRE, MURO, type PacState, type Region } from "@/lib/pacman/recursiveDivision";

const CELL = 14;

const AZUL = "#2121de";
const AZUL_CLARO = "#5a5aff";

/**
 * Dibuja un laberinto con el look de Pacman: fondo negro, muros azules gruesos
 * y puntitos en los pasillos. Resalta la región que se está dividiendo y el
 * último muro dibujado (con su hueco).
 */
export function PacmanMaze({
  grid,
  region = null,
  wall = null,
  dots = false,
  cell = CELL,
  maxHeight,
}: {
  grid: number[][];
  region?: Region | null;
  wall?: PacState["wall"];
  dots?: boolean;
  cell?: number;
  /** Tope de altura, para que el laberinto entre en el panel sin recortarse. */
  maxHeight?: string;
}) {
  const rows = grid.length;
  const cols = grid[0].length;
  const W = cols * cell;
  const H = rows * cell;
  const wallSet = new Set(wall?.cells.map(([r, c]) => `${r},${c}`) ?? []);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full max-w-2xl rounded-lg"
      style={{ background: "#000", maxHeight }}
    >
      {/* Región que se está dividiendo */}
      {region && (
        <rect
          x={region.x * cell}
          y={region.y * cell}
          width={region.w * cell}
          height={region.h * cell}
          fill="#fbbf24"
          fillOpacity={0.13}
          stroke="#fbbf24"
          strokeOpacity={0.5}
          strokeWidth={1}
        />
      )}

      {/* Muros */}
      {grid.map((row, r) =>
        row.map((v, c) => {
          if (v !== MURO) return null;
          const nuevo = wallSet.has(`${r},${c}`);
          return (
            <rect
              key={`${r}-${c}`}
              x={c * cell + cell * 0.1}
              y={r * cell + cell * 0.1}
              width={cell * 0.8}
              height={cell * 0.8}
              rx={cell * 0.28}
              fill={nuevo ? AZUL_CLARO : AZUL}
            />
          );
        }),
      )}

      {/* Hueco del último muro (el pasaje que se deja abierto) */}
      {wall && (
        <circle
          cx={(wall.gap[1] + 0.5) * cell}
          cy={(wall.gap[0] + 0.5) * cell}
          r={cell * 0.3}
          fill="none"
          stroke="#fde047"
          strokeWidth={1.6}
        />
      )}

      {/* Puntitos en los pasillos */}
      {dots &&
        grid.map((row, r) =>
          row.map((v, c) =>
            v === LIBRE ? (
              <circle key={`d${r}-${c}`} cx={(c + 0.5) * cell} cy={(r + 0.5) * cell} r={cell * 0.09} fill="#ffd9a0" />
            ) : null,
          ),
        )}
    </svg>
  );
}

/** Envoltorio para la animación: muestra el laberinto + datos del paso. */
export function PacmanMazeStep({ state }: { state: PacState }) {
  const { grid, region, wall, depth, muros } = state;
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="flex w-full max-w-md justify-center">
        <PacmanMaze grid={grid} region={region} wall={wall} maxHeight="min(50vh, 340px)" />
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-zinc-400">
        <span>nivel de recursión: <strong className="text-amber-500">{depth}</strong></span>
        <span>celdas de muro: <strong className="text-sky-400">{muros}</strong></span>
        {region && <span>región: {region.w}×{region.h}</span>}
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "#fbbf24", opacity: 0.5 }} /> región actual
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full border" style={{ borderColor: "#fde047" }} /> hueco
        </span>
      </div>
    </div>
  );
}
