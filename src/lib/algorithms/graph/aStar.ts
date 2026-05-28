import type { Step, WatchEntry } from "@/lib/types";
import { manhattanDistance } from "./sampleGraphs";
import { neighborsOf, type Graph, type GraphState } from "./types";

export const A_STAR_CODE = `def a_star(grafo, origen, destino):
    g = {n: infinito for n in grafo.nodos}
    g[origen] = 0
    f = {n: infinito for n in grafo.nodos}
    f[origen] = heuristica(origen, destino)
    pred = {n: None for n in grafo.nodos}
    abiertos = {origen}
    cerrados = set()

    while abiertos:
        actual = min(abiertos, key=lambda n: f[n])
        if actual == destino:
            return reconstruir_camino(pred, destino)
        abiertos.remove(actual)
        cerrados.add(actual)

        for vecino, peso in grafo.aristas_de(actual):
            if vecino in cerrados:
                continue
            tentativo_g = g[actual] + peso
            if tentativo_g < g[vecino]:
                pred[vecino] = actual
                g[vecino] = tentativo_g
                f[vecino] = g[vecino] + heuristica(vecino, destino)
                abiertos.add(vecino)
    return None
`;

/**
 * A* sobre un grid: como Dijkstra pero ordenando el frontier por
 * f(n) = g(n) + h(n), donde h(n) es la heurística (distancia Manhattan al
 * destino). El heurístico **guía** la búsqueda en dirección al destino,
 * lo que hace que A* explore muchos menos nodos que Dijkstra para llegar
 * al mismo resultado en grids regulares.
 */
export function generateAStarSteps(
  graph: Graph,
  startId: string,
  endId: string,
): Step<GraphState>[] {
  const steps: Step<GraphState>[] = [];

  const g: Record<string, number | null> = {};
  const f: Record<string, number | null> = {};
  const pred: Record<string, string | null> = {};
  for (const n of graph.nodes) {
    g[n.id] = null;
    f[n.id] = null;
    pred[n.id] = null;
  }
  g[startId] = 0;
  f[startId] = manhattanDistance(startId, endId);

  const open = new Set<string>([startId]);
  const closed: string[] = [];

  function snap(
    line: number,
    note: string,
    extras: Partial<GraphState> = {},
    watch?: WatchEntry[],
  ): void {
    steps.push({
      state: {
        graph,
        visited: [...closed],
        openSet: Array.from(open),
        frontier: Array.from(open),
        frontierType: "priority",
        source: startId,
        destination: endId,
        distances: { ...f }, // mostramos f sobre los nodos
        predecessors: { ...pred },
        ...extras,
      },
      line,
      note,
      watch,
    });
  }

  function fLabel(id: string): string {
    const v = f[id];
    return v === null ? "∞" : String(v);
  }
  function gLabel(id: string): string {
    const v = g[id];
    return v === null ? "∞" : String(v);
  }
  function labelOf(id: string): string {
    return graph.nodes.find((n) => n.id === id)?.label ?? id;
  }

  snap(
    4,
    `Inicializo. h(${labelOf(startId)}) = ${manhattanDistance(startId, endId)} (distancia Manhattan al destino). f[${labelOf(startId)}] = g + h = 0 + ${manhattanDistance(startId, endId)}.`,
    {},
    [
      { name: "origen", value: `"${labelOf(startId)}"`, kind: "input" },
      {
        name: "destino",
        value: `"${labelOf(endId)}"`,
        kind: "input",
      },
      {
        name: `g[${labelOf(startId)}]`,
        value: "0",
        kind: "computed",
        changed: true,
      },
      {
        name: `f[${labelOf(startId)}]`,
        value: String(manhattanDistance(startId, endId)),
        kind: "computed",
        changed: true,
      },
    ],
  );

  let foundDestination = false;
  let pathEdges: { from: string; to: string }[] | undefined;
  let pathNodes: string[] | undefined;
  let pathCost: number | undefined;

  while (open.size > 0) {
    // actual = abiertos con menor f
    let current: string | null = null;
    let minF = Infinity;
    for (const id of open) {
      const v = f[id];
      if (v !== null && v < minF) {
        minF = v;
        current = id;
      }
    }
    if (current === null) break;

    snap(
      9,
      `Elijo de abiertos el de menor f: "${labelOf(current)}" (f=${fLabel(current)}, g=${gLabel(current)}, h=${manhattanDistance(current, endId)}).`,
      { cursor: current },
      [
        {
          name: "actual",
          value: `"${labelOf(current)}"`,
          kind: "computed",
          changed: true,
        },
        {
          name: `f[${labelOf(current)}]`,
          value: fLabel(current),
          kind: "computed",
        },
        {
          name: `g[${labelOf(current)}]`,
          value: gLabel(current),
          kind: "computed",
        },
        {
          name: `h(${labelOf(current)})`,
          value: String(manhattanDistance(current, endId)),
          kind: "computed",
        },
      ],
    );

    if (current === endId) {
      // Reconstruir camino
      pathNodes = [];
      pathEdges = [];
      let cur: string | null = endId;
      while (cur !== null) {
        pathNodes.unshift(cur);
        const p: string | null = pred[cur] ?? null;
        if (p !== null) pathEdges.unshift({ from: p, to: cur });
        cur = p;
      }
      pathCost = g[endId] ?? undefined;
      foundDestination = true;
      snap(
        11,
        `¡Llegué al destino "${labelOf(endId)}"! Reconstruyo el camino: ${pathNodes.map(labelOf).join(" → ")} (costo ${pathCost}).`,
        {
          cursor: current,
          pathEdges,
          pathNodes,
          pathCost,
        },
        [
          {
            name: "camino",
            value: pathNodes.map(labelOf).join(" → "),
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
      break;
    }

    open.delete(current);
    closed.push(current);
    snap(
      13,
      `Saco "${labelOf(current)}" de abiertos y lo paso a cerrados.`,
      { cursor: current },
    );

    for (const { neighborId, weight } of neighborsOf(graph, current)) {
      if (closed.includes(neighborId)) {
        snap(
          16,
          `Vecino "${labelOf(neighborId)}" ya está en cerrados. Salto.`,
          { cursor: current, examiningEdge: { from: current, to: neighborId } },
        );
        continue;
      }

      const tentG = g[current]! + weight;
      const oldG = g[neighborId];
      const improves = oldG === null || tentG < oldG;
      const h = manhattanDistance(neighborId, endId);

      snap(
        17,
        `Vecino "${labelOf(neighborId)}" (peso=${weight}). tentativo_g = ${g[current]} + ${weight} = ${tentG}.`,
        { cursor: current, examiningEdge: { from: current, to: neighborId } },
        [
          {
            name: "vecino",
            value: `"${labelOf(neighborId)}"`,
            kind: "computed",
            changed: true,
          },
          {
            name: "tentativo_g",
            value: String(tentG),
            kind: "computed",
            changed: true,
          },
          {
            name: `g[${labelOf(neighborId)}] actual`,
            value: gLabel(neighborId),
            kind: "computed",
          },
        ],
      );

      snap(
        18,
        `¿${tentG} < ${gLabel(neighborId)}? ${improves ? "Sí, actualizo." : "No, no mejora."}`,
        { cursor: current, examiningEdge: { from: current, to: neighborId } },
      );

      if (improves) {
        pred[neighborId] = current;
        g[neighborId] = tentG;
        f[neighborId] = tentG + h;
        open.add(neighborId);
        snap(
          21,
          `Actualizo: g[${labelOf(neighborId)}] = ${tentG}, f[${labelOf(neighborId)}] = ${tentG} + ${h} = ${tentG + h}. Lo agrego a abiertos.`,
          { cursor: current, examiningEdge: { from: current, to: neighborId } },
          [
            {
              name: `g[${labelOf(neighborId)}]`,
              value: String(tentG),
              kind: "output",
              changed: true,
            },
            {
              name: `h(${labelOf(neighborId)})`,
              value: String(h),
              kind: "computed",
            },
            {
              name: `f[${labelOf(neighborId)}]`,
              value: String(tentG + h),
              kind: "output",
              changed: true,
            },
          ],
        );
      }
    }
  }

  if (!foundDestination) {
    snap(
      22,
      `Abiertos vacío sin encontrar destino. No hay camino.`,
      {},
    );
  }

  return steps;
}
