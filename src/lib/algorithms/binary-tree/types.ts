/**
 * Árbol binario de búsqueda (BST).
 *
 * Cada nodo tiene a lo sumo DOS hijos: `left` y `right`. La invariante del
 * BST es: para cada nodo, todos los valores del subárbol izquierdo son
 * menores, y todos los del derecho son mayores. Esa propiedad es lo que
 * permite búsquedas en O(log n) (en árbol balanceado).
 */
export type BstNode = {
  /** ID estable para reconciliación de animaciones. */
  id: string;
  value: number;
  left?: BstNode | null;
  right?: BstNode | null;
};

export type BstState = {
  /** Raíz del BST (puede ser null si el árbol está vacío). */
  root: BstNode | null;

  /** Nodo siendo visitado/comparado ahora. */
  cursor?: string;

  /** Nodos ya recorridos (path de comparaciones). */
  visited: string[];

  /** Valor pendiente de insertar/buscar (se muestra como "bubble" arriba). */
  pendingValue?: number;

  /** ID de un nodo recién insertado, para resaltarlo brevemente. */
  newNodeId?: string;

  /** ID del nodo encontrado en una búsqueda exitosa. */
  found?: string;

  /** true si la búsqueda terminó sin éxito. */
  notFound?: boolean;

  /** Para recorrido inorden: lista de valores visitados (queda ordenada). */
  output: number[];

  /**
   * Dirección que se está tomando en el cursor actual:
   * - "left": valor pendiente menor → bajo a la izquierda
   * - "right": valor pendiente mayor → bajo a la derecha
   * - "match": valor pendiente igual → match exacto
   * - "null": llegamos a null → insertar acá o "no encontrado"
   */
  direction?: "left" | "right" | "match" | "null";
};

export type NodeLayout = { x: number; y: number };

/**
 * Layout BST por posición inorden: cada nodo recibe una x única en el
 * orden en que aparecería al recorrer el árbol inorden.
 *
 * Esto garantiza que `node.left` siempre quede a la izquierda visual de
 * `node`, y `node.right` siempre a la derecha — incluso si solo existe
 * uno de los dos. Es el dibujo "natural" de un BST en libros de texto.
 */
export function layoutBst(
  root: BstNode | null,
): { positions: Map<string, NodeLayout>; width: number; height: number } {
  const positions = new Map<string, NodeLayout>();
  let nextX = 0;
  let maxDepth = 0;

  function recurse(node: BstNode | null | undefined, depth: number): void {
    if (!node) return;
    maxDepth = Math.max(maxDepth, depth);
    recurse(node.left, depth + 1);
    positions.set(node.id, { x: nextX, y: depth });
    nextX += 1;
    recurse(node.right, depth + 1);
  }

  recurse(root, 0);
  return {
    positions,
    width: Math.max(1, nextX),
    height: maxDepth + 1,
  };
}

/** DFS plano (pre-order) de todos los nodos. */
export function flattenBst(root: BstNode | null): BstNode[] {
  const result: BstNode[] = [];
  function recurse(n: BstNode | null | undefined) {
    if (!n) return;
    result.push(n);
    recurse(n.left);
    recurse(n.right);
  }
  recurse(root);
  return result;
}

/** Recolecta aristas padre → hijo (con etiqueta "left"/"right" para visual). */
export function collectBstEdges(
  root: BstNode | null,
): { parentId: string; childId: string; side: "left" | "right" }[] {
  const edges: { parentId: string; childId: string; side: "left" | "right" }[] =
    [];
  function recurse(n: BstNode | null | undefined) {
    if (!n) return;
    if (n.left) {
      edges.push({ parentId: n.id, childId: n.left.id, side: "left" });
      recurse(n.left);
    }
    if (n.right) {
      edges.push({ parentId: n.id, childId: n.right.id, side: "right" });
      recurse(n.right);
    }
  }
  recurse(root);
  return edges;
}

/** Clona el árbol completo (necesario para inmutabilidad entre snapshots). */
export function cloneBst(node: BstNode | null | undefined): BstNode | null {
  if (!node) return null;
  return {
    id: node.id,
    value: node.value,
    left: cloneBst(node.left),
    right: cloneBst(node.right),
  };
}
