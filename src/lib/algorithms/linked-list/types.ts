/**
 * Modelo de nodo y estado para visualizar listas enlazadas simples.
 *
 * Cada nodo tiene un `id` estable que sobrevive a inserciones/eliminaciones,
 * así Framer Motion puede reconciliar correctamente con `layout` y
 * `AnimatePresence`.
 */

export type ListNode = {
  /** Identificador estable para reconciliación de animaciones. */
  id: string;
  value: number;
};

export type PointerHighlight = {
  /** ID del nodo desde el que sale el puntero resaltado. */
  fromId: string;
  /** ID del nodo al que apunta. null = `None`. */
  toId: string | null;
  /** Etiqueta del puntero, ej. "siguiente". */
  label?: string;
  /**
   * - "normal": el puntero ya existente
   * - "new": puntero recién creado (verde)
   * - "broken": puntero a punto de desconectarse (rojo, tachado)
   */
  variant?: "normal" | "new" | "broken";
};

export type LinkedListState = {
  /** Nodos en orden de la cabeza al final. */
  nodes: ListNode[];
  /** ID del nodo que se está visitando ahora. */
  cursor?: string;
  /** ID del nodo recién insertado (resaltado en verde). */
  newNodeId?: string;
  /**
   * ID del nodo a punto de ser eliminado (resaltado en rojo).
   * Una vez eliminado del array, este campo no se vuelve a pasar.
   */
  removingId?: string;
  /**
   * Puntero "extra" para mostrar reescrituras (ej. `anterior` apuntando a un
   * nuevo `siguiente`).
   */
  extraPointer?: PointerHighlight;
  /**
   * Nombre y nodo al que apunta una "variable de cursor", ej. `actual` o
   * `anterior`. Se dibuja como etiqueta arriba del nodo correspondiente.
   */
  variables?: { name: string; nodeId: string | null }[];
};
