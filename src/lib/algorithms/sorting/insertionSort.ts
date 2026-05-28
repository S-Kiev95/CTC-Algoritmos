import type { Step, WatchEntry } from "@/lib/types";
import type { SortElement, SortState } from "./types";

export const INSERTION_SORT_CODE = `def insertion_sort(arr):
    for i in range(1, len(arr)):
        j = i
        while j > 0 and arr[j - 1] > arr[j]:
            arr[j], arr[j - 1] = arr[j - 1], arr[j]
            j -= 1
    return arr
`;

/**
 * Insertion sort versión "con swaps". Cada elemento se inserta en su lugar
 * correcto dentro del sub-arreglo ya ordenado a la izquierda, intercambiando
 * con el vecino izquierdo hasta que ya no haga falta. Es la versión más
 * natural para visualizar — el elemento "burbujea hacia atrás" hasta su sitio.
 *
 * Eficiencia: O(n²) peor caso, O(n) mejor (arreglo ya ordenado).
 */
export function generateInsertionSortSteps(
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

  snap(1, `Llamada a insertion_sort([${values.join(", ")}]).`, {
    sortedRange: [0, 0],
  }, [
    { name: "arr", value: `[${values.join(", ")}]`, kind: "input" },
  ]);

  for (let i = 1; i < n; i++) {
    snap(
      2,
      `Pasada i = ${i}. Voy a insertar arr[${i}]=${elements[i].value} en su lugar dentro del sub-arreglo [0..${i - 1}].`,
      {
        sortedRange: [0, i - 1],
        markers: [{ name: "i", index: i, tone: "sky" }],
      },
      [
        { name: "i", value: String(i), kind: "computed", changed: true },
        {
          name: `arr[i]`,
          value: String(elements[i].value),
          kind: "computed",
        },
      ],
    );

    let j = i;
    snap(
      3,
      `j = i = ${j}.`,
      {
        sortedRange: [0, i - 1],
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

    while (j > 0) {
      const prev = elements[j - 1].value;
      const cur = elements[j].value;
      comparisons++;
      const greater = prev > cur;
      snap(
        4,
        `¿arr[${j - 1}] (${prev}) > arr[${j}] (${cur})? ${greater ? "Sí, sigo bajando." : "No, el lugar está."}`,
        {
          sortedRange: [0, i - 1],
          comparing: [j - 1, j],
          markers: [
            { name: "i", index: i, tone: "sky" },
            { name: "j", index: j, tone: "amber" },
          ],
        },
        [
          { name: "j", value: String(j), kind: "computed" },
          {
            name: `arr[j-1]`,
            value: String(prev),
            kind: "computed",
            changed: true,
          },
          {
            name: `arr[j]`,
            value: String(cur),
            kind: "computed",
          },
        ],
      );
      if (!greater) break;

      snap(
        5,
        `Intercambio arr[${j}] con arr[${j - 1}].`,
        {
          sortedRange: [0, i - 1],
          swapping: [j, j - 1],
          markers: [
            { name: "i", index: i, tone: "sky" },
            { name: "j", index: j, tone: "amber" },
          ],
        },
      );
      [elements[j], elements[j - 1]] = [elements[j - 1], elements[j]];
      swaps++;
      j -= 1;
      snap(
        6,
        `j = ${j}.`,
        {
          sortedRange: [0, i - 1],
          markers: [
            { name: "i", index: i, tone: "sky" },
            { name: "j", index: j, tone: "amber" },
          ],
        },
        [
          { name: "j", value: String(j), kind: "computed", changed: true },
        ],
      );
    }

    snap(0, `Elemento insertado en su lugar.`, {
      sortedRange: [0, i],
    });
  }

  snap(
    7,
    `Arreglo ordenado.`,
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
