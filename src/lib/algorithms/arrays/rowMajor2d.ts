import type { Step, WatchEntry } from "@/lib/types";
import { cellKey, type Array2DState } from "./types";

export const ROW_MAJOR_CODE = `def recorrer(matriz):
    filas = len(matriz)
    cols = len(matriz[0])
    for i in range(filas):
        for j in range(cols):
            print(matriz[i][j])
`;

/**
 * Recorrido row-major: por cada fila, recorre todas las columnas antes
 * de pasar a la siguiente fila. Equivale a los dos for anidados clásicos.
 *
 * El watch panel muestra `filas`, `cols`, `i`, `j` y `matriz[i][j]` —
 * exactamente los nombres que aparecen en el código.
 */
export function generateRowMajorSteps(
  values: number[][],
): Step<Array2DState>[] {
  const rows = values.length;
  const cols = values[0]?.length ?? 0;
  const steps: Step<Array2DState>[] = [];
  const visited: string[] = [];

  function snap(
    line: number,
    note: string,
    cursor?: { row: number; col: number },
    watch?: WatchEntry[],
  ): void {
    steps.push({
      state: {
        rows,
        cols,
        values,
        cursor,
        visited: [...visited],
      },
      line,
      note,
      watch,
    });
  }

  const baseInputs: WatchEntry[] = [
    { name: "filas", value: String(rows), kind: "computed" },
    { name: "cols", value: String(cols), kind: "computed" },
  ];

  snap(1, `Recibo una matriz de ${rows}×${cols}.`, undefined, [
    { name: "matriz", value: `${rows}×${cols}`, kind: "input" },
  ]);
  snap(2, `filas = ${rows}.`, undefined, [
    { name: "matriz", value: `${rows}×${cols}`, kind: "input" },
    {
      name: "filas",
      value: String(rows),
      kind: "computed",
      changed: true,
    },
  ]);
  snap(3, `cols = ${cols}.`, undefined, [
    ...baseInputs,
    {
      name: "cols",
      value: String(cols),
      kind: "computed",
      changed: true,
    },
  ]);

  for (let i = 0; i < rows; i++) {
    snap(4, `Empiezo la fila i = ${i}.`, { row: i, col: 0 }, [
      ...baseInputs,
      { name: "i", value: String(i), kind: "computed", changed: true },
    ]);
    for (let j = 0; j < cols; j++) {
      snap(5, `Columna j = ${j}.`, { row: i, col: j }, [
        ...baseInputs,
        { name: "i", value: String(i), kind: "computed" },
        { name: "j", value: String(j), kind: "computed", changed: true },
      ]);
      snap(
        6,
        `Visito matriz[${i}][${j}] = ${values[i][j]}.`,
        { row: i, col: j },
        [
          ...baseInputs,
          { name: "i", value: String(i), kind: "computed" },
          { name: "j", value: String(j), kind: "computed" },
          {
            name: `matriz[${i}][${j}]`,
            value: String(values[i][j]),
            kind: "computed",
            changed: true,
          },
        ],
      );
      visited.push(cellKey(i, j));
    }
  }

  steps.push({
    state: {
      rows,
      cols,
      values,
      cursor: undefined,
      visited: [...visited],
    },
    line: 0,
    note: `Recorrido completo: ${rows * cols} celdas visitadas.`,
    watch: [
      {
        name: "visitadas",
        value: String(rows * cols),
        kind: "output",
      },
    ],
  });

  return steps;
}
