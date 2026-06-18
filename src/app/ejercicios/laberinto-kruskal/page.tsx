"use client";

import { useMemo, useState } from "react";
import { Grid3x3, Play, RefreshCw } from "lucide-react";
import { AlgorithmPlayer } from "@/components/AlgorithmPlayer";
import { PythonLesson } from "@/components/python/PythonLesson";
import { MazeBoard } from "@/components/ejercicios/MazeBoard";
import { MAZE_CODE, generateMazeSteps } from "@/lib/ejercicios/mazeKruskal";

export default function LaberintoKruskalPage() {
  return (
    <PythonLesson
      kicker="Ejercicios · Demostración"
      teoriaLabel="Explicación"
      icon={<Grid3x3 className="h-5 w-5" />}
      title="Laberinto (Kruskal)"
      subtitle={
        <>
          Una demostración: generamos un <strong>laberinto perfecto</strong> con
          el algoritmo de <strong>Kruskal</strong> y <strong>Union-Find</strong>.
          Más adelante lo vamos a recorrer con Dijkstra y A*.
        </>
      }
      teoria={{
        resumen: (
          <>
            Partimos de una grilla con <strong>todos los muros puestos</strong> y
            los vamos tirando con cuidado: solo si conectan dos zonas que todavía
            estaban separadas. El resultado es un laberinto donde entre dos celdas
            cualesquiera hay <strong>exactamente un camino</strong> (sin ciclos):
            un <em>laberinto perfecto</em>.
          </>
        ),
        lectura: [
          {
            titulo: "La idea: un bosque que se va uniendo",
            contenido: (
              <>
                <p>
                  Pensá cada celda como un nodo y cada muro como una posible{" "}
                  <em>arista</em> entre dos celdas vecinas. Queremos conectar todas
                  las celdas sin formar ciclos: eso es exactamente un{" "}
                  <strong>árbol de expansión</strong> del grafo de la grilla, y
                  Kruskal es el algoritmo clásico para construirlo.
                </p>
                <p>
                  Recorremos los muros en <strong>orden aleatorio</strong>. Para
                  cada muro entre las celdas <code>a</code> y <code>b</code>: si{" "}
                  <code>a</code> y <code>b</code> ya están conectadas, dejamos el
                  muro (tirarlo crearía un ciclo). Si están separadas, las unimos y
                  abrimos el paso. Como el orden es aleatorio, cada vez sale un
                  laberinto distinto.
                </p>
              </>
            ),
          },
          {
            titulo: "Union-Find: saber quién está conectado con quién",
            contenido: (
              <>
                <p>
                  La pregunta clave —<em>¿a y b ya están conectadas?</em>— se
                  responde rapidísimo con la estructura <strong>Union-Find</strong>{" "}
                  (también llamada DSU, <em>disjoint-set union</em>). Cada celda
                  guarda un &quot;representante&quot; de su grupo:
                </p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>
                    <code>find(x)</code>: devuelve el representante del grupo de{" "}
                    <code>x</code>. Si dos celdas tienen el mismo representante,
                    están conectadas.
                  </li>
                  <li>
                    <code>union(a, b)</code>: fusiona los dos grupos en uno.
                  </li>
                </ul>
                <p>
                  En la animación, las celdas del mismo grupo comparten color: vas
                  a ver cómo los colores se van fusionando hasta quedar todo en un
                  solo grupo.
                </p>
              </>
            ),
          },
          {
            titulo: "El código",
            contenido: (
              <>
                <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 font-mono text-[12px] leading-relaxed text-zinc-100">
                  <code>{MAZE_CODE}</code>
                </pre>
              </>
            ),
          },
          {
            titulo: "¿Y después?",
            contenido: (
              <>
                <p>
                  Este laberinto es la base para lo que viene: vamos a buscar el
                  camino entre dos celdas con <strong>Dijkstra</strong> (y su
                  versión <em>bidireccional</em>, que avanza desde los dos extremos
                  a la vez) y con <strong>A*</strong>. Y más adelante lo
                  reutilizaremos para un juego de calabozos.
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
                En la pestaña <strong>Animación</strong>, mirá el contador de{" "}
                <em>grupos</em>: empieza en 25 (una grilla 5×5) y termina en 1
                cuando todo quedó conectado.
              </>
            ),
          },
        ],
        preguntas: [
          "¿Por qué dejamos el muro cuando las dos celdas ya están conectadas?",
          "¿Qué significa que un laberinto sea 'perfecto'?",
          "¿Qué hacen las operaciones find y union?",
          "¿Por qué el laberinto cambia cada vez que se genera?",
          "¿Qué relación hay entre este laberinto y un árbol de expansión?",
        ],
      }}
      demos={[
        {
          id: "maze",
          label: "Animación",
          icon: <Play className="h-3.5 w-3.5" />,
          render: () => <MazeDemo />,
        },
      ]}
    />
  );
}

function MazeDemo() {
  const [seed, setSeed] = useState(0);
  // Cada cambio de `seed` regenera el laberinto (orden de muros al azar).
  const steps = useMemo(() => generateMazeSteps(5, 5), [seed]);
  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
        <span className="text-xs text-zinc-500">
          Cada laberinto se genera al azar.
        </span>
        <button
          onClick={() => setSeed((s) => s + 1)}
          className="flex items-center gap-1.5 rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Generar otro
        </button>
      </div>
      <div className="min-h-0 flex-1">
        <AlgorithmPlayer
          key={seed}
          code={MAZE_CODE}
          steps={steps}
          title="Kruskal + Union-Find tirando muros"
          renderVisualization={(step) => <MazeBoard state={step.state} />}
        />
      </div>
    </div>
  );
}
