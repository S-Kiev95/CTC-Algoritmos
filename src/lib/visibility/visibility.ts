/**
 * Visibilidad 2D por ray casting. Reimplementación propia del algoritmo clásico
 * (lanzar rayos a las esquinas de las paredes y armar el polígono de lo visible),
 * inspirado en el artículo de Red Blob Games sobre visibilidad 2D.
 */

export type Pt = { x: number; y: number };
export type Seg = { a: Pt; b: Pt };

/**
 * Intersección de un rayo (origen `o`, dirección unitaria `d`) con un segmento.
 * Devuelve el punto de choque y su distancia al origen, o `null` si no cruza.
 */
export function intersectRay(
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  seg: Seg,
): { x: number; y: number; dist: number } | null {
  const spx = seg.a.x;
  const spy = seg.a.y;
  const sdx = seg.b.x - seg.a.x;
  const sdy = seg.b.y - seg.a.y;

  const denom = dx * sdy - dy * sdx;
  if (Math.abs(denom) < 1e-12) return null; // paralelos

  // Parámetro sobre el segmento (0..1) y sobre el rayo (>=0).
  const t2 = ((spx - ox) * dy - (spy - oy) * dx) / denom;
  if (t2 < 0 || t2 > 1) return null;

  const px = spx + sdx * t2;
  const py = spy + sdy * t2;
  const dist = (px - ox) * dx + (py - oy) * dy; // d es unitario → distancia real
  if (dist < 0) return null; // el segmento está detrás del rayo

  return { x: px, y: py, dist };
}

/** El primer choque del rayo con cualquiera de los segmentos (el más cercano). */
export function nearestHit(
  origin: Pt,
  angle: number,
  segments: Seg[],
): { x: number; y: number; dist: number } | null {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  let best: { x: number; y: number; dist: number } | null = null;
  for (const s of segments) {
    const hit = intersectRay(origin.x, origin.y, dx, dy, s);
    if (hit && (!best || hit.dist < best.dist)) best = hit;
  }
  return best;
}

/**
 * Polígono de visibilidad desde `light`. Lanza tres rayos por cada esquina
 * (al ángulo exacto y un poquito a cada lado, ±ε) para "doblar" en las esquinas,
 * se queda con el choque más cercano de cada rayo y ordena los puntos por ángulo.
 */
export function computeVisibility(light: Pt, segments: Seg[]): Pt[] {
  const EPS = 1e-4;
  const angles: number[] = [];
  for (const s of segments) {
    for (const p of [s.a, s.b]) {
      const base = Math.atan2(p.y - light.y, p.x - light.x);
      angles.push(base - EPS, base, base + EPS);
    }
  }

  const pts: { x: number; y: number; angle: number }[] = [];
  for (const a of angles) {
    const hit = nearestHit(light, a, segments);
    if (hit) pts.push({ x: hit.x, y: hit.y, angle: a });
  }
  pts.sort((p, q) => p.angle - q.angle);
  return pts.map((p) => ({ x: p.x, y: p.y }));
}

/**
 * Sensor tipo LIDAR: lanza `count` rayos repartidos en un abanico (`spread`
 * radianes, por defecto 360°) alrededor de `dir`. Devuelve para cada rayo el
 * punto de choque más cercano (o el alcance máximo si no choca con nada).
 */
export function castSensor(
  origin: Pt,
  segments: Seg[],
  count: number,
  opts: { spread?: number; dir?: number; maxRange?: number } = {},
): { x: number; y: number; dist: number; hit: boolean }[] {
  const spread = opts.spread ?? Math.PI * 2;
  const dir = opts.dir ?? 0;
  const maxRange = opts.maxRange ?? 10000;
  const full = spread >= Math.PI * 2 - 1e-6;
  const out: { x: number; y: number; dist: number; hit: boolean }[] = [];

  for (let i = 0; i < count; i++) {
    // En 360° repartimos parejo; en un cono barremos de -spread/2 a +spread/2.
    const frac = full ? i / count : count === 1 ? 0.5 : i / (count - 1);
    const angle = dir + (full ? frac * Math.PI * 2 : (frac - 0.5) * spread);
    const hit = nearestHit(origin, angle, segments);
    if (hit && hit.dist <= maxRange) {
      out.push({ x: hit.x, y: hit.y, dist: hit.dist, hit: true });
    } else {
      out.push({
        x: origin.x + Math.cos(angle) * maxRange,
        y: origin.y + Math.sin(angle) * maxRange,
        dist: maxRange,
        hit: false,
      });
    }
  }
  return out;
}

/** Convierte un rectángulo (x, y, ancho, alto) en sus 4 paredes. */
export function rectToSegs(x: number, y: number, w: number, h: number): Seg[] {
  const tl = { x, y };
  const tr = { x: x + w, y };
  const br = { x: x + w, y: y + h };
  const bl = { x, y: y + h };
  return [
    { a: tl, b: tr },
    { a: tr, b: br },
    { a: br, b: bl },
    { a: bl, b: tl },
  ];
}

/** Los 4 bordes del escenario (para que los rayos siempre choquen con algo). */
export function borderSegs(w: number, h: number): Seg[] {
  return rectToSegs(0, 0, w, h);
}

/** Área (con signo) de un polígono, por la fórmula del zapato (shoelace). */
export function polygonArea(pts: Pt[]): number {
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  return Math.abs(area) / 2;
}
