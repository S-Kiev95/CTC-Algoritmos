"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Play, RefreshCw, Sprout } from "lucide-react";
import { AlgorithmPlayer } from "@/components/AlgorithmPlayer";
import { PythonLesson } from "@/components/python/PythonLesson";
import { PrimMazeBoard } from "@/components/ejercicios/PrimMazeBoard";
import { PRIM_CODE, generatePrimSteps } from "@/lib/ejercicios/mazePrim";

export default function LaberintoPrimPage() {
  return (
    <PythonLesson
      kicker="Ejercicios · Demostración"
      teoriaLabel="Explicación"
      icon={<Sprout className="h-5 w-5" />}
      title="Laberinto (Prim)"
      subtitle={
        <>
          Otra forma de generar un <strong>laberinto perfecto</strong>: con el
          algoritmo de <strong>Prim</strong>, que hace crecer el laberinto desde
          una sola celda, como una mancha que se expande.
        </>
      }
      teoria={{
        resumen: (
          <>
            Igual que con{" "}
            <Link
              href="/ejercicios/laberinto-kruskal"
              className="font-medium text-sky-600 underline-offset-2 hover:underline dark:text-sky-400"
            >
              Kruskal
            </Link>
            , partimos de una grilla con <strong>todos los muros puestos</strong> y
            terminamos con un laberinto donde entre dos celdas hay{" "}
            <strong>exactamente un camino</strong>. Lo que cambia es{" "}
            <em>el orden</em> en que se tiran los muros: Prim arranca en una celda y
            va sumando celdas vecinas de a una.
          </>
        ),
        lectura: [
          {
            titulo: "La idea: una mancha que crece",
            contenido: (
              <>
                <p>
                  Elegimos una celda de inicio: ese es nuestro laberinto, por ahora de
                  una sola celda. Los muros que la separan de sus vecinas forman la{" "}
                  <strong>frontera</strong>: son los lugares por donde el laberinto
                  puede crecer.
                </p>
                <p>En cada paso:</p>
                <ol className="ml-5 list-decimal space-y-1">
                  <li>Tomamos <strong>un muro de la frontera al azar</strong>.</li>
                  <li>
                    Si la celda del otro lado <strong>todavía está afuera</strong>,
                    tiramos el muro: la celda entra al laberinto y sus propios muros
                    se suman a la frontera.
                  </li>
                  <li>
                    Si la celda del otro lado <strong>ya estaba adentro</strong>,
                    dejamos el muro: tirarlo crearía un ciclo.
                  </li>
                </ol>
                <p>Cuando la frontera se vacía, todas las celdas están conectadas.</p>
              </>
            ),
          },
          {
            titulo: "¿Por qué no hace falta Union-Find?",
            contenido: (
              <>
                <p>
                  Kruskal maneja <strong>muchos grupos</strong> a la vez, así que
                  necesita Union-Find para saber si dos celdas ya están conectadas.
                  Prim tiene <strong>un solo grupo</strong>: el laberinto que viene
                  creciendo. La pregunta se reduce a{" "}
                  <em>¿esta celda ya está adentro?</em>, y eso se responde con un
                  simple conjunto (<code>en_laberinto</code>).
                </p>
              </>
            ),
          },
          {
            titulo: "Prim vs. Kruskal",
            contenido: (
              <>
                <ul className="ml-5 list-disc space-y-1">
                  <li>
                    <strong>Kruskal</strong> recorre <em>todos</em> los muros en orden
                    aleatorio y va <strong>uniendo islas</strong> sueltas por toda la
                    grilla, hasta que queda una sola.
                  </li>
                  <li>
                    <strong>Prim</strong> hace crecer <strong>un único árbol</strong>{" "}
                    desde el inicio; solo mira los muros del borde de lo que ya
                    construyó.
                  </li>
                </ul>
                <p>
                  Los dos construyen un <strong>árbol de expansión</strong> de la
                  grilla, y son los mismos algoritmos que se usan en grafos con pesos
                  para encontrar el árbol de expansión mínimo. Acá, como los muros se
                  eligen al azar, el resultado es un laberinto distinto cada vez.
                </p>
                <p>
                  A la vista también se nota la diferencia: los laberintos de Prim
                  suelen tener <strong>muchos callejones cortos</strong> que salen del
                  inicio hacia afuera.
                </p>
              </>
            ),
          },
          {
            titulo: "El código",
            contenido: (
              <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 font-mono text-[12px] leading-relaxed text-zinc-100">
                <code>{PRIM_CODE}</code>
              </pre>
            ),
          },
        ],
        callouts: [
          {
            tipo: "tip",
            texto: (
              <>
                En la pestaña <strong>Animación</strong>, mirá los colores: verde es
                lo que ya está adentro, ámbar la frontera. Vas a ver la mancha verde
                crecer desde la celda de inicio.
              </>
            ),
          },
        ],
        preguntas: [
          "¿Qué es la frontera y cómo cambia en cada paso?",
          "¿Por qué dejamos el muro cuando la celda del otro lado ya está adentro?",
          "¿Por qué Prim no necesita Union-Find y Kruskal sí?",
          "¿Cuándo termina el algoritmo?",
          "¿En qué se parecen y en qué se diferencian Prim y Kruskal?",
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
  // Cada cambio de `seed` regenera el laberinto (inicio y muros al azar).
  const steps = useMemo(() => generatePrimSteps(5, 5), [seed]);
  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
        <span className="text-xs text-zinc-500">Cada laberinto se genera al azar.</span>
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
          code={PRIM_CODE}
          steps={steps}
          title="Prim: el laberinto crece desde una celda"
          renderVisualization={(step) => <PrimMazeBoard state={step.state} />}
        />
      </div>
    </div>
  );
}
