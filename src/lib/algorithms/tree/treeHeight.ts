import type { Step, WatchEntry } from "@/lib/types";
import type { TreeNode, TreeState } from "./types";

export const TREE_HEIGHT_CODE = `def altura(nodo):
    if not nodo.hijos:
        return 0
    return 1 + max(altura(hijo) for hijo in nodo.hijos)
`;

/**
 * Calcula la altura del árbol — la cantidad de aristas en el camino más
 * largo de la raíz a una hoja.
 *
 * Patrón recursivo: **agregación por max**. Cada nodo devuelve 1 + el
 * máximo entre las alturas de sus hijos (o 0 si es hoja). Es el dual de
 * `contar`: ambos son recursivos sobre árboles, pero uno suma y el otro
 * toma máximo.
 */
export function generateTreeHeightSteps(root: TreeNode): Step<TreeState>[] {
  const steps: Step<TreeState>[] = [];
  const visited: string[] = [];
  const subtreeHeights: Record<string, number> = {};
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
        subtreeHeights: { ...subtreeHeights },
        ...extras,
      },
      line,
      note,
      watch,
    });
  }

  function altura(nodo: TreeNode): number {
    depth += 1;
    snap(
      1,
      `Llamada a altura("${nodo.value}"). Profundidad del stack: ${depth}.`,
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

    const children = nodo.children ?? [];
    if (children.length === 0) {
      snap(
        2,
        `"${nodo.value}" no tiene hijos (es hoja). Devuelvo 0.`,
        nodo.id,
        {},
        [
          { name: "nodo.valor", value: `"${nodo.value}"`, kind: "input" },
          {
            name: "len(hijos)",
            value: "0",
            kind: "computed",
          },
          {
            name: "return",
            value: "0",
            kind: "output",
            changed: true,
          },
        ],
      );
      subtreeHeights[nodo.id] = 0;
      snap(
        2,
        `altura("${nodo.value}") = 0.`,
        nodo.id,
        {},
      );
      depth -= 1;
      return 0;
    }

    snap(
      3,
      `Tiene ${children.length} hijo${children.length === 1 ? "" : "s"}. Calculo la altura de cada uno.`,
      nodo.id,
      {},
      [
        { name: "nodo.valor", value: `"${nodo.value}"`, kind: "input" },
        {
          name: "len(hijos)",
          value: String(children.length),
          kind: "computed",
        },
      ],
    );

    const childHeights: number[] = [];
    for (const hijo of children) {
      snap(
        3,
        `Pido altura("${hijo.value}")...`,
        nodo.id,
        {},
        [
          {
            name: "hijo.valor",
            value: `"${hijo.value}"`,
            kind: "computed",
            changed: true,
          },
        ],
      );
      const h = altura(hijo);
      childHeights.push(h);
      snap(
        3,
        `altura("${hijo.value}") = ${h}. Lo agrego al conjunto a maximizar.`,
        nodo.id,
        {},
        [
          {
            name: "alturas hijos",
            value: `[${childHeights.join(", ")}]`,
            kind: "computed",
            changed: true,
          },
        ],
      );
    }

    const maxH = Math.max(...childHeights);
    const result = 1 + maxH;
    subtreeHeights[nodo.id] = result;
    snap(
      4,
      `max(${childHeights.join(", ")}) = ${maxH}. Sumo 1 (la arista hasta el hijo más alto).`,
      nodo.id,
      {},
      [
        {
          name: "alturas hijos",
          value: `[${childHeights.join(", ")}]`,
          kind: "computed",
        },
        {
          name: "max",
          value: String(maxH),
          kind: "computed",
          changed: true,
        },
        {
          name: "return",
          value: `1 + ${maxH} = ${result}`,
          kind: "output",
          changed: true,
        },
      ],
    );
    snap(
      4,
      `altura("${nodo.value}") = ${result}.`,
      nodo.id,
      {},
    );
    depth -= 1;
    return result;
  }

  snap(0, `Calcular altura del árbol con raíz "${root.value}".`, undefined);
  const finalHeight = altura(root);
  snap(
    0,
    `Altura del árbol: ${finalHeight}.`,
    undefined,
    { height: finalHeight },
    [
      {
        name: "altura final",
        value: String(finalHeight),
        kind: "output",
      },
    ],
  );

  return steps;
}
