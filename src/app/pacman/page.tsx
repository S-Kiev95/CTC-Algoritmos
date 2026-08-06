"use client";

import { useMemo } from "react";
import { Ghost, Split, Cookie } from "lucide-react";
import Link from "next/link";
import { AlgorithmPlayer } from "@/components/AlgorithmPlayer";
import { PythonLesson } from "@/components/python/PythonLesson";
import { PacmanMazeStep } from "@/components/pacman/PacmanMaze";
import { PacmanGenerator } from "@/components/pacman/PacmanGenerator";
import { PACMAN_CODE, generateMazeSteps } from "@/lib/pacman/recursiveDivision";

export default function PacmanPage() {
  return (
    <PythonLesson
      kicker="Laberintos · División recursiva"
      teoriaLabel="Teoría"
      icon={<Ghost className="h-5 w-5" />}
      title="Laberinto tipo Pacman"
      subtitle={
        <>
          Cómo se genera un laberinto por <strong>división recursiva</strong>:
          partir el espacio en dos con un muro que deja un hueco, y repetir en cada
          mitad.
        </>
      }
      teoria={{
        resumen: (
          <>
            La <strong>división recursiva</strong> es la forma más directa de generar
            laberintos con <strong>muros gruesos</strong>, como los de Pacman. Es lo
            contrario de{" "}
            <Link
              href="/ejercicios/laberinto-kruskal"
              className="font-medium text-sky-600 underline-offset-2 hover:underline dark:text-sky-400"
            >
              Kruskal
            </Link>
            : en vez de <em>tirar</em> muros de un mapa lleno, se{" "}
            <em>agregan</em> muros a un mapa vacío.
          </>
        ),
        lectura: [
          {
            titulo: "La idea: dividir y repetir",
            contenido: (
              <>
                <p>
                  Arrancás con un <strong>rectángulo vacío</strong> (solo el borde es
                  muro). Después:
                </p>
                <ol className="ml-5 list-decimal space-y-1">
                  <li>Elegís una orientación (horizontal o vertical).</li>
                  <li>Dibujás un <strong>muro</strong> que parte el rectángulo en dos.</li>
                  <li>Le dejás un <strong>hueco</strong> para que las dos mitades sigan comunicadas.</li>
                  <li>Repetís lo mismo, por separado, en cada mitad.</li>
                </ol>
                <p>
                  Eso es <strong>recursión</strong>: el mismo procedimiento aplicado a
                  regiones cada vez más chicas, hasta que ya no entra ningún muro más.
                </p>
              </>
            ),
          },
          {
            titulo: "El caso base",
            contenido: (
              <>
                <p>
                  Toda recursión necesita un <strong>caso base</strong> que la corte.
                  Acá es simple: si la región es <strong>más chica que 3</strong> de
                  ancho y de alto, no entra un muro con espacio a los dos lados, así que
                  se deja como pasillo y listo.
                </p>
              </>
            ),
          },
          {
            titulo: "¿Horizontal o vertical?",
            contenido: (
              <>
                <p>
                  La regla habitual: cortar por el <strong>lado más largo</strong>. Si
                  la región es más alta que ancha, muro horizontal; si es más ancha que
                  alta, vertical; y si es cuadrada, al azar. Esto evita que queden
                  pasillos larguísimos y da laberintos más parejos.
                </p>
              </>
            ),
          },
          {
            titulo: "El truco de la paridad (¡importante!)",
            contenido: (
              <>
                <p>
                  Acá hay una trampa que rompe el algoritmo si no se tiene cuidado. Si
                  las posiciones de los muros y de los huecos se eligen totalmente al
                  azar, un muro nuevo puede caer <strong>justo encima del hueco</strong>{" "}
                  de un muro anterior… y ahí el laberinto se <strong>parte en zonas
                  incomunicadas</strong>.
                </p>
                <p>
                  La solución clásica es la <strong>paridad</strong>: los muros van
                  siempre en índices <strong>pares</strong> y los huecos en índices{" "}
                  <strong>impares</strong>. Como nunca coinciden, ningún muro puede
                  tapar un hueco y el laberinto queda <strong>siempre conectado</strong>.
                </p>
                <p className="rounded-md bg-amber-50 p-3 text-[13px] dark:bg-amber-950/30">
                  Lo comprobamos: generando 300 laberintos <em>sin</em> paridad,{" "}
                  <strong>0 quedaron conectados</strong>; con paridad,{" "}
                  <strong>300 de 300</strong>.
                </p>
              </>
            ),
          },
          {
            titulo: "Muros gruesos vs muros finos",
            contenido: (
              <>
                <p>
                  En este algoritmo el muro <strong>ocupa celdas enteras</strong> (por
                  eso se ve grueso, como en Pacman). Es distinto del modelo de{" "}
                  <Link href="/aristas" className="font-medium text-sky-600 underline-offset-2 hover:underline dark:text-sky-400">
                    aristas
                  </Link>
                  , donde la pared es una línea fina entre dos celdas.
                </p>
                <p>
                  Por eso acá la grilla se piensa con celdas <em>pares</em> para muros e{" "}
                  <em>impares</em> para pasillos, y conviene que el ancho y el alto sean{" "}
                  <strong>números impares</strong>.
                </p>
              </>
            ),
          },
          {
            titulo: "Comparación con Kruskal",
            contenido: (
              <>
                <ul className="ml-5 list-disc space-y-1">
                  <li>
                    <strong>Kruskal</strong>: parte de todo lleno de muros y los va{" "}
                    <em>tirando</em>; usa Union-Find para no crear ciclos. Da laberintos
                    de aspecto &ldquo;orgánico&rdquo;.
                  </li>
                  <li>
                    <strong>División recursiva</strong>: parte de todo vacío y{" "}
                    <em>agrega</em> muros; da laberintos con estructura de{" "}
                    <strong>rectángulos anidados</strong>, más &ldquo;arquitectónicos&rdquo;
                    — justo el look de Pacman.
                  </li>
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
                En la animación, mirá el <strong>nivel de recursión</strong>: cada muro
                nuevo divide una región más chica que la anterior. La zona amarilla es
                la región que se está dividiendo.
              </>
            ),
          },
        ],
        preguntas: [
          "¿En qué se diferencia la división recursiva de Kruskal?",
          "¿Cuáles son los cuatro pasos que se repiten en cada región?",
          "¿Cuál es el caso base que corta la recursión?",
          "¿Por qué conviene cortar siempre por el lado más largo?",
          "¿Qué pasa si un muro nuevo cae encima del hueco de un muro anterior?",
          "¿Cómo evita ese problema el truco de la paridad?",
          "¿Por qué el ancho y el alto conviene que sean impares?",
        ],
      }}
      demos={[
        {
          id: "animacion",
          label: "Cómo se genera",
          icon: <Split className="h-3.5 w-3.5" />,
          render: () => <DivisionDemo />,
        },
        {
          id: "generador",
          label: "Generador",
          icon: <Cookie className="h-3.5 w-3.5" />,
          render: () => (
            <div className="flex h-full w-full items-start justify-center overflow-auto p-4">
              <PacmanGenerator />
            </div>
          ),
        },
      ]}
    />
  );
}

function DivisionDemo() {
  const steps = useMemo(() => generateMazeSteps(15, 21), []);
  return (
    <AlgorithmPlayer
      code={PACMAN_CODE}
      steps={steps}
      title="División recursiva: cada muro parte una región en dos"
      renderVisualization={(step) => <PacmanMazeStep state={step.state} />}
    />
  );
}
