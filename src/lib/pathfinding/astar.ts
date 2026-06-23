import type { Step } from "@/lib/types";
import { edgeWeight, type Maze } from "@/lib/ejercicios/mazeKruskal";
import type { CellMark, PathState } from "./types";

export const ASTAR_CODE = `import heapq
def a_star(adj, start, goal):
    g = {start: 0}
    pq = [(h(start), start)]      # prioridad = g + h
    prev = {}
    while pq:
        _, u = heapq.heappop(pq)  # mejor f = g + h
        if u == goal:
            break
        for (v, peso) in adj[u]:
            ng = g[u] + peso
            if ng < g.get(v, INF):
                g[v] = ng
                prev[v] = u
                f = ng + h(v)     # h = distancia Manhattan a la meta
                heapq.heappush(pq, (f, v))
    return camino(prev, start, goal)
`;

export function generateAstarSteps(maze: Maze): Step<PathState>[] {
  const { rows, cols, carved, adj } = maze;
  const start = 0;
  const goal = rows * cols - 1;

  const gr = Math.floor(goal / cols);
  const gc = goal % cols;
  const h = (cell: number) =>
    Math.abs(Math.floor(cell / cols) - gr) + Math.abs((cell % cols) - gc);

  const g = new Map<number, number>([[start, 0]]);
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
    note: `Arrancamos en la celda ${start}. La heurística guía hacia la meta.`,
  });

  while (frontier.size > 0) {
    // Mínimo f = g + h.
    let u = -1;
    let best = Infinity;
    for (const f of frontier) {
      const f_ = (g.get(f) ?? Infinity) + h(f);
      if (f_ < best) {
        best = f_;
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
        note: `Llegamos a la meta (celda ${goal}).`,
      });
      break;
    }

    steps.push({
      state: base({ marks: buildMarks(u) }),
      line: 7,
      note: `Se expande la celda ${u} (menor f = g + h). La heurística evita ramas que se alejan.`,
    });

    for (const v of adj[u]) {
      if (visited.has(v)) continue;
      const ng = (g.get(u) ?? Infinity) + edgeWeight(maze, u, v);
      if (ng < (g.get(v) ?? Infinity)) {
        g.set(v, ng);
        prev.set(v, u);
        frontier.add(v);
      }
    }
  }

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

  const cost = g.get(goal);
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
          ? `Camino óptimo: costo ${cost} (${path.length - 1} cuadras), explorando menos celdas. Explorados: ${explored}.`
          : "Trazando el camino…",
    });
  });

  return steps;
}
