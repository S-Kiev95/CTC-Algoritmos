import type { City } from "./cities";

export type GeoNode = { id: number; lat: number; lon: number };
/** Arista a otro nodo: peso (metros) + polilínea real de la calle (lat/lon). */
export type GeoEdge = { to: number; weight: number; points: [number, number][] };

export type CityGraph = {
  slug: string;
  bbox: [number, number, number, number];
  /** Nodos-interés (intersecciones / extremos), indexados 0..n-1. */
  nodes: GeoNode[];
  /** Lista de adyacencia por índice de nodo. */
  adj: GeoEdge[][];
};

/** Distancia en metros entre dos coordenadas (haversine). */
export function haversine(
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const la1 = toRad(aLat);
  const la2 = toRad(bLat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Varios mirrors: si uno está caído o rate-limitea, se prueba el siguiente.
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];
const HIGHWAYS =
  "primary|secondary|tertiary|residential|unclassified|living_street|trunk|primary_link|secondary_link";

type OverpassElement =
  | { type: "node"; id: number; lat: number; lon: number }
  | { type: "way"; id: number; nodes: number[] };

/** Procesa la respuesta cruda de Overpass en un grafo simplificado. */
export function buildGraph(
  slug: string,
  bbox: [number, number, number, number],
  elements: OverpassElement[],
): CityGraph {
  const coord = new Map<number, { lat: number; lon: number }>();
  const ways: number[][] = [];
  for (const el of elements) {
    if (el.type === "node") coord.set(el.id, { lat: el.lat, lon: el.lon });
    else if (el.type === "way" && el.nodes.length >= 2) ways.push(el.nodes);
  }

  // Conteo de uso para detectar intersecciones.
  const use = new Map<number, number>();
  for (const w of ways) for (const n of w) use.set(n, (use.get(n) ?? 0) + 1);
  const isInterest = (osmId: number, way: number[]) =>
    (use.get(osmId) ?? 0) >= 2 ||
    osmId === way[0] ||
    osmId === way[way.length - 1];

  // Asignar índice a cada nodo-interés que tenga coordenadas.
  const indexOf = new Map<number, number>();
  const nodes: GeoNode[] = [];
  const ensureIndex = (osmId: number): number | null => {
    const c = coord.get(osmId);
    if (!c) return null;
    let idx = indexOf.get(osmId);
    if (idx === undefined) {
      idx = nodes.length;
      indexOf.set(osmId, idx);
      nodes.push({ id: osmId, lat: c.lat, lon: c.lon });
    }
    return idx;
  };

  const adj: GeoEdge[][] = [];
  const ensureAdj = (i: number) => {
    while (adj.length <= i) adj.push([]);
  };

  for (const w of ways) {
    let prevInterest: number | null = null; // índice
    let segPoints: [number, number][] = [];
    let segLen = 0;
    let lastCoord: { lat: number; lon: number } | null = null;

    for (let k = 0; k < w.length; k++) {
      const osmId = w[k];
      const c = coord.get(osmId);
      if (!c) continue;
      if (lastCoord) segLen += haversine(lastCoord.lat, lastCoord.lon, c.lat, c.lon);
      segPoints.push([c.lat, c.lon]);
      lastCoord = c;

      if (isInterest(osmId, w)) {
        const idx = ensureIndex(osmId);
        if (idx === null) continue;
        if (prevInterest !== null && idx !== prevInterest && segLen > 0) {
          ensureAdj(idx);
          ensureAdj(prevInterest);
          const fwd = [...segPoints] as [number, number][];
          const rev = [...segPoints].reverse() as [number, number][];
          adj[prevInterest].push({ to: idx, weight: segLen, points: fwd });
          adj[idx].push({ to: prevInterest, weight: segLen, points: rev });
        }
        prevInterest = idx;
        segPoints = [[c.lat, c.lon]];
        segLen = 0;
      }
    }
  }
  while (adj.length < nodes.length) adj.push([]);

  return { slug, bbox, nodes, adj };
}

function overpassQuery(bbox: [number, number, number, number]): string {
  const [s, w, n, e] = bbox;
  return `[out:json][timeout:25];way["highway"~"^(${HIGHWAYS})$"](${s},${w},${n},${e});(._;>;);out skel qt;`;
}

const cacheKey = (slug: string) => `mapgraph:${slug}`;

function readCache(slug: string): CityGraph | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(cacheKey(slug));
    return raw ? (JSON.parse(raw) as CityGraph) : null;
  } catch {
    return null;
  }
}

function writeCache(graph: CityGraph): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(cacheKey(graph.slug), JSON.stringify(graph));
  } catch {
    // localStorage lleno o deshabilitado: seguimos sin cachear.
  }
}

/**
 * Trae el grafo de calles de una ciudad: primero del caché (localStorage), y si
 * no está, lo pide a Overpass y lo guarda. El browser agrega el User-Agent y
 * Overpass habilita CORS, así que el fetch funciona desde el cliente.
 */
export async function fetchCityGraph(
  city: City,
  opts: { force?: boolean } = {},
): Promise<CityGraph> {
  if (!opts.force) {
    const cached = readCache(city.slug);
    if (cached && cached.nodes.length > 0) return cached;
  }
  const body = "data=" + encodeURIComponent(overpassQuery(city.bbox));
  let lastErr: unknown = null;
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Overpass a veces responde 200 con una página HTML de rate-limit.
      const text = await res.text();
      const json = JSON.parse(text) as { elements: OverpassElement[] };
      const graph = buildGraph(city.slug, city.bbox, json.elements ?? []);
      if (graph.nodes.length === 0) throw new Error("sin calles");
      writeCache(graph);
      return graph;
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(
    `No se pudo obtener el mapa (OpenStreetMap ocupado). ${lastErr instanceof Error ? lastErr.message : ""}`.trim(),
  );
}

/** Índice del nodo más cercano a una coordenada (para el click del usuario). */
export function nearestNode(graph: CityGraph, lat: number, lon: number): number {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < graph.nodes.length; i++) {
    const d = haversine(lat, lon, graph.nodes[i].lat, graph.nodes[i].lon);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}
