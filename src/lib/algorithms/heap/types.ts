/**
 * Min-heap representado como array. Si el item está en el índice `i`:
 *   - padre  = floor((i - 1) / 2)
 *   - hijo izquierdo = 2i + 1
 *   - hijo derecho   = 2i + 2
 *
 * Visualizamos como árbol binario completo: la raíz arriba al centro, y
 * cada nivel se llena de izquierda a derecha. El item con menor `key` es
 * siempre la raíz (min-heap).
 */
export type HeapItem = {
  /** ID estable para reconciliación de animaciones. */
  id: string;
  /** Valor numérico que se compara. */
  key: number;
  /** Texto opcional para variantes temáticas (ej. nombre en sala urgencias). */
  label?: string;
};

export type HeapState = {
  /** Array de items en orden BFS (índice 0 = raíz). */
  items: HeapItem[];
  /** Operación que se está ejecutando. */
  operation?: "init" | "push" | "pop" | "bubble-up" | "bubble-down" | "done";
  /** Item que se está moviendo (cursor). */
  cursorId?: string;
  /** Par siendo comparado en este paso (ids). */
  comparing?: [string, string];
  /** Par justo intercambiado (para resaltar). */
  swapped?: [string, string];
  /** Valor entrante "en vuelo" (antes de insertar al final). */
  flying?: HeapItem;
  /** Valor recién extraído (mostrar en panel de salida). */
  extracted?: HeapItem;
  /**
   * En extracción, ID del item que actualmente ocupa la raíz pero todavía
   * no está en su lugar (bubble-down en curso).
   */
  movingFromBottomId?: string;
};

/** Padre, hijos. */
export function parentIdx(i: number): number {
  return Math.floor((i - 1) / 2);
}
export function leftIdx(i: number): number {
  return 2 * i + 1;
}
export function rightIdx(i: number): number {
  return 2 * i + 2;
}

/**
 * Layout de árbol binario completo para visualización.
 * Cada item recibe (depth, column) donde column va de 0 a 2^depth - 1
 * para esa profundidad. Devuelve también la profundidad máxima.
 */
export function layoutHeap(items: HeapItem[]): {
  positions: Map<string, { depth: number; col: number }>;
  maxDepth: number;
} {
  const positions = new Map<string, { depth: number; col: number }>();
  let maxDepth = 0;
  items.forEach((item, i) => {
    const depth = Math.floor(Math.log2(i + 1));
    const col = i - (Math.pow(2, depth) - 1);
    positions.set(item.id, { depth, col });
    maxDepth = Math.max(maxDepth, depth);
  });
  return { positions, maxDepth };
}
