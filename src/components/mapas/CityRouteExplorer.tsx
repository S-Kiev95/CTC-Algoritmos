"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, MapPin, Navigation, RefreshCw, RotateCcw, Waypoints } from "lucide-react";
import { AlgorithmPlayer } from "@/components/AlgorithmPlayer";
import { ReadingPane } from "@/components/ejercicios/ExerciseLesson";
import { CityMap } from "@/components/mapas/CityMap";
import type { City } from "@/lib/mapas/cities";
import { fetchCityGraph, type CityGraph } from "@/lib/mapas/overpass";
import {
  ASTAR_CODE,
  BIDIRECTIONAL_CODE,
  DIJKSTRA_CODE,
  generateAstarSteps,
  generateBidirectionalSteps,
  generateDijkstraSteps,
} from "@/lib/mapas/pathfind";

type Tab = "explicacion" | "dijkstra" | "astar" | "bidir";

/**
 * Explorador de rutas sobre las calles reales de una ciudad. Carga el grafo de
 * OpenStreetMap (con caché), deja elegir inicio/meta con un clic y anima
 * Dijkstra / A* / bidireccional sobre los mismos puntos. Reutilizable por ciudad.
 */
export function CityRouteExplorer({ city }: { city: City }) {
  const [graph, setGraph] = useState<CityGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [start, setStart] = useState<number | null>(null);
  const [goal, setGoal] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab>("explicacion");

  const load = useCallback(
    (force = false) => {
      setLoading(true);
      setError(null);
      fetchCityGraph(city, { force })
        .then(setGraph)
        .catch((e: unknown) => setError(e instanceof Error ? e.message : "Error"))
        .finally(() => setLoading(false));
    },
    [city],
  );

  useEffect(() => {
    // Al cambiar de ciudad, limpiar la selección.
    setStart(null);
    setGoal(null);
    load();
  }, [load]);

  const pick = useCallback(
    (node: number) => {
      setStart((s) => {
        if (s === null) return node;
        if (goal === null) {
          if (node !== s) setGoal(node);
          return s;
        }
        setGoal(null);
        return node;
      });
    },
    [goal],
  );

  const clear = () => {
    setStart(null);
    setGoal(null);
  };

  const steps = useMemo(() => {
    if (!graph || start === null || goal === null) return [];
    if (tab === "dijkstra") return generateDijkstraSteps(graph, start, goal);
    if (tab === "astar") return generateAstarSteps(graph, start, goal);
    if (tab === "bidir") return generateBidirectionalSteps(graph, start, goal);
    return [];
  }, [graph, start, goal, tab]);

  const code = tab === "astar" ? ASTAR_CODE : tab === "bidir" ? BIDIRECTIONAL_CODE : DIJKSTRA_CODE;

  const header = (
    <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          <MapPin className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Mapas · Ruta más corta
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {city.title}
          </h1>
          <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
            Calles reales (OpenStreetMap). Elegí <strong>inicio</strong> y{" "}
            <strong>meta</strong> con un clic y mirá cómo cada algoritmo recorre
            la ciudad.
          </p>
        </div>
        <button
          onClick={() => load(true)}
          title="Volver a descargar el mapa"
          className="flex shrink-0 items-center gap-1.5 rounded-md border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Recargar mapa
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex flex-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
          <TabBtn active={tab === "explicacion"} onClick={() => setTab("explicacion")} icon={<BookOpen className="h-3.5 w-3.5" />}>
            Explicación
          </TabBtn>
          <TabBtn active={tab === "dijkstra"} onClick={() => setTab("dijkstra")} icon={<Navigation className="h-3.5 w-3.5" />}>
            Dijkstra
          </TabBtn>
          <TabBtn active={tab === "astar"} onClick={() => setTab("astar")} icon={<Navigation className="h-3.5 w-3.5" />}>
            A*
          </TabBtn>
          <TabBtn active={tab === "bidir"} onClick={() => setTab("bidir")} icon={<Waypoints className="h-3.5 w-3.5" />}>
            Bidireccional
          </TabBtn>
        </div>

        {tab !== "explicacion" && (
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
              {start === null ? "elegí inicio" : "inicio ✓"}
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
              {goal === null ? "elegí meta" : "meta ✓"}
            </span>
            {(start !== null || goal !== null) && (
              <button onClick={clear} className="flex items-center gap-1 rounded-md px-2 py-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <RotateCcw className="h-3 w-3" />
                Limpiar
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );

  return (
    <div className="flex h-full flex-col">
      {header}
      <div className="min-h-0 flex-1">
        <Body
          tab={tab}
          cityTitle={city.title}
          graph={graph}
          loading={loading}
          error={error}
          start={start}
          goal={goal}
          steps={steps}
          code={code}
          onPick={pick}
          onRetry={() => load(true)}
        />
      </div>
    </div>
  );
}

function Body({
  tab,
  cityTitle,
  graph,
  loading,
  error,
  start,
  goal,
  steps,
  code,
  onPick,
  onRetry,
}: {
  tab: Tab;
  cityTitle: string;
  graph: CityGraph | null;
  loading: boolean;
  error: string | null;
  start: number | null;
  goal: number | null;
  steps: ReturnType<typeof generateDijkstraSteps>;
  code: string;
  onPick: (n: number) => void;
  onRetry: () => void;
}) {
  if (tab === "explicacion") return <Explicacion />;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-zinc-400">Descargando el mapa de {cityTitle}…</p>
      </div>
    );
  }
  if (error || !graph) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="max-w-sm text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No se pudo cargar el mapa ({error ?? "sin datos"}). Puede ser un
            límite temporal de OpenStreetMap.
          </p>
          <button onClick={onRetry} className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900">
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (start === null || goal === null) {
    return (
      <div className="flex h-full flex-col">
        <div className="shrink-0 border-b border-zinc-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-800 dark:border-zinc-800 dark:bg-amber-950/30 dark:text-amber-200">
          Hacé clic en el mapa para elegir el <strong>inicio</strong>
          {start !== null ? " y la " : " y luego la "}
          <strong>meta</strong>.
        </div>
        <div className="flex min-h-0 flex-1 p-4">
          <CityMap graph={graph} start={start} goal={goal} onPick={onPick} />
        </div>
      </div>
    );
  }

  return (
    <AlgorithmPlayer
      key={`${tab}-${start}-${goal}`}
      code={code}
      steps={steps}
      title="Recorriendo las calles"
      layout="stacked"
      renderVisualization={(step) => (
        <CityMap graph={graph} state={step.state} start={start} goal={goal} onPick={onPick} />
      )}
    />
  );
}

function Explicacion() {
  return (
    <ReadingPane>
      <p>
        Acá los algoritmos de búsqueda no corren sobre una grilla, sino sobre las{" "}
        <strong>calles reales</strong> de la ciudad. Bajamos la red vial de{" "}
        <strong>OpenStreetMap</strong> y la convertimos en un <em>grafo</em>: cada
        intersección es un nodo y cada cuadra una arista con su{" "}
        <strong>distancia real</strong> (en metros).
      </p>
      <h2>Cómo usarlo</h2>
      <p>
        Entrá a una pestaña de algoritmo, hacé clic en el mapa para elegir el{" "}
        <strong>inicio</strong> (verde) y la <strong>meta</strong> (roja), y dale
        play. Vas a ver qué nodos va explorando y la ruta más corta que encuentra.
      </p>
      <h2>Los tres algoritmos</h2>
      <p>
        <strong>Dijkstra</strong> explora en todas las direcciones por igual,
        siempre expandiendo el nodo más cercano al inicio. Garantiza la ruta más
        corta, pero explora mucho.
      </p>
      <p>
        <strong>A*</strong> es Dijkstra + una <em>pista</em>: la distancia en línea
        recta hacia la meta (heurística). Eso lo &quot;empuja&quot; hacia el
        destino, así explora bastante menos manteniendo la ruta óptima.
      </p>
      <p>
        <strong>Bidireccional</strong> lanza dos búsquedas a la vez —una desde el
        inicio y otra desde la meta— hasta que se encuentran en el medio. Suele
        explorar menos que una búsqueda sola.
      </p>
      <p>
        Probá los tres con los <em>mismos</em> dos puntos y compará el contador de{" "}
        <strong>nodos explorados</strong>.
      </p>
    </ReadingPane>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
      ].join(" ")}
    >
      {icon}
      {children}
    </button>
  );
}
