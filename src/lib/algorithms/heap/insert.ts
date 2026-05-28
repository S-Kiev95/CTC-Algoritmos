import type { Step, WatchEntry } from "@/lib/types";
import {
  parentIdx,
  type HeapItem,
  type HeapState,
} from "./types";

export const HEAP_PUSH_CODE = `import heapq

# heappush: inserta y reordena (bubble-up)
heap = [3, 7, 5, 12, 9]   # ya cumple min-heap
heapq.heappush(heap, 2)
# 1. Pongo 2 al final: [3, 7, 5, 12, 9, 2]
# 2. Comparo con padre (índice 2 → 5): 2 < 5, intercambio
#    [3, 7, 2, 12, 9, 5]
# 3. Comparo con padre (índice 0 → 3): 2 < 3, intercambio
#    [2, 7, 3, 12, 9, 5]
# 4. Ya soy la raíz: terminé.

# heap final: [2, 7, 3, 12, 9, 5]
# La raíz (2) es siempre el menor.
`;

/**
 * Genera pasos para insertar varios valores en un min-heap, mostrando
 * cada bubble-up paso a paso.
 */
export function generateHeapInsertSteps(
  initial: number[],
  toInsert: number[],
): Step<HeapState>[] {
  const steps: Step<HeapState>[] = [];
  const items: HeapItem[] = initial.map((k, i) => ({
    id: `init-${i}-${k}`,
    key: k,
  }));
  let nextId = 0;

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
    `Heap inicial: [${items.map((i) => i.key).join(", ")}]. La raíz es el mínimo.`,
  );

  for (const v of toInsert) {
    const newItem: HeapItem = { id: `new-${nextId++}-${v}`, key: v };

    // 1. Anunciamos el valor entrante "en vuelo"
    snap(
      4,
      `heappush(heap, ${v}) — agrego ${v} al final del heap.`,
      { operation: "push", flying: newItem },
      [
        { name: "valor entrante", value: String(v), kind: "input", changed: true },
        { name: "len(heap)", value: String(items.length), kind: "computed" },
      ],
    );

    // 2. Lo colocamos al final
    items.push(newItem);
    let idx = items.length - 1;
    snap(
      5,
      `${v} entra al final del array (índice ${idx}).`,
      { operation: "push", cursorId: newItem.id },
      [
        { name: "len(heap)", value: String(items.length), kind: "computed", changed: true },
        { name: "índice", value: String(idx), kind: "computed" },
      ],
    );

    // 3. Bubble-up
    while (idx > 0) {
      const pIdx = parentIdx(idx);
      const child = items[idx];
      const parent = items[pIdx];

      snap(
        6,
        `Comparo ${child.key} (índice ${idx}) con su padre ${parent.key} (índice ${pIdx}).`,
        {
          operation: "bubble-up",
          cursorId: child.id,
          comparing: [child.id, parent.id],
        },
        [
          { name: "hijo", value: String(child.key), kind: "computed", changed: true },
          { name: "padre", value: String(parent.key), kind: "computed" },
        ],
      );

      if (child.key < parent.key) {
        // swap
        items[idx] = parent;
        items[pIdx] = child;
        snap(
          7,
          `${child.key} < ${parent.key} → intercambio. ${child.key} sube al índice ${pIdx}.`,
          {
            operation: "bubble-up",
            cursorId: child.id,
            swapped: [child.id, parent.id],
          },
          [
            { name: "hijo", value: String(child.key), kind: "computed" },
            { name: "padre (era)", value: String(parent.key), kind: "computed", changed: true },
            { name: "nuevo índice", value: String(pIdx), kind: "computed", changed: true },
          ],
        );
        idx = pIdx;
      } else {
        snap(
          8,
          `${child.key} ≥ ${parent.key} → heap-property OK. Terminé.`,
          {
            operation: "bubble-up",
            cursorId: child.id,
          },
          [
            { name: "hijo", value: String(child.key), kind: "computed" },
            { name: "padre", value: String(parent.key), kind: "computed" },
            { name: "estado", value: "heap válido", kind: "output", changed: true },
          ],
        );
        break;
      }
    }

    if (idx === 0) {
      snap(
        9,
        `${v} llegó a la raíz — es el nuevo mínimo.`,
        { operation: "done", cursorId: newItem.id },
        [
          {
            name: "nueva raíz",
            value: String(v),
            kind: "output",
            changed: true,
          },
        ],
      );
    }
  }

  snap(
    11,
    `Heap final: [${items.map((i) => i.key).join(", ")}]. Mínimo = ${items[0]?.key ?? "—"}.`,
    { operation: "done" },
  );

  return steps;
}
