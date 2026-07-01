/**
 * Modelo de laberinto **basado en aristas** (idea de redblobgames/grids/edges,
 * reimplementada). Una pared no ocupa una celda: vive en la **arista** entre dos
 * celdas vecinas. Guardamos el conjunto de aristas bloqueadas; una celda `a` se
 * comunica con su vecina `b` solo si la arista `a–b` NO está en ese conjunto.
 */

export type EditMaze = {
  rows: number;
  cols: number;
  /** Aristas bloqueadas (paredes internas). Clave `wkey(a, b)`. */
  walls: Set<string>;
  start: number;
  goal: number;
};

export const wkey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);

export const rc = (i: number, cols: number): [number, number] => [Math.floor(i / cols), i % cols];
export const idx = (r: number, c: number, cols: number) => r * cols + c;

/** Vecinos ortogonales (índices de celda) que existen dentro de la grilla. */
export function neighbors(i: number, rows: number, cols: number): number[] {
  const [r, c] = rc(i, cols);
  const out: number[] = [];
  if (r > 0) out.push(idx(r - 1, c, cols));
  if (r < rows - 1) out.push(idx(r + 1, c, cols));
  if (c > 0) out.push(idx(r, c - 1, cols));
  if (c < cols - 1) out.push(idx(r, c + 1, cols));
  return out;
}

/** ¿Se puede pasar de `a` a su vecina `b`? (no hay pared en la arista). */
export const passable = (maze: EditMaze, a: number, b: number) => !maze.walls.has(wkey(a, b));

/**
 * **Pixel lookup**: dado un punto (x, y) en píxeles del tablero, devuelve la
 * arista interna más cercana como par de celdas `[a, b]`, o `null` si lo más
 * cercano es un borde exterior (no editable). Comparar la distancia a cada uno
 * de los 4 lados de la celda es justo lo que enseña la página de aristas.
 */
export function pickEdge(
  x: number,
  y: number,
  rows: number,
  cols: number,
  cell: number,
): [number, number] | null {
  const c = Math.min(cols - 1, Math.max(0, Math.floor(x / cell)));
  const r = Math.min(rows - 1, Math.max(0, Math.floor(y / cell)));
  const fx = x - c * cell;
  const fy = y - r * cell;
  const dLeft = fx;
  const dRight = cell - fx;
  const dTop = fy;
  const dBottom = cell - fy;
  const min = Math.min(dLeft, dRight, dTop, dBottom);
  if (min === dLeft) return c > 0 ? [idx(r, c - 1, cols), idx(r, c, cols)] : null;
  if (min === dRight) return c < cols - 1 ? [idx(r, c, cols), idx(r, c + 1, cols)] : null;
  if (min === dTop) return r > 0 ? [idx(r - 1, c, cols), idx(r, c, cols)] : null;
  return r < rows - 1 ? [idx(r, c, cols), idx(r + 1, c, cols)] : null;
}

/** Celda bajo el punto (x, y) en píxeles. */
export function pickCell(
  x: number,
  y: number,
  rows: number,
  cols: number,
  cell: number,
): number {
  const c = Math.min(cols - 1, Math.max(0, Math.floor(x / cell)));
  const r = Math.min(rows - 1, Math.max(0, Math.floor(y / cell)));
  return idx(r, c, cols);
}

// ── Búsqueda de camino (rejilla sin pesos: costo 1 por paso) ─────────────────

export type SearchFrame = {
  visited: number[];
  frontier: number[];
  current: number | null;
  path: number[] | null;
  explored: number;
};

export type SearchResult = {
  frames: SearchFrame[];
  found: boolean;
  path: number[];
  explored: number;
};

function reconstruct(prev: Map<number, number>, start: number, goal: number): number[] {
  const path: number[] = [];
  let cur: number | undefined = goal;
  while (cur !== undefined) {
    path.push(cur);
    if (cur === start) break;
    cur = prev.get(cur);
  }
  if (path[path.length - 1] !== start) return [];
  return path.reverse();
}

/** Frames finales que van pintando el camino celda por celda. */
function pathFrames(base: Omit<SearchFrame, "path">, path: number[]): SearchFrame[] {
  const acc: number[] = [];
  return path.map((cell) => {
    acc.push(cell);
    return { ...base, current: null, path: [...acc] };
  });
}

export function bfs(maze: EditMaze): SearchResult {
  const { rows, cols, start, goal } = maze;
  const queue: number[] = [start];
  const visited = new Set<number>([start]);
  const prev = new Map<number, number>();
  const frames: SearchFrame[] = [];
  let explored = 0;
  let found = false;

  while (queue.length > 0) {
    const u = queue.shift()!;
    explored++;
    frames.push({
      visited: [...visited],
      frontier: [...queue],
      current: u,
      path: null,
      explored,
    });
    if (u === goal) {
      found = true;
      break;
    }
    for (const v of neighbors(u, rows, cols)) {
      if (visited.has(v) || !passable(maze, u, v)) continue;
      visited.add(v);
      prev.set(v, u);
      queue.push(v);
    }
  }

  const path = found ? reconstruct(prev, start, goal) : [];
  const tail = pathFrames(
    { visited: [...visited], frontier: [], current: null, explored },
    path,
  );
  return { frames: [...frames, ...tail], found, path, explored };
}

export function astar(maze: EditMaze): SearchResult {
  const { rows, cols, start, goal } = maze;
  const [gr, gc] = rc(goal, cols);
  const h = (i: number) => {
    const [r, c] = rc(i, cols);
    return Math.abs(r - gr) + Math.abs(c - gc);
  };

  const g = new Map<number, number>([[start, 0]]);
  const prev = new Map<number, number>();
  const open = new Set<number>([start]);
  const closed = new Set<number>();
  const frames: SearchFrame[] = [];
  let explored = 0;
  let found = false;

  while (open.size > 0) {
    // Nodo abierto con menor f = g + h. Desempate: preferir menor h (el más
    // cercano a la meta), para que A* avance hacia el objetivo en vez de
    // abrirse en abanico como BFS.
    let u = -1;
    let bestF = Infinity;
    let bestH = Infinity;
    for (const n of open) {
      const hn = h(n);
      const f = (g.get(n) ?? Infinity) + hn;
      if (f < bestF || (f === bestF && hn < bestH)) {
        bestF = f;
        bestH = hn;
        u = n;
      }
    }
    open.delete(u);
    closed.add(u);
    explored++;
    frames.push({
      visited: [...closed],
      frontier: [...open],
      current: u,
      path: null,
      explored,
    });
    if (u === goal) {
      found = true;
      break;
    }
    for (const v of neighbors(u, rows, cols)) {
      if (closed.has(v) || !passable(maze, u, v)) continue;
      const ng = (g.get(u) ?? Infinity) + 1;
      if (ng < (g.get(v) ?? Infinity)) {
        g.set(v, ng);
        prev.set(v, u);
        open.add(v);
      }
    }
  }

  const path = found ? reconstruct(prev, start, goal) : [];
  const tail = pathFrames(
    { visited: [...closed], frontier: [...open], current: null, explored },
    path,
  );
  return { frames: [...frames, ...tail], found, path, explored };
}

export type Algo = "bfs" | "astar";

export function search(maze: EditMaze, algo: Algo): SearchResult {
  return algo === "astar" ? astar(maze) : bfs(maze);
}

/** Genera un laberinto perfecto (Kruskal) y devuelve el conjunto de aristas
 *  internas que quedan como pared (las que NO se abrieron). */
export function perfectMazeWalls(rows: number, cols: number): Set<string> {
  const n = rows * cols;
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x: number): number => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };

  const edges: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = idx(r, c, cols);
      if (c + 1 < cols) edges.push([i, i + 1]);
      if (r + 1 < rows) edges.push([i, i + cols]);
    }
  }
  // Todas las aristas internas empiezan como pared.
  const walls = new Set(edges.map(([a, b]) => wkey(a, b)));

  // Mezcla y abre (quita de walls) las que unen grupos distintos.
  for (let i = edges.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [edges[i], edges[j]] = [edges[j], edges[i]];
  }
  for (const [a, b] of edges) {
    if (find(a) !== find(b)) {
      parent[find(a)] = find(b);
      walls.delete(wkey(a, b));
    }
  }
  return walls;
}
