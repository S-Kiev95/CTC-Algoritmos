/**
 * Navegación de un "auto" en una grilla con obstáculos: escenario aleatorio con
 * camino garantizado + A* sobre celdas (8 direcciones). Reutilizado por la demo
 * del auto autónomo.
 */

export type Cell = { r: number; c: number };

export type Scene = {
  rows: number;
  cols: number;
  grid: number[][]; // 0 = libre, 1 = obstáculo
  start: Cell;
  goal: Cell;
  path: Cell[]; // camino de start a goal (celdas)
};

const key = (r: number, c: number) => `${r},${c}`;

/** A* en grilla, 8 vecinos. Devuelve el camino de celdas o null. */
export function astarGrid(grid: number[][], start: Cell, goal: Cell): Cell[] | null {
  const rows = grid.length;
  const cols = grid[0].length;
  const free = (r: number, c: number) => r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] === 0;
  if (!free(start.r, start.c) || !free(goal.r, goal.c)) return null;

  const h = (r: number, c: number) => Math.hypot(r - goal.r, c - goal.c);
  const g = new Map<string, number>([[key(start.r, start.c), 0]]);
  const prev = new Map<string, Cell>();
  const open = new Set<string>([key(start.r, start.c)]);
  const closed = new Set<string>();

  const dirs = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [-1, 1], [1, -1], [1, 1],
  ];

  while (open.size > 0) {
    // Nodo abierto con menor f.
    let bestK = "";
    let bestF = Infinity;
    let bestNode: Cell | null = null;
    for (const k of open) {
      const [r, c] = k.split(",").map(Number);
      const f = (g.get(k) ?? Infinity) + h(r, c);
      if (f < bestF) { bestF = f; bestK = k; bestNode = { r, c }; }
    }
    if (!bestNode) break;
    open.delete(bestK);
    closed.add(bestK);
    if (bestNode.r === goal.r && bestNode.c === goal.c) {
      // Reconstruir.
      const path: Cell[] = [];
      let cur: Cell | undefined = bestNode;
      while (cur) {
        path.push(cur);
        cur = prev.get(key(cur.r, cur.c));
      }
      return path.reverse();
    }
    for (const [dr, dc] of dirs) {
      const nr = bestNode.r + dr;
      const nc = bestNode.c + dc;
      if (!free(nr, nc)) continue;
      // Evitar cortar esquinas entre dos obstáculos en diagonal.
      if (dr !== 0 && dc !== 0 && (!free(bestNode.r + dr, bestNode.c) || !free(bestNode.r, bestNode.c + dc))) continue;
      const nk = key(nr, nc);
      if (closed.has(nk)) continue;
      const ng = (g.get(bestK) ?? Infinity) + Math.hypot(dr, dc);
      if (ng < (g.get(nk) ?? Infinity)) {
        g.set(nk, ng);
        prev.set(nk, bestNode);
        open.add(nk);
      }
    }
  }
  return null;
}

/** Genera un escenario aleatorio con obstáculos, y start/goal lejanos, que tenga
 *  camino. Reintenta hasta lograrlo (o afloja la densidad). */
export function randomScene(rows = 12, cols = 16, density = 0.24): Scene {
  for (let intento = 0; intento < 40; intento++) {
    const grid: number[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => (Math.random() < density ? 1 : 0)),
    );
    // start e izquierda, goal a la derecha, en filas al azar.
    const start: Cell = { r: Math.floor(Math.random() * rows), c: 0 };
    const goal: Cell = { r: Math.floor(Math.random() * rows), c: cols - 1 };
    grid[start.r][start.c] = 0;
    grid[goal.r][goal.c] = 0;
    // Despejar un poco alrededor del start/goal.
    for (const cell of [start, goal]) {
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const r = cell.r + dr, c = cell.c + dc;
          if (r >= 0 && r < rows && c >= 0 && c < cols) grid[r][c] = 0;
        }
    }
    const path = astarGrid(grid, start, goal);
    if (path && path.length > cols * 0.8) {
      return { rows, cols, grid, start, goal, path };
    }
  }
  // Fallback sin obstáculos (rarísimo).
  const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));
  const start = { r: (rows / 2) | 0, c: 0 };
  const goal = { r: (rows / 2) | 0, c: cols - 1 };
  return { rows, cols, grid, start, goal, path: astarGrid(grid, start, goal)! };
}

/** Sensor al frente del auto: distancia (en celdas) al primer obstáculo en una
 *  dirección, hasta `maxRange`. Muestrea a pasos finos sobre la grilla. */
export function frontSensor(
  grid: number[][],
  x: number,
  y: number,
  angle: number,
  maxRange = 6,
): number {
  const rows = grid.length;
  const cols = grid[0].length;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const step = 0.1;
  for (let d = step; d <= maxRange; d += step) {
    const px = x + dx * d;
    const py = y + dy * d;
    const c = Math.floor(px);
    const r = Math.floor(py);
    if (r < 0 || r >= rows || c < 0 || c >= cols) return d;
    if (grid[r][c] === 1) return d;
  }
  return maxRange;
}
