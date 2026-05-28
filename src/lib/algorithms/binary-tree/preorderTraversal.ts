import type { Step, WatchEntry } from "@/lib/types";
import { cloneBst, type BstNode, type BstState } from "./types";

export const PREORDER_CODE = `def preorden(nodo):
    if nodo is None:
        return
    print(nodo.valor)
    preorden(nodo.izq)
    preorden(nodo.der)
`;

/**
 * Recorrido preorden: **nodo → izquierda → derecha**.
 *
 * El nodo se visita ANTES de bajar a sus hijos. Como consecuencia, la
 * raíz es el primer valor del output, y cada nodo aparece antes que sus
 * descendientes. Uso típico: serializar la estructura del árbol (escribir
 * el árbol "como se construyó"), expresiones prefijas, copia profunda.
 */
export function generatePreorderSteps(
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

  function preorden(nodo: BstNode | null | undefined): void {
    depth += 1;
    snap(
      1,
      `Llamada a preorden(${nodo ? nodo.value : "None"}). Profundidad ${depth}.`,
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

    // VISITAR PRIMERO
    visited.push(nodo.id);
    output.push(nodo.value);
    snap(
      4,
      `print(${nodo.value}). Lo agrego al output ANTES de bajar a los hijos.`,
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
      5,
      `Recurro al subárbol izquierdo: preorden(${nodo.left ? nodo.left.value : "None"}).`,
      { cursor: nodo.id, direction: "left" },
    );
    preorden(nodo.left);

    snap(
      6,
      `Recurro al subárbol derecho: preorden(${nodo.right ? nodo.right.value : "None"}).`,
      { cursor: nodo.id, direction: "right" },
    );
    preorden(nodo.right);

    depth -= 1;
  }

  snap(0, `Empiezo el recorrido preorden desde la raíz.`);
  preorden(root);
  snap(
    0,
    `Recorrido completo. Output: [${output.join(", ")}]. La raíz quedó primera.`,
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
