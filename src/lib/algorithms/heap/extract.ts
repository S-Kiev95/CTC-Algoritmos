import type { Step, WatchEntry } from "@/lib/types";
import {
  leftIdx,
  rightIdx,
  type HeapItem,
  type HeapState,
} from "./types";

export const HEAP_POP_CODE = `import heapq

# heappop: saca la raíz (el mínimo) y reordena (bubble-down)
heap = [2, 7, 3, 12, 9, 5]    # min-heap
minimo = heapq.heappop(heap)
# 1. Guardo la raíz (mínimo): 2
# 2. Pongo el último (5) en la raíz: [5, 7, 3, 12, 9]
# 3. Comparo con hijos (7, 3): el menor es 3
#    5 > 3 → intercambio con índice 2
#    [3, 7, 5, 12, 9]
# 4. Comparo con hijos (no tiene más): listo
# heap final: [3, 7, 5, 12, 9], retornó 2
`;

/**
 * Genera pasos para extraer la raíz de un min-heap N veces. Cada
 * extracción muestra: guardar raíz, mover último a raíz, bubble-down.
 */
export function generateHeapPopSteps(
  initial: number[],
  pops: number,
): Step<HeapState>[] {
  const steps: Step<HeapState>[] = [];
  const items: HeapItem[] = initial.map((k, i) => ({
    id: `h-${i}-${k}`,
    key: k,
  }));

  function snap(
    line: number,
    note: string,
    extras: Partial<HeapState> = {},
    watch?: WatchEntry[],
  ) {
    steps.push({
      state: { items: items.map((it) => ({ ...it })), ...extras },
      line,
      note,
      watch,
    });
  }

  snap(
    3,
    `Heap inicial: [${items.map((i) => i.key).join(", ")}]. La raíz (${items[0]?.key ?? "—"}) es el mínimo.`,
  );

  for (let popN = 0; popN < pops; popN++) {
    if (items.length === 0) {
      snap(0, "Heap vacío — no hay nada que extraer.", { operation: "done" });
      break;
    }

    const root = items[0];

    // 1. Anunciar que sacamos la raíz
    snap(
      4,
      `heappop(): saco la raíz, que es ${root.key} (el menor del heap).`,
      { operation: "pop", cursorId: root.id, extracted: root },
      [
        {
          name: "mínimo extraído",
          value: String(root.key),
          kind: "output",
          changed: true,
        },
      ],
    );

    if (items.length === 1) {
      items.pop();
      snap(
        5,
        `Solo había un elemento. Heap queda vacío.`,
        { operation: "done", extracted: root },
      );
      continue;
    }

    // 2. Reemplazar raíz con el último
    const last = items[items.length - 1];
    items[0] = last;
    items.pop();
    snap(
      5,
      `Pongo el último elemento (${last.key}) en la raíz. Ahora hay que bajarlo a su lugar.`,
      {
        operation: "bubble-down",
        cursorId: last.id,
        movingFromBottomId: last.id,
      },
      [
        { name: "nueva raíz (provisoria)", value: String(last.key), kind: "computed", changed: true },
        { name: "len(heap)", value: String(items.length), kind: "computed", changed: true },
      ],
    );

    // 3. Bubble-down
    let idx = 0;
    while (true) {
      const l = leftIdx(idx);
      const r = rightIdx(idx);

      if (l >= items.length) {
        snap(
          8,
          `Índice ${idx} no tiene hijos — está en su lugar. Terminé.`,
          { operation: "done", cursorId: items[idx].id, extracted: root },
          [
            { name: "estado", value: "heap válido", kind: "output", changed: true },
          ],
        );
        break;
      }

      const current = items[idx];
      const left = items[l];
      const right = r < items.length ? items[r] : null;

      // Elegimos el hijo más pequeño
      let smaller = left;
      let smallerIdx = l;
      if (right && right.key < left.key) {
        smaller = right;
        smallerIdx = r;
      }

      snap(
        6,
        right
          ? `Comparo ${current.key} con sus hijos (${left.key}, ${right.key}). El menor es ${smaller.key}.`
          : `Comparo ${current.key} con su único hijo (${left.key}).`,
        {
          operation: "bubble-down",
          cursorId: current.id,
          comparing: [current.id, smaller.id],
        },
        [
          { name: "actual", value: String(current.key), kind: "computed", changed: true },
          { name: "menor hijo", value: String(smaller.key), kind: "computed" },
        ],
      );

      if (current.key <= smaller.key) {
        snap(
          7,
          `${current.key} ≤ ${smaller.key} → heap-property OK en este nivel. Terminé.`,
          { operation: "done", cursorId: current.id, extracted: root },
          [
            { name: "estado", value: "heap válido", kind: "output", changed: true },
          ],
        );
        break;
      }

      // swap
      items[idx] = smaller;
      items[smallerIdx] = current;
      snap(
        7,
        `${current.key} > ${smaller.key} → intercambio. ${current.key} baja al índice ${smallerIdx}.`,
        {
          operation: "bubble-down",
          cursorId: current.id,
          swapped: [current.id, smaller.id],
        },
        [
          { name: "índice anterior", value: String(idx), kind: "computed" },
          { name: "nuevo índice", value: String(smallerIdx), kind: "computed", changed: true },
        ],
      );
      idx = smallerIdx;
    }
  }

  snap(
    9,
    items.length > 0
      ? `Heap final: [${items.map((i) => i.key).join(", ")}].`
      : "Heap vacío.",
    { operation: "done" },
  );

  return steps;
}
