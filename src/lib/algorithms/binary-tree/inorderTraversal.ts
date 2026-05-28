import type { Step, WatchEntry } from "@/lib/types";
import { cloneBst, type BstNode, type BstState } from "./types";

export const INORDER_CODE = `def inorden(nodo):
    if nodo is None:
        return
    inorden(nodo.izq)
    print(nodo.valor)
    inorden(nodo.der)
`;

/**
 * Recorrido inorden de un BST: izquierda → nodo → derecha.
 *
 * El "click" pedagógico: en un BST, este recorrido devuelve los valores
 * **ordenados** de menor a mayor. Es consecuencia directa de la invariante
 * BST (todos los del subárbol izquierdo son menores, y todos los del
 * derecho son mayores).
 */
export function generateInorderSteps(
  rootSnapshot: BstNode,
): Step<BstState>[] {
  const steps: Step<BstState>[] = [];
  const root = cloneBst(rootSnapshot);
  const visited: string[] = [];
  const output: number[] = [];
  let depth = 0;

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
        output: [...output],
        ...extras,
      },
      line,
      note,
      watch,
    });
  }

  function inorden(nodo: BstNode | null | undefined): void {
    depth += 1;
    snap(
      1,
      `Llamada a inorden(${nodo ? nodo.value : "None"}). Profundidad ${depth}.`,
      { cursor: nodo?.id },
      [
        {
          name: "nodo",
          value: nodo ? `Nodo(${nodo.value})` : "None",
          kind: "input",
          changed: true,
        },
      ],
    );

    if (!nodo) {
      snap(
        2,
        `nodo es None — fin de la rama. Vuelvo al padre.`,
        { cursor: undefined, direction: "null" },
        [{ name: "return", value: "(nada)", kind: "output" }],
      );
      depth -= 1;
      return;
    }

    snap(
      4,
      `Recurro al subárbol izquierdo: inorden(${nodo.left ? nodo.left.value : "None"}).`,
      { cursor: nodo.id, direction: "left" },
    );
    inorden(nodo.left);

    visited.push(nodo.id);
    output.push(nodo.value);
    snap(
      5,
      `print(${nodo.value}). Lo agrego al output.`,
      { cursor: nodo.id },
      [
        {
          name: "nodo.valor",
          value: String(nodo.value),
          kind: "computed",
        },
        {
          name: "output",
          value: `[${output.join(", ")}]`,
          kind: "output",
          changed: true,
        },
      ],
    );

    snap(
      6,
      `Recurro al subárbol derecho: inorden(${nodo.right ? nodo.right.value : "None"}).`,
      { cursor: nodo.id, direction: "right" },
    );
    inorden(nodo.right);

    depth -= 1;
  }

  snap(0, `Empiezo el recorrido inorden desde la raíz.`);
  inorden(root);
  snap(
    0,
    `Recorrido completo. Output: [${output.join(", ")}].`,
    {},
    [
      {
        name: "output final",
        value: `[${output.join(", ")}]`,
        kind: "output",
      },
    ],
  );

  return steps;
}
