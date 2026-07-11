"use client";

import { useMemo } from "react";
import { Castle, Waypoints, TowerControl } from "lucide-react";
import { AlgorithmPlayer } from "@/components/AlgorithmPlayer";
import { PythonLesson } from "@/components/python/PythonLesson";
import { BfsGrid } from "@/components/towerdefense/BfsGrid";
import { TowerDefense } from "@/components/towerdefense/TowerDefense";
import { BFS_CODE, generateBfsSteps, type Cell, type Grid } from "@/lib/towerdefense/towerdefense";

// Escenario chico para la animación de BFS.
const DEMO_ROWS = 7;
const DEMO_COLS = 11;
function demoGrid(): Grid {
  const g: Grid = Array.from({ length: DEMO_ROWS }, () => Array(DEMO_COLS).fill(0));
  for (let r = 1; r <= 4; r++) g[r][4] = 1; // muro parcial
  for (let r = 2; r <= 5; r++) g[r][7] = 1;
  return g;
}
const DEMO_GOAL: Cell = { r: 3, c: DEMO_COLS - 1 };

export default function TowerDefensePage() {
  return (
    <PythonLesson
      kicker="Pathfinding · Tower Defense"
      teoriaLabel="Teoría"
      icon={<Castle className="h-5 w-5" />}
      title="Tower Defense"
      subtitle={
        <>
          Muchos enemigos yendo a una misma <strong>meta</strong>, con torres que
          cambian el mapa. En vez de calcular el camino de cada uno, calculamos{" "}
          <strong>uno solo</strong> desde la meta: el <strong>campo de flujo</strong>.
        </>
      }
      teoria={{
        resumen: (
          <>
            Adaptación libre en español del{" "}
            <a
              href="https://www.redblobgames.com/pathfinding/tower-defense/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sky-600 underline-offset-2 hover:underline dark:text-sky-400"
            >
              artículo de pathfinding para tower defense de Red Blob Games (Amit Patel)
            </a>
            . La explicación y los componentes interactivos son propios; la idea y el
            recorrido son de Amit.
          </>
        ),
        lectura: [
          {
            titulo: "El problema",
            contenido: (
              <>
                <p>
                  En un <strong>tower defense</strong> hay <strong>muchos enemigos</strong>{" "}
                  caminando hacia <strong>una sola meta</strong>, y el jugador va poniendo{" "}
                  <strong>torres</strong> que bloquean el paso y cambian el mapa todo el
                  tiempo.
                </p>
                <p>
                  Correr <code>A*</code> (un camino) para <em>cada</em> enemigo, cada vez que
                  se mueve una torre, es carísimo. La clave: como todos van al{" "}
                  <em>mismo</em> lugar, conviene calcular <strong>una sola vez</strong> el
                  camino desde <strong>todas las celdas hacia la meta</strong>.
                </p>
              </>
            ),
          },
          {
            titulo: "Buscar al revés: desde la meta",
            contenido: (
              <>
                <p>
                  El truco es hacer la búsqueda <strong>al revés</strong>: en vez de salir
                  de cada enemigo hacia la meta, salimos de <strong>la meta</strong> y nos
                  expandimos hacia afuera hasta cubrir todo el mapa. Una sola búsqueda nos
                  da información para <strong>todos</strong> los enemigos a la vez.
                </p>
                <p>
                  Es un problema de tipo <em>muchos-a-uno</em> (todas las celdas → una
                  meta), y para eso el algoritmo ideal es la{" "}
                  <strong>búsqueda en anchura (BFS)</strong>.
                </p>
              </>
            ),
          },
          {
            titulo: "Búsqueda en anchura (BFS)",
            contenido: (
              <>
                <p>
                  BFS explora por <strong>capas</strong>: mantiene una{" "}
                  <strong>frontera</strong> (la cola de celdas por visitar) y, en cada paso,
                  saca la más vieja, mira sus vecinos y agrega los que todavía no visitó.
                  Como avanza parejo en todas las direcciones, la primera vez que llega a
                  una celda es por el camino <strong>más corto</strong>.
                </p>
                <p className="rounded-md bg-zinc-100 p-3 font-mono text-[11px] leading-relaxed dark:bg-zinc-800/60">
                  frontera = cola([meta]); distancia[meta] = 0
                  <br />
                  mientras frontera no esté vacía:
                  <br />
                  &nbsp;&nbsp;actual = frontera.sacar()
                  <br />
                  &nbsp;&nbsp;para cada vecino de actual:
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;si vecino no visitado:
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;distancia[vecino] = distancia[actual] + 1
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;frontera.agregar(vecino)
                </p>
                <p>
                  Mirá la animación en la pestaña <strong>Búsqueda en anchura</strong>: la
                  frontera avanza desde la meta y va llenando cada celda con su{" "}
                  <strong>distancia</strong>.
                </p>
              </>
            ),
          },
          {
            titulo: "El campo de distancias",
            contenido: (
              <>
                <p>
                  Si en cada celda guardamos <strong>a qué distancia está de la meta</strong>,
                  obtenemos el <strong>campo de distancias</strong> (un número por celda).
                  Sirve, por ejemplo, para saber &ldquo;qué celdas están a menos de 5 pasos
                  de la meta&rdquo;.
                </p>
              </>
            ),
          },
          {
            titulo: "El campo de flujo (las flechas)",
            contenido: (
              <>
                <p>
                  Del campo de distancias sale lo más útil: en cada celda ponemos una{" "}
                  <strong>flecha</strong> que apunta al vecino con <strong>menor
                  distancia</strong> (el que está más cerca de la meta). Ese conjunto de
                  flechas es el <strong>campo de flujo</strong>.
                </p>
                <p>
                  Ahora los enemigos <strong>no piensan</strong>: cada uno mira la flecha de
                  su celda y se mueve en esa dirección. <strong>Un solo cálculo</strong>{" "}
                  (BFS desde la meta) sirve para miles de enemigos.
                </p>
              </>
            ),
          },
          {
            titulo: "Recalcular al poner torres",
            contenido: (
              <>
                <p>
                  Cuando el jugador pone o saca una torre, el mapa cambia: volvemos a correr
                  el BFS desde la meta y <strong>todas las flechas se actualizan</strong>{" "}
                  solas. Las celdas que quedaron <strong>sin salida</strong> (rodeadas de
                  torres) no tienen flecha, y los enemigos ahí se frenan.
                </p>
                <p>
                  Probalo en la pestaña <strong>Tower Defense</strong>: poné torres y mirá
                  cómo el campo de flujo se rearma y los enemigos buscan otro camino.
                </p>
              </>
            ),
          },
          {
            titulo: "Un poco más",
            contenido: (
              <>
                <ul className="ml-5 list-disc space-y-1">
                  <li>Si el mapa tiene <strong>terrenos con costo</strong> (barro, agua), BFS se convierte en <strong>Dijkstra</strong>.</li>
                  <li>Con varias metas, se conectan todas a un <em>nodo virtual</em> y se hace un solo BFS.</li>
                  <li>Para mover a los enemigos suave entre celdas, se <em>interpolan</em> las flechas.</li>
                </ul>
              </>
            ),
          },
        ],
        callouts: [
          {
            tipo: "tip",
            texto: (
              <>
                La gran idea: en vez de <em>un camino por enemigo</em>, calculás{" "}
                <strong>un campo para todos</strong>, una sola vez, desde la meta.
              </>
            ),
          },
        ],
        preguntas: [
          "¿Por qué correr A* por cada enemigo es un problema en un tower defense?",
          "¿Por qué conviene hacer la búsqueda desde la meta y no desde cada enemigo?",
          "¿Qué es la frontera en BFS y cómo se expande?",
          "¿Qué es el campo de distancias?",
          "¿Cómo se obtiene el campo de flujo (las flechas) a partir de las distancias?",
          "¿Qué pasa con las flechas cuando el jugador pone una torre nueva?",
        ],
      }}
      demos={[
        {
          id: "bfs",
          label: "Búsqueda en anchura",
          icon: <Waypoints className="h-3.5 w-3.5" />,
          render: () => <BfsDemo />,
        },
        {
          id: "sandbox",
          label: "Tower Defense",
          icon: <TowerControl className="h-3.5 w-3.5" />,
          render: () => (
            <div className="flex h-full w-full items-start justify-center overflow-auto p-4">
              <TowerDefense />
            </div>
          ),
        },
      ]}
    />
  );
}

function BfsDemo() {
  const steps = useMemo(() => generateBfsSteps(demoGrid(), DEMO_GOAL), []);
  return (
    <AlgorithmPlayer
      code={BFS_CODE}
      steps={steps}
      layout="stacked"
      title="BFS desde la meta: la frontera avanza y llena el campo de distancias"
      renderVisualization={(step) => <BfsGrid state={step.state} />}
    />
  );
}
