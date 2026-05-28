/**
 * Una pila (Stack) modelada como un array donde el ÚLTIMO elemento es el
 * tope. Visualmente la renderizamos vertical: tope arriba, base abajo.
 *
 * Cada elemento tiene un `id` estable para que Framer Motion pueda
 * reconciliar entradas/salidas al hacer push/pop.
 */
export type StackItem = {
  id: string;
  value: string;
};

export type StackState = {
  /** Elementos de la pila. El último del array es el tope visible. */
  items: StackItem[];

  /** Operación que se está animando en este step (para el header). */
  operation?: "push" | "pop" | "peek" | "init" | "empty-check";

  /** Valor "en vuelo" (el que está entrando o saliendo). */
  flying?: { id: string; value: string };

  /** ID del último elemento agregado — se resalta brevemente. */
  newId?: string;

  /** ID del elemento siendo mirado por peek/pop. */
  highlightId?: string;

  /** Valor retornado por la operación (para mostrar en panel). */
  returned?: string | null;

  /** True si la pila está vacía en este step (para badges). */
  isEmpty?: boolean;
};
