"use client";

import { useMemo } from "react";
import { nearestNode, type CityGraph } from "@/lib/mapas/overpass";
import type { MapPathState, NodeMark } from "@/lib/mapas/pathfind";

const MARK_COLOR: Record<NodeMark, string> = {
  visitedA: "#38bdf8", // celeste
  frontierA: "#f59e0b", // ámbar
  visitedB: "#a78bfa", // violeta
  frontierB: "#fb7185", // rosa
  current: "#f59e0b",
  meet: "#10b981", // verde
  path: "#eab308", // dorado
};

/**
 * Mapa de la ciudad en SVG. Dibuja todas las calles (polilíneas reales) y, por
 * encima, el estado de la búsqueda (nodos visitados/frontera, ruta final).
 * Permite elegir inicio y meta haciendo clic (devuelve el nodo más cercano).
 */
export function CityMap({
  graph,
  state,
  start,
  goal,
  onPick,
}: {
  graph: CityGraph;
  state?: MapPathState | null;
  start: number | null;
  goal: number | null;
  onPick?: (node: number) => void;
}) {
  const [s, w, n, e] = graph.bbox;
  const latMid = (s + n) / 2;
  const lonSpan = (e - w) * Math.cos((latMid * Math.PI) / 180);
  const latSpan = n - s;
  const H = 600;
  const W = Math.max(200, (H * lonSpan) / latSpan);

  const projX = (lon: number) => ((lon - w) / (e - w)) * W;
  const projY = (lat: number) => ((n - lat) / (n - s)) * H;

  // Polilíneas de todas las calles (sin duplicar aristas: solo to > i).
  const streets = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i < graph.adj.length; i++) {
      for (const edge of graph.adj[i]) {
        if (edge.to > i) {
          out.push(edge.points.map(([la, lo]) => `${projX(lo)},${projY(la)}`).join(" "));
        }
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph]);

  // Ruta final: polilínea siguiendo las calles entre nodos del camino.
  const pathStr = useMemo(() => {
    const pn = state?.pathNodes;
    if (!pn || pn.length < 2) return "";
    const pts: string[] = [];
    for (let k = 0; k < pn.length - 1; k++) {
      const a = pn[k];
      const b = pn[k + 1];
      const edge = graph.adj[a]?.find((x) => x.to === b);
      const poly = edge ? edge.points : [
        [graph.nodes[a].lat, graph.nodes[a].lon],
        [graph.nodes[b].lat, graph.nodes[b].lon],
      ] as [number, number][];
      for (const [la, lo] of poly) pts.push(`${projX(lo)},${projY(la)}`);
    }
    return pts.join(" ");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, graph]);

  const marks = state?.marks ?? {};

  function handleClick(ev: React.MouseEvent<SVGSVGElement>) {
    if (!onPick) return;
    const svg = ev.currentTarget;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    // Convertir las coords de pantalla a coords del viewBox (preciso aunque la
    // SVG esté escalada o con letterbox por preserveAspectRatio).
    const loc = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(ctm.inverse());
    const lon = w + (loc.x / W) * (e - w);
    const lat = n - (loc.y / H) * (n - s);
    onPick(nearestNode(graph, lat, lon));
  }

  const dot = (i: number, color: string, r: number) => (
    <circle key={`m${i}`} cx={projX(graph.nodes[i].lon)} cy={projY(graph.nodes[i].lat)} r={r} fill={color} />
  );

  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        onClick={handleClick}
        preserveAspectRatio="xMidYMid meet"
        className={[
          "h-full max-h-full w-auto max-w-full min-h-[260px] rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950",
          onPick ? "cursor-crosshair" : "",
        ].join(" ")}
      >
        {/* Calles */}
        {streets.map((pts, i) => (
          <polyline
            key={`st${i}`}
            points={pts}
            fill="none"
            className="stroke-zinc-300 dark:stroke-zinc-700"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        ))}

        {/* Nodos marcados (visitados / frontera) */}
        {Object.entries(marks).map(([idx, mark]) => {
          const i = Number(idx);
          if (mark === "path") return null;
          const r = mark === "current" || mark === "meet" ? 5 : 2.6;
          return dot(i, MARK_COLOR[mark], r);
        })}

        {/* Ruta final */}
        {pathStr && (
          <polyline
            points={pathStr}
            fill="none"
            stroke={MARK_COLOR.path}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Inicio / meta */}
        {start !== null && (
          <circle cx={projX(graph.nodes[start].lon)} cy={projY(graph.nodes[start].lat)} r={7} fill="#22c55e" stroke="#fff" strokeWidth={2} />
        )}
        {goal !== null && (
          <circle cx={projX(graph.nodes[goal].lon)} cy={projY(graph.nodes[goal].lat)} r={7} fill="#ef4444" stroke="#fff" strokeWidth={2} />
        )}
      </svg>
    </div>
  );
}
