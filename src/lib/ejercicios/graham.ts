import type { Step } from "@/lib/types";

export type Point = { x: number; y: number };

/**
 * Producto cruzado (o × a→b). > 0: giro antihorario (izquierda). < 0: horario
 * (derecha). = 0: colineales.
 */
export function cross(o: Point, a: Point, b: Point): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

/** Convex hull por Graham scan. Devuelve los vértices del casco en orden. */
export function convexHull(points: Point[]): Point[] {
  if (points.length < 3) return [...points];
  const p0 = points.reduce((m, p) =>
    p.y < m.y || (p.y === m.y && p.x < m.x) ? p : m,
  );
  const rest = points
    .filter((p) => p !== p0)
    .sort((a, b) => {
      const ca = cross(p0, a, b);
      if (ca !== 0) return ca > 0 ? -1 : 1;
      // colineales: el más cercano primero
      return dist2(p0, a) - dist2(p0, b);
    });
  const hull: Point[] = [p0];
  for (const p of rest) {
    while (hull.length >= 2 && cross(hull[hull.length - 2], hull[hull.length - 1], p) <= 0) {
      hull.pop();
    }
    hull.push(p);
  }
  return hull;
}

function dist2(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

/** Área de un polígono (fórmula del shoelace). */
export function polygonArea(poly: Point[]): number {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    s += a.x * b.y - b.x * a.y;
  }
  return Math.abs(s) / 2;
}

export function randomPoints(n: number, maxX: number, maxY: number): Point[] {
  const pts: Point[] = [];
  const seen = new Set<string>();
  while (pts.length < n) {
    const x = 1 + Math.floor(Math.random() * (maxX - 1));
    const y = 1 + Math.floor(Math.random() * (maxY - 1));
    const k = `${x},${y}`;
    if (seen.has(k)) continue;
    seen.add(k);
    pts.push({ x, y });
  }
  return pts;
}

export const GRAHAM_CODE = `import math

def giro(a, b, c):
    # producto cruzado: >0 antihorario, <0 horario, =0 colineales
    return (b[0]-a[0])*(c[1]-a[1]) - (b[1]-a[1])*(c[0]-a[0])

def angulo(o, p):
    return math.atan2(p[1]-o[1], p[0]-o[0])

def dist(o, p):
    return (p[0]-o[0])**2 + (p[1]-o[1])**2

def graham_scan(points):
    # p0: el punto mas abajo (y menor); si empatan, el mas a la izquierda
    p0 = min(points, key=lambda p: (p[1], p[0]))
    # ordenar el resto por angulo polar respecto de p0
    puntos = [p for p in points if p != p0]
    puntos.sort(key=lambda p: (angulo(p0, p), dist(p0, p)))

    hull = [p0]
    for p in puntos:
        # mientras el giro no sea antihorario, descartar el ultimo
        while len(hull) >= 2 and giro(hull[-2], hull[-1], p) <= 0:
            hull.pop()
        hull.append(p)
    return hull
`;

export type Turn = "left" | "right" | "collinear";

export type GrahamState = {
  points: Point[];
  /** Índice del punto base p0. */
  p0?: number;
  /** Índices de points en orden polar (incluye p0 primero). */
  order?: number[];
  /** Pila del casco en construcción (índices). */
  hull: number[];
  /** Índice del punto candidato en este paso. */
  current?: number | null;
  /** Índice recién descartado (pop) en este paso. */
  popped?: number | null;
  turn?: Turn | null;
  /** Casco cerrado (terminado). */
  closed?: boolean;
  /** Área del casco (shoelace), al cerrar. */
  area?: number;
};

/**
 * Pasos de Graham scan para animar: elegir p0, ordenar por ángulo, y construir
 * el casco empujando/descartando puntos según el test de giro.
 */
export function generateGrahamSteps(points: Point[]): Step<GrahamState>[] {
  const steps: Step<GrahamState>[] = [];
  const n = points.length;
  if (n < 3) {
    steps.push({
      state: { points, hull: points.map((_, i) => i), closed: true, area: 0 },
      line: 26,
      note: "Con menos de 3 puntos no hay polígono.",
    });
    return steps;
  }

  const fmtP = (i: number) => `(${points[i].x}, ${points[i].y})`;
  const fmtHull = (h: number[]) => "[" + h.map(fmtP).join(", ") + "]";

  // p0: índice del punto más abajo / izquierda.
  let p0 = 0;
  for (let i = 1; i < n; i++) {
    if (points[i].y < points[p0].y || (points[i].y === points[p0].y && points[i].x < points[p0].x)) {
      p0 = i;
    }
  }
  steps.push({
    state: { points, p0, hull: [p0] },
    line: 15,
    note: "p0: el punto más abajo (y, si empatan, el más a la izquierda). Es seguro que está en el casco.",
    watch: [
      { name: "p0", value: fmtP(p0), kind: "input", changed: true },
      { name: "hull", value: fmtHull([p0]), kind: "computed" },
    ],
  });

  // Orden polar (índices), p0 primero.
  const rest = points
    .map((_, i) => i)
    .filter((i) => i !== p0)
    .sort((a, b) => {
      const ca = cross(points[p0], points[a], points[b]);
      if (ca !== 0) return ca > 0 ? -1 : 1;
      return dist2(points[p0], points[a]) - dist2(points[p0], points[b]);
    });
  const order = [p0, ...rest];
  steps.push({
    state: { points, p0, order, hull: [p0] },
    line: 18,
    note: "Se ordenan los demás puntos por su ángulo polar respecto de p0.",
    watch: [
      { name: "p0", value: fmtP(p0), kind: "input" },
      { name: "por procesar", value: String(order.length - 1), kind: "computed", changed: true },
      { name: "hull", value: fmtHull([p0]), kind: "computed" },
    ],
  });

  const hull: number[] = [p0];
  for (let k = 1; k < order.length; k++) {
    const p = order[k];
    while (hull.length >= 2) {
      const c = cross(points[hull[hull.length - 2]], points[hull[hull.length - 1]], points[p]);
      if (c > 0) break; // giro antihorario: ok
      const popped = hull[hull.length - 1];
      steps.push({
        state: {
          points, p0, order,
          hull: [...hull],
          current: p,
          popped,
          turn: c === 0 ? "collinear" : "right",
        },
        line: 24,
        note: c === 0
          ? "Punto colineal: se descarta para no dejar vértices de más."
          : "El giro es a la derecha (cóncavo): se descarta el último del casco.",
        watch: [
          { name: "p (candidato)", value: fmtP(p), kind: "input" },
          { name: "últimos 2 del hull", value: `${fmtP(hull[hull.length - 2])}, ${fmtP(popped)}`, kind: "computed" },
          { name: "giro(a,b,p)", value: `${c}  (≤ 0 → sacar)`, kind: "computed", changed: true },
          { name: "len(hull)", value: String(hull.length), kind: "computed" },
        ],
      });
      hull.pop();
    }
    const pushC =
      hull.length >= 2
        ? cross(points[hull[hull.length - 2]], points[hull[hull.length - 1]], points[p])
        : null;
    hull.push(p);
    steps.push({
      state: { points, p0, order, hull: [...hull], current: p, turn: "left" },
      line: 25,
      note: "Giro antihorario: el punto entra al casco.",
      watch: [
        { name: "p (candidato)", value: fmtP(p), kind: "input" },
        { name: "giro(a,b,p)", value: pushC === null ? "— (hull < 2)" : `${pushC}  (> 0 → agregar)`, kind: "computed", changed: true },
        { name: "hull", value: fmtHull(hull), kind: "computed" },
      ],
    });
  }

  const hullPts = hull.map((i) => points[i]);
  const area = polygonArea(hullPts);
  steps.push({
    state: { points, p0, order, hull: [...hull], closed: true, area },
    line: 26,
    note: "Casco convexo cerrado. El polígono que envuelve a todos los puntos.",
    watch: [
      { name: "hull", value: fmtHull(hull), kind: "output" },
      { name: "vértices", value: String(hull.length), kind: "output" },
      { name: "área", value: area.toFixed(1), kind: "output", changed: true },
    ],
  });

  return steps;
}
