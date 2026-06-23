import type { Step } from "@/lib/types";
import { edgeWeight, type Maze } from "@/lib/ejercicios/mazeKruskal";
import type { CellMark, PathState } from "./types";

export const DIJKSTRA_CODE = `import heapq
def dijkstra(adj, start, goal):
    dist = {start: 0}
    pq = [(0, start)]              # (distancia, celda)
    prev = {}
    while pq:
        d, u = heapq.heappop(pq)  # la celda mas cercana
        if u == goal:
            break
        for (v, peso) in adj[u]:  # cada pasaje tiene su costo
            nd = d + peso
            if nd < dist.get(v, INF):
                dist[v] = nd
                prev[v] = u
                heapq.heappush(pq, (nd, v))
    return camino(prev, start, goal)
`;

export function generateDijkstraSteps(maze: Maze): Step<PathState>[] {
  const { rows, cols, carved, adj } = maze;
  const start = 0;
  const goal = rows * cols - 1;

  const dist = new Map<number, number>([[start, 0]]);
  const prev = new Map<number, number>();
  const visited = new Set<number>();
  const frontier = new Set<number>([start]);

  const steps: Step<PathState>[] = [];
  let explored = 0;

  const buildMarks = (current: number | null, path?: Set<number>) => {
    const m: Record<number, CellMark> = {};
    for (const v of visited) m[v] = "visitedA";
    for (const f of frontier) m[f] = "frontierA";
    if (current != null) m[current] = "current";
    if (path) for (const p of path) m[p] = "path";
    return m;
  };
  const base = (extra: Partial<PathState>): PathState => ({
    rows,
    cols,
    carved,
    start,
    goal,
    marks: {},
    explored,
    ...extra,
  });

  steps.push({
    state: base({ marks: buildMarks(null) }),
    line: 4,
    note: `Arrancamos en la celda ${start} con distancia 0.`,
  });

  while (frontier.size > 0) {
    let u = -1;
    let best = Infinity;
    for (const f of frontier) {
      const d = dist.get(f) ?? Infinity;
      if (d < best) {
        best = d;
        u = f;
      }
    }
    frontier.delete(u);
    visited.add(u);
    explored++;

    if (u === goal) {
      steps.push({
        state: base({ marks: buildMarks(u) }),
        line: 8,
        note: `Llegamos a la meta (celda ${goal}). Reconstruimos el camino.`,
      });
      break;
    }

    steps.push({
      state: base({ marks: buildMarks(u) }),
      line: 7,
      note: `Se expande la celda ${u}, la de menor distancia (${best}).`,
    });

    for (const v of adj[u]) {
      if (visited.has(v)) continue;
      const nd = best + edgeWeight(maze, u, v);
      if (nd < (dist.get(v) ?? Infinity)) {
        dist.set(v, nd);
        prev.set(v, u);
        frontier.add(v);
      }
    }
  }

  // Reconstrucción del camino.
  const path: number[] = [];
  if (visited.has(goal)) {
    let cur: number | undefined = goal;
    while (cur != null) {
      path.push(cur);
      if (cur === start) break;
      cur = prev.get(cur);
    }
    path.reverse();
  }

  const cost = dist.get(goal);
  const pathSet = new Set<number>();
  path.forEach((cell, i) => {
    pathSet.add(cell);
    steps.push({
      state: base({
        marks: buildMarks(null, pathSet),
        found: i === path.length - 1,
        pathLen: path.length - 1,
        cost,
      }),
      line: 16,
      note:
        i === path.length - 1
          ? `Camino más barato: costo ${cost} (${path.length - 1} cuadras). Explorados: ${explored}.`
          : "Trazando el camino desde la meta hacia el inicio…",
    });
  });

  return steps;
}
