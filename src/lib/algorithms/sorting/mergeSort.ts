import type { Step, WatchEntry } from "@/lib/types";
import type { SortElement, SortState } from "./types";

export const MERGE_SORT_CODE = `def merge_sort(arr, lo, hi):
    if lo >= hi:
        return
    mid = (lo + hi) // 2
    merge_sort(arr, lo, mid)
    merge_sort(arr, mid + 1, hi)
    merge(arr, lo, mid, hi)

def merge(arr, lo, mid, hi):
    izq = arr[lo:mid + 1]
    der = arr[mid + 1:hi + 1]
    i = j = 0
    k = lo
    while i < len(izq) and j < len(der):
        if izq[i] <= der[j]:
            arr[k] = izq[i]
            i += 1
        else:
            arr[k] = der[j]
            j += 1
        k += 1
    while i < len(izq):
        arr[k] = izq[i]; i += 1; k += 1
    while j < len(der):
        arr[k] = der[j]; j += 1; k += 1
`;

/**
 * Merge sort top-down. Divide y vencerás: dos mitades recursivas + un merge
 * lineal. Para la visualización destacamos la mitad izquierda (sky) y la
 * derecha (fuchsia) durante el merge; los elementos físicamente cambian de
 * posición preservando sus IDs (Framer Motion anima el reordenamiento).
 */
export function generateMergeSortSteps(
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

  function mergeSort(lo: number, hi: number): void {
    if (lo >= hi) {
      snap(
        2,
        `lo (${lo}) >= hi (${hi}): tramo de 1 elemento o vacío, ya está ordenado.`,
        { activeRange: [lo, Math.max(lo, hi)] },
        [
          { name: "lo", value: String(lo), kind: "input" },
          { name: "hi", value: String(hi), kind: "input" },
        ],
      );
      return;
    }
    const mid = Math.floor((lo + hi) / 2);
    snap(
      4,
      `Llamada merge_sort(lo=${lo}, hi=${hi}). Divido por mid = ${mid}.`,
      { activeRange: [lo, hi] },
      [
        { name: "lo", value: String(lo), kind: "input", changed: true },
        { name: "hi", value: String(hi), kind: "input", changed: true },
        {
          name: "mid",
          value: String(mid),
          kind: "computed",
          changed: true,
        },
      ],
    );

    snap(
      5,
      `Recursión izquierda: merge_sort(${lo}, ${mid}).`,
      {
        activeRange: [lo, hi],
        leftRange: [lo, mid],
      },
    );
    mergeSort(lo, mid);

    snap(
      6,
      `Recursión derecha: merge_sort(${mid + 1}, ${hi}).`,
      {
        activeRange: [lo, hi],
        rightRange: [mid + 1, hi],
      },
    );
    mergeSort(mid + 1, hi);

    snap(
      7,
      `Las dos mitades [${lo}..${mid}] y [${mid + 1}..${hi}] están ordenadas. Las combino.`,
      {
        activeRange: [lo, hi],
        leftRange: [lo, mid],
        rightRange: [mid + 1, hi],
      },
    );
    merge(lo, mid, hi);
  }

  function merge(lo: number, mid: number, hi: number): void {
    const left = elements.slice(lo, mid + 1);
    const right = elements.slice(mid + 1, hi + 1);

    let i = 0;
    let j = 0;
    let k = lo;

    snap(
      10,
      `Copio mitades. izq tiene ${left.length} elementos, der tiene ${right.length}.`,
      {
        activeRange: [lo, hi],
        leftRange: [lo, mid],
        rightRange: [mid + 1, hi],
        markers: [
          { name: "k", index: k, tone: "purple" },
        ],
      },
      [
        { name: "lo", value: String(lo), kind: "input" },
        { name: "mid", value: String(mid), kind: "input" },
        { name: "hi", value: String(hi), kind: "input" },
        {
          name: "izq",
          value: `[${left.map((e) => e.value).join(", ")}]`,
          kind: "computed",
        },
        {
          name: "der",
          value: `[${right.map((e) => e.value).join(", ")}]`,
          kind: "computed",
        },
      ],
    );

    while (i < left.length && j < right.length) {
      comparisons++;
      const li = left[i].value;
      const rj = right[j].value;
      snap(
        14,
        `Comparo izq[${i}]=${li} con der[${j}]=${rj}.`,
        {
          activeRange: [lo, hi],
          leftRange: [lo, mid],
          rightRange: [mid + 1, hi],
          markers: [
            { name: "k", index: k, tone: "purple" },
          ],
        },
        [
          { name: "i", value: String(i), kind: "computed", changed: true },
          { name: "j", value: String(j), kind: "computed", changed: true },
          { name: "k", value: String(k), kind: "computed" },
          { name: "izq[i]", value: String(li), kind: "computed" },
          { name: "der[j]", value: String(rj), kind: "computed" },
        ],
      );

      if (li <= rj) {
        elements[k] = left[i];
        i++;
      } else {
        elements[k] = right[j];
        j++;
      }
      k++;
      swaps++;
      snap(
        15,
        `Coloco el menor en arr[${k - 1}]. Avanzo k.`,
        {
          activeRange: [lo, hi],
          leftRange: [lo, mid],
          rightRange: [mid + 1, hi],
          markers: [{ name: "k", index: k, tone: "purple" }],
        },
      );
    }

    while (i < left.length) {
      elements[k] = left[i];
      i++;
      k++;
      swaps++;
      snap(
        20,
        `Resto de izq: copio.`,
        {
          activeRange: [lo, hi],
          leftRange: [lo, mid],
          rightRange: [mid + 1, hi],
          markers: [{ name: "k", index: k, tone: "purple" }],
        },
      );
    }

    while (j < right.length) {
      elements[k] = right[j];
      j++;
      k++;
      swaps++;
      snap(
        21,
        `Resto de der: copio.`,
        {
          activeRange: [lo, hi],
          leftRange: [lo, mid],
          rightRange: [mid + 1, hi],
          markers: [{ name: "k", index: k, tone: "purple" }],
        },
      );
    }

    snap(0, `Tramo [${lo}..${hi}] mergeado y ordenado.`, {
      activeRange: [lo, hi],
    });
  }

  snap(1, `Llamada inicial merge_sort(arr, 0, ${n - 1}).`, {}, [
    { name: "arr", value: `[${values.join(", ")}]`, kind: "input" },
  ]);

  mergeSort(0, n - 1);

  snap(
    0,
    `Arreglo ordenado. ${comparisons} comparaciones, ${swaps} movimientos.`,
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
