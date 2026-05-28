import type { Edge, Graph, GraphNode } from "./types";

/**
 * Grafo simple para la tab "Conceptos". 4 nodos en cuadrado + una diagonal.
 *
 *    A ─── B
 *    │\    │
 *    │ \   │
 *    C ─── D
 *
 * Tiene 5 aristas. Pequeño y suficiente para mostrar matriz de adyacencia
 * sin abrumar al estudiante.
 */
export const SIMPLE_GRAPH: Graph = {
  directed: false,
  nodes: [
    { id: "a", label: "A", x: 80, y: 60 },
    { id: "b", label: "B", x: 280, y: 60 },
    { id: "c", label: "C", x: 80, y: 220 },
    { id: "d", label: "D", x: 280, y: 220 },
  ],
  edges: [
    { from: "a", to: "b" },
    { from: "a", to: "c" },
    { from: "a", to: "d" },
    { from: "b", to: "d" },
    { from: "c", to: "d" },
  ],
};

/**
 * Grafo para BFS y DFS — 6 nodos, 8 aristas, con ciclos.
 *
 *      A ─── B
 *     ╱│     │╲
 *    C │     │ D
 *     ╲│     │╱
 *      E ─── F
 */
export const SAMPLE_GRAPH: Graph = {
  directed: false,
  nodes: [
    { id: "a", label: "A", x: 160, y: 40 },
    { id: "b", label: "B", x: 340, y: 40 },
    { id: "c", label: "C", x: 40, y: 150 },
    { id: "d", label: "D", x: 460, y: 150 },
    { id: "e", label: "E", x: 200, y: 260 },
    { id: "f", label: "F", x: 300, y: 260 },
  ],
  edges: [
    { from: "a", to: "b" },
    { from: "a", to: "c" },
    { from: "a", to: "e" },
    { from: "b", to: "d" },
    { from: "b", to: "f" },
    { from: "c", to: "e" },
    { from: "d", to: "f" },
    { from: "e", to: "f" },
  ],
};

/**
 * Cuadrícula tipo "ciudad" para A*. Cada intersección es un nodo,
 * cada cuadra (segmento entre intersecciones adyacentes) es una arista
 * de peso 1. 5×5 = 25 intersecciones, 40 cuadras.
 *
 * Layout: (row, col) → posición (col*70+30, row*70+30).
 * Labels: numerados 1-25 en orden row-major.
 */
function createCityGrid(rows: number, cols: number): Graph {
  const nodes: GraphNode[] = [];
  const edges: Edge[] = [];
  const SPACING = 70;
  const PAD = 30;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = `${r},${c}`;
      const num = r * cols + c + 1;
      nodes.push({
        id,
        label: String(num),
        x: PAD + c * SPACING,
        y: PAD + r * SPACING,
      });
      if (c < cols - 1) {
        edges.push({ from: id, to: `${r},${c + 1}`, weight: 1 });
      }
      if (r < rows - 1) {
        edges.push({ from: id, to: `${r + 1},${c}`, weight: 1 });
      }
    }
  }
  return { nodes, edges, directed: false };
}

export const CITY_GRID = createCityGrid(5, 5);

/**
 * Distancia Manhattan entre dos nodos del grid. Los IDs son "r,c".
 * Sirve como heurística admisible para A* en grids 4-conectados con
 * pesos uniformes.
 */
export function manhattanDistance(idA: string, idB: string): number {
  const [ar, ac] = idA.split(",").map(Number);
  const [br, bc] = idB.split(",").map(Number);
  return Math.abs(ar - br) + Math.abs(ac - bc);
}

/**
 * Mismo grafo con pesos para Dijkstra.
 * Pesos elegidos para que el camino A→F mínimo pase por C→E (suma 7)
 * en lugar de directo por B (suma 12) o por E (suma 11).
 */
export const WEIGHTED_GRAPH: Graph = {
  directed: false,
  nodes: SAMPLE_GRAPH.nodes,
  edges: [
    { from: "a", to: "b", weight: 4 },
    { from: "a", to: "c", weight: 2 },
    { from: "a", to: "e", weight: 7 },
    { from: "b", to: "d", weight: 5 },
    { from: "b", to: "f", weight: 8 },
    { from: "c", to: "e", weight: 1 },
    { from: "d", to: "f", weight: 3 },
    { from: "e", to: "f", weight: 4 },
  ],
};
