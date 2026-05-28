import type { Step, WatchEntry } from "@/lib/types";
import type { Array1DState } from "./types";

export const LINEAR_SEARCH_CODE = `def busqueda_lineal(arr, objetivo):
    for i in range(len(arr)):
        if arr[i] == objetivo:
            return i
    return -1
`;

/**
 * Genera los pasos para buscar `target` en `values` recorriendo de izquierda
 * a derecha y comparando cada elemento. El watch panel muestra `arr`,
 * `objetivo`, `i`, `arr[i]` y eventualmente el `return`.
 */
export function generateLinearSearchSteps(
  values: number[],
  target: number,
): Step<Array1DState>[] {
  const steps: Step<Array1DState>[] = [];

  function snap(
    line: number,
    note: string,
    cursor: number | null,
    watch?: WatchEntry[],
    extra: Partial<Array1DState> = {},
  ): void {
    steps.push({
      state: {
        values: [...values],
        cursor,
        target,
        ...extra,
      },
      line,
      note,
      watch,
    });
  }

  const arrStr = `[${values.join(", ")}]`;
  const baseInputs: WatchEntry[] = [
    { name: "arr", value: arrStr, kind: "input" },
    { name: "objetivo", value: String(target), kind: "input" },
  ];

  snap(
    1,
    `Llamada a busqueda_lineal con arr=${arrStr} y objetivo=${target}.`,
    null,
    baseInputs,
  );

  for (let i = 0; i < values.length; i++) {
    snap(2, `Itero con i = ${i}.`, i, [
      ...baseInputs,
      { name: "i", value: String(i), kind: "computed", changed: true },
    ]);
    const ok = values[i] === target;
    snap(
      3,
      `Comparo: arr[${i}] = ${values[i]}, ¿${values[i]} == ${target}? ${ok ? "Sí." : "No."}`,
      i,
      [
        ...baseInputs,
        { name: "i", value: String(i), kind: "computed" },
        {
          name: `arr[${i}]`,
          value: String(values[i]),
          kind: "computed",
          changed: true,
        },
      ],
    );
    if (ok) {
      snap(
        4,
        `Encontrado en el índice ${i}. Devuelvo ${i}.`,
        i,
        [
          ...baseInputs,
          { name: "i", value: String(i), kind: "computed" },
          { name: `arr[${i}]`, value: String(values[i]), kind: "computed" },
          {
            name: "return",
            value: String(i),
            kind: "output",
            changed: true,
          },
        ],
        { found: i },
      );
      return steps;
    }
  }

  snap(
    5,
    `Recorrí todo el arreglo sin éxito. Devuelvo -1.`,
    null,
    [
      ...baseInputs,
      { name: "return", value: "-1", kind: "output", changed: true },
    ],
    { exhausted: true },
  );
  return steps;
}
