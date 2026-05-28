import type { Step, WatchEntry } from "@/lib/types";
import { cloneBst, type BstNode, type BstState } from "./types";

export const INSERT_BST_CODE = `def insertar(raiz, valor):
    if raiz is None:
        return Nodo(valor)
    if valor < raiz.valor:
        raiz.izq = insertar(raiz.izq, valor)
    else:
        raiz.der = insertar(raiz.der, valor)
    return raiz
`;

/**
 * Inserción recursiva en un BST. Cada llamada compara con el nodo actual
 * y baja por el lado correcto. Cuando llega a `None`, crea el nodo y lo
 * devuelve para que el padre lo "enganche" en su izquierda/derecha.
 *
 * El demo inserta varios valores secuencialmente sobre el mismo árbol.
 * Entre cada inserción el árbol queda en su estado final visible.
 */
export function generateInsertBstSteps(
  values: number[],
): Step<BstState>[] {
  const steps: Step<BstState>[] = [];
  let root: BstNode | null = null;

  function snap(
    line: number,
    note: string,
    extras: Partial<BstState> = {},
    watch?: WatchEntry[],
  ): void {
    steps.push({
      state: {
        root: cloneBst(root),
        visited: [],
        output: [],
        ...extras,
      },
      line,
      note,
      watch,
    });
  }

  // Inserción iterativa con tracking de path para emitir steps.
  // (Es equivalente a la recursiva pero más fácil de instrumentar.)
  function insertarConSteps(valor: number, idx: number): void {
    const newId = `n${valor}-${idx}`;
    const visited: string[] = [];

    snap(
      0,
      `Inserto el valor ${valor} en el BST.`,
      { pendingValue: valor, visited: [] },
      [
        {
          name: "valor",
          value: String(valor),
          kind: "input",
          changed: true,
        },
      ],
    );

    if (root === null) {
      snap(
        2,
        `raíz es None: el árbol está vacío. Creo el nodo ${valor} como raíz.`,
        { pendingValue: valor, direction: "null", newNodeId: newId },
        [
          { name: "raíz", value: "None", kind: "input" },
          { name: "valor", value: String(valor), kind: "input" },
        ],
      );
      root = { id: newId, value: valor };
      snap(
        3,
        `Nuevo nodo raíz: ${valor}.`,
        { pendingValue: valor, newNodeId: newId, cursor: newId },
        [
          {
            name: "return",
            value: `Nodo(${valor})`,
            kind: "output",
            changed: true,
          },
        ],
      );
      return;
    }

    // Recorrer hasta encontrar None y registrar comparaciones
    let actual: BstNode = root;
    while (true) {
      visited.push(actual.id);
      snap(
        4,
        `Comparo ${valor} con raíz.valor = ${actual.value}.`,
        {
          pendingValue: valor,
          cursor: actual.id,
          visited: [...visited],
        },
        [
          { name: "valor", value: String(valor), kind: "input" },
          {
            name: "raíz.valor",
            value: String(actual.value),
            kind: "computed",
            changed: true,
          },
        ],
      );

      if (valor < actual.value) {
        snap(
          4,
          `${valor} < ${actual.value}: voy a la izquierda.`,
          {
            pendingValue: valor,
            cursor: actual.id,
            visited: [...visited],
            direction: "left",
          },
        );
        if (actual.left == null) {
          snap(
            5,
            `raíz.izq es None: pongo ${valor} ahí.`,
            {
              pendingValue: valor,
              cursor: actual.id,
              visited: [...visited],
              direction: "null",
            },
          );
          actual.left = { id: newId, value: valor };
          snap(
            5,
            `${valor} insertado como hijo izquierdo de ${actual.value}.`,
            {
              pendingValue: valor,
              cursor: newId,
              visited: [...visited],
              newNodeId: newId,
            },
            [
              {
                name: "return",
                value: `Nodo(${valor})`,
                kind: "output",
                changed: true,
              },
            ],
          );
          return;
        }
        actual = actual.left;
      } else {
        snap(
          6,
          `${valor} ≥ ${actual.value}: voy a la derecha.`,
          {
            pendingValue: valor,
            cursor: actual.id,
            visited: [...visited],
            direction: "right",
          },
        );
        if (actual.right == null) {
          snap(
            7,
            `raíz.der es None: pongo ${valor} ahí.`,
            {
              pendingValue: valor,
              cursor: actual.id,
              visited: [...visited],
              direction: "null",
            },
          );
          actual.right = { id: newId, value: valor };
          snap(
            7,
            `${valor} insertado como hijo derecho de ${actual.value}.`,
            {
              pendingValue: valor,
              cursor: newId,
              visited: [...visited],
              newNodeId: newId,
            },
            [
              {
                name: "return",
                value: `Nodo(${valor})`,
                kind: "output",
                changed: true,
              },
            ],
          );
          return;
        }
        actual = actual.right;
      }
    }
  }

  snap(0, `BST vacío. Insertando valores: [${values.join(", ")}].`);

  values.forEach((v, idx) => {
    insertarConSteps(v, idx);
  });

  snap(0, `BST final con ${values.length} nodos.`, {}, [
    {
      name: "valores insertados",
      value: `[${values.join(", ")}]`,
      kind: "output",
    },
  ]);

  return steps;
}
