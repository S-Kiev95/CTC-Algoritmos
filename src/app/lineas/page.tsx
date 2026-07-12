"use client";

import { Crosshair, Spline } from "lucide-react";
import { PythonLesson } from "@/components/python/PythonLesson";
import { LineGrid } from "@/components/line/LineGrid";
import { RangedAttack } from "@/components/line/RangedAttack";

export default function LineasPage() {
  return (
    <PythonLesson
      kicker="Grillas · Trazar líneas"
      teoriaLabel="Teoría"
      icon={<Spline className="h-5 w-5" />}
      title="Trazar líneas"
      subtitle={
        <>
          ¿Qué celdas de una grilla toca una línea entre dos puntos? Es la base de
          los <strong>ataques a distancia</strong>, la <strong>línea de visión</strong>{" "}
          y las trayectorias de flechas y balas.
        </>
      }
      teoria={{
        resumen: (
          <>
            Adaptación libre en español del{" "}
            <a
              href="https://www.redblobgames.com/grids/line-drawing/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sky-600 underline-offset-2 hover:underline dark:text-sky-400"
            >
              artículo de trazado de líneas en grillas de Red Blob Games (Amit Patel)
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
                  Tenemos dos celdas en una grilla y queremos saber por{" "}
                  <strong>qué celdas pasa la línea recta</strong> que las une. Sirve
                  para mover una ficha en línea, para trazar la trayectoria de una
                  flecha o una bala, y para decidir si un personaje <strong>ve</strong>{" "}
                  a otro (línea de visión).
                </p>
                <p>
                  Se puede hacer con el clásico algoritmo de <strong>Bresenham</strong>,
                  pero hay una forma más simple y hoy igual de rápida:{" "}
                  <strong>interpolación lineal</strong>.
                </p>
              </>
            ),
          },
          {
            titulo: "Interpolación lineal (lerp)",
            contenido: (
              <>
                <p>
                  Interpolar es &ldquo;mezclar&rdquo; dos valores según un parámetro{" "}
                  <code>t</code> que va de 0 (el inicio) a 1 (el final):
                </p>
                <p className="rounded-md bg-zinc-100 p-3 font-mono text-[11px] leading-relaxed dark:bg-zinc-800/60">
                  lerp(a, b, t) = a + (b − a) · t
                </p>
                <p>
                  Para una línea en 2D, interpolamos la <code>x</code> y la{" "}
                  <code>y</code> por separado. Recorriendo <code>t</code> de 0 a 1
                  obtenemos puntos que van del inicio al final; los{" "}
                  <strong>redondeamos</strong> a la celda más cercana.
                </p>
              </>
            ),
          },
          {
            titulo: "¿Cuántos puntos? La distancia diagonal",
            contenido: (
              <>
                <p>
                  Si muestreamos pocos puntos, la línea queda con <strong>huecos</strong>;
                  si muestreamos de más, repetimos celdas. El número justo es la{" "}
                  <strong>distancia diagonal</strong> (o de Chebyshev): el mayor de las
                  diferencias en x y en y.
                </p>
                <p className="rounded-md bg-zinc-100 p-3 font-mono text-[11px] leading-relaxed dark:bg-zinc-800/60">
                  N = max(|x1 − x0|, |y1 − y0|)
                  <br />
                  <br />
                  para paso de 0 a N:
                  <br />
                  &nbsp;&nbsp;t = (N == 0) ? 0 : paso / N
                  <br />
                  &nbsp;&nbsp;celda = redondear( lerp_punto(p0, p1, t) )
                </p>
                <p>
                  En la pestaña <strong>Trazar línea</strong>, arrastrá los extremos y
                  mirá cómo <code>N</code> (la distancia diagonal) da exactamente las
                  celdas necesarias, sin huecos.
                </p>
              </>
            ),
          },
          {
            titulo: "Supercover: todas las celdas tocadas",
            contenido: (
              <>
                <p>
                  La interpolación da <strong>una celda por paso</strong> — una línea
                  &ldquo;fina&rdquo;. Pero a veces querés <strong>todas</strong> las
                  celdas que la línea <em>toca</em>, aunque sea una esquinita. A eso se
                  le llama <strong>supercover</strong>.
                </p>
                <p>
                  Es lo que conviene para la <strong>línea de visión</strong>: si un
                  muro apenas roza la trayectoria, debería <strong>tapar</strong> la
                  vista. Con la línea fina podría &ldquo;colarse&rdquo; en diagonal
                  entre dos muros; supercover no.
                </p>
              </>
            ),
          },
          {
            titulo: "Aplicaciones en juegos",
            contenido: (
              <>
                <ul className="ml-5 list-disc space-y-1">
                  <li><strong>Ataques a distancia</strong>: la bala/flecha recorre las celdas de la línea; si hay un muro, choca ahí.</li>
                  <li><strong>Línea de visión / niebla de guerra</strong>: ¿el enemigo ve al jugador? Trazá la línea y fijate si algo la corta.</li>
                  <li><strong>Campo de visión</strong>: combinado con la sección de <em>visibilidad 2D</em>.</li>
                  <li><strong>IA</strong>: &ldquo;disparo si tengo tiro libre&rdquo;.</li>
                </ul>
                <p>
                  Probalo en la pestaña <strong>Disparo</strong>: mové el objetivo y
                  poné muros para ver cuándo el tiro queda bloqueado.
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
                La misma línea sirve para <strong>dibujar</strong> (interpolación) y
                para <strong>tapar la visión</strong> (supercover). Elegí según si
                querés la línea fina o todas las celdas tocadas.
              </>
            ),
          },
        ],
        preguntas: [
          "¿Qué hace la función lerp(a, b, t)?",
          "¿Cómo se traza una línea en una grilla usando interpolación?",
          "¿Qué es la distancia diagonal y por qué es la cantidad justa de puntos?",
          "¿Qué diferencia hay entre la línea fina (interpolación) y la supercover?",
          "¿Por qué para la línea de visión conviene usar supercover?",
          "Nombrá dos usos de trazar líneas en un juego.",
        ],
      }}
      demos={[
        {
          id: "trazar",
          label: "Trazar línea",
          icon: <Spline className="h-3.5 w-3.5" />,
          render: () => (
            <div className="flex h-full w-full items-start justify-center overflow-auto p-4">
              <LineGrid />
            </div>
          ),
        },
        {
          id: "disparo",
          label: "Disparo",
          icon: <Crosshair className="h-3.5 w-3.5" />,
          render: () => (
            <div className="flex h-full w-full items-start justify-center overflow-auto p-4">
              <RangedAttack />
            </div>
          ),
        },
      ]}
    />
  );
}
