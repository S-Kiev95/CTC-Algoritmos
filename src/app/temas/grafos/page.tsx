"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  Layers,
  ListOrdered,
  MapPin,
  Route,
  Workflow,
} from "lucide-react";
import { AlgorithmPlayer } from "@/components/AlgorithmPlayer";
import { AdjacencyMatrix } from "@/components/algorithms/AdjacencyMatrix";
import { Graph } from "@/components/algorithms/Graph";
import { A_STAR_CODE, generateAStarSteps } from "@/lib/algorithms/graph/aStar";
import { BFS_CODE, generateBfsSteps } from "@/lib/algorithms/graph/bfs";
import { DFS_CODE, generateDfsSteps } from "@/lib/algorithms/graph/dfs";
import {
  DIJKSTRA_CODE,
  generateDijkstraSteps,
} from "@/lib/algorithms/graph/dijkstra";
import {
  CITY_GRID,
  SAMPLE_GRAPH,
  SIMPLE_GRAPH,
  WEIGHTED_GRAPH,
} from "@/lib/algorithms/graph/sampleGraphs";

type DemoKey = "conceptos" | "bfs" | "dfs" | "dijkstra" | "astar";

const START_OPTIONS = [
  { id: "a", label: "A" },
  { id: "b", label: "B" },
  { id: "c", label: "C" },
  { id: "d", label: "D" },
  { id: "e", label: "E" },
  { id: "f", label: "F" },
];

// Para A*, opciones de origen/destino sobre la grilla 5×5 (nodos 1..25).
const CITY_OPTIONS = CITY_GRID.nodes.map((n) => ({
  id: n.id,
  label: n.label,
}));

export default function GrafosPage() {
  const [demo, setDemo] = useState<DemoKey>("conceptos");
  const [startId, setStartId] = useState("a");
  const [endId, setEndId] = useState("f");
  // A* tiene su propio par origen/destino sobre la grilla.
  const [aStarStart, setAStarStart] = useState("0,0");
  const [aStarEnd, setAStarEnd] = useState("4,4");

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <Workflow className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Tema
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Grafos
            </h1>
            <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
              Nodos conectados por aristas. Pueden ser dirigidos o no, y
              tener pesos. Casi todos los algoritmos sobre grafos usan
              <em> recorridos</em> con un conjunto de <em>visitados</em> para
              evitar caer en ciclos infinitos.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
            <TabButton
              active={demo === "conceptos"}
              onClick={() => setDemo("conceptos")}
              icon={<BookOpen className="h-3.5 w-3.5" />}
            >
              Conceptos
            </TabButton>
            <TabButton
              active={demo === "bfs"}
              onClick={() => setDemo("bfs")}
              icon={<ListOrdered className="h-3.5 w-3.5" />}
              subtitle="cola FIFO"
            >
              BFS
            </TabButton>
            <TabButton
              active={demo === "dfs"}
              onClick={() => setDemo("dfs")}
              icon={<Layers className="h-3.5 w-3.5" />}
              subtitle="pila LIFO"
            >
              DFS
            </TabButton>
            <TabButton
              active={demo === "dijkstra"}
              onClick={() => setDemo("dijkstra")}
              icon={<Route className="h-3.5 w-3.5" />}
              subtitle="caminos mínimos"
            >
              Dijkstra
            </TabButton>
            <TabButton
              active={demo === "astar"}
              onClick={() => setDemo("astar")}
              icon={<MapPin className="h-3.5 w-3.5" />}
              subtitle="ciudad + heurística"
            >
              A*
            </TabButton>
          </div>

          {(demo === "bfs" || demo === "dfs" || demo === "dijkstra") && (
            <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-mono">origen =</span>
              <select
                value={startId}
                onChange={(e) => setStartId(e.target.value)}
                className="rounded-md border border-zinc-200 bg-white px-2 py-1 font-mono text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                {START_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          {demo === "astar" && (
            <>
              <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-mono text-sky-600 dark:text-sky-400">
                  origen =
                </span>
                <select
                  value={aStarStart}
                  onChange={(e) => setAStarStart(e.target.value)}
                  className="rounded-md border border-sky-300 bg-white px-2 py-1 font-mono text-sm text-zinc-900 focus:border-sky-400 focus:outline-none dark:border-sky-700/60 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  {CITY_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-mono text-rose-600 dark:text-rose-400">
                  destino =
                </span>
                <select
                  value={aStarEnd}
                  onChange={(e) => setAStarEnd(e.target.value)}
                  className="rounded-md border border-rose-300 bg-white px-2 py-1 font-mono text-sm text-zinc-900 focus:border-rose-400 focus:outline-none dark:border-rose-700/60 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  {CITY_OPTIONS.filter((o) => o.id !== aStarStart).map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}

          {demo === "dijkstra" && (
            <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-mono text-rose-600 dark:text-rose-400">
                destino =
              </span>
              <select
                value={endId}
                onChange={(e) => setEndId(e.target.value)}
                className="rounded-md border border-rose-300 bg-white px-2 py-1 font-mono text-sm text-zinc-900 focus:border-rose-400 focus:outline-none dark:border-rose-700/60 dark:bg-zinc-900 dark:text-zinc-100"
              >
                {START_OPTIONS.filter((o) => o.id !== startId).map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1">
        {demo === "conceptos" && <ConceptosTab />}
        {demo === "bfs" && <BfsDemo key={`b-${startId}`} startId={startId} />}
        {demo === "dfs" && <DfsDemo key={`d-${startId}`} startId={startId} />}
        {demo === "dijkstra" && (
          <DijkstraDemo
            key={`dj-${startId}-${endId}`}
            startId={startId}
            endId={endId}
          />
        )}
        {demo === "astar" && (
          <AStarDemo
            key={`as-${aStarStart}-${aStarEnd}`}
            startId={aStarStart}
            endId={aStarEnd}
          />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  subtitle,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex flex-col items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
      ].join(" ")}
    >
      <span className="flex items-center gap-1.5">
        {icon}
        {children}
      </span>
      {subtitle && (
        <span className="font-mono text-[10px] opacity-60">{subtitle}</span>
      )}
    </button>
  );
}

// ============================================================================
// Conceptos: página estática, sin AlgorithmPlayer
// ============================================================================

function ConceptosTab() {
  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-5xl px-6 py-6">
        {/* Sección 1: ¿Qué es un grafo? */}
        <section className="mb-8">
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            ¿Qué es un grafo?
          </h2>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Una estructura matemática formada por un conjunto de{" "}
            <strong>nodos</strong> (también llamados vértices) y un conjunto
            de <strong>aristas</strong> que los conectan. A diferencia de un
            árbol, un grafo puede tener <strong>ciclos</strong> (caminos que
            vuelven al punto de partida), y un nodo puede tener cualquier
            número de conexiones.
          </p>
        </section>

        {/* Sección 2: Conceptos clave */}
        <section className="mb-8">
          <h2 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Vocabulario
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ConceptCard term="Nodo (vértice)" def="Una entidad del grafo. Se representa con un círculo." />
            <ConceptCard
              term="Arista"
              def="Una conexión entre dos nodos. Se dibuja como línea."
            />
            <ConceptCard
              term="Dirigido / No dirigido"
              def="Si las aristas tienen sentido (A → B) o son simétricas (A — B)."
            />
            <ConceptCard
              term="Ponderado"
              def="Cuando cada arista tiene un peso (costo, distancia, tiempo)."
            />
            <ConceptCard
              term="Camino"
              def="Secuencia de nodos conectados consecutivamente por aristas."
            />
            <ConceptCard
              term="Ciclo"
              def="Camino que empieza y termina en el mismo nodo."
            />
          </div>
        </section>

        {/* Sección 3: Representación */}
        <section className="mb-8">
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Dos representaciones del mismo grafo
          </h2>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            En memoria, un grafo se puede guardar como un dibujo de nodos y
            aristas o como una <strong>matriz de adyacencia</strong>: una
            tabla donde la fila <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs dark:bg-zinc-800">i</code>{" "}
            y columna <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs dark:bg-zinc-800">j</code>{" "}
            vale 1 si existe la arista <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs dark:bg-zinc-800">i → j</code>{" "}
            y 0 si no. Para grafos no dirigidos la matriz es simétrica.
          </p>

          <div className="flex flex-wrap items-start gap-6 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="min-w-[280px] flex-1">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Vista visual
              </p>
              <div className="h-[260px]">
                <Graph state={{ graph: SIMPLE_GRAPH, visited: [] }} />
              </div>
            </div>

            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Vista matricial
              </p>
              <AdjacencyMatrix graph={SIMPLE_GRAPH} cellSize={32} />
            </div>
          </div>

          <p className="mt-3 text-xs text-zinc-500">
            <strong>Ambas son equivalentes.</strong> La matriz usa memoria{" "}
            <span className="font-mono">O(n²)</span> independientemente de
            cuántas aristas haya — eficiente para grafos densos, derrochador
            para grafos esparsos (donde conviene una <em>lista de adyacencia</em>).
          </p>
        </section>

        {/* Sección 4: Algoritmos clásicos */}
        <section>
          <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Algoritmos clásicos
          </h2>
          <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
            Las próximas tabs muestran los tres algoritmos fundamentales:
          </p>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>
              <strong className="text-zinc-900 dark:text-zinc-100">BFS</strong>{" "}
              — recorrido por niveles usando una <strong>cola</strong>. Útil
              para encontrar el camino con menos aristas.
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-zinc-100">DFS</strong>{" "}
              — recorrido profundo usando una <strong>pila</strong>. Profundiza
              por una rama hasta el fondo antes de retroceder.
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-zinc-100">
                Dijkstra
              </strong>{" "}
              — camino más corto desde un origen en grafos{" "}
              <strong>ponderados con pesos no negativos</strong>. Generaliza
              BFS: en lugar de elegir el siguiente nodo por orden de
              descubrimiento, elige el de menor distancia acumulada.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function ConceptCard({ term, def }: { term: string; def: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
      <p className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {term}
      </p>
      <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
        {def}
      </p>
    </div>
  );
}

// ============================================================================
// Demos algorítmicos: AlgorithmPlayer + Graph
// ============================================================================

function BfsDemo({ startId }: { startId: string }) {
  const steps = useMemo(
    () => generateBfsSteps(SAMPLE_GRAPH, startId),
    [startId],
  );
  return (
    <AlgorithmPlayer
      code={BFS_CODE}
      steps={steps}
      title={`bfs(grafo, "${startId.toUpperCase()}") — cola FIFO`}
      renderVisualization={(step) => <Graph state={step.state} />}
    />
  );
}

function DfsDemo({ startId }: { startId: string }) {
  const steps = useMemo(
    () => generateDfsSteps(SAMPLE_GRAPH, startId),
    [startId],
  );
  return (
    <AlgorithmPlayer
      code={DFS_CODE}
      steps={steps}
      title={`dfs(grafo, "${startId.toUpperCase()}") — pila LIFO`}
      renderVisualization={(step) => <Graph state={step.state} />}
    />
  );
}

function AStarDemo({
  startId,
  endId,
}: {
  startId: string;
  endId: string;
}) {
  const steps = useMemo(
    () => generateAStarSteps(CITY_GRID, startId, endId),
    [startId, endId],
  );
  const startLabel = CITY_GRID.nodes.find((n) => n.id === startId)?.label;
  const endLabel = CITY_GRID.nodes.find((n) => n.id === endId)?.label;
  return (
    <AlgorithmPlayer
      code={A_STAR_CODE}
      steps={steps}
      title={`A* en ciudad 5×5 — ${startLabel} → ${endLabel} (heurística: Manhattan)`}
      renderVisualization={(step) => <Graph state={step.state} />}
    />
  );
}

function DijkstraDemo({
  startId,
  endId,
}: {
  startId: string;
  endId: string;
}) {
  const steps = useMemo(
    () => generateDijkstraSteps(WEIGHTED_GRAPH, startId, endId),
    [startId, endId],
  );
  return (
    <AlgorithmPlayer
      code={DIJKSTRA_CODE}
      steps={steps}
      title={`dijkstra(ponderado, "${startId.toUpperCase()}" → "${endId.toUpperCase()}")`}
      renderVisualization={(step) => <Graph state={step.state} />}
    />
  );
}
