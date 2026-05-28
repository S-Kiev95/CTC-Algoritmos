/**
 * Modelo de grafo para visualización.
 *
 * Posiciones (x, y) fijas por nodo — evita layouts dinámicos y mantiene
 * los demos predecibles.
 */

export type GraphNode = {
  id: string;
  label: string;
  x: number;
  y: number;
};

export type Edge = {
  from: string;
  to: string;
  weight?: number;
};

export type Graph = {
  nodes: GraphNode[];
  edges: Edge[];
  directed: boolean;
};

export type FrontierType = "queue" | "stack" | "priority";

export type GraphState = {
  graph: Graph;
  cursor?: string;
  visited: string[];
  frontier?: string[];
  frontierType?: FrontierType;
  examiningEdge?: { from: string; to: string };
  distances?: Record<string, number | null>;
  predecessors?: Record<string, string | null>;
  treeEdges?: { from: string; to: string }[];
  source?: string;
  /** Nodo destino (Dijkstra). Se resalta siempre con color distintivo. */
  destination?: string;
  /** Aristas del camino más corto origen → destino (al final de Dijkstra). */
  pathEdges?: { from: string; to: string }[];
  /** Nodos en orden del camino más corto, para mostrar texto "A → C → E → F". */
  pathNodes?: string[];
  /** Costo total del camino más corto al destino. */
  pathCost?: number;
  /** Conjunto "abierto" (open set) en A* — nodos descubiertos pero no procesados. */
  openSet?: string[];
};

export function neighborsOf(
  graph: Graph,
  nodeId: string,
): { neighborId: string; weight: number }[] {
  const result: { neighborId: string; weight: number }[] = [];
  for (const edge of graph.edges) {
    if (edge.from === nodeId) {
      result.push({ neighborId: edge.to, weight: edge.weight ?? 1 });
    } else if (!graph.directed && edge.to === nodeId) {
      result.push({ neighborId: edge.from, weight: edge.weight ?? 1 });
    }
  }
  return result;
}

export function isEdgeInTree(
  edge: Edge,
  treeEdges: { from: string; to: string }[] | undefined,
  directed: boolean,
): boolean {
  if (!treeEdges) return false;
  return treeEdges.some(
    (te) =>
      (te.from === edge.from && te.to === edge.to) ||
      (!directed && te.from === edge.to && te.to === edge.from),
  );
}
