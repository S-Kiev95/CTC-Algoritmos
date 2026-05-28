import type { Step, WatchEntry } from "@/lib/types";
import type { TreeNode, TreeState } from "./types";

export const COUNT_NODES_CODE = `def contar(nodo):
    total = 1
    for hijo in nodo.hijos:
        total += contar(hijo)
    return total
`;

/**
 * Cuenta cuántos nodos hay en el árbol. Es el ejemplo más limpio de
 * **agregación recursiva por suma**: cada nodo contribuye 1, y le suma lo
 * que sus hijos reportan recursivamente.
 *
 * En el watch panel se ve cómo `total` arranca en 1 (el propio nodo),
 * después absorbe los resultados de las llamadas a sus hijos uno por uno,
 * y devuelve la suma.
 */
export function generateCountNodesSteps(root: TreeNode): Step<TreeState>[] {
  const steps: Step<TreeState>[] = [];
  const visited: string[] = [];
  let depth = 0;

  function snap(
    line: number,
    note: string,
    cursor: string | undefined,
    extras: Partial<TreeState> = {},
    watch?: WatchEntry[],
  ): void {
    steps.push({
      state: {
        root,
        cursor,
        visited: [...visited],
        output: [],
        ...extras,
      },
      line,
      note,
      watch,
    });
  }

  function contar(nodo: TreeNode): number {
    depth += 1;
    snap(
      1,
      `Llamada a contar("${nodo.value}"). Profundidad ${depth}.`,
      nodo.id,
      {},
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

    let total = 1;
    snap(
      2,
      `total = 1 (contar el propio nodo "${nodo.value}").`,
      nodo.id,
      {},
      [
        { name: "nodo.valor", value: `"${nodo.value}"`, kind: "input" },
        {
          name: "total",
          value: "1",
          kind: "computed",
          changed: true,
        },
      ],
    );

    const children = nodo.children ?? [];
    for (const hijo of children) {
      snap(
        3,
        `for hijo: bajo a contar("${hijo.value}").`,
        nodo.id,
        {},
        [
          {
            name: "hijo.valor",
            value: `"${hijo.value}"`,
            kind: "computed",
            changed: true,
          },
          { name: "total", value: String(total), kind: "computed" },
        ],
      );

      const sub = contar(hijo);

      snap(
        4,
        `contar("${hijo.value}") devolvió ${sub}. Sumo a total.`,
        nodo.id,
        {},
        [
          {
            name: "sub",
            value: String(sub),
            kind: "computed",
            changed: true,
          },
          { name: "total (antes)", value: String(total), kind: "computed" },
        ],
      );
      total += sub;
      snap(
        4,
        `total = ${total - sub} + ${sub} = ${total}.`,
        nodo.id,
        {},
        [
          {
            name: "total",
            value: String(total),
            kind: "computed",
            changed: true,
          },
        ],
      );
    }

    snap(
      5,
      `"${nodo.value}" reporta total = ${total}.`,
      nodo.id,
      {},
      [
        {
          name: "return",
          value: String(total),
          kind: "output",
          changed: true,
        },
      ],
    );

    depth -= 1;
    return total;
  }

  snap(0, `Contar nodos del árbol con raíz "${root.value}".`, undefined);
  const finalCount = contar(root);
  snap(
    0,
    `Total: ${finalCount} nodos.`,
    undefined,
    { count: finalCount },
    [
      {
        name: "total final",
        value: String(finalCount),
        kind: "output",
      },
    ],
  );

  return steps;
}
