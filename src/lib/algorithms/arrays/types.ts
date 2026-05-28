/**
 * Tipos de estado para las visualizaciones del tema "Arreglos".
 */

export type Array1DState = {
  /** Elementos del arreglo. */
  values: number[];
  /** Índice que se está mirando ahora (cursor). null si todavía no empezamos. */
  cursor: number | null;
  /** Valor que se está buscando (para búsqueda lineal). */
  target?: number;
  /** Índice donde se encontró el target. undefined si todavía no se encontró. */
  found?: number;
  /** true cuando se recorrió todo el arreglo sin éxito. */
  exhausted?: boolean;
};

export type Cell2D = {
  row: number;
  col: number;
};

export type Array2DState = {
  rows: number;
  cols: number;
  /** Valores opcionales por celda. */
  values?: number[][];
  /** Celda activa actualmente. */
  cursor?: Cell2D;
  /** Conjunto de celdas ya visitadas (encoded como "r,c"). */
  visited: string[];
};

/**
 * Estado para el problema "granos de arroz en el tablero".
 *
 * Los conteos se manejan como string porque BigInt no es serializable
 * en JSON ni comparable trivialmente entre snapshots.
 */
export type ChessRiceState = {
  size: number;
  /** Celdas ya colocadas con su cuenta de granos (key = "r,c"). */
  grains: Record<string, string>;
  /** Casilla actual. */
  cursor?: Cell2D;
  /** Granos colocados en esta llamada (2^k). */
  currentGrains?: string;
  /** Exponente actual k tal que granos = 2^k. */
  currentExponent?: number;
  /** Total acumulado hasta ahora (BigInt como string). */
  total: string;
  /** Profundidad actual de la recursión. */
  depth: number;
  /** true cuando terminó todo el recorrido. */
  done?: boolean;
};

export function cellKey(row: number, col: number): string {
  return `${row},${col}`;
}
