import type { Step } from "@/lib/types";
import {
  generateGrahamSteps,
  type GrahamState,
  type Point,
} from "@/lib/ejercicios/graham";

export type CropField = {
  rows: number;
  cols: number;
  /** infected[idx] = true si la planta de esa celda está enferma. */
  infected: boolean[];
};

export type CropState = {
  rows: number;
  cols: number;
  infected: boolean[];
  /** Fila que se está recorriendo en este paso (fase scan). */
  scanRow?: number | null;
  /** Índices de celda infectadas encontradas hasta ahora. */
  found: number[];
  /** Estado del convex hull (fase hull/done). */
  graham?: GrahamState | null;
  phase: "scan" | "hull" | "done";
  /** Área afectada estimada (celdas²), al terminar. */
  area?: number;
};

export const CROP_CODE = `infectadas = []
for r in range(filas):          # recorrer la matriz
    for c in range(cols):
        if campo[r][c] == ENFERMA:
            infectadas.append((c, r))

casco = graham_scan(infectadas)   # convex hull de las infectadas
area = area_poligono(casco)       # shoelace -> area afectada
`;

/** Campo aleatorio. Garantiza al menos 3 plantas infectadas (para el hull). */
export function generateCropField(rows = 9, cols = 9, prob = 0.14): CropField {
  const n = rows * cols;
  const infected = Array.from({ length: n }, () => Math.random() < prob);
  let count = infected.filter(Boolean).length;
  while (count < 3) {
    const i = Math.floor(Math.random() * n);
    if (!infected[i]) {
      infected[i] = true;
      count++;
    }
  }
  return { rows, cols, infected };
}

/**
 * Pasos: fase 1 recorre la matriz fila por fila juntando las infectadas; fase 2
 * arma el convex hull (Graham) sobre ellas; fase 3 muestra el área estimada.
 */
export function generateCropSteps(field: CropField): Step<CropState>[] {
  const { rows, cols, infected } = field;
  const steps: Step<CropState>[] = [];
  const found: number[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (infected[idx]) found.push(idx);
    }
    steps.push({
      state: { rows, cols, infected, scanRow: r, found: [...found], graham: null, phase: "scan" },
      line: 4,
      note: `Recorriendo la fila ${r}. Plantas infectadas encontradas: ${found.length}.`,
    });
  }

  const points: Point[] = found.map((idx) => ({ x: idx % cols, y: Math.floor(idx / cols) }));
  const gsteps = generateGrahamSteps(points);

  gsteps.forEach((gs, k) => {
    const isLast = k === gsteps.length - 1;
    steps.push({
      state: {
        rows,
        cols,
        infected,
        found: [...found],
        graham: gs.state,
        phase: isLast ? "done" : "hull",
        area: isLast ? gs.state.area : undefined,
      },
      line: isLast ? 8 : 7,
      note: isLast
        ? `Área afectada ≈ ${(gs.state.area ?? 0).toFixed(1)} celdas². Es la superficie que conviene tratar.`
        : gs.note,
    });
  });

  return steps;
}
