import type { Step, WatchEntry } from "@/lib/types";
import { cloneBst, type BstNode, type BstState } from "./types";

export const POSTORDER_CODE = `def postorden(nodo):
    if nodo is None:
        return
    postorden(nodo.izq)
    postorden(nodo.der)
    print(nodo.valor)
`;

/**
 * Recorrido postorden: **izquierda → derecha → nodo**.
 *
 * El nodo se visita DESPUÉS de sus hijos. La raíz queda última en el
 * output, y las hojas aparecen primero. Uso típico: liberar memoria de
 * un árbol (no podés borrar un nodo antes que sus hijos), evaluar
 * expresiones postfijas, calcular tamaños/alturas bottom-up.
 */
export function generatePostorderSteps(
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

  function postorden(nodo: BstNode | null | undefined): void {
    depth += 1;
    snap(
      1,
      `Llamada a postorden(${nodo ? nodo.value : "None"}). Profundidad ${depth}.`,
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
      `Recurro al subárbol izquierdo: postorden(${nodo.left ? nodo.left.value : "None"}).`,
      { cursor: nodo.id, direction: "left" },
    );
    postorden(nodo.left);

    snap(
      5,
      `Recurro al subárbol derecho: postorden(${nodo.right ? nodo.right.value : "None"}).`,
      { cursor: nodo.id, direction: "right" },
    );
    postorden(nodo.right);

    // VISITAR AL FINAL
    visited.push(nodo.id);
    output.push(nodo.value);
    snap(
      6,
      `print(${nodo.value}). Lo agrego al output DESPUÉS de los hijos.`,
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

    depth -= 1;
  }

  snap(0, `Empiezo el recorrido postorden desde la raíz.`);
  postorden(root);
  snap(
    0,
    `Recorrido completo. Output: [${output.join(", ")}]. La raíz quedó última.`,
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
