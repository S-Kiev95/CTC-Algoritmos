import type { Step } from "@/lib/types";
import type { LinkedListState, ListNode } from "./types";

export const REMOVE_CODE = `def eliminar(cabeza, objetivo):
    if cabeza is None:
        return None
    if cabeza.valor == objetivo:
        return cabeza.siguiente
    anterior = cabeza
    while anterior.siguiente is not None:
        if anterior.siguiente.valor == objetivo:
            anterior.siguiente = anterior.siguiente.siguiente
            return cabeza
        anterior = anterior.siguiente
    return cabeza
`;

/**
 * Eliminación por valor. Cuando el target NO es la cabeza, hay que avanzar
 * con `anterior` buscando el predecesor del nodo a eliminar, y luego
 * reescribir `anterior.siguiente = anterior.siguiente.siguiente`. Eso "salta"
 * el nodo target y lo deja desconectado.
 */
export function generateRemoveSteps(
  initialValues: number[],
  target: number,
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
    `Llamada a eliminar(cabeza, objetivo=${target}). Lista: [${initialValues.join(", ")}].`,
  );

  snap(2, `¿cabeza es None?`);
  if (nodes.length === 0) {
    snap(3, `Sí. Devuelvo None.`);
    return steps;
  }

  snap(4, `¿cabeza.valor (${nodes[0].value}) == ${target}?`, {
    cursor: nodes[0].id,
  });

  if (nodes[0].value === target) {
    const removedId = nodes[0].id;
    snap(
      5,
      `Sí. Devuelvo cabeza.siguiente — la cabeza queda desconectada.`,
      { cursor: removedId, removingId: removedId },
    );
    nodes.shift();
    snap(5, `Nuevo head: ${nodes[0]?.value ?? "None"}.`, {
      cursor: nodes[0]?.id,
    });
    return steps;
  }

  // anterior = cabeza
  let prevIdx = 0;
  snap(6, `anterior = cabeza. Empiezo a recorrer buscando el predecesor.`, {
    cursor: nodes[prevIdx].id,
    variables: [{ name: "anterior", nodeId: nodes[prevIdx].id }],
  });

  while (prevIdx + 1 < nodes.length) {
    const prev = nodes[prevIdx];
    const next = nodes[prevIdx + 1];

    snap(7, `¿anterior.siguiente no es None? Sí.`, {
      cursor: prev.id,
      variables: [{ name: "anterior", nodeId: prev.id }],
    });

    snap(
      8,
      `¿anterior.siguiente.valor (${next.value}) == ${target}?`,
      {
        cursor: prev.id,
        variables: [{ name: "anterior", nodeId: prev.id }],
      },
    );

    if (next.value === target) {
      const afterNext = nodes[prevIdx + 2] ?? null;
      // Mostrar el "broken" sobre el puntero existente, y proponer el "new"
      snap(
        9,
        `Sí. Reescribo: anterior.siguiente = anterior.siguiente.siguiente. ${
          afterNext
            ? `El puntero salta al nodo con valor ${afterNext.value}.`
            : `El puntero queda en None.`
        }`,
        {
          cursor: prev.id,
          removingId: next.id,
          variables: [{ name: "anterior", nodeId: prev.id }],
          extraPointer: {
            fromId: prev.id,
            toId: afterNext?.id ?? null,
            label: "siguiente",
            variant: "new",
          },
        },
      );

      // Quitar del array
      nodes.splice(prevIdx + 1, 1);
      snap(
        10,
        `El nodo target quedó desconectado. Devuelvo cabeza.`,
        {
          cursor: prev.id,
          variables: [{ name: "anterior", nodeId: prev.id }],
        },
      );
      return steps;
    }

    // Avanzar
    prevIdx += 1;
    snap(
      11,
      `No es el target. Avanzo: anterior = anterior.siguiente (valor ${nodes[prevIdx].value}).`,
      {
        cursor: nodes[prevIdx].id,
        variables: [{ name: "anterior", nodeId: nodes[prevIdx].id }],
      },
    );
  }

  snap(7, `anterior.siguiente es None. Salí del while.`, {
    variables: [{ name: "anterior", nodeId: nodes[prevIdx].id }],
  });
  snap(
    12,
    `El target ${target} no estaba en la lista. Devuelvo cabeza intacta.`,
  );

  return steps;
}
