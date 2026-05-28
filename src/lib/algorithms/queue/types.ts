/**
 * Cola (Queue) FIFO. El primer elemento del array es el FRENTE (el que se
 * atiende), el último es el FONDO (el que recién llega).
 *
 * Visualmente horizontal: frente a la izquierda, fondo a la derecha.
 */
export type QueueItem = {
  id: string;
  value: string;
};

export type QueueState = {
  items: QueueItem[];
  operation?: "enqueue" | "dequeue" | "peek" | "init" | "size-check";
  /** Valor entrando o saliendo en este step. */
  flying?: { id: string; value: string };
  /** ID del recién agregado al fondo — se resalta. */
  newId?: string;
  /** ID del que está en el frente cuando hacemos peek/dequeue. */
  highlightId?: string;
  /** Valor retornado por la operación. */
  returned?: string | null;
  isEmpty?: boolean;
};
