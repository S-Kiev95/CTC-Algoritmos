"use client";

import { Grid3x3 } from "lucide-react";
import { useMemo } from "react";
import type { Graph } from "@/lib/algorithms/graph/types";

type Props = {
  graph: Graph;
  /** Tamaño de las celdas en píxeles. Default 28. */
  cellSize?: number;
  /** Si false, oculta el header y pie. Default true. */
  showChrome?: boolean;
};

/**
 * Matriz de adyacencia M[i][j] = peso de la arista i→j (o "·" si no hay,
 * "—" en la diagonal). Estática — no reacciona al estado del algoritmo;
 * sirve como referencia visual de la estructura.
 */
export function AdjacencyMatrix({
  graph,
  cellSize = 28,
  showChrome = true,
}: Props) {
  const adj = useMemo(() => {
    const map = new Map<string, number>();
    for (const edge of graph.edges) {
      const w = edge.weight ?? 1;
      map.set(`${edge.from}|${edge.to}`, w);
      if (!graph.directed) {
        map.set(`${edge.to}|${edge.from}`, w);
      }
    }
    return map;
  }, [graph]);

  function cellWeight(fromId: string, toId: string): number | null {
    const v = adj.get(`${fromId}|${toId}`);
    return v ?? null;
  }

  const cellPx = `${cellSize}px`;

  return (
    <div className="inline-flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {showChrome && (
        <div className="flex shrink-0 items-center gap-1.5 border-b border-zinc-200 bg-zinc-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/60">
          <Grid3x3 className="h-3 w-3" />
          Matriz de adyacencia
        </div>
      )}
      <div className="p-2">
        <table className="font-mono text-[12px] tabular-nums">
          <thead>
            <tr>
              <th style={{ width: cellPx, height: cellPx }} />
              {graph.nodes.map((n) => (
                <th
                  key={n.id}
                  style={{ width: cellPx, height: cellPx }}
                  className="text-center font-bold text-zinc-600 dark:text-zinc-400"
                >
                  {n.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {graph.nodes.map((rowNode) => (
              <tr key={rowNode.id}>
                <th
                  style={{ width: cellPx, height: cellPx }}
                  className="text-center font-bold text-zinc-600 dark:text-zinc-400"
                >
                  {rowNode.label}
                </th>
                {graph.nodes.map((colNode) => {
                  const w = cellWeight(rowNode.id, colNode.id);
                  const diag = rowNode.id === colNode.id;
                  return (
                    <td
                      key={colNode.id}
                      style={{ width: cellPx, height: cellPx }}
                      className={[
                        "border border-zinc-100 text-center dark:border-zinc-800/60",
                        w !== null
                          ? "bg-sky-50 font-semibold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
                          : diag
                            ? "bg-zinc-100 text-zinc-300 dark:bg-zinc-800/40 dark:text-zinc-700"
                            : "text-zinc-300 dark:text-zinc-700",
                      ].join(" ")}
                    >
                      {w !== null ? w : diag ? "—" : "·"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showChrome && (
        <div className="shrink-0 border-t border-zinc-200 px-2 py-1 text-[10px] text-zinc-500 dark:border-zinc-800">
          {graph.directed ? "Dirigido: M[i][j] = i→j" : "No dirigido (simétrica)"}
        </div>
      )}
    </div>
  );
}
