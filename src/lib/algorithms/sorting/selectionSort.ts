import type { Step, WatchEntry } from "@/lib/types";
import type { SortElement, SortState } from "./types";

export const SELECTION_SORT_CODE = `def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr
`;

/**
 * Selection sort: en cada pasada encuentra el mínimo del sub-arreglo
 * restante y lo intercambia a la posición i. Hace siempre O(n²) comparaciones
 * pero a lo sumo n swaps — eso es lo que lo distingue de bubble.
 */
export function generateSelectionSortSteps(
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

  snap(1, `Llamada a selection_sort([${values.join(", ")}]).`, {}, [
    { name: "arr", value: `[${values.join(", ")}]`, kind: "input" },
  ]);

  snap(2, `n = ${n}.`, {}, [
    { name: "n", value: String(n), kind: "computed", changed: true },
  ]);

  for (let i = 0; i < n; i++) {
    let minIdx = i;
    snap(
      3,
      `Pasada i = ${i}. Asumo que el mínimo está en [${i}].`,
      {
        sortedRange: i > 0 ? [0, i - 1] : undefined,
        markers: [
          { name: "i", index: i, tone: "sky" },
          { name: "min_idx", index: minIdx, tone: "purple" },
        ],
      },
      [
        { name: "i", value: String(i), kind: "computed", changed: true },
        {
          name: "min_idx",
          value: String(minIdx),
          kind: "computed",
          changed: true,
        },
      ],
    );
    snap(4, `min_idx = i = ${i}.`, {
      sortedRange: i > 0 ? [0, i - 1] : undefined,
      markers: [
        { name: "i", index: i, tone: "sky" },
        { name: "min_idx", index: minIdx, tone: "purple" },
      ],
    });

    for (let j = i + 1; j < n; j++) {
      snap(
        5,
        `j = ${j}. Comparo arr[${j}]=${elements[j].value} con arr[min_idx=${minIdx}]=${elements[minIdx].value}.`,
        {
          sortedRange: i > 0 ? [0, i - 1] : undefined,
          comparing: [j, minIdx],
          markers: [
            { name: "i", index: i, tone: "sky" },
            { name: "j", index: j, tone: "amber" },
            { name: "min_idx", index: minIdx, tone: "purple" },
          ],
        },
        [
          { name: "i", value: String(i), kind: "computed" },
          { name: "j", value: String(j), kind: "computed", changed: true },
          { name: "min_idx", value: String(minIdx), kind: "computed" },
          {
            name: `arr[j]`,
            value: String(elements[j].value),
            kind: "computed",
          },
          {
            name: `arr[min_idx]`,
            value: String(elements[minIdx].value),
            kind: "computed",
          },
        ],
      );
      comparisons++;

      if (elements[j].value < elements[minIdx].value) {
        minIdx = j;
        snap(
          6,
          `arr[${j}] es menor: actualizo min_idx = ${j}.`,
          {
            sortedRange: i > 0 ? [0, i - 1] : undefined,
            markers: [
              { name: "i", index: i, tone: "sky" },
              { name: "j", index: j, tone: "amber" },
              { name: "min_idx", index: minIdx, tone: "purple" },
            ],
          },
          [
            { name: "i", value: String(i), kind: "computed" },
            { name: "j", value: String(j), kind: "computed" },
            {
              name: "min_idx",
              value: String(minIdx),
              kind: "computed",
              changed: true,
            },
          ],
        );
      }
    }

    if (minIdx !== i) {
      snap(
        7,
        `Mínimo encontrado en [${minIdx}]. Intercambio con [${i}].`,
        {
          sortedRange: i > 0 ? [0, i - 1] : undefined,
          swapping: [i, minIdx],
          markers: [
            { name: "i", index: i, tone: "sky" },
            { name: "min_idx", index: minIdx, tone: "purple" },
          ],
        },
      );
      [elements[i], elements[minIdx]] = [elements[minIdx], elements[i]];
      swaps++;
      snap(7, `Swap hecho. arr[${i}] = ${elements[i].value}.`, {
        sortedRange: [0, i],
      });
    } else {
      snap(7, `min_idx == i, no hay swap necesario.`, {
        sortedRange: [0, i],
      });
    }
  }

  snap(
    8,
    `Arreglo completamente ordenado. ${swaps} intercambios (vs ${comparisons} comparaciones).`,
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
