import type { Step } from "@/lib/types";

export type Cell = { col: number; row: number };

export type QueensState = {
  n: number;
  /** queens[col] = fila de la reina en esa columna, o -1 si no hay. */
  queens: number[];
  /** Casilla que se está probando en este paso. */
  trying?: Cell | null;
  /** La casilla en prueba tiene conflicto. */
  conflict?: boolean;
  /** Reinas ya colocadas que atacan a la casilla en prueba. */
  attackers?: Cell[];
  /** Tablero completo y válido. */
  solved?: boolean;
};

// Solución general de N reinas con backtracking (la animación corre N = 8).
export const OCHO_REINAS_CODE = `def resolver(n):
    tablero = [-1] * n              # fila de la reina en cada columna

    def es_seguro(col, fila):
        for c in range(col):
            f = tablero[c]
            if f == fila:                       # misma fila
                return False
            if abs(f - fila) == abs(c - col):   # misma diagonal
                return False
        return True

    def colocar(col):
        if col == n:                   # todas ubicadas: solucion!
            return True
        for fila in range(n):
            if es_seguro(col, fila):
                tablero[col] = fila            # colocar la reina
                if colocar(col + 1):           # seguir con la proxima columna
                    return True
                tablero[col] = -1              # backtrack: quitarla
        return False                   # ninguna fila sirve en esta columna

    colocar(0)
    return tablero

print(resolver(8))
`;

/**
 * Ejecuta el backtracking real sobre un tablero 8×8 y registra cada intento
 * hasta la PRIMERA solución: probar una casilla → conflicto o colocar →
 * avanzar de columna → retroceder cuando no hay fila válida.
 */
export function generateOchoReinasSteps(n = 8): Step<QueensState>[] {
  const queens: number[] = new Array(n).fill(-1);
  const steps: Step<QueensState>[] = [];

  const snap = (extra: Partial<QueensState> = {}): QueensState => ({
    n,
    queens: [...queens],
    ...extra,
  });

  // Reinas ya colocadas (columnas < col) que atacan a (col, row).
  function attackersOf(col: number, row: number): Cell[] {
    const out: Cell[] = [];
    for (let c = 0; c < col; c++) {
      const f = queens[c];
      if (f === row || Math.abs(f - row) === Math.abs(c - col)) {
        out.push({ col: c, row: f });
      }
    }
    return out;
  }

  function place(col: number): boolean {
    if (col === n) {
      steps.push({
        state: snap({ solved: true }),
        line: 14,
        note: "¡Tablero completo! Las 8 reinas conviven sin atacarse. Solución encontrada.",
      });
      return true;
    }
    for (let row = 0; row < n; row++) {
      const attackers = attackersOf(col, row);
      const conflict = attackers.length > 0;
      steps.push({
        state: snap({ trying: { col, row }, conflict, attackers }),
        line: 17,
        note: conflict
          ? `Columna ${col}, fila ${row}: choca con una reina ya puesta (misma fila o diagonal). Se descarta.`
          : `Columna ${col}, fila ${row}: probar si es seguro.`,
      });
      if (!conflict) {
        queens[col] = row;
        steps.push({
          state: snap({ trying: null }),
          line: 18,
          note: `Sin conflicto: se coloca la reina en columna ${col}, fila ${row}, y se pasa a la columna ${col + 1}.`,
        });
        if (place(col + 1)) return true;
        queens[col] = -1;
        steps.push({
          state: snap(),
          line: 21,
          note: `Esa rama no llevó a solución: se quita la reina de la columna ${col} (backtracking) y se prueba la próxima fila.`,
        });
      }
    }
    steps.push({
      state: snap(),
      line: 22,
      note: `Ninguna fila funciona en la columna ${col}: se vuelve a la columna anterior.`,
    });
    return false;
  }

  place(0);
  return steps;
}
