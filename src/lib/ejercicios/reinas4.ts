import type { Step } from "@/lib/types";

/** Nodo del árbol de decisión del backtracking. */
export type TreeNode = {
  id: number;
  parent: number | null;
  /** Columna que decide este nodo (-1 para la raíz). */
  col: number;
  /** Fila elegida en esa columna (null en la raíz). */
  row: number | null;
  status: "root" | "deadend" | "valid" | "onpath" | "solution";
  /** Posición de layout. */
  x: number;
  depth: number;
};

export type Queens4State = {
  n: number;
  /** Fila de la reina por columna ya decidida (length = depth). */
  queens: number[];
  depth: number;
  /** Casilla que se está probando ahora. */
  trying?: { col: number; row: number } | null;
  /** Nodos del árbol revelados hasta este paso. */
  revealed: number;
  /** Nodo activo del árbol. */
  current: number;
  solved?: boolean;
};

export const REINAS4_CODE = `def resolver(n=4):
    tablero = [-1] * n
    def seguro(col, fila):
        for c in range(col):
            f = tablero[c]
            if f == fila or abs(f-fila) == abs(c-col):
                return False
        return True
    def colocar(col):
        if col == n:
            return True          # 4 reinas ubicadas
        for fila in range(n):
            if seguro(col, fila):
                tablero[col] = fila
                if colocar(col + 1):
                    return True
                tablero[col] = -1  # backtrack
        return False
    colocar(0)
    return tablero
`;

/**
 * Backtracking de N reinas en 4×4 que además construye el árbol de decisión.
 * Devuelve los pasos (para animar tablero + árbol) y el árbol completo con
 * layout ya calculado.
 */
export function generateReinas4(n = 4): {
  steps: Step<Queens4State>[];
  tree: TreeNode[];
} {
  const nodes: TreeNode[] = [];
  const queens = new Array(n).fill(-1);
  const steps: Step<Queens4State>[] = [];
  let nextId = 0;

  const safe = (col: number, row: number) => {
    for (let c = 0; c < col; c++) {
      const f = queens[c];
      if (f === row || Math.abs(f - row) === Math.abs(c - col)) return false;
    }
    return true;
  };

  const snap = (current: number, trying: Queens4State["trying"], solved?: boolean): Queens4State => ({
    n,
    queens: queens.slice(),
    depth: queens.filter((q) => q >= 0).length,
    trying,
    revealed: nextId,
    current,
    solved,
  });

  const root: TreeNode = { id: nextId++, parent: null, col: -1, row: null, status: "root", x: 0, depth: 0 };
  nodes.push(root);
  steps.push({
    state: snap(root.id, null),
    line: 14,
    sound: "tick",
    note: "Tablero vacío. Hay que decidir, columna por columna, en qué fila va cada reina.",
  });

  function place(col: number, parentId: number): boolean {
    for (let row = 0; row < n; row++) {
      const node: TreeNode = {
        id: nextId++,
        parent: parentId,
        col,
        row,
        status: "deadend",
        x: 0,
        depth: col + 1,
      };
      nodes.push(node);
      const ok = safe(col, row);
      steps.push({
        state: snap(node.id, { col, row }),
        line: 13,
        sound: ok ? "tick" : "error",
        note: ok
          ? `Columna ${col}, fila ${row}: casilla segura (celeste). Se prueba.`
          : `Columna ${col}, fila ${row}: atacada por otra reina (roja). Se descarta.`,
      });
      if (!ok) continue;
      node.status = "valid";
      queens[col] = row;

      if (col + 1 === n) {
        node.status = "solution";
        steps.push({
          state: snap(node.id, null, true),
          line: 9,
          sound: "found",
          note: "¡Las 4 reinas conviven sin atacarse! Solución encontrada.",
        });
        return true;
      }

      steps.push({
        state: snap(node.id, null),
        line: 16,
        sound: "place",
        note: `Se coloca la reina en columna ${col}, fila ${row}, y se pasa a la columna ${col + 1}.`,
      });

      if (place(col + 1, node.id)) {
        node.status = "onpath";
        return true;
      }

      queens[col] = -1;
      steps.push({
        state: snap(node.id, null),
        line: 18,
        sound: "pop",
        note: `Ninguna fila funcionó en la columna ${col + 1}: backtrack, se quita esta reina.`,
      });
    }
    return false;
  }

  place(0, root.id);

  // Layout del árbol: x de cada hoja consecutivo; los internos, promedio de hijos.
  const children = new Map<number, number[]>();
  for (const nd of nodes) {
    if (nd.parent !== null) {
      const arr = children.get(nd.parent) ?? [];
      arr.push(nd.id);
      children.set(nd.parent, arr);
    }
  }
  let leafX = 0;
  const byId = new Map(nodes.map((nd) => [nd.id, nd]));
  const assign = (id: number): number => {
    const kids = children.get(id) ?? [];
    const node = byId.get(id)!;
    if (kids.length === 0) {
      node.x = leafX++;
      return node.x;
    }
    const xs = kids.map(assign);
    node.x = xs.reduce((a, b) => a + b, 0) / xs.length;
    return node.x;
  };
  assign(root.id);

  return { steps, tree: nodes };
}
