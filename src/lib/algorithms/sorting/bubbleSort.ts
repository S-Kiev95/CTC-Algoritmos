import type { Step, WatchEntry } from "@/lib/types";
import type { SortElement, SortState } from "./types";

export const BUBBLE_SORT_CODE = `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr
`;

/**
 * Bubble sort: en cada pasada los elementos "burbujean" hasta el final.
 * Cada comparación y cada swap es un step. El watch muestra `n`, `i`, `j`
 * y los dos valores que se comparan.
 */
export function generateBubbleSortSteps(
  values: number[],
): Step<SortState>[] {
  const steps: Step<SortState>[] = [];
  const elements: SortElement[] = values.map((v, i) => ({
    id: `e${i}`,
    value: v,
  }));
  let comparisons = 0;
  let swaps = 0;
  const n = elements.length;

  function snap(
    line: number,
    note: string,
    extras: Partial<SortState> = {},
    watch?: WatchEntry[],
  ): void {
    steps.push({
      state: {
        elements: [...elements],
        comparisons,
        swaps,
        ...extras,
      },
      line,
      note,
      watch,
    });
  }

  snap(
    1,
    `Llamada a bubble_sort([${values.join(", ")}]).`,
    {},
    [
      {
        name: "arr",
        value: `[${values.join(", ")}]`,
        kind: "input",
      },
    ],
  );

  snap(2, `n = ${n}.`, {}, [
    { name: "n", value: String(n), kind: "computed", changed: true },
  ]);

  for (let i = 0; i < n; i++) {
    snap(
      3,
      `Pasada externa i = ${i}. Voy a comparar hasta el índice ${n - 1 - i}.`,
      {
        sortedRange: i > 0 ? [n - i, n - 1] : undefined,
        markers: [{ name: "i", index: i, tone: "sky" }],
      },
      [
        { name: "n", value: String(n), kind: "computed" },
        { name: "i", value: String(i), kind: "computed", changed: true },
      ],
    );

    for (let j = 0; j < n - 1 - i; j++) {
      snap(
        4,
        `Iteración interna j = ${j}.`,
        {
          sortedRange: i > 0 ? [n - i, n - 1] : undefined,
          markers: [
            { name: "i", index: i, tone: "sky" },
            { name: "j", index: j, tone: "amber" },
          ],
        },
        [
          { name: "i", value: String(i), kind: "computed" },
          { name: "j", value: String(j), kind: "computed", changed: true },
        ],
      );

      comparisons++;
      const a = elements[j].value;
      const b = elements[j + 1].value;
      const greater = a > b;
      snap(
        5,
        `¿arr[${j}] (${a}) > arr[${j + 1}] (${b})? ${greater ? "Sí." : "No."}`,
        {
          sortedRange: i > 0 ? [n - i, n - 1] : undefined,
          comparing: [j, j + 1],
          markers: [
            { name: "i", index: i, tone: "sky" },
            { name: "j", index: j, tone: "amber" },
          ],
        },
        [
          { name: "i", value: String(i), kind: "computed" },
          { name: "j", value: String(j), kind: "computed" },
          {
            name: `arr[${j}]`,
            value: String(a),
            kind: "computed",
            changed: true,
          },
          {
            name: `arr[${j + 1}]`,
            value: String(b),
            kind: "computed",
            changed: true,
          },
        ],
      );

      if (greater) {
        // Highlight swap
        snap(
          6,
          `Intercambio arr[${j}] con arr[${j + 1}].`,
          {
            sortedRange: i > 0 ? [n - i, n - 1] : undefined,
            swapping: [j, j + 1],
            markers: [
              { name: "i", index: i, tone: "sky" },
              { name: "j", index: j, tone: "amber" },
            ],
          },
          [
            { name: "i", value: String(i), kind: "computed" },
            { name: "j", value: String(j), kind: "computed" },
          ],
        );
        // Do the swap
        [elements[j], elements[j + 1]] = [elements[j + 1], elements[j]];
        swaps++;
        snap(
          6,
          `Swap completado: ahora arr[${j}]=${elements[j].value}, arr[${j + 1}]=${elements[j + 1].value}.`,
          {
            sortedRange: i > 0 ? [n - i, n - 1] : undefined,
            markers: [
              { name: "i", index: i, tone: "sky" },
              { name: "j", index: j, tone: "amber" },
            ],
          },
        );
      }
    }

    snap(
      0,
      `Fin de pasada i=${i}. El elemento en posición [${n - 1 - i}] ya está en su lugar definitivo.`,
      {
        sortedRange: [n - 1 - i, n - 1],
      },
    );
  }

  snap(
    7,
    `Arreglo completamente ordenado.`,
    {
      sortedRange: [0, n - 1],
    },
    [
      {
        name: "return",
        value: `[${elements.map((e) => e.value).join(", ")}]`,
        kind: "output",
        changed: true,
      },
    ],
  );

  return steps;
}
