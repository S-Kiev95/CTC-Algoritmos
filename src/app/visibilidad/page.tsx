"use client";

import dynamic from "next/dynamic";
import { Lightbulb, Radar, Flashlight, Boxes, Box, Package, Car } from "lucide-react";
import { PythonLesson } from "@/components/python/PythonLesson";
import { VisibilityLight } from "@/components/visibility/VisibilityLight";
import { RaycastSensor } from "@/components/visibility/RaycastSensor";
import { Raycaster3D } from "@/components/visibility/Raycaster3D";
import { CarNav } from "@/components/visibility/CarNav";

// Three.js solo en el cliente: no se puede prerenderizar en el export estático.
const Visibility3D = dynamic(
  () => import("@/components/visibility/Visibility3D").then((m) => m.Visibility3D),
  {
    ssr: false,
    loading: () => <p className="p-8 text-sm text-zinc-400">Cargando escena 3D…</p>,
  },
);
import {
  NaiveVsCorners,
  SweepDemo,
  FieldOfView,
  Playground,
} from "@/components/visibility/VisibilityDemos";

export default function VisibilidadPage() {
  return (
    <PythonLesson
      kicker="Geometría · Visibilidad 2D"
      teoriaLabel="Teoría"
      icon={<Lightbulb className="h-5 w-5" />}
      title="Visibilidad 2D"
      subtitle={
        <>
          Desde un punto, y con paredes de por medio, ¿qué parte del mundo se{" "}
          <strong>ve</strong>? Lo resolvemos lanzando <strong>rayos</strong>: la base
          de las luces y sombras, la niebla de guerra y los sensores de un robot.
        </>
      }
      teoria={{
        resumen: (
          <>
            Adaptación libre en español del{" "}
            <a
              href="https://www.redblobgames.com/articles/visibility/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sky-600 underline-offset-2 hover:underline dark:text-sky-400"
            >
              artículo de visibilidad 2D de Red Blob Games (Amit Patel)
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
                  Imaginá una vista de arriba (top-down) con <strong>paredes</strong> y
                  una <strong>luz</strong> (o un jugador, o un guardia). Queremos saber
                  qué zona <strong>se ve</strong> desde ese punto: lo que no está tapado
                  por una pared. Eso sirve para dibujar luces y sombras, para la{" "}
                  <em>niebla de guerra</em> (tapar lo que el jugador no vio) y para el{" "}
                  <em>campo de visión</em> de un enemigo.
                </p>
                <p>
                  Arrastrá la luz en el escenario de acá abajo para ver cómo cambia el
                  área visible:
                </p>
                <VisibilityLight />
              </>
            ),
          },
          {
            titulo: "Lanzar rayos (ray casting)",
            contenido: (
              <>
                <p>
                  La idea base: desde la luz, tiramos <strong>rayos</strong> en muchas
                  direcciones. Cada rayo avanza hasta chocar con la primera pared; ese
                  choque es un punto del borde de lo visible. Si tiramos <em>muchísimos</em>{" "}
                  rayos, obtenemos una buena aproximación… pero es un desperdicio.
                </p>
                <p>
                  La clave está en darse cuenta de que el borde de la zona visible solo{" "}
                  <strong>cambia de dirección en las esquinas</strong> de las paredes.
                  Entre dos esquinas, el borde es una línea recta. Entonces no hace falta
                  barrer todos los ángulos: alcanza con lanzar los rayos{" "}
                  <strong>justo hacia las esquinas</strong> de las paredes (activá
                  &ldquo;mostrar esquinas&rdquo; en la demo). Muchísimos menos rayos, el
                  mismo resultado.
                </p>
                <p>
                  Cambiá entre las dos formas y mirá el contador de rayos:
                </p>
                <NaiveVsCorners />
              </>
            ),
          },
          {
            titulo: "Doblar en las esquinas (±ε)",
            contenido: (
              <>
                <p>
                  Hay un detalle fino. Un rayo dirigido <em>exactamente</em> a una
                  esquina se queda ahí, pero muchas veces la pared{" "}
                  <strong>termina</strong> en esa esquina y la visión debe{" "}
                  <em>seguir de largo</em> hacia lo que hay detrás. Por eso, por cada
                  esquina lanzamos <strong>tres rayos</strong>: al ángulo exacto y un
                  poquito a cada lado (<code>±ε</code>). Los rayos &ldquo;de más&rdquo;
                  son los que pasan rozando la esquina y encuentran la pared lejana.
                </p>
              </>
            ),
          },
          {
            titulo: "El barrido angular",
            contenido: (
              <>
                <p>
                  El algoritmo eficiente <strong>ordena las esquinas por ángulo</strong> y
                  &ldquo;barre&rdquo; una línea girando alrededor de la luz, como la
                  aguja de un reloj. Mientras gira, mantiene una lista de las paredes que
                  la línea está cruzando en ese momento, porque{" "}
                  <strong>solo la pared más cercana es la visible</strong>.
                </p>
                <p>
                  En cada esquina que toca: agrega las paredes que <em>empiezan</em> ahí,
                  saca las que <em>terminan</em>, y vuelve a mirar cuál es la más cercana.
                  Cuando la pared más cercana <strong>cambia</strong>, cierra un triángulo
                  de zona visible y empieza otro. Uniendo todos esos triángulos sale el
                  área iluminada.
                </p>
                <p className="rounded-md bg-zinc-100 p-3 font-mono text-[11px] leading-relaxed dark:bg-zinc-800/60">
                  esquinas ordenadas por ángulo
                  <br />
                  abiertas = []  # paredes que cruza el barrido
                  <br />
                  para cada esquina:
                  <br />
                  &nbsp;&nbsp;recordar la pared más cercana
                  <br />
                  &nbsp;&nbsp;agregar paredes que empiezan acá
                  <br />
                  &nbsp;&nbsp;quitar paredes que terminan acá
                  <br />
                  &nbsp;&nbsp;si cambió la más cercana: cerrar triángulo, abrir otro
                </p>
                <p>
                  Movés el barrido con el slider y ves cómo se va llenando el área
                  visible:
                </p>
                <SweepDemo />
              </>
            ),
          },
          {
            titulo: "El polígono de visibilidad",
            contenido: (
              <>
                <p>
                  El resultado de todo esto es un <strong>polígono</strong>: la lista de
                  puntos de choque, <strong>ordenados por ángulo</strong>, unidos en
                  orden. Ese polígono es exactamente la zona visible. (La demo de arriba
                  usa la versión simple: por cada esquina, tres rayos, y se ordenan los
                  choques por ángulo — sin el barrido, pero da el mismo polígono.)
                </p>
              </>
            ),
          },
          {
            titulo: "Para qué sirve (incluida la robótica)",
            contenido: (
              <>
                <ul className="ml-5 list-disc space-y-1">
                  <li>
                    <strong>Luces y sombras</strong>: el polígono es la zona iluminada;
                    varias luces se combinan con unión.
                  </li>
                  <li>
                    <strong>Niebla de guerra</strong>: se revela solo lo visible; el resto
                    queda oscuro.
                  </li>
                  <li>
                    <strong>Campo de visión</strong>: intersecando con un círculo (alcance)
                    o un cono se hace una linterna o el cono de visión de un guardia.
                  </li>
                  <li>
                    <strong>Robótica y autos autónomos</strong>: el mismo ray casting es la
                    base de los <strong>sensores de rango</strong> (LIDAR): el robot lanza
                    rayos y mide hasta el primer obstáculo. Con esos puntos arma un mapa
                    (SLAM) y esquiva obstáculos. Probalo en la pestaña{" "}
                    <strong>Sensor (LIDAR)</strong>.
                  </li>
                </ul>
              </>
            ),
          },
          {
            titulo: "De 2D a 3D (estilo Doom)",
            contenido: (
              <>
                <p>
                  El mismo ray casting sirve para <strong>fingir 3D</strong>. Los
                  primeros juegos en primera persona (Wolfenstein 3D, Doom) no tenían
                  un motor 3D real: tenían un <strong>mapa 2D</strong> y, por cada
                  columna de píxeles de la pantalla, lanzaban un rayo hasta la primera
                  pared. Después dibujaban una <strong>franja vertical</strong> tan
                  alta como <code>1 / distancia</code>: las paredes cercanas se ven
                  grandes y las lejanas chicas. ¡Eso es todo!
                </p>
                <p>
                  En la pestaña <strong>Vista 3D</strong> podés caminar en primera
                  persona por un laberinto renderizado justo así. El minimapa muestra
                  la vista 2D real desde arriba.
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
                En la demo, prendé <strong>mostrar rayos</strong> y{" "}
                <strong>mostrar esquinas</strong>: vas a ver que los rayos apuntan justo a
                las esquinas y que el borde de la luz &ldquo;dobla&rdquo; en ellas.
              </>
            ),
          },
        ],
        preguntas: [
          "¿Qué es el polígono de visibilidad?",
          "¿Por qué alcanza con lanzar rayos solo hacia las esquinas de las paredes?",
          "¿Por qué se tira un rayo un poquito a cada lado de cada esquina (±ε)?",
          "En el barrido angular, ¿por qué solo importa la pared más cercana?",
          "¿Cómo se arma el polígono final a partir de los puntos de choque?",
          "¿Qué relación hay entre este algoritmo y el LIDAR de un robot?",
        ],
      }}
      demos={[
        {
          id: "cubos3d",
          label: "3D con cubos",
          icon: <Package className="h-3.5 w-3.5" />,
          render: () => (
            <div className="flex h-full w-full items-start justify-center overflow-auto p-4">
              <Visibility3D />
            </div>
          ),
        },
        {
          id: "auto",
          label: "Auto autónomo",
          icon: <Car className="h-3.5 w-3.5" />,
          render: () => (
            <div className="flex h-full w-full items-start justify-center overflow-auto p-4">
              <CarNav />
            </div>
          ),
        },
        {
          id: "vista3d",
          label: "Vista 3D (Doom)",
          icon: <Box className="h-3.5 w-3.5" />,
          render: () => (
            <div className="flex h-full w-full items-start justify-center overflow-auto p-4">
              <Raycaster3D />
            </div>
          ),
        },
        {
          id: "fov",
          label: "Alcance y cono",
          icon: <Flashlight className="h-3.5 w-3.5" />,
          render: () => (
            <div className="flex h-full w-full items-start justify-center overflow-auto p-4">
              <FieldOfView />
            </div>
          ),
        },
        {
          id: "playground",
          label: "Playground",
          icon: <Boxes className="h-3.5 w-3.5" />,
          render: () => (
            <div className="flex h-full w-full items-start justify-center overflow-auto p-4">
              <Playground />
            </div>
          ),
        },
        {
          id: "sensor",
          label: "Sensor (LIDAR)",
          icon: <Radar className="h-3.5 w-3.5" />,
          render: () => (
            <div className="flex h-full w-full items-start justify-center overflow-auto p-4">
              <RaycastSensor />
            </div>
          ),
        },
      ]}
    />
  );
}
