import type { Step } from "@/lib/types";

export type MazeState = {
  rows: number;
  cols: number;
  /** Representante (root) del grupo de cada celda — celdas con el mismo root
   *  comparten color. */
  comp: number[];
  /** Pares de celdas conectadas (muro tirado / pasaje abierto). */
  carved: [number, number][];
  /** Muro que se está evaluando ahora (par de celdas). */
  current?: { a: number; b: number } | null;
  /** Resultado para el muro actual. */
  decision?: "carve" | "keep" | null;
  /** Cantidad de grupos distintos en este instante. */
  groups: number;
  /** Laberinto terminado. */
  done?: boolean;
};

export const MAZE_CODE = `parent = list(range(n))        # cada celda en su propio grupo

def find(x):                   # representante del grupo de x
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x

def union(a, b):
    parent[find(a)] = find(b)

random.shuffle(walls)          # muros en orden aleatorio
for a, b in walls:             # a, b: celdas separadas por el muro
    if find(a) != find(b):     # estan en grupos distintos?
        union(a, b)            # unirlos
        carve(a, b)            # tirar el muro: abrir el paso
    # si ya estaban conectadas, el muro se queda (evita ciclos)
`;

/** Estructura final de un laberinto perfecto (sin los pasos de generación). */
export type Maze = {
  rows: number;
  cols: number;
  /** Pasajes abiertos entre celdas vecinas. */
  carved: [number, number][];
  /** Lista de adyacencia: adj[cell] = celdas alcanzables (pasaje directo). */
  adj: number[][];
};

/**
 * Genera un laberinto perfecto (Kruskal + Union-Find) y devuelve su estructura
 * final: muros tirados + lista de adyacencia. Para los algoritmos de recorrido.
 * Aleatorio en cada llamada.
 */
export function generateMaze(rows = 8, cols = 8): Maze {
  const n = rows * cols;
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x: number): number => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };

  const walls: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (c + 1 < cols) walls.push([idx, idx + 1]);
      if (r + 1 < rows) walls.push([idx, idx + cols]);
    }
  }
  for (let i = walls.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [walls[i], walls[j]] = [walls[j], walls[i]];
  }

  const carved: [number, number][] = [];
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of walls) {
    if (find(a) !== find(b)) {
      parent[find(a)] = find(b);
      carved.push([a, b]);
      adj[a].push(b);
      adj[b].push(a);
    }
  }
  return { rows, cols, carved, adj };
}

/**
 * Genera un laberinto perfecto con el algoritmo de Kruskal + Union-Find y
 * registra cada paso: por cada muro, primero se pregunta si las dos celdas
 * están en el mismo grupo, y luego se decide tirarlo (unir grupos) o dejarlo.
 * El orden de los muros es aleatorio, así que cada visita genera otro laberinto.
 */
export function generateMazeSteps(rows = 5, cols = 5): Step<MazeState>[] {
  const n = rows * cols;
  const parent = Array.from({ length: n }, (_, i) => i);

  const find = (x: number): number => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  const union = (a: number, b: number) => {
    parent[find(a)] = find(b);
  };

  // Muros internos: entre celda y su vecino derecho / inferior.
  const walls: { a: number; b: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (c + 1 < cols) walls.push({ a: idx, b: idx + 1 });
      if (r + 1 < rows) walls.push({ a: idx, b: idx + cols });
    }
  }
  // Mezcla aleatoria (Fisher–Yates).
  for (let i = walls.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [walls[i], walls[j]] = [walls[j], walls[i]];
  }

  const carved: [number, number][] = [];
  const steps: Step<MazeState>[] = [];

  const comp = () => Array.from({ length: n }, (_, i) => find(i));
  const groups = () => new Set(comp()).size;

  steps.push({
    state: { rows, cols, comp: comp(), carved: [], current: null, decision: null, groups: groups() },
    line: 12,
    note: "Cada celda empieza como su propio grupo. Se mezclan los muros al azar.",
  });

  for (const { a, b } of walls) {
    const same = find(a) === find(b);
    steps.push({
      state: { rows, cols, comp: comp(), carved: [...carved], current: { a, b }, decision: null, groups: groups() },
      line: 14,
      note: `¿Las celdas ${a} y ${b} están en el mismo grupo?`,
    });
    if (!same) {
      union(a, b);
      carved.push([a, b]);
      steps.push({
        state: { rows, cols, comp: comp(), carved: [...carved], current: { a, b }, decision: "carve", groups: groups() },
        line: 16,
        note: "Grupos distintos: se unen y se abre el paso (se tira el muro).",
      });
    } else {
      steps.push({
        state: { rows, cols, comp: comp(), carved: [...carved], current: { a, b }, decision: "keep", groups: groups() },
        line: 17,
        note: "Mismo grupo: ya estaban conectadas, el muro se queda (evita un ciclo).",
      });
    }
  }

  steps.push({
    state: { rows, cols, comp: comp(), carved: [...carved], current: null, decision: null, groups: 1, done: true },
    line: 12,
    note: "¡Laberinto perfecto! Todas las celdas en un solo grupo, conectadas y sin ciclos.",
  });

  return steps;
}
