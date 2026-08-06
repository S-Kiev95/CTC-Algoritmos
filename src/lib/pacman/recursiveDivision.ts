import type { Step } from "@/lib/types";

/**
 * Generación de laberintos por **división recursiva** (el método con el que se
 * arman los laberintos tipo Pacman): se parte un rectángulo vacío con un muro
 * que deja un hueco, y se repite el proceso en las dos mitades.
 *
 * A diferencia de Kruskal (que tira muros de un mapa lleno), acá se **agregan**
 * muros a un mapa vacío. Los muros ocupan celdas enteras — por eso se ven
 * "gruesos", como en Pacman.
 */

export const LIBRE = 0;
export const MURO = 1;

export type Region = { x: number; y: number; w: number; h: number };

export type PacState = {
  rows: number;
  cols: number;
  grid: number[][];
  /** Región que se está dividiendo en este paso. */
  region: Region | null;
  /** Muro recién dibujado (celdas) y su hueco. */
  wall: { cells: [number, number][]; gap: [number, number] } | null;
  /** Profundidad de la recursión (para mostrar el anidamiento). */
  depth: number;
  muros: number;
  done?: boolean;
};

export const PACMAN_CODE = `# los muros van en indices PARES y los huecos en IMPARES
def al_azar(lo, hi, par):
    op = [v for v in range(lo, hi + 1) if v % 2 == (0 if par else 1)]
    return random.choice(op) if op else None

def dividir(grid, x, y, w, h):
    if w < 3 and h < 3: return          # region muy chica: listo
    if   h < 3: horizontal = False      # no entra un muro horizontal
    elif w < 3: horizontal = True
    else:       horizontal = h > w if w != h else random.random() < 0.5

    if horizontal:
        wy = al_azar(y + 1, y + h - 2, par=True)   # fila del muro
        px = al_azar(x, x + w - 1, par=False)      # columna del hueco
        if wy is None or px is None: return
        for cx in range(x, x + w): grid[wy][cx] = MURO
        grid[wy][px] = LIBRE                       # abrir el pasaje
        dividir(grid, x, y, w, wy - y)                # arriba
        dividir(grid, x, wy + 1, w, y + h - wy - 1)   # abajo
    else:
        wx = al_azar(x + 1, x + w - 2, par=True)   # columna del muro
        py = al_azar(y, y + h - 1, par=False)      # fila del hueco
        if wx is None or py is None: return
        for cy in range(y, y + h): grid[cy][wx] = MURO
        grid[py][wx] = LIBRE                       # abrir el pasaje
        dividir(grid, x, y, wx - x, h)                # izquierda
        dividir(grid, wx + 1, y, x + w - wx - 1, h)   # derecha
`;

/**
 * Elige un índice al azar con la paridad pedida dentro de [lo, hi], o `null` si
 * no hay ninguno. **Los muros van en índices pares y los huecos en impares**:
 * así un muro nuevo nunca puede taparle el hueco a un muro anterior (si no, el
 * laberinto se parte en pedazos incomunicados).
 */
function pickParity(lo: number, hi: number, wantEven: boolean): number | null {
  const start = lo % 2 === (wantEven ? 0 : 1) ? lo : lo + 1;
  const count = Math.floor((hi - start) / 2) + 1;
  if (count <= 0) return null;
  return start + 2 * Math.floor(Math.random() * count);
}

/** Grilla vacía con el borde exterior de muro. */
function baseGrid(rows: number, cols: number): number[][] {
  const g: number[][] = Array.from({ length: rows }, () => Array(cols).fill(LIBRE));
  for (let c = 0; c < cols; c++) {
    g[0][c] = MURO;
    g[rows - 1][c] = MURO;
  }
  for (let r = 0; r < rows; r++) {
    g[r][0] = MURO;
    g[r][cols - 1] = MURO;
  }
  return g;
}

/** Genera un laberinto por división recursiva (sin pasos). */
export function generateMaze(rows: number, cols: number): number[][] {
  const grid = baseGrid(rows, cols);
  const divide = (x: number, y: number, w: number, h: number) => {
    if (w < 3 && h < 3) return;
    let horizontal: boolean;
    if (h < 3) horizontal = false;
    else if (w < 3) horizontal = true;
    else horizontal = w === h ? Math.random() < 0.5 : h > w;

    if (horizontal) {
      const wy = pickParity(y + 1, y + h - 2, true);
      const px = pickParity(x, x + w - 1, false);
      if (wy === null || px === null) return;
      for (let cx = x; cx < x + w; cx++) grid[wy][cx] = MURO;
      grid[wy][px] = LIBRE;
      divide(x, y, w, wy - y);
      divide(x, wy + 1, w, y + h - wy - 1);
    } else {
      const wx = pickParity(x + 1, x + w - 2, true);
      const py = pickParity(y, y + h - 1, false);
      if (wx === null || py === null) return;
      for (let cy = y; cy < y + h; cy++) grid[cy][wx] = MURO;
      grid[py][wx] = LIBRE;
      divide(x, y, wx - x, h);
      divide(wx + 1, y, x + w - wx - 1, h);
    }
  };
  divide(1, 1, cols - 2, rows - 2);
  return grid;
}

/** Igual que `generateMaze` pero registrando cada paso, para animar. */
export function generateMazeSteps(rows: number, cols: number): Step<PacState>[] {
  const grid = baseGrid(rows, cols);
  const steps: Step<PacState>[] = [];
  let muros = 0;

  const snap = (
    region: Region | null,
    wall: PacState["wall"],
    depth: number,
    extra: Partial<PacState> = {},
  ): PacState => ({
    rows,
    cols,
    grid: grid.map((r) => [...r]),
    region,
    wall,
    depth,
    muros,
    ...extra,
  });

  const divide = (x: number, y: number, w: number, h: number, depth: number) => {
    const region: Region = { x, y, w, h };

    if (w < 3 && h < 3) {
      steps.push({
        state: snap(region, null, depth),
        line: 7,
        sound: "tick",
        note: `Región de ${w}×${h}: muy chica para dividir, se deja como pasillo.`,
      });
      return;
    }

    let horizontal: boolean;
    if (h < 3) horizontal = false;
    else if (w < 3) horizontal = true;
    else horizontal = w === h ? Math.random() < 0.5 : h > w;

    steps.push({
      state: snap(region, null, depth),
      line: 10,
      sound: "tick",
      note: `Región de ${w}×${h} (nivel ${depth}): se corta con un muro ${horizontal ? "horizontal" : "vertical"} (siempre por el lado más largo).`,
    });

    if (horizontal) {
      const wy = pickParity(y + 1, y + h - 2, true);
      const px = pickParity(x, x + w - 1, false);
      if (wy === null || px === null) return;
      const cells: [number, number][] = [];
      for (let cx = x; cx < x + w; cx++) {
        grid[wy][cx] = MURO;
        cells.push([wy, cx]);
        muros++;
      }
      grid[wy][px] = LIBRE;
      muros--;
      steps.push({
        state: snap(region, { cells, gap: [wy, px] }, depth),
        line: 17,
        sound: "place",
        note: `Muro horizontal en la fila ${wy} (par), con el hueco en la columna ${px} (impar).`,
      });
      divide(x, y, w, wy - y, depth + 1);
      divide(x, wy + 1, w, y + h - wy - 1, depth + 1);
    } else {
      const wx = pickParity(x + 1, x + w - 2, true);
      const py = pickParity(y, y + h - 1, false);
      if (wx === null || py === null) return;
      const cells: [number, number][] = [];
      for (let cy = y; cy < y + h; cy++) {
        grid[cy][wx] = MURO;
        cells.push([cy, wx]);
        muros++;
      }
      grid[py][wx] = LIBRE;
      muros--;
      steps.push({
        state: snap(region, { cells, gap: [py, wx] }, depth),
        line: 25,
        sound: "place",
        note: `Muro vertical en la columna ${wx} (par), con el hueco en la fila ${py} (impar).`,
      });
      divide(x, y, wx - x, h, depth + 1);
      divide(wx + 1, y, x + w - wx - 1, h, depth + 1);
    }
  };

  steps.push({
    state: snap(null, null, 0),
    line: 6,
    note: "Arrancamos con un rectángulo vacío (solo el borde es muro).",
  });

  divide(1, 1, cols - 2, rows - 2, 1);

  steps.push({
    state: snap(null, null, 0, { done: true }),
    line: 7,
    sound: "found",
    note: `¡Listo! Laberinto generado con ${muros} celdas de muro. Todas las celdas libres quedan conectadas.`,
  });

  return steps;
}

/** Chequeo: ¿todas las celdas libres están conectadas? (flood fill) */
export function isConnected(grid: number[][]): boolean {
  const rows = grid.length;
  const cols = grid[0].length;
  let start: [number, number] | null = null;
  let total = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (grid[r][c] === LIBRE) {
        total++;
        if (!start) start = [r, c];
      }
  if (!start) return true;

  const seen = new Set<string>([`${start[0]},${start[1]}`]);
  const stack: [number, number][] = [start];
  while (stack.length) {
    const [r, c] = stack.pop()!;
    for (const [nr, nc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]] as [number, number][]) {
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (grid[nr][nc] !== LIBRE) continue;
      const k = `${nr},${nc}`;
      if (seen.has(k)) continue;
      seen.add(k);
      stack.push([nr, nc]);
    }
  }
  return seen.size === total;
}
