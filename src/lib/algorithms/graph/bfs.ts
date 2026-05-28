import type { Step, WatchEntry } from "@/lib/types";
import { neighborsOf, type Graph, type GraphState } from "./types";

export const BFS_CODE = `def bfs(grafo, origen):
    visitados = []
    cola = [origen]
    while cola:
        nodo = cola.pop(0)
        if nodo in visitados:
            continue
        visitados.append(nodo)
        for vecino in grafo.vecinos(nodo):
            if vecino not in visitados and vecino not in cola:
                cola.append(vecino)
    return visitados
`;

export function generateBfsSteps(
  graph: Graph,
  startId: string,
): Step<GraphState>[] {
  const steps: Step<GraphState>[] = [];
  const visited: string[] = [];
  const queue: string[] = [startId];

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
        frontier: [...queue],
        frontierType: "queue",
        source: startId,
        ...extras,
      },
      line,
      note,
      watch,
    });
  }

  snap(
    2,
    `Empiezo BFS desde "${startId.toUpperCase()}". Cola inicial: [${startId.toUpperCase()}].`,
    {},
    [
      { name: "origen", value: `"${startId.toUpperCase()}"`, kind: "input" },
      {
        name: "cola",
        value: `["${startId.toUpperCase()}"]`,
        kind: "computed",
        changed: true,
      },
    ],
  );

  while (queue.length > 0) {
    const node = queue.shift()!;
    snap(
      5,
      `nodo = cola.pop(0) = "${node.toUpperCase()}". Cola: [${queue.map((q) => q.toUpperCase()).join(", ") || "vacía"}].`,
      { cursor: node },
      [
        { name: "nodo", value: `"${node.toUpperCase()}"`, kind: "computed", changed: true },
        { name: "cola", value: `[${queue.map((q) => `"${q.toUpperCase()}"`).join(", ")}]`, kind: "computed" },
      ],
    );

    if (visited.includes(node)) {
      snap(
        7,
        `"${node.toUpperCase()}" ya está visitado. Salto.`,
        { cursor: node },
      );
      continue;
    }

    visited.push(node);
    snap(
      8,
      `Visito "${node.toUpperCase()}". Lo agrego a visitados.`,
      { cursor: node },
      [
        {
          name: "visitados",
          value: `[${visited.map((v) => `"${v.toUpperCase()}"`).join(", ")}]`,
          kind: "computed",
          changed: true,
        },
      ],
    );

    const neighbors = neighborsOf(graph, node);
    for (const { neighborId } of neighbors) {
      const inVisited = visited.includes(neighborId);
      const inQueue = queue.includes(neighborId);
      snap(
        9,
        `Vecino "${neighborId.toUpperCase()}". ${
          inVisited ? "Visitado, no lo agrego." : inQueue ? "Ya en cola, no lo agrego." : "Lo encolo."
        }`,
        { cursor: node, examiningEdge: { from: node, to: neighborId } },
        [
          { name: "vecino", value: `"${neighborId.toUpperCase()}"`, kind: "computed", changed: true },
        ],
      );
      if (!inVisited && !inQueue) {
        queue.push(neighborId);
        snap(
          10,
          `cola.append("${neighborId.toUpperCase()}"). Cola: [${queue.map((q) => q.toUpperCase()).join(", ")}].`,
          { cursor: node },
          [
            {
              name: "cola",
              value: `[${queue.map((q) => `"${q.toUpperCase()}"`).join(", ")}]`,
              kind: "computed",
              changed: true,
            },
          ],
        );
      }
    }
  }

  snap(
    11,
    `Cola vacía. Recorrido BFS: [${visited.map((v) => v.toUpperCase()).join(", ")}].`,
    {},
    [
      {
        name: "return",
        value: `[${visited.map((v) => `"${v.toUpperCase()}"`).join(", ")}]`,
        kind: "output",
        changed: true,
      },
    ],
  );

  return steps;
}
