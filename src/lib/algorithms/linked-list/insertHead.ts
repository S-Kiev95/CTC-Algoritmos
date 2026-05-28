import type { Step } from "@/lib/types";
import type { LinkedListState, ListNode } from "./types";

export const INSERT_HEAD_CODE = `def insertar_al_inicio(cabeza, valor):
    nuevo = Nodo(valor)
    nuevo.siguiente = cabeza
    return nuevo
`;

/**
 * Inserción al inicio: el caso elegante de O(1). El nodo nuevo apunta a la
 * vieja cabeza, y se devuelve como la nueva cabeza. Dos punteros tocados,
 * nada más.
 */
export function generateInsertHeadSteps(
  initialValues: number[],
  newValue: number,
): Step<LinkedListState>[] {
  const steps: Step<LinkedListState>[] = [];
  const nodes: ListNode[] = initialValues.map((v, i) => ({
    id: `n${i}`,
    value: v,
  }));

  function snap(
    line: number,
    note: string,
    extras: Partial<LinkedListState> = {},
  ): void {
    steps.push({
      state: { nodes: [...nodes], ...extras },
      line,
      note,
    });
  }

  snap(
    1,
    `Llamada a insertar_al_inicio con valor=${newValue}. Lista actual: [${initialValues.join(", ")}].`,
  );

  const newId = "new";
  const newNode: ListNode = { id: newId, value: newValue };
  nodes.unshift(newNode);

  snap(2, `nuevo = Nodo(${newValue}). Creo el nodo y lo agrego al principio.`, {
    newNodeId: newId,
    cursor: newId,
  });

  const oldHeadId = nodes[1]?.id ?? null;
  snap(
    3,
    `nuevo.siguiente = cabeza. ${
      oldHeadId
        ? `El puntero del nodo nuevo apunta a la vieja cabeza.`
        : `La lista estaba vacía, nuevo.siguiente es None.`
    }`,
    {
      newNodeId: newId,
      cursor: newId,
      extraPointer: oldHeadId
        ? { fromId: newId, toId: oldHeadId, label: "siguiente", variant: "new" }
        : undefined,
    },
  );

  snap(4, `Devuelvo nuevo. Es la nueva cabeza. Total: O(1).`, {
    newNodeId: newId,
  });

  snap(0, `Lista resultante.`);

  return steps;
}
