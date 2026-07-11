import type { Step } from "@/lib/types";

/**
 * Pathfinding para Tower Defense: una sola búsqueda en anchura (BFS) desde la
 * meta produce el campo de distancias y el campo de flujo (flechas) que todos
 * los enemigos siguen. Reimplementación propia inspirada en el artículo de
 * Red Blob Games sobre pathfinding para tower defense.
 */

export type Grid = number[][]; // 0 = libre, 1 = torre/pared
export type Cell = { r: number; c: number };

export const idx = (r: number, c: number, cols: number) => r * cols + c;
export const rc = (i: number, cols: number): [number, number] => [Math.floor(i / cols), i % cols];

/** Vecinos ortogonales (4 direcciones) transitables. */
export function neighbors(grid: Grid, r: number, c: number): Cell[] {
  const rows = grid.length;
  const cols = grid[0].length;
  const out: Cell[] = [];
  const cand = [
    [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1],
  ];
  for (const [nr, nc] of cand) {
    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
    if (grid[nr][nc] === 1) continue;
    out.push({ r: nr, c: nc });
  }
  return out;
}

export type Field = {
  /** distancia a la meta (Infinity = inalcanzable o pared). */
  dist: number[][];
  /** hacia qué celda apunta cada celda (índice) o null. */
  cameFrom: (number | null)[][];
};

/** BFS desde la meta: llena el campo de distancias y el "came_from" (flujo). */
export function bfsField(grid: Grid, goal: Cell): Field {
  const rows = grid.length;
  const cols = grid[0].length;
  const dist: number[][] = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const cameFrom: (number | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));

  if (grid[goal.r][goal.c] === 1) return { dist, cameFrom };

  const queue: Cell[] = [goal];
  dist[goal.r][goal.c] = 0;
  let head = 0;
  while (head < queue.length) {
    const cur = queue[head++];
    for (const n of neighbors(grid, cur.r, cur.c)) {
      if (dist[n.r][n.c] === Infinity) {
        dist[n.r][n.c] = dist[cur.r][cur.c] + 1;
        cameFrom[n.r][n.c] = idx(cur.r, cur.c, cols); // apunta hacia la meta
        queue.push(n);
      }
    }
  }
  return { dist, cameFrom };
}

/** Dirección de flujo (dr, dc) de una celda hacia la meta, o null. */
export function flowDir(field: Field, r: number, c: number, cols: number): [number, number] | null {
  const from = field.cameFrom[r][c];
  if (from === null) return null;
  const [tr, tc] = rc(from, cols);
  return [tr - r, tc - c];
}

// ── Pasos para la animación de BFS (campo de distancias) ─────────────────────

export type BfsState = {
  rows: number;
  cols: number;
  grid: Grid;
  goal: Cell;
  dist: Record<number, number>; // distancias ya descubiertas
  frontier: number[];
  current: number | null;
  reached: number[];
  done?: boolean;
};

export const BFS_CODE = `from collections import deque

def bfs(grid, meta):
    frontera = deque([meta])
    distancia = {meta: 0}
    while frontera:
        actual = frontera.popleft()
        for vecino in vecinos(grid, actual):
            if vecino not in distancia:
                distancia[vecino] = distancia[actual] + 1
                frontera.append(vecino)
    return distancia
`;

export function generateBfsSteps(grid: Grid, goal: Cell): Step<BfsState>[] {
  const rows = grid.length;
  const cols = grid[0].length;
  const steps: Step<BfsState>[] = [];
  const dist: Record<number, number> = {};
  const reached = new Set<number>();
  const gi = idx(goal.r, goal.c, cols);
  dist[gi] = 0;
  reached.add(gi);
  const queue: Cell[] = [goal];
  let head = 0;

  const snap = (current: number | null, extra: Partial<BfsState> = {}): BfsState => ({
    rows,
    cols,
    grid,
    goal,
    dist: { ...dist },
    frontier: queue.slice(head).map((c) => idx(c.r, c.c, cols)),
    current,
    reached: [...reached],
    ...extra,
  });

  steps.push({
    state: snap(null),
    line: 5,
    note: "Arrancamos con la meta en la frontera, a distancia 0.",
  });

  while (head < queue.length) {
    const cur = queue[head++];
    const ci = idx(cur.r, cur.c, cols);
    steps.push({
      state: snap(ci),
      line: 6,
      sound: "tick",
      note: `Saco la celda más vieja de la frontera (distancia ${dist[ci]}).`,
    });
    const nuevos: number[] = [];
    for (const n of neighbors(grid, cur.r, cur.c)) {
      const ni = idx(n.r, n.c, cols);
      if (!reached.has(ni)) {
        reached.add(ni);
        dist[ni] = dist[ci] + 1;
        queue.push(n);
        nuevos.push(ni);
      }
    }
    if (nuevos.length > 0) {
      steps.push({
        state: snap(ci),
        line: 10,
        sound: "place",
        note: `Agrego ${nuevos.length} vecino(s) a la frontera con distancia ${dist[ci] + 1}.`,
      });
    }
  }

  steps.push({
    state: snap(null, { done: true }),
    line: 12,
    sound: "found",
    note: "Listo: cada celda alcanzable tiene su distancia a la meta.",
  });

  return steps;
}
