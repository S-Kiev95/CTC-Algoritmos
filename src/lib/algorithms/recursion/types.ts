/**
 * Estado compartido por las visualizaciones de recursividad.
 * Cada Step<RecursionState> es un snapshot de la pila + qué frame se está mirando.
 */

export type FrameStatus = "active" | "waiting" | "returning";

export type CallFrame = {
  /** ID estable para reconciliación de animaciones */
  id: string;
  /** Nombre de la función, ej. "factorial" o "fib" */
  fn: string;
  /** Argumentos de la llamada, ej. [3] */
  args: number[];
  /** Valor devuelto, presente solo cuando status === "returning" */
  returnValue?: number;
  /**
   * - "active": frame ejecutándose ahora (top of stack)
   * - "waiting": frame esperando a que su llamada recursiva termine
   * - "returning": frame con su valor de retorno listo, a punto de hacer pop
   */
  status: FrameStatus;
};

export type RecursionState = {
  /** Pila de llamadas. Index 0 = primera llamada; último = top of stack. */
  stack: CallFrame[];
  /** Resultado final, una vez que la pila quedó vacía. */
  finalResult?: number;
};
