import type { Step, WatchEntry } from "@/lib/types";
import { neighborsOf, type Graph, type GraphState } from "./types";

export const DFS_CODE = `def dfs(grafo, origen):
    visitados = []
    pila = [origen]
    while pila:
        nodo = pila.pop()
        if nodo in visitados:
            continue
        visitados.append(nodo)
        for vecino in reversed(grafo.vecinos(nodo)):
            if vecino not in visitados:
                pila.append(vecino)
    return visitados
`;

export function generateDfsSteps(
  graph: Graph,
  startId: string,
): Step<GraphState>[] {
  const steps: Step<GraphState>[] = [];
  const visited: string[] = [];
  const stack: string[] = [startId];

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
        frontier: [...stack],
        frontierType: "stack",
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
    `Empiezo DFS desde "${startId.toUpperCase()}". Pila inicial: [${startId.toUpperCase()}].`,
    {},
    [
      { name: "origen", value: `"${startId.toUpperCase()}"`, kind: "input" },
      { name: "pila", value: `["${startId.toUpperCase()}"]`, kind: "computed", changed: true },
    ],
  );

  while (stack.length > 0) {
    const node = stack.pop()!;
    snap(
      5,
      `nodo = pila.pop() = "${node.toUpperCase()}". Pila: [${stack.map((s) => s.toUpperCase()).join(", ") || "vacía"}].`,
      { cursor: node },
      [
        { name: "nodo", value: `"${node.toUpperCase()}"`, kind: "computed", changed: true },
        { name: "pila", value: `[${stack.map((s) => `"${s.toUpperCase()}"`).join(", ")}]`, kind: "computed" },
      ],
    );

    if (visited.includes(node)) {
      snap(7, `"${node.toUpperCase()}" ya está visitado. Salto.`, { cursor: node });
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
    const reversedNeighbors = [...neighbors].reverse();
    for (const { neighborId } of reversedNeighbors) {
      const inVisited = visited.includes(neighborId);
      snap(
        9,
        `Vecino "${neighborId.toUpperCase()}". ${inVisited ? "Visitado, no lo apilo." : "Lo apilo."}`,
        { cursor: node, examiningEdge: { from: node, to: neighborId } },
        [
          { name: "vecino", value: `"${neighborId.toUpperCase()}"`, kind: "computed", changed: true },
        ],
      );
      if (!inVisited) {
        stack.push(neighborId);
        snap(
          10,
          `pila.append("${neighborId.toUpperCase()}"). Pila: [${stack.map((s) => s.toUpperCase()).join(", ")}].`,
          { cursor: node },
          [
            {
              name: "pila",
              value: `[${stack.map((s) => `"${s.toUpperCase()}"`).join(", ")}]`,
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
    `Pila vacía. Recorrido DFS: [${visited.map((v) => v.toUpperCase()).join(", ")}].`,
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
