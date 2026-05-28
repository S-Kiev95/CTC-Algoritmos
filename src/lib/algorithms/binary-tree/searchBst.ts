import type { Step, WatchEntry } from "@/lib/types";
import { cloneBst, type BstNode, type BstState } from "./types";

export const SEARCH_BST_CODE = `def buscar(raiz, objetivo):
    if raiz is None:
        return False
    if raiz.valor == objetivo:
        return True
    if objetivo < raiz.valor:
        return buscar(raiz.izq, objetivo)
    return buscar(raiz.der, objetivo)
`;

/**
 * Búsqueda en BST. Patrón divide-y-vencerás: en cada nodo, compara, y
 * descarta la mitad del árbol restante (la que no tiene el target).
 * En árbol balanceado son O(log n) comparaciones.
 */
export function generateSearchBstSteps(
  rootSnapshot: BstNode,
  target: number,
): Step<BstState>[] {
  const steps: Step<BstState>[] = [];
  // Clonamos para no mutar el sample que se reutiliza entre demos.
  const root = cloneBst(rootSnapshot);
  const visited: string[] = [];

  function snap(
    line: number,
    note: string,
    extras: Partial<BstState> = {},
    watch?: WatchEntry[],
  ): void {
    steps.push({
      state: {
        root: cloneBst(root),
        visited: [...visited],
        output: [],
        pendingValue: target,
        ...extras,
      },
      line,
      note,
      watch,
    });
  }

  function buscar(nodo: BstNode | null | undefined): boolean {
    snap(
      1,
      `Llamada a buscar(...).`,
      { cursor: nodo?.id },
      [
        {
          name: "objetivo",
          value: String(target),
          kind: "input",
        },
        {
          name: "raíz",
          value: nodo ? `Nodo(${nodo.value})` : "None",
          kind: "input",
          changed: true,
        },
      ],
    );

    if (!nodo) {
      snap(
        2,
        `raíz es None — recorrí hasta el final sin encontrar ${target}.`,
        { cursor: undefined, direction: "null", notFound: true },
        [
          {
            name: "return",
            value: "False",
            kind: "output",
            changed: true,
          },
        ],
      );
      return false;
    }

    visited.push(nodo.id);

    snap(
      4,
      `¿raíz.valor (${nodo.value}) == objetivo (${target})?`,
      { cursor: nodo.id },
      [
        {
          name: "raíz.valor",
          value: String(nodo.value),
          kind: "computed",
        },
        {
          name: "objetivo",
          value: String(target),
          kind: "input",
        },
      ],
    );

    if (nodo.value === target) {
      snap(
        5,
        `¡Coincide! Encontré ${target}.`,
        { cursor: nodo.id, found: nodo.id, direction: "match" },
        [
          {
            name: "return",
            value: "True",
            kind: "output",
            changed: true,
          },
        ],
      );
      return true;
    }

    if (target < nodo.value) {
      snap(
        6,
        `${target} < ${nodo.value}: el target solo puede estar en el subárbol izquierdo. Recurro a buscar(raíz.izq).`,
        { cursor: nodo.id, direction: "left" },
      );
      return buscar(nodo.left);
    }

    snap(
      8,
      `${target} > ${nodo.value}: el target solo puede estar en el subárbol derecho. Recurro a buscar(raíz.der).`,
      { cursor: nodo.id, direction: "right" },
    );
    return buscar(nodo.right);
  }

  snap(0, `Buscar ${target} en el BST.`);
  const result = buscar(root);

  if (result) {
    snap(0, `${target} está en el árbol.`);
  } else {
    snap(0, `${target} no está en el árbol.`, { notFound: true });
  }

  return steps;
}
