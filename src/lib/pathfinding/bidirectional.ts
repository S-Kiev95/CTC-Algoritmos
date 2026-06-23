import type { Step } from "@/lib/types";
import { edgeWeight, type Maze } from "@/lib/ejercicios/mazeKruskal";
import type { CellMark, PathState } from "./types";

export const BIDIRECTIONAL_CODE = `def bidireccional(adj, start, goal):
    distA, distB = {start: 0}, {goal: 0}
    fa, fb = [(0, start)], [(0, goal)]   # dos frentes
    prevA, prevB = {}, {}
    visA, visB = set(), set()
    while fa and fb:
        u = expandir(fa, distA, prevA, visA, adj)
        if u in visB:                    # los frentes se tocan!
            return unir(prevA, prevB, u)
        v = expandir(fb, distB, prevB, visB, adj)
        if v in visA:
            return unir(prevA, prevB, v)
`;

export function generateBidirectionalSteps(maze: Maze): Step<PathState>[] {
  const { rows, cols, carved, adj } = maze;
  const start = 0;
  const goal = rows * cols - 1;

  const distA = new Map<number, number>([[start, 0]]);
  const distB = new Map<number, number>([[goal, 0]]);
  const prevA = new Map<number, number>();
  const prevB = new Map<number, number>();
  const visitedA = new Set<number>();
  const visitedB = new Set<number>();
  const frontierA = new Set<number>([start]);
  const frontierB = new Set<number>([goal]);

  const steps: Step<PathState>[] = [];
  let explored = 0;

  const buildMarks = (
    current: number | null,
    meet: number | null,
    path?: Set<number>,
  ) => {
    const m: Record<number, CellMark> = {};
    for (const f of frontierA) m[f] = "frontierA";
    for (const f of frontierB) m[f] = "frontierB";
    for (const v of visitedA) m[v] = "visitedA";
    for (const v of visitedB) m[v] = "visitedB";
    if (current != null) m[current] = "current";
    if (meet != null) m[meet] = "meet";
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

  const expand = (
    frontier: Set<number>,
    dist: Map<number, number>,
    prev: Map<number, number>,
    visited: Set<number>,
  ): number => {
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
    for (const v of adj[u]) {
      if (visited.has(v)) continue;
      const nd = best + edgeWeight(maze, u, v);
      if (nd < (dist.get(v) ?? Infinity)) {
        dist.set(v, nd);
        prev.set(v, u);
        frontier.add(v);
      }
    }
    return u;
  };

  steps.push({
    state: base({ marks: buildMarks(null, null) }),
    line: 5,
    note: "Dos frentes: uno desde el inicio (celeste) y otro desde la meta (violeta).",
  });

  let meet: number | null = null;

  while (frontierA.size > 0 && frontierB.size > 0 && meet == null) {
    const uA = expand(frontierA, distA, prevA, visitedA);
    if (visitedB.has(uA)) {
      meet = uA;
      steps.push({
        state: base({ marks: buildMarks(null, meet) }),
        line: 8,
        note: `¡Los frentes se tocan en la celda ${uA}! Se une el camino.`,
      });
      break;
    }
    steps.push({
      state: base({ marks: buildMarks(uA, null) }),
      line: 7,
      note: `Frente del inicio: expande la celda ${uA}.`,
    });

    const uB = expand(frontierB, distB, prevB, visitedB);
    if (visitedA.has(uB)) {
      meet = uB;
      steps.push({
        state: base({ marks: buildMarks(null, meet) }),
        line: 11,
        note: `¡Los frentes se tocan en la celda ${uB}! Se une el camino.`,
      });
      break;
    }
    steps.push({
      state: base({ marks: buildMarks(uB, null) }),
      line: 10,
      note: `Frente de la meta: expande la celda ${uB}.`,
    });
  }

  // Reconstrucción: start → meet (prevA) + meet → goal (prevB).
  const path: number[] = [];
  if (meet != null) {
    const pathA: number[] = [];
    let cur: number | undefined = meet;
    while (cur != null) {
      pathA.push(cur);
      if (cur === start) break;
      cur = prevA.get(cur);
    }
    pathA.reverse(); // start..meet
    const pathB: number[] = [];
    cur = meet;
    while (cur != null) {
      pathB.push(cur);
      if (cur === goal) break;
      cur = prevB.get(cur);
    }
    // pathB = meet..goal
    path.push(...pathA, ...pathB.slice(1));
  }

  const cost =
    meet != null ? (distA.get(meet) ?? 0) + (distB.get(meet) ?? 0) : undefined;
  const pathSet = new Set<number>();
  path.forEach((cell, i) => {
    pathSet.add(cell);
    steps.push({
      state: base({
        marks: buildMarks(null, meet, pathSet),
        found: i === path.length - 1,
        pathLen: path.length - 1,
        cost,
      }),
      line: 9,
      note:
        i === path.length - 1
          ? `Camino unido: costo ${cost} (${path.length - 1} cuadras). Al buscar desde los dos lados se exploran menos celdas.`
          : "Uniendo las dos mitades del camino…",
    });
  });

  return steps;
}
