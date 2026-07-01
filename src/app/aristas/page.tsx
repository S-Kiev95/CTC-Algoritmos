"use client";

import { Fence, Grid3x3 } from "lucide-react";
import Link from "next/link";
import { PythonLesson } from "@/components/python/PythonLesson";
import { MazeEditor } from "@/components/mazeedit/MazeEditor";

export default function AristasPage() {
  return (
    <PythonLesson
      kicker="Grillas · Aristas y muros"
      teoriaLabel="Teoría"
      icon={<Fence className="h-5 w-5" />}
      title="Aristas y muros"
      subtitle={
        <>
          Una pared no tiene por qué ocupar una celda: puede vivir en la{" "}
          <strong>arista</strong> entre dos celdas vecinas. Ese pequeño cambio de
          modelo hace más simples los laberintos y el <em>pathfinding</em>.
        </>
      }
      teoria={{
        resumen: (
          <>
            En una grilla solemos pensar en <strong>celdas</strong> (los cuadraditos),
            pero muchas cosas —paredes, puertas, cables, ríos— viven en realidad{" "}
            <strong>entre</strong> dos celdas: en sus <strong>aristas</strong>. Idea
            tomada de{" "}
            <a
              href="https://www.redblobgames.com/grids/edges/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sky-600 underline-offset-2 hover:underline dark:text-sky-400"
            >
              Red Blob Games
            </a>
            . Nuestro{" "}
            <Link href="/recorrido" className="font-medium text-sky-600 underline-offset-2 hover:underline dark:text-sky-400">
              laberinto
            </Link>{" "}
            ya usa este modelo por dentro; acá lo explicamos y lo hacemos editable.
          </>
        ),
        lectura: [
          {
            titulo: "Celdas y aristas",
            contenido: (
              <>
                <p>
                  Una grilla de <code>filas × columnas</code> tiene celdas, pero
                  también <strong>aristas</strong>: los segmentos que separan dos
                  celdas vecinas. Una <strong>pared</strong> es una arista{" "}
                  <em>cerrada</em>; un <strong>pasaje</strong> es una arista{" "}
                  <em>abierta</em>.
                </p>
                <p>
                  La clave del modelo: en vez de marcar celdas como "muro" (que
                  ocupan lugar), marcamos <strong>aristas</strong> como pared. Así
                  dos celdas transitables pueden estar separadas por una pared sin
                  perder ninguna celda.
                </p>
              </>
            ),
          },
          {
            titulo: "Cómo se nombra una arista",
            contenido: (
              <>
                <p>
                  Cada arista interna vive entre exactamente dos celdas vecinas, así
                  que la identificamos por <strong>ese par de celdas</strong>. Para
                  no guardar la misma arista dos veces, usamos una clave ordenada:{" "}
                  <code>min(a,b)-max(a,b)</code>.
                </p>
                <p>
                  Hay dos tipos: la arista <strong>vertical</strong> entre{" "}
                  <code>(f, c)</code> y <code>(f, c+1)</code>, y la{" "}
                  <strong>horizontal</strong> entre <code>(f, c)</code> y{" "}
                  <code>(f+1, c)</code>. Red Blob Games guarda por celda solo la
                  arista Norte y Oeste; es la misma idea (elegir un representante por
                  arista para no duplicar).
                </p>
              </>
            ),
          },
          {
            titulo: "Pixel lookup: ¿tocaste una celda o una arista?",
            contenido: (
              <>
                <p>
                  Para poder hacer <strong>clic en una pared</strong> necesitamos
                  saber, dado el mouse, si estás más cerca del <em>centro</em> de una
                  celda o de una de sus <em>aristas</em>. El truco es medir la
                  distancia a los cuatro lados de la celda:
                </p>
                <p className="font-mono text-xs">
                  izquierda = x%celda · derecha = celda − x%celda · arriba = y%celda ·
                  abajo = celda − y%celda
                </p>
                <p>
                  El lado con la <strong>menor distancia</strong> es la arista que
                  querés tocar. Eso es exactamente lo que usa el editor de abajo para
                  poner y sacar paredes.
                </p>
              </>
            ),
          },
          {
            titulo: "Cómo lo usa la búsqueda de caminos",
            contenido: (
              <>
                <p>
                  El pathfinding se vuelve directo: podés moverte de una celda{" "}
                  <code>a</code> a su vecina <code>b</code> solo si la arista{" "}
                  <code>a–b</code> está <strong>abierta</strong>. Con eso, BFS y A*
                  recorren la grilla respetando las paredes.
                </p>
                <p>
                  <strong>BFS</strong> se expande en abanico en todas las
                  direcciones; <strong>A*</strong> usa una <em>heurística</em> (la
                  distancia a la meta) para avanzar hacia el objetivo y explorar
                  muchas menos celdas. En la demo, generá un laberinto o dibujá
                  paredes y compará el contador de celdas exploradas.
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
                En el editor: <strong>arrastrá</strong> cerca de las líneas para
                dibujar paredes, mové <strong>Inicio</strong> y <strong>Meta</strong>,
                y probá <strong>BFS</strong> vs <strong>A*</strong>. En una grilla
                abierta, A* explora una fracción de lo que explora BFS.
              </>
            ),
          },
        ],
        preguntas: [
          "¿Qué diferencia hay entre modelar una pared como celda o como arista?",
          "¿Cómo se identifica de forma única una arista entre dos celdas?",
          "¿Por qué guardamos solo un representante por arista (clave ordenada)?",
          "¿Cómo decide el editor si hiciste clic en una celda o en una arista?",
          "¿Cuándo se puede pasar de una celda a su vecina?",
          "¿Por qué A* suele explorar muchas menos celdas que BFS?",
        ],
      }}
      demos={[
        {
          id: "editor",
          label: "Editor de laberinto",
          icon: <Grid3x3 className="h-3.5 w-3.5" />,
          render: () => (
            <div className="flex h-full w-full items-start justify-center overflow-auto p-4">
              <MazeEditor />
            </div>
          ),
        },
      ]}
    />
  );
}
