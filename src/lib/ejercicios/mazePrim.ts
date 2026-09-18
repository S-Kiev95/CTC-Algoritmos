import type { Step } from "@/lib/types";

/**
 * Laberinto con el algoritmo de **Prim** (versión aleatoria).
 *
 * Kruskal une muchos grupos sueltos hasta que queda uno solo. Prim, en cambio,
 * hace crecer **un único árbol** desde una celda inicial, como una mancha: en
 * cada paso toma al azar un muro de la frontera (entre una celda de adentro y
 * una de afuera) y, si la de afuera todavía no está conectada, lo tira.
 */
export type PrimState = {
  rows: number;
  cols: number;
  /** Celdas que ya forman parte del laberinto. */
  inMaze: boolean[];
  /** Celdas de afuera que tocan el laberinto (la "frontera"). */
  frontier: number[];
  /** Pasajes abiertos (muros tirados). */
  carved: [number, number][];
  /** Muro que se está evaluando: `a` adentro, `b` del otro lado. */
  current: { a: number; b: number } | null;
  decision: "carve" | "keep" | null;
  /** Cantidad de muros pendientes en la frontera. */
  pending: number;
  start: number;
  done?: boolean;
};

export const PRIM_CODE = `import random

def vecinas(celda, filas, cols):
    f, c = celda
    for df, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        if 0 <= f + df < filas and 0 <= c + dc < cols:
            yield (f + df, c + dc)

def prim(filas, cols):
    inicio = (random.randrange(filas), random.randrange(cols))
    en_laberinto = {inicio}                     # celdas ya conectadas
    frontera = [(inicio, v) for v in vecinas(inicio, filas, cols)]
    pasajes = []

    while frontera:
        muro = random.choice(frontera)          # un muro de la frontera al azar
        frontera.remove(muro)
        a, b = muro                             # a ya esta adentro
        if b not in en_laberinto:               # b todavia afuera?
            pasajes.append(muro)                # tirar el muro: abrir el paso
            en_laberinto.add(b)
            frontera += [(b, v) for v in vecinas(b, filas, cols)
                         if v not in en_laberinto]
        # si b ya estaba adentro, el muro queda (evita un ciclo)
    return pasajes
`;

function neighbors(i: number, rows: number, cols: number): number[] {
  const r = Math.floor(i / cols);
  const c = i % cols;
  const out: number[] = [];
  if (r + 1 < rows) out.push(i + cols);
  if (r > 0) out.push(i - cols);
  if (c + 1 < cols) out.push(i + 1);
  if (c > 0) out.push(i - 1);
  return out;
}

/**
 * Genera un laberinto perfecto con Prim y registra cada paso: elegir un muro
 * de la frontera, y después tirarlo (celda nueva) o dejarlo (ya estaba adentro).
 */
export function generatePrimSteps(rows = 5, cols = 5): Step<PrimState>[] {
  const n = rows * cols;
  const inMaze = Array<boolean>(n).fill(false);
  const carved: [number, number][] = [];
  const steps: Step<PrimState>[] = [];

  const start = Math.floor(Math.random() * n);
  inMaze[start] = true;
  let walls: [number, number][] = neighbors(start, rows, cols).map((v) => [start, v]);

  const frontierCells = () => {
    const s = new Set<number>();
    for (const [, b] of walls) if (!inMaze[b]) s.add(b);
    return [...s];
  };

  const snap = (
    current: PrimState["current"],
    decision: PrimState["decision"],
    extra: Partial<PrimState> = {},
  ): PrimState => ({
    rows,
    cols,
    inMaze: [...inMaze],
    frontier: frontierCells(),
    carved: [...carved],
    current,
    decision,
    pending: walls.length,
    start,
    ...extra,
  });

  steps.push({
    state: snap(null, null),
    line: 12,
    note: `Arrancamos desde la celda ${start}. Sus muros forman la frontera inicial.`,
  });

  while (walls.length > 0) {
    const k = Math.floor(Math.random() * walls.length);
    const [a, b] = walls[k];
    walls.splice(k, 1);

    steps.push({
      state: snap({ a, b }, null),
      line: 16,
      note: `Muro al azar de la frontera: entre la celda ${a} (adentro) y la ${b}. ¿La ${b} ya está conectada?`,
    });

    if (!inMaze[b]) {
      inMaze[b] = true;
      carved.push([a, b]);
      walls = walls.concat(
        neighbors(b, rows, cols)
          .filter((v) => !inMaze[v])
          .map((v): [number, number] => [b, v]),
      );
      steps.push({
        state: snap({ a, b }, "carve"),
        line: 20,
        sound: "carve",
        note: `No: se tira el muro, la celda ${b} entra al laberinto y sus muros se suman a la frontera.`,
      });
    } else {
      steps.push({
        state: snap({ a, b }, "keep"),
        line: 24,
        note: `Sí, ya estaba adentro: el muro se queda (tirarlo crearía un ciclo).`,
      });
    }
  }

  steps.push({
    state: snap(null, null, { done: true }),
    line: 25,
    sound: "found",
    note: "¡Laberinto perfecto! La frontera se vació: todas las celdas quedaron conectadas, sin ciclos.",
  });

  return steps;
}
