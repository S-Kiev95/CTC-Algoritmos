import type { Step, WatchEntry } from "@/lib/types";
import { neighborsOf, type Graph, type GraphState } from "./types";

export const DIJKSTRA_CODE = `def dijkstra(grafo, origen):
    dist = {n: infinito for n in grafo.nodos}
    dist[origen] = 0
    pred = {n: None for n in grafo.nodos}
    no_visitados = set(grafo.nodos)

    while no_visitados:
        actual = min(no_visitados, key=lambda n: dist[n])
        if dist[actual] == infinito:
            break
        no_visitados.remove(actual)

        for vecino, peso in grafo.aristas_de(actual):
            if vecino not in no_visitados:
                continue
            alternativa = dist[actual] + peso
            if alternativa < dist[vecino]:
                dist[vecino] = alternativa
                pred[vecino] = actual
    return dist, pred
`;

export function generateDijkstraSteps(
  graph: Graph,
  startId: string,
  endId?: string,
): Step<GraphState>[] {
  const steps: Step<GraphState>[] = [];
  const visited: string[] = [];
  const distances: Record<string, number | null> = {};
  const predecessors: Record<string, string | null> = {};
  const unvisited = new Set(graph.nodes.map((n) => n.id));

  for (const node of graph.nodes) {
    distances[node.id] = null;
    predecessors[node.id] = null;
  }
  distances[startId] = 0;

  function snap(
    line: number,
    note: string,
    extras: Partial<GraphState> = {},
    watch?: WatchEntry[],
  ): void {
    steps.push({
      state: {
        graph,
        visited: [...visited],
        frontier: Array.from(unvisited),
        frontierType: "priority",
        source: startId,
        destination: endId,
        distances: { ...distances },
        predecessors: { ...predecessors },
        ...extras,
      },
      line,
      note,
      watch,
    });
  }

  function distLabel(id: string): string {
    const d = distances[id];
    return d === null ? "∞" : String(d);
  }

  snap(
    3,
    `Inicializo: dist[${startId.toUpperCase()}] = 0, todos los demás = ∞.${endId ? ` Buscamos camino mínimo hasta "${endId.toUpperCase()}".` : ""}`,
    {},
    [
      { name: "origen", value: `"${startId.toUpperCase()}"`, kind: "input" },
      ...(endId
        ? [
            {
              name: "destino",
              value: `"${endId.toUpperCase()}"`,
              kind: "input" as const,
            },
          ]
        : []),
      {
        name: `dist[${startId.toUpperCase()}]`,
        value: "0",
        kind: "computed",
        changed: true,
      },
    ],
  );

  while (unvisited.size > 0) {
    let current: string | null = null;
    let minDist = Infinity;
    for (const id of unvisited) {
      const d = distances[id];
      if (d !== null && d < minDist) {
        minDist = d;
        current = id;
      }
    }

    if (current === null) {
      snap(9, `Todos los no-visitados son ∞. Salgo del while.`);
      break;
    }

    snap(
      7,
      `Elijo el no-visitado con menor dist: "${current.toUpperCase()}" (dist=${distLabel(current)}).`,
      { cursor: current },
      [
        {
          name: "actual",
          value: `"${current.toUpperCase()}"`,
          kind: "computed",
          changed: true,
        },
        {
          name: `dist[${current.toUpperCase()}]`,
          value: distLabel(current),
          kind: "computed",
        },
      ],
    );

    unvisited.delete(current);
    visited.push(current);
    snap(
      11,
      `Saco "${current.toUpperCase()}" de no_visitados. Su distancia ya es definitiva.`,
      { cursor: current },
    );

    const neighbors = neighborsOf(graph, current);
    for (const { neighborId, weight } of neighbors) {
      if (!unvisited.has(neighborId)) {
        snap(
          14,
          `Vecino "${neighborId.toUpperCase()}" ya visitado. Salto.`,
          { cursor: current, examiningEdge: { from: current, to: neighborId } },
        );
        continue;
      }

      const alternative = distances[current]! + weight;
      const old = distances[neighborId];
      const improves = old === null || alternative < old;

      snap(
        16,
        `Vecino "${neighborId.toUpperCase()}" (peso=${weight}). alternativa = ${distances[current]} + ${weight} = ${alternative}.`,
        { cursor: current, examiningEdge: { from: current, to: neighborId } },
        [
          {
            name: "vecino",
            value: `"${neighborId.toUpperCase()}"`,
            kind: "computed",
            changed: true,
          },
          { name: "peso", value: String(weight), kind: "computed" },
          {
            name: "alternativa",
            value: String(alternative),
            kind: "computed",
            changed: true,
          },
          {
            name: `dist[${neighborId.toUpperCase()}] actual`,
            value: distLabel(neighborId),
            kind: "computed",
          },
        ],
      );

      snap(
        17,
        `¿${alternative} < ${distLabel(neighborId)}? ${improves ? "Sí, actualizo." : "No, no mejora."}`,
        { cursor: current, examiningEdge: { from: current, to: neighborId } },
      );

      if (improves) {
        distances[neighborId] = alternative;
        predecessors[neighborId] = current;
        snap(
          18,
          `dist[${neighborId.toUpperCase()}] = ${alternative}, pred[${neighborId.toUpperCase()}] = "${current.toUpperCase()}".`,
          { cursor: current, examiningEdge: { from: current, to: neighborId } },
          [
            {
              name: `dist[${neighborId.toUpperCase()}]`,
              value: String(alternative),
              kind: "output",
              changed: true,
            },
            {
              name: `pred[${neighborId.toUpperCase()}]`,
              value: `"${current.toUpperCase()}"`,
              kind: "output",
              changed: true,
            },
          ],
        );
      }
    }
  }

  // Árbol de caminos mínimos completo
  const treeEdges: { from: string; to: string }[] = [];
  for (const node of graph.nodes) {
    const pred = predecessors[node.id];
    if (pred !== null) {
      treeEdges.push({ from: pred, to: node.id });
    }
  }

  // Si hay destino, reconstruir el camino origen → destino siguiendo pred
  let pathEdges: { from: string; to: string }[] | undefined;
  let pathNodes: string[] | undefined;
  let pathCost: number | undefined;
  if (endId && distances[endId] !== null) {
    pathNodes = [];
    pathEdges = [];
    let cur: string | null = endId;
    while (cur !== null) {
      pathNodes.unshift(cur);
      const p: string | null = predecessors[cur] ?? null;
      if (p !== null) {
        pathEdges.unshift({ from: p, to: cur });
      }
      cur = p;
    }
    pathCost = distances[endId] ?? undefined;
  }

  if (endId) {
    if (pathNodes && pathNodes.length > 1) {
      snap(
        20,
        `Camino mínimo desde "${startId.toUpperCase()}" hasta "${endId.toUpperCase()}": ${pathNodes.map((n) => n.toUpperCase()).join(" → ")} (costo ${pathCost}).`,
        { treeEdges, pathEdges, pathNodes, pathCost },
        [
          {
            name: "camino",
            value: pathNodes.map((n) => n.toUpperCase()).join(" → "),
            kind: "output",
            changed: true,
          },
          {
            name: "costo",
            value: String(pathCost),
            kind: "output",
            changed: true,
          },
        ],
      );
    } else {
      snap(
        20,
        `No hay camino desde "${startId.toUpperCase()}" hasta "${endId.toUpperCase()}".`,
        { treeEdges },
      );
    }
  } else {
    snap(
      20,
      `Dijkstra completo. Distancias mínimas finalizadas.`,
      { treeEdges },
      [
        {
          name: "dist final",
          value: graph.nodes
            .map((n) => `${n.label}=${distLabel(n.id)}`)
            .join(", "),
          kind: "output",
          changed: true,
        },
      ],
    );
  }

  return steps;
}
