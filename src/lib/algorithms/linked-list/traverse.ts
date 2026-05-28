import type { Step } from "@/lib/types";
import type { LinkedListState, ListNode } from "./types";

export const TRAVERSE_CODE = `class Nodo:
    def __init__(self, valor, siguiente=None):
        self.valor = valor
        self.siguiente = siguiente

def recorrer(cabeza):
    actual = cabeza
    while actual is not None:
        print(actual.valor)
        actual = actual.siguiente
`;

/**
 * Pasos para recorrer una lista enlazada desde la cabeza siguiendo `.siguiente`
 * hasta llegar a `None`. Mostramos la variable `actual` saltando de nodo en nodo.
 */
export function generateTraverseSteps(
  values: number[],
): Step<LinkedListState>[] {
  const nodes: ListNode[] = values.map((v, i) => ({ id: `n${i}`, value: v }));
  const steps: Step<LinkedListState>[] = [];

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

  snap(6, `Llamada a recorrer(cabeza).`);

  if (nodes.length === 0) {
    snap(8, `La lista está vacía: actual ya es None, no entro al while.`, {
      variables: [{ name: "actual", nodeId: null }],
    });
    return steps;
  }

  // actual = cabeza
  let currentIdx = 0;
  snap(
    7,
    `actual = cabeza. La variable apunta al primer nodo.`,
    {
      cursor: nodes[0].id,
      variables: [{ name: "actual", nodeId: nodes[0].id }],
    },
  );

  while (currentIdx < nodes.length) {
    const current = nodes[currentIdx];
    snap(8, `¿actual no es None? Sí, sigo.`, {
      cursor: current.id,
      variables: [{ name: "actual", nodeId: current.id }],
    });
    snap(9, `Imprimo ${current.value}.`, {
      cursor: current.id,
      variables: [{ name: "actual", nodeId: current.id }],
    });

    currentIdx += 1;
    const next = nodes[currentIdx] ?? null;
    snap(
      10,
      next
        ? `actual = actual.siguiente. Avanzo al nodo con valor ${next.value}.`
        : `actual = actual.siguiente. El siguiente es None.`,
      {
        cursor: next?.id,
        variables: [{ name: "actual", nodeId: next ? next.id : null }],
      },
    );
  }

  snap(8, `actual es None. Salgo del while. Recorrido completo.`, {
    variables: [{ name: "actual", nodeId: null }],
  });

  return steps;
}
