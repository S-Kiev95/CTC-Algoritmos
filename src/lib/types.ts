/**
 * Una entrada del "watch panel" estilo debugger: nombre de variable y su
 * valor textual en este momento de la ejecución. `kind` controla el color
 * para distinguir entradas (parámetros) de salidas (return) y estado
 * intermedio.
 */
export type WatchEntry = {
  name: string;
  value: string;
  /** "input" = parámetro, "computed" = variable local, "output" = retorno. */
  kind?: "input" | "computed" | "output";
  /** Si cambió en este step respecto al anterior — se resalta. */
  changed?: boolean;
};

/**
 * Un Step representa un instante en la ejecución del algoritmo:
 * el estado de la estructura de datos + la línea de código que se ejecuta
 * + un comentario opcional + variables en scope para mostrar al usuario.
 *
 * Cada visualización define su propio TState (forma del estado),
 * pero todas comparten esta envoltura para que el reproductor sea genérico.
 */
export type Step<TState> = {
  state: TState;
  line: number;
  note?: string;
  /** Variables en scope en este instante. Si está vacío/undefined no se muestra panel. */
  watch?: WatchEntry[];
  /** Sonido a reproducir al llegar a este paso (opcional; default un "tick"). */
  sound?: "tick" | "place" | "pop" | "carve" | "found" | "error";
};

export type Algorithm<TState> = {
  /** Identificador único dentro del tema (ej. "busqueda-lineal") */
  id: string;
  /** Nombre que ve el usuario */
  name: string;
  /** Breve descripción del problema */
  description: string;
  /** Código fuente (Python) que se muestra en el panel derecho */
  code: string;
  /** Lista precomputada de pasos para reproducir */
  steps: Step<TState>[];
};
