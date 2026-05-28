/**
 * Tipos compartidos por las visualizaciones del tema "Tablas hash".
 *
 * Modelo: la tabla es un arreglo de `size` buckets. En chaining, cada bucket
 * es una lista de entradas; en open addressing es un slot de a lo sumo 1
 * entrada (lo modelamos igual con listas de longitud ≤ 1).
 *
 * Cada entrada tiene un `id` estable, así `layoutId` de Framer Motion puede
 * animar el "vuelo" desde el pending card (arriba) hasta el bucket destino.
 */

export type HashEntry = {
  id: string;
  key: string;
  value: number;
};

export type HashTableMode = "chaining" | "openAddressing";

export type HashTableState = {
  size: number;
  mode: HashTableMode;
  /** Buckets indexados de 0 a size-1. */
  buckets: HashEntry[][];

  // === Operación en curso ===

  /** Entrada que está siendo insertada o buscada. */
  pendingEntry?: HashEntry;
  /** Desglose textual del cálculo del hash, ej. "97+110+97 = 304". */
  hashBreakdown?: string;
  /** Bucket destino calculado (hash % size). */
  targetBucket?: number;
  /** Bucket que se está inspeccionando ahora (probing o lookup). */
  probeBucket?: number;
  /** Historial de buckets que ya se probaron y resultaron ocupados. */
  probedBuckets?: number[];
  /** Bucket donde finalmente se colocó la entrada (para resaltar). */
  placedAt?: number;

  // === Resultado de búsqueda ===

  /** ID de la entrada que se está comparando dentro del chain. */
  comparingEntryId?: string;
  /** ID de la entrada encontrada. */
  foundEntryId?: string;
  /** true si la búsqueda terminó sin éxito. */
  notFound?: boolean;
};

/**
 * Hash de string: suma los códigos ASCII de cada caracter y aplica módulo.
 * Es el hash más simple y suficiente para mostrar colisiones controladas.
 */
export function hashString(key: string, size: number): number {
  let sum = 0;
  for (const c of key) sum += c.charCodeAt(0);
  return sum % size;
}

/**
 * Devuelve el desglose textual del cálculo del hash para mostrar al usuario.
 * Ej. para "ana" y tamaño 7: "97 + 110 + 97 = 304   304 % 7 = 3"
 */
export function hashBreakdownText(key: string, size: number): string {
  const codes = Array.from(key).map((c) => c.charCodeAt(0));
  const sum = codes.reduce((a, b) => a + b, 0);
  const mod = sum % size;
  return `${codes.join(" + ")} = ${sum}   ${sum} % ${size} = ${mod}`;
}
