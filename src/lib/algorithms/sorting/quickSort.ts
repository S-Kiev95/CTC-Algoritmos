import type { Step, WatchEntry } from "@/lib/types";
import type { SortElement, SortState } from "./types";

export const QUICK_SORT_CODE = `def quick_sort(arr, bajo, alto):
    if bajo < alto:
        p = particionar(arr, bajo, alto)
        quick_sort(arr, bajo, p - 1)
        quick_sort(arr, p + 1, alto)

def particionar(arr, bajo, alto):
    pivote = arr[alto]
    i = bajo - 1
    for j in range(bajo, alto):
        if arr[j] <= pivote:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[alto] = arr[alto], arr[i + 1]
    return i + 1
`;

/**
 * Quick sort con esquema Lomuto: el pivote es el último elemento del rango,
 * `i` marca la frontera entre los "menores o iguales al pivote" y `j` recorre
 * todo el rango comparando.
 *
 * Visualización: el pivote queda destacado en púrpura, `i` y `j` aparecen
 * como markers. La parte fuera del rango activo se atenúa para enfocar
 * dónde está trabajando la recursión.
 */
export function generateQuickSortSteps(
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

  function quickSort(lo: number, hi: number): void {
    if (lo >= hi) {
      snap(
        2,
        `bajo (${lo}) >= alto (${hi}): tramo de 1 elemento, ya está.`,
        { activeRange: [lo, Math.max(lo, hi)] },
        [
          { name: "bajo", value: String(lo), kind: "input" },
          { name: "alto", value: String(hi), kind: "input" },
        ],
      );
      return;
    }
    snap(
      2,
      `Llamada quick_sort(bajo=${lo}, alto=${hi}).`,
      { activeRange: [lo, hi] },
      [
        { name: "bajo", value: String(lo), kind: "input", changed: true },
        { name: "alto", value: String(hi), kind: "input", changed: true },
      ],
    );

    const p = partition(lo, hi);

    snap(
      4,
      `Recursión izquierda: quick_sort(${lo}, ${p - 1}).`,
      { activeRange: [lo, hi] },
    );
    quickSort(lo, p - 1);

    snap(
      5,
      `Recursión derecha: quick_sort(${p + 1}, ${hi}).`,
      { activeRange: [lo, hi] },
    );
    quickSort(p + 1, hi);
  }

  function partition(lo: number, hi: number): number {
    const pivotValue = elements[hi].value;
    snap(
      8,
      `Particionar(${lo}, ${hi}). El pivote es arr[${hi}] = ${pivotValue}.`,
      { activeRange: [lo, hi], pivotIndex: hi },
      [
        { name: "bajo", value: String(lo), kind: "input" },
        { name: "alto", value: String(hi), kind: "input" },
        {
          name: "pivote",
          value: String(pivotValue),
          kind: "computed",
          changed: true,
        },
      ],
    );

    let i = lo - 1;
    snap(
      9,
      `i = bajo - 1 = ${i}. Es la frontera de los "menores o iguales al pivote".`,
      {
        activeRange: [lo, hi],
        pivotIndex: hi,
        markers: [{ name: "i", index: i, tone: "amber" }],
      },
      [
        { name: "i", value: String(i), kind: "computed", changed: true },
        { name: "pivote", value: String(pivotValue), kind: "computed" },
      ],
    );

    for (let j = lo; j < hi; j++) {
      snap(
        10,
        `j = ${j}.`,
        {
          activeRange: [lo, hi],
          pivotIndex: hi,
          markers: [
            { name: "i", index: i, tone: "amber" },
            { name: "j", index: j, tone: "sky" },
          ],
        },
        [
          { name: "i", value: String(i), kind: "computed" },
          { name: "j", value: String(j), kind: "computed", changed: true },
        ],
      );

      comparisons++;
      const aj = elements[j].value;
      const leq = aj <= pivotValue;
      snap(
        11,
        `¿arr[${j}] (${aj}) <= pivote (${pivotValue})? ${leq ? "Sí." : "No, no toco nada."}`,
        {
          activeRange: [lo, hi],
          pivotIndex: hi,
          comparing: [j, hi],
          markers: [
            { name: "i", index: i, tone: "amber" },
            { name: "j", index: j, tone: "sky" },
          ],
        },
        [
          { name: "j", value: String(j), kind: "computed" },
          { name: "arr[j]", value: String(aj), kind: "computed" },
          { name: "pivote", value: String(pivotValue), kind: "computed" },
        ],
      );

      if (leq) {
        i++;
        snap(
          12,
          `i = ${i}. Voy a intercambiar arr[${i}] con arr[${j}].`,
          {
            activeRange: [lo, hi],
            pivotIndex: hi,
            markers: [
              { name: "i", index: i, tone: "amber" },
              { name: "j", index: j, tone: "sky" },
            ],
          },
          [
            { name: "i", value: String(i), kind: "computed", changed: true },
            { name: "j", value: String(j), kind: "computed" },
          ],
        );
        if (i !== j) {
          snap(
            13,
            `Swap arr[${i}] ↔ arr[${j}].`,
            {
              activeRange: [lo, hi],
              pivotIndex: hi,
              swapping: [i, j],
              markers: [
                { name: "i", index: i, tone: "amber" },
                { name: "j", index: j, tone: "sky" },
              ],
            },
          );
          [elements[i], elements[j]] = [elements[j], elements[i]];
          swaps++;
          snap(
            13,
            `Swap completado.`,
            {
              activeRange: [lo, hi],
              pivotIndex: hi,
              markers: [
                { name: "i", index: i, tone: "amber" },
                { name: "j", index: j, tone: "sky" },
              ],
            },
          );
        }
      }
    }

    // Mover el pivote a su posición final
    snap(
      14,
      `Recorrido completo. Coloco el pivote en su lugar: swap arr[${i + 1}] ↔ arr[${hi}].`,
      {
        activeRange: [lo, hi],
        pivotIndex: hi,
        swapping: [i + 1, hi],
        markers: [{ name: "i", index: i, tone: "amber" }],
      },
    );
    [elements[i + 1], elements[hi]] = [elements[hi], elements[i + 1]];
    swaps++;
    snap(
      14,
      `Pivote en posición [${i + 1}]. Los menores quedaron a la izquierda, los mayores a la derecha.`,
      {
        activeRange: [lo, hi],
        pivotIndex: i + 1,
        sortedRange: [i + 1, i + 1],
      },
      [
        {
          name: "return",
          value: String(i + 1),
          kind: "output",
          changed: true,
        },
      ],
    );
    return i + 1;
  }

  snap(1, `Llamada inicial quick_sort(arr, 0, ${n - 1}).`, {}, [
    { name: "arr", value: `[${values.join(", ")}]`, kind: "input" },
  ]);

  quickSort(0, n - 1);

  snap(
    0,
    `Arreglo ordenado. ${comparisons} comparaciones, ${swaps} intercambios.`,
    { sortedRange: [0, n - 1] },
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
