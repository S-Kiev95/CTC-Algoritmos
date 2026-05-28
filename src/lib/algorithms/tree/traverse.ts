import type { Step, WatchEntry } from "@/lib/types";
import type { TreeNode, TreeState } from "./types";

export const TRAVERSE_CODE = `def recorrer(nodo):
    print(nodo.valor)
    for hijo in nodo.hijos:
        recorrer(hijo)
`;

/**
 * Recorrido recursivo en DFS pre-order: visita el nodo, después sus hijos
 * en orden de izquierda a derecha. Es el patrón base del que se derivan
 * casi todos los algoritmos sobre árboles.
 *
 * El watch panel sigue al "nodo actual" — el frame activo de la pila.
 */
export function generateTraverseSteps(root: TreeNode): Step<TreeState>[] {
  const steps: Step<TreeState>[] = [];
  const visited: string[] = [];
  const output: string[] = [];
  let depth = 0;

  function snap(
    line: number,
    note: string,
    cursor: string | undefined,
    watch?: WatchEntry[],
  ): void {
    steps.push({
      state: {
        root,
        cursor,
        visited: [...visited],
        output: [...output],
      },
      line,
      note,
      watch,
    });
  }

  function recorrer(nodo: TreeNode): void {
    depth += 1;
    snap(
      1,
      `Llamada a recorrer("${nodo.value}"). Profundidad del stack: ${depth}.`,
      nodo.id,
      [
        {
          name: "nodo.valor",
          value: `"${nodo.value}"`,
          kind: "input",
          changed: true,
        },
      ],
    );

    visited.push(nodo.id);
    output.push(nodo.value);
    snap(2, `print("${nodo.value}").`, nodo.id, [
      {
        name: "nodo.valor",
        value: `"${nodo.value}"`,
        kind: "input",
      },
    ]);

    const children = nodo.children ?? [];
    if (children.length === 0) {
      snap(
        3,
        `"${nodo.value}" no tiene hijos. Es una hoja — la recursión termina acá.`,
        nodo.id,
        [
          { name: "nodo.valor", value: `"${nodo.value}"`, kind: "input" },
          {
            name: "len(hijos)",
            value: "0",
            kind: "computed",
          },
        ],
      );
    } else {
      snap(
        3,
        `Recorro los ${children.length} hijo${children.length === 1 ? "" : "s"} de "${nodo.value}".`,
        nodo.id,
        [
          { name: "nodo.valor", value: `"${nodo.value}"`, kind: "input" },
          {
            name: "len(hijos)",
            value: String(children.length),
            kind: "computed",
          },
        ],
      );
      for (const hijo of children) {
        snap(3, `for hijo: bajo a "${hijo.value}".`, nodo.id, [
          {
            name: "hijo.valor",
            value: `"${hijo.value}"`,
            kind: "computed",
            changed: true,
          },
        ]);
        recorrer(hijo);
      }
    }

    depth -= 1;
  }

  snap(0, `Empiezo a recorrer desde la raíz "${root.value}".`, undefined);
  recorrer(root);
  snap(
    0,
    `Recorrido completo. ${output.length} nodos visitados en orden DFS.`,
    undefined,
    [
      {
        name: "output",
        value: `[${output.join(", ")}]`,
        kind: "output",
        changed: true,
      },
    ],
  );

  return steps;
}
