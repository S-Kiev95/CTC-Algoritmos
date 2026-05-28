/**
 * Tipos del tema "Ordenación".
 *
 * Cada elemento del arreglo tiene un `id` estable independiente de su valor.
 * Eso es clave para que `layout` de Framer Motion pueda animar swaps
 * físicamente: cuando dos elementos intercambian posiciones en el array,
 * sus bars literales se intercambian visualmente con sus identidades
 * preservadas.
 */

export type SortElement = {
  id: string;
  value: number;
};

export type MarkerTone = "sky" | "amber" | "purple" | "rose" | "emerald";

export type SortMarker = {
  /** Nombre como aparece en el código: "i", "j", "min_idx", "pivote", etc. */
  name: string;
  /** Posición a la que apunta. Si es -1, no se renderiza. */
  index: number;
  tone?: MarkerTone;
};

export type SortState = {
  /** Estado actual del array. */
  elements: SortElement[];
  /** Índices comparados ahora (highlight ámbar). */
  comparing?: number[];
  /** Índices que están haciendo swap ahora (highlight rosa). */
  swapping?: number[];
  /** Rango [lo, hi] inclusivos que ya está fijo en su posición final. */
  sortedRange?: [number, number];
  /** Rango activo para algoritmos recursivos. Lo de afuera se atenúa. */
  activeRange?: [number, number];
  /**
   * Para merge sort: las dos mitades que se están combinando.
   * Se renderizan con bordes coloreados distintos.
   */
  leftRange?: [number, number];
  rightRange?: [number, number];
  /** Para quick sort: índice del pivote (highlight púrpura). */
  pivotIndex?: number;
  /** Punteros con nombre (i, j, etc.). */
  markers?: SortMarker[];
  /** Contadores acumulados. */
  comparisons: number;
  swaps: number;
};
