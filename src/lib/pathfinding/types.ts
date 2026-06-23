/** Estado de una celda durante una búsqueda de camino. */
export type CellMark =
  | "visitedA"
  | "frontierA"
  | "visitedB"
  | "frontierB"
  | "current"
  | "path"
  | "meet";

/** Estado compartido por las animaciones de recorrido (Dijkstra/bidir/A*). */
export type PathState = {
  rows: number;
  cols: number;
  carved: [number, number][];
  start: number;
  goal: number;
  /** celda -> estado en este paso. */
  marks: Record<number, CellMark>;
  /** Nodos expandidos hasta ahora (para comparar algoritmos). */
  explored: number;
  found?: boolean;
  /** Largo del camino final (en pasos / celdas). */
  pathLen?: number;
  /** Costo total del camino (suma de pesos de las cuadras). */
  cost?: number;
};
