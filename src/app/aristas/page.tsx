"use client";

import { Fence, Grid3x3 } from "lucide-react";
import Link from "next/link";
import { PythonLesson } from "@/components/python/PythonLesson";
import { MazeEditor } from "@/components/mazeedit/MazeEditor";
import {
  FigAnd,
  FigCornerBitmask,
  FigCoords,
  FigOr,
  FigPixelLookup,
  FigThickVsThin,
  FigXor,
} from "@/components/mazeedit/EdgeFigures";

export default function AristasPage() {
  return (
    <PythonLesson
      kicker="Grillas · Aristas y muros"
      teoriaLabel="Teoría"
      icon={<Fence className="h-5 w-5" />}
      title="Aristas y muros"
      subtitle={
        <>
          Una grilla no es solo un montón de celdas: también tiene{" "}
          <strong>aristas</strong> y <strong>esquinas</strong>. Muchas cosas —
          paredes, puertas, caños— viven en las aristas, y modelarlas ahí simplifica
          el código.
        </>
      }
      teoria={{
        resumen: (
          <>
            Adaptación libre en español de{" "}
            <a
              href="https://www.redblobgames.com/grids/edges/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sky-600 underline-offset-2 hover:underline dark:text-sky-400"
            >
              &ldquo;Grid parts: Edges&rdquo; de Red Blob Games (Amit Patel)
            </a>
            . La explicación y los diagramas interactivos son propios; el crédito de
            la idea y del recorrido es de Amit. Nuestro{" "}
            <Link href="/recorrido" className="font-medium text-sky-600 underline-offset-2 hover:underline dark:text-sky-400">
              laberinto
            </Link>{" "}
            ya usa este modelo por dentro.
          </>
        ),
        lectura: [
          {
            titulo: "Una grilla tiene celdas, aristas y esquinas",
            contenido: (
              <>
                <p>
                  Cuando pensamos en una grilla, casi siempre pensamos en{" "}
                  <strong>celdas</strong> (los cuadraditos). Pero también están las{" "}
                  <strong>aristas</strong> (los segmentos que separan dos celdas
                  vecinas) y las <strong>esquinas</strong> (los puntos donde se cruzan
                  las líneas).
                </p>
                <p>
                  En muchos juegos de construcción, lo interesante pasa en las
                  aristas: <em>bloquean</em> (paredes, precipicios) o{" "}
                  <em>conectan</em> (puertas, caños, cables) dos celdas. Una{" "}
                  <strong>pared</strong> no es una celda: es una arista cerrada entre
                  dos celdas.
                </p>
              </>
            ),
          },
          {
            titulo: "Pared gruesa vs pared fina",
            contenido: (
              <>
                <p>
                  Hay dos formas de representar una pared. La <strong>gruesa</strong>{" "}
                  ocupa una celda entera (esa celda es "muro"). La <strong>fina</strong>{" "}
                  vive en la arista entre dos celdas, así que las dos siguen siendo
                  transitables pero no se puede cruzar de una a la otra.
                </p>
                <FigThickVsThin />
                <p>
                  La pared fina es más flexible: no gastás una celda por cada muro y
                  podés tener, por ejemplo, una puerta en esa misma arista.
                </p>
              </>
            ),
          },
          {
            titulo: "Primario y secundario",
            contenido: (
              <>
                <p>
                  Una idea clave: en vez de guardar celdas <em>y</em> aristas por
                  separado (y arriesgarte a que queden inconsistentes), conviene
                  elegir uno como <strong>dato primario</strong> y{" "}
                  <strong>calcular el otro</strong> con una función. Veamos tres casos
                  según la operación lógica.
                </p>
                <p>
                  <strong>OR — iluminación.</strong> Las celdas son el dato primario.
                  Una arista se ilumina si <em>cualquiera</em> de sus dos celdas está
                  encendida.
                </p>
                <FigOr />
                <p>
                  <strong>AND — tuberías.</strong> Hay caño entre dos celdas solo si{" "}
                  <em>ambas</em> están marcadas como tanque.
                </p>
                <FigAnd />
                <p>
                  <strong>XOR — contorno.</strong> Aparece una pared fina donde{" "}
                  <em>exactamente una</em> de las dos celdas vecinas es sólida. El
                  resultado es el borde de la región.
                </p>
                <FigXor />
                <p>
                  En los tres casos guardamos solo las celdas y{" "}
                  <strong>derivamos</strong> las aristas con una operación simple. Es
                  más difícil equivocarse que manteniendo dos listas en sincronía.
                </p>
              </>
            ),
          },
          {
            titulo: "Cómo se nombra una arista",
            contenido: (
              <>
                <p>
                  Para trabajar con aristas necesitamos poder nombrarlas. Podríamos
                  darle a cada celda cuatro aristas (Norte, Sur, Este, Oeste), pero
                  entonces la arista de abajo de <code>(q, r)</code> y la de arriba de{" "}
                  <code>(q, r+1)</code> serían <em>la misma</em>, nombrada dos veces.
                </p>
                <p>
                  El truco: quedarse solo con la arista <strong>Norte</strong> y la{" "}
                  <strong>Oeste</strong> de cada celda. Así cada arista tiene un único
                  nombre: <code>q,r,N</code> o <code>q,r,O</code>. Una celda{" "}
                  <code>(q, r)</code> toca cuatro aristas: <code>q,r,N</code>,{" "}
                  <code>q,r,O</code>, <code>q,r+1,N</code> y <code>q+1,r,O</code>.
                </p>
                <FigCoords />
                <p>
                  Y al revés: la arista <code>q,r,N</code> separa las celdas{" "}
                  <code>(q, r−1)</code> y <code>(q, r)</code>; la <code>q,r,O</code>{" "}
                  separa <code>(q−1, r)</code> y <code>(q, r)</code>. (En nuestro código
                  usamos la variante equivalente Este/Sur, con una clave ordenada por
                  el par de celdas.)
                </p>
              </>
            ),
          },
          {
            titulo: "¿Tocaste una celda o una arista?",
            contenido: (
              <>
                <p>
                  Para poder <strong>hacer clic en una pared</strong> hace falta
                  saber, dado el mouse, si estás apuntando al centro de una celda o a
                  una de sus aristas. Detectar la celda es trivial (cae en su
                  cuadrado); detectar la arista es más fino.
                </p>
                <p>
                  Una solución práctica: calcular la celda más cercana{" "}
                  <em>y</em> la arista más cercana, y quedarse con la que esté a menor
                  distancia del puntero. Moviendo el control de abajo cambiás cuánto
                  se favorece a una o a otra.
                </p>
                <FigPixelLookup />
                <p>
                  Esto es exactamente lo que usa el editor de la otra pestaña para
                  poner y sacar paredes con el mouse.
                </p>
              </>
            ),
          },
          {
            titulo: "Guardar todo en un solo arreglo (bitmask)",
            contenido: (
              <>
                <p>
                  Una idea prolija para almacenar celdas, aristas <em>y</em> esquinas
                  juntas: duplicar los índices y usar el <strong>bit bajo</strong> de{" "}
                  <code>x</code> e <code>y</code> como código de tipo. Con dos bits
                  distinguís los cuatro elementos:
                </p>
                <p className="font-mono text-xs">
                  00 = esquina · 01 = arista Oeste · 10 = arista Norte · 11 = celda
                </p>
                <FigCornerBitmask />
                <p>
                  Así una esquina <code>q,r</code> va a <code>arr[2q][2r]</code>, la
                  arista Norte a <code>arr[2q+1][2r]</code>, la Oeste a{" "}
                  <code>arr[2q][2r+1]</code> y la celda a <code>arr[2q+1][2r+1]</code>.
                  Todo en una sola matriz.
                </p>
              </>
            ),
          },
          {
            titulo: "Cómo lo usa la búsqueda de caminos",
            contenido: (
              <>
                <p>
                  Con las paredes en las aristas, el pathfinding es directo: podés
                  moverte de una celda <code>a</code> a su vecina <code>b</code> solo
                  si la arista <code>a–b</code> está <strong>abierta</strong>. En la
                  pestaña <strong>Editor de laberinto</strong> dibujás paredes y
                  comparás cómo exploran <strong>BFS</strong> y <strong>A*</strong>.
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
                Casi todos los diagramas de arriba son interactivos: hacé clic,
                arrastrá o pasá el mouse. Después probá el editor de la otra pestaña.
              </>
            ),
          },
        ],
        preguntas: [
          "¿Qué diferencia hay entre una pared gruesa (celda-muro) y una fina (arista-muro)?",
          "¿Por qué conviene elegir un dato primario y derivar el otro, en vez de guardar los dos?",
          "En iluminación (OR), tuberías (AND) y contorno (XOR): ¿cómo se calcula cada arista a partir de sus celdas?",
          "¿Por qué guardamos solo la arista Norte y Oeste de cada celda?",
          "¿Cómo decide el programa si hiciste clic en una celda o en una arista?",
          "¿Cuándo se puede pasar de una celda a su vecina en el laberinto?",
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
