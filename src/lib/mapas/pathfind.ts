import type { Step } from "@/lib/types";
import { haversine, type CityGraph } from "./overpass";

export type NodeMark =
  | "visitedA"
  | "frontierA"
  | "visitedB"
  | "frontierB"
  | "current"
  | "path"
  | "meet";

export type MapPathState = {
  start: number;
  goal: number;
  marks: Record<number, NodeMark>;
  explored: number;
  found?: boolean;
  distMeters?: number;
  pathNodes?: number[];
};

const fmt = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`);

function reconstruct(prev: Map<number, number>, start: number, goal: number): number[] {
  const path: number[] = [];
  let cur: number | undefined = goal;
  while (cur !== undefined) {
    path.push(cur);
    if (cur === start) break;
    cur = prev.get(cur);
  }
  return path.reverse();
}

// ── Dijkstra y A* (comparten estructura; A* suma una heurística) ──────────
export const DIJKSTRA_CODE = `import heapq
def dijkstra(grafo, inicio, meta):
    dist = {inicio: 0}
    pq = [(0, inicio)]
    prev = {}
    while pq:
        d, u = heapq.heappop(pq)   # el nodo mas cercano
        if u == meta: break
        for (v, metros) in grafo[u]:
            nd = d + metros
            if nd < dist.get(v, INF):
                dist[v] = nd; prev[v] = u
                heapq.heappush(pq, (nd, v))
    return camino(prev, inicio, meta)
`;

export const ASTAR_CODE = `import heapq
def a_estrella(grafo, inicio, meta):
    g = {inicio: 0}
    pq = [(h(inicio, meta), inicio)]  # prioridad = g + h
    prev = {}
    while pq:
        _, u = heapq.heappop(pq)
        if u == meta: break
        for (v, metros) in grafo[u]:
            ng = g[u] + metros
            if ng < g.get(v, INF):
                g[v] = ng; prev[v] = u
                # h = distancia en linea recta a la meta
                heapq.heappush(pq, (ng + h(v, meta), v))
    return camino(prev, inicio, meta)
`;

function search(
  graph: CityGraph,
  start: number,
  goal: number,
  useHeuristic: boolean,
): Step<MapPathState>[] {
  const g = new Map<number, number>([[start, 0]]);
  const prev = new Map<number, number>();
  const visited = new Set<number>();
  const frontier = new Set<number>([start]);
  const steps: Step<MapPathState>[] = [];
  let explored = 0;

  const h = (i: number) =>
    useHeuristic
      ? haversine(
          graph.nodes[i].lat,
          graph.nodes[i].lon,
          graph.nodes[goal].lat,
          graph.nodes[goal].lon,
        )
      : 0;

  const marks = (current: number | null): Record<number, NodeMark> => {
    const m: Record<number, NodeMark> = {};
    for (const v of visited) m[v] = "visitedA";
    for (const f of frontier) m[f] = "frontierA";
    if (current !== null) m[current] = "current";
    return m;
  };
  const line = useHeuristic ? { expand: 7, relax: 11 } : { expand: 7, relax: 10 };

  while (frontier.size > 0) {
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

    if (u === goal) break;

    steps.push({
      state: { start, goal, marks: marks(u), explored },
      line: line.expand,
      sound: "tick",
      note: `Se expande el nodo más prometedor (explorados: ${explored}).`,
    });

    for (const e of graph.adj[u]) {
      if (visited.has(e.to)) continue;
      const ng = (g.get(u) ?? Infinity) + e.weight;
      if (ng < (g.get(e.to) ?? Infinity)) {
        g.set(e.to, ng);
        prev.set(e.to, u);
        frontier.add(e.to);
      }
    }
  }

  const path = visited.has(goal) ? reconstruct(prev, start, goal) : [];
  const dist = g.get(goal);
  steps.push({
    state: {
      start,
      goal,
      marks: marks(null),
      explored,
      found: path.length > 0,
      distMeters: dist,
      pathNodes: path,
    },
    line: line.relax,
    sound: "found",
    note:
      path.length > 0
        ? `Ruta encontrada: ${fmt(dist ?? 0)}. Nodos explorados: ${explored}.`
        : "No hay ruta entre esos puntos en esta zona.",
  });
  return steps;
}

export function generateDijkstraSteps(graph: CityGraph, start: number, goal: number) {
  return search(graph, start, goal, false);
}
export function generateAstarSteps(graph: CityGraph, start: number, goal: number) {
  return search(graph, start, goal, true);
}

// ── Bidireccional (dos frentes que se encuentran) ─────────────────────────
export const BIDIRECTIONAL_CODE = `def bidireccional(grafo, inicio, meta):
    # dos busquedas a la vez: una desde inicio, otra desde meta
    distA, distB = {inicio: 0}, {meta: 0}
    prevA, prevB = {}, {}
    frenteA, frenteB = {inicio}, {meta}
    while frenteA and frenteB:
        expandir_menor(frenteA, distA, prevA)   # un paso cada frente
        expandir_menor(frenteB, distB, prevB)
        encuentro = frenteA & visitadosB
        if encuentro:                           # se tocaron
            return unir(prevA, prevB, encuentro)
`;

export function generateBidirectionalSteps(
  graph: CityGraph,
  start: number,
  goal: number,
): Step<MapPathState>[] {
  const distA = new Map<number, number>([[start, 0]]);
  const distB = new Map<number, number>([[goal, 0]]);
  const prevA = new Map<number, number>();
  const prevB = new Map<number, number>();
  const visA = new Set<number>();
  const visB = new Set<number>();
  const frontA = new Set<number>([start]);
  const frontB = new Set<number>([goal]);
  const steps: Step<MapPathState>[] = [];
  let explored = 0;
  let meet = -1;

  const marks = (cur: number | null): Record<number, NodeMark> => {
    const m: Record<number, NodeMark> = {};
    for (const v of visA) m[v] = "visitedA";
    for (const v of visB) m[v] = "visitedB";
    for (const f of frontA) m[f] = "frontierA";
    for (const f of frontB) m[f] = "frontierB";
    if (cur !== null) m[cur] = "current";
    return m;
  };

  const expand = (
    front: Set<number>,
    dist: Map<number, number>,
    prev: Map<number, number>,
    vis: Set<number>,
  ): number => {
    let u = -1;
    let best = Infinity;
    for (const f of front) {
      const d = dist.get(f) ?? Infinity;
      if (d < best) {
        best = d;
        u = f;
      }
    }
    if (u === -1) return -1;
    front.delete(u);
    vis.add(u);
    explored++;
    for (const e of graph.adj[u]) {
      if (vis.has(e.to)) continue;
      const nd = best + e.weight;
      if (nd < (dist.get(e.to) ?? Infinity)) {
        dist.set(e.to, nd);
        prev.set(e.to, u);
        front.add(e.to);
      }
    }
    return u;
  };

  while (frontA.size > 0 && frontB.size > 0) {
    const ua = expand(frontA, distA, prevA, visA);
    if (ua !== -1 && visB.has(ua)) {
      meet = ua;
      break;
    }
    const ub = expand(frontB, distB, prevB, visB);
    if (ub !== -1 && visA.has(ub)) {
      meet = ub;
      break;
    }
    steps.push({
      state: { start, goal, marks: marks(ua), explored },
      line: 7,
      sound: "tick",
      note: `Avanzan los dos frentes (explorados: ${explored}).`,
    });
  }

  let path: number[] = [];
  let distMeters = 0;
  if (meet !== -1) {
    const left = reconstruct(prevA, start, meet); // start..meet
    const right = reconstruct(prevB, goal, meet).reverse(); // meet..goal
    path = [...left, ...right.slice(1)];
    distMeters = (distA.get(meet) ?? 0) + (distB.get(meet) ?? 0);
    const m = marks(null);
    m[meet] = "meet";
    steps.push({
      state: { start, goal, marks: m, explored, found: false, pathNodes: [] },
      line: 9,
      sound: "tick",
      note: `Los dos frentes se encontraron en un nodo. Se unen las dos mitades.`,
    });
  }

  steps.push({
    state: {
      start,
      goal,
      marks: marks(null),
      explored,
      found: path.length > 0,
      distMeters,
      pathNodes: path,
    },
    line: 10,
    sound: "found",
    note:
      path.length > 0
        ? `Ruta encontrada: ${fmt(distMeters)}. Nodos explorados: ${explored} (suele explorar menos que Dijkstra simple).`
        : "No se encontró ruta.",
  });
  return steps;
}
