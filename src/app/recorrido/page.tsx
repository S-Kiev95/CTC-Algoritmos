"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Route,
  Waypoints,
  ArrowLeftRight,
  Star,
  RefreshCw,
} from "lucide-react";
import { AlgorithmPlayer } from "@/components/AlgorithmPlayer";
import { PythonLesson } from "@/components/python/PythonLesson";
import { PathBoard } from "@/components/pathfinding/PathBoard";
import { generateMaze } from "@/lib/ejercicios/mazeKruskal";
import { DIJKSTRA_CODE, generateDijkstraSteps } from "@/lib/pathfinding/dijkstra";
import {
  BIDIRECTIONAL_CODE,
  generateBidirectionalSteps,
} from "@/lib/pathfinding/bidirectional";
import { ASTAR_CODE, generateAstarSteps } from "@/lib/pathfinding/astar";

export default function RecorridoPage() {
  const [seed, setSeed] = useState(0);
  // Un único laberinto compartido por las tres pestañas. "Generar otro" lo cambia.
  const maze = useMemo(() => generateMaze(8, 8), [seed]);
  const dijkstra = useMemo(() => generateDijkstraSteps(maze), [maze]);
  const bidir = useMemo(() => generateBidirectionalSteps(maze), [maze]);
  const astar = useMemo(() => generateAstarSteps(maze), [maze]);

  const renderAlgo = (
    code: string,
    steps: typeof dijkstra,
    title: string,
  ): ReactNode => (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
        <span className="text-xs text-zinc-500">
          Inicio arriba-izquierda → meta abajo-derecha. El mismo laberinto en las
          3 pestañas.
        </span>
        <button
          onClick={() => setSeed((s) => s + 1)}
          className="flex shrink-0 items-center gap-1.5 rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Generar otro
        </button>
      </div>
      <div className="min-h-0 flex-1">
        <AlgorithmPlayer
          key={seed}
          code={code}
          steps={steps}
          title={title}
          renderVisualization={(step) => <PathBoard state={step.state} />}
        />
      </div>
    </div>
  );

  return (
    <PythonLesson
      kicker="Recorrido · Laberinto"
      teoriaLabel="Explicación"
      icon={<Route className="h-5 w-5" />}
      title="Recorrer el laberinto"
      subtitle={
        <>
          Tres formas de encontrar el camino entre dos celdas:{" "}
          <strong>Dijkstra</strong>, <strong>Dijkstra bidireccional</strong> y{" "}
          <strong>A*</strong> — todas sobre el mismo laberinto, para comparar.
        </>
      }
      teoria={{
        resumen: (
          <>
            Sobre el laberinto generado con Kruskal buscamos el camino de la
            esquina superior izquierda a la inferior derecha. Como hay un único
            camino entre dos celdas, todos encuentran el mismo; lo interesante es{" "}
            <strong>cuántas celdas explora cada uno</strong>.
          </>
        ),
        lectura: [
          {
            titulo: "Dijkstra",
            contenido: (
              <>
                <p>
                  Expande siempre la celda <em>más cercana al inicio</em> que tenga
                  pendiente, usando una cola de prioridad. Garantiza el camino más
                  corto, pero explora &quot;en círculos&quot; alrededor del inicio,
                  sin saber dónde está la meta.
                </p>
              </>
            ),
          },
          {
            titulo: "Dijkstra bidireccional",
            contenido: (
              <>
                <p>
                  Lanza <strong>dos búsquedas a la vez</strong>: una desde el
                  inicio y otra desde la meta. Cuando los dos frentes se{" "}
                  <em>tocan</em>, se une el camino. Al cubrir media distancia cada
                  uno, suele explorar bastantes menos celdas que el Dijkstra común.
                </p>
              </>
            ),
          },
          {
            titulo: "A*",
            contenido: (
              <>
                <p>
                  Es Dijkstra + una <strong>heurística</strong> que estima cuánto
                  falta hasta la meta (distancia Manhattan). Prioriza{" "}
                  <code>f = g + h</code> (lo recorrido más lo estimado), así avanza
                  derecho hacia la meta y evita ramas que se alejan. Mirá el
                  contador de <em>celdas exploradas</em>: suele ser el más bajo.
                </p>
              </>
            ),
          },
          {
            titulo: "¿Para qué?",
            contenido: (
              <>
                <p>
                  Estos son los algoritmos que mueven enemigos y NPCs hacia un
                  objetivo en los videojuegos. Más adelante los usamos para un{" "}
                  <strong>juego de calabozos</strong> sobre estos mismos
                  laberintos.
                </p>
              </>
            ),
          },
        ],
        callouts: [
          {
            tipo: "tip",
            texto: (
              <>
                Generá un laberinto y corré las tres pestañas: el camino final es
                el mismo, pero compará el contador de <strong>celdas
                exploradas</strong> de Dijkstra vs A*.
              </>
            ),
          },
        ],
        preguntas: [
          "¿Por qué Dijkstra explora 'en círculos' alrededor del inicio?",
          "¿Qué ventaja da buscar desde los dos extremos a la vez?",
          "¿Qué es la heurística en A* y qué estima?",
          "¿Por qué A* suele explorar menos celdas que Dijkstra?",
          "En este laberinto, ¿por qué los tres encuentran el mismo camino?",
        ],
      }}
      demos={[
        {
          id: "dijkstra",
          label: "Dijkstra",
          icon: <Waypoints className="h-3.5 w-3.5" />,
          render: () => renderAlgo(DIJKSTRA_CODE, dijkstra, "Dijkstra"),
        },
        {
          id: "bidir",
          label: "Bidireccional",
          icon: <ArrowLeftRight className="h-3.5 w-3.5" />,
          render: () =>
            renderAlgo(BIDIRECTIONAL_CODE, bidir, "Dijkstra bidireccional"),
        },
        {
          id: "astar",
          label: "A*",
          icon: <Star className="h-3.5 w-3.5" />,
          render: () => renderAlgo(ASTAR_CODE, astar, "A* (Dijkstra + heurística)"),
        },
      ]}
    />
  );
}
