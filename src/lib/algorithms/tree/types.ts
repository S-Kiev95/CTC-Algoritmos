/**
 * Modelo de árbol n-ario genérico.
 *
 * Un nodo tiene un `value` (lo que el nodo "es") y, opcionalmente, una lista
 * de hijos. Los nodos sin hijos son las hojas. La raíz es el nodo que no
 * tiene padre (no la modelamos explícitamente — es simplemente el primer
 * nodo desde el que se empieza a recorrer).
 *
 * Lo más importante de esta forma: cada hijo es a su vez un TreeNode con la
 * misma estructura → la **recursión** se desliza naturalmente.
 */
export type TreeNode = {
  /** ID estable para reconciliación de animaciones. */
  id: string;
  /** Valor del nodo. Lo usamos como string corto (letra) para que entre
   *  bien dentro del círculo del SVG. */
  value: string;
  /** Hijos del nodo. Si está vacío o ausente, es una hoja. */
  children?: TreeNode[];
};

export type TreeState = {
  root: TreeNode;
  /** Nodo actualmente siendo visitado. */
  cursor?: string;
  /** Conjunto de IDs visitados en orden, para mostrar el progreso del recorrido. */
  visited: string[];
  /** Output del algoritmo (paths impresos, valores listados, etc.). */
  output: string[];
  /** Para "contar nodos": el conteo parcial/final. */
  count?: number;
  /** Para "altura": la altura final calculada. */
  height?: number;
  /**
   * Para "altura": mapa de IDs de subárbol → altura calculada.
   * Permite mostrar la altura local de cada subárbol a medida que se computan.
   */
  subtreeHeights?: Record<string, number>;
};

/**
 * Layout cartesiano para dibujar el árbol en SVG.
 * Cada nodo recibe una `x` (en unidades de "slots de hoja") y `y` (= depth).
 * El cálculo es bottom-up: cada hoja toma un slot único, cada padre se
 * centra entre el primer y el último hijo.
 */
export type NodeLayout = { x: number; y: number };

export function layoutTree(root: TreeNode): {
  positions: Map<string, NodeLayout>;
  width: number;
  height: number;
} {
  const positions = new Map<string, NodeLayout>();
  let nextLeafX = 0;
  let maxDepth = 0;

  function recurse(node: TreeNode, depth: number): void {
    maxDepth = Math.max(maxDepth, depth);
    if (!node.children || node.children.length === 0) {
      positions.set(node.id, { x: nextLeafX, y: depth });
      nextLeafX += 1;
      return;
    }
    for (const child of node.children) {
      recurse(child, depth + 1);
    }
    const firstChild = positions.get(node.children[0].id)!;
    const lastChild = positions.get(
      node.children[node.children.length - 1].id,
    )!;
    positions.set(node.id, {
      x: (firstChild.x + lastChild.x) / 2,
      y: depth,
    });
  }

  recurse(root, 0);
  return { positions, width: Math.max(1, nextLeafX), height: maxDepth + 1 };
}

/**
 * DFS plano de todos los nodos en orden pre-order.
 * Útil para iterar sobre todo el árbol cuando se hace el render.
 */
export function flattenNodes(root: TreeNode): TreeNode[] {
  const result: TreeNode[] = [];
  function recurse(n: TreeNode) {
    result.push(n);
    for (const c of n.children ?? []) recurse(c);
  }
  recurse(root);
  return result;
}

/**
 * Recolecta todas las aristas padre → hijo del árbol.
 */
export function collectEdges(
  root: TreeNode,
): { parentId: string; childId: string }[] {
  const edges: { parentId: string; childId: string }[] = [];
  function recurse(n: TreeNode) {
    for (const c of n.children ?? []) {
      edges.push({ parentId: n.id, childId: c.id });
      recurse(c);
    }
  }
  recurse(root);
  return edges;
}
