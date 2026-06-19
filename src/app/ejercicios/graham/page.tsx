"use client";

import { useMemo, useState } from "react";
import { BookOpen, Play, RefreshCw } from "lucide-react";
import { AlgorithmPlayer } from "@/components/AlgorithmPlayer";
import { ExerciseLesson, ReadingPane } from "@/components/ejercicios/ExerciseLesson";
import { ConvexHullBoard } from "@/components/ejercicios/ConvexHullBoard";
import { CropField } from "@/components/ejercicios/CropField";
import { getExercise } from "@/lib/ejercicios/exercises";
import {
  GRAHAM_CODE,
  generateGrahamSteps,
  randomPoints,
} from "@/lib/ejercicios/graham";
import {
  CROP_CODE,
  generateCropField,
  generateCropSteps,
} from "@/lib/ejercicios/cropPlague";

const exercise = getExercise("graham")!;

export default function GrahamPage() {
  return (
    <ExerciseLesson
      exercise={exercise}
      subtitle={
        <>
          El <strong>convex hull</strong> (cápsula convexa): el polígono más
          chico que encierra un conjunto de puntos. Lo usamos para estimar el
          área de una plaga en un campo.
        </>
      }
      leadingTabs={[
        {
          id: "teoria",
          label: "Teoría",
          icon: <BookOpen className="h-3.5 w-3.5" />,
          render: () => <Teoria />,
        },
        {
          id: "demo",
          label: "Demo",
          icon: <Play className="h-3.5 w-3.5" />,
          render: () => <Demo />,
        },
      ]}
      enunciado={<Enunciado />}
      pistas={PISTAS}
      solucion={<Solucion />}
      animacion={() => <CropDemo />}
    />
  );
}

function Teoria() {
  return (
    <ReadingPane>
      <p>
        Dado un conjunto de puntos en el plano, el <strong>convex hull</strong> es
        el polígono convexo más chico que los contiene a todos. Imaginá una
        bandita elástica que rodea todos los puntos y se suelta: la forma que
        queda es el casco convexo.
      </p>
      <h2>Graham Scan, paso a paso</h2>
      <p>
        El algoritmo de <strong>Graham</strong> lo construye así:
      </p>
      <p>
        <strong>1. Elegir p0.</strong> El punto más abajo (menor <code>y</code>);
        si hay empate, el más a la izquierda. Ese punto seguro pertenece al casco.
      </p>
      <p>
        <strong>2. Ordenar por ángulo polar.</strong> Se ordenan los demás puntos
        según el ángulo que forman con <code>p0</code>, de menor a mayor.
      </p>
      <p>
        <strong>3. Recorrer y descartar.</strong> Se van agregando los puntos a
        una pila. Antes de agregar uno nuevo, se mira el <em>giro</em> que forman
        los dos últimos del casco con el nuevo punto: si <strong>no</strong> es un
        giro antihorario (es decir, el casco se &quot;hunde&quot;), se descarta el
        último y se vuelve a chequear. Así nunca quedan vértices cóncavos.
      </p>
      <h2>El test de giro (orientación)</h2>
      <p>
        Se usa el <strong>producto cruzado</strong> de los vectores. Para tres
        puntos a → b → c, el signo del cruzado dice si el giro es antihorario
        (izquierda, positivo), horario (derecha, negativo) o si son colineales
        (cero). Es solo una resta y dos multiplicaciones: rapidísimo.
      </p>
      <h2>¿Para qué sirve?</h2>
      <p>
        El convex hull aparece en visión por computadora (detección de formas),
        colisiones en videojuegos, análisis geográfico, y —como en este
        ejercicio— para <strong>estimar el área</strong> que ocupa un conjunto de
        puntos. Pasá a la <strong>Demo</strong> para verlo en acción.
      </p>
    </ReadingPane>
  );
}

function Demo() {
  const [seed, setSeed] = useState(0);
  const steps = useMemo(() => generateGrahamSteps(randomPoints(11, 14, 11)), [seed]);
  return (
    <div className="flex h-full flex-col">
      <RegenBar onClick={() => setSeed((s) => s + 1)} label="Otros puntos" />
      <div className="min-h-0 flex-1">
        <AlgorithmPlayer
          key={seed}
          code={GRAHAM_CODE}
          steps={steps}
          title="Construyendo el casco convexo"
          renderVisualization={(step) => <ConvexHullBoard state={step.state} />}
        />
      </div>
    </div>
  );
}

function Enunciado() {
  return (
    <>
      <p>
        Un campo de cultivo se representa como una <strong>matriz</strong>: cada
        celda es una planta. Una <strong>plaga</strong> afectó a algunas plantas,
        que aparecen marcadas en rojo (su posición es aleatoria).
      </p>
      <h2>Tu tarea</h2>
      <p>
        <strong>1.</strong> Recorrer la matriz para <strong>encontrar todas las
        plantas infectadas</strong> y quedarte con sus coordenadas.
      </p>
      <p>
        <strong>2.</strong> Usar <strong>Graham Scan</strong> sobre esas
        coordenadas para obtener el <em>convex hull</em> que las encierra.
      </p>
      <p>
        <strong>3.</strong> Calcular el <strong>área</strong> de ese polígono: es
        una estimación de la superficie del cultivo afectada por la plaga (la zona
        que conviene fumigar o poner en cuarentena).
      </p>
    </>
  );
}

const PISTAS = [
  <>
    Para encontrar las infectadas, recorré toda la matriz con dos bucles
    anidados (fila y columna) y guardá las posiciones donde la planta está
    enferma.
  </>,
  <>
    Convertí cada celda infectada <code>(fila, columna)</code> en un punto{" "}
    <code>(x, y)</code> para poder aplicar el algoritmo geométrico.
  </>,
  <>
    Aplicá <strong>Graham Scan</strong> a esos puntos: vas a obtener solo los
    vértices del borde (los de adentro no importan para el área).
  </>,
  <>
    El área de un polígono a partir de sus vértices se calcula con la{" "}
    <strong>fórmula del shoelace</strong> (zapato):{" "}
    <code>½ · |Σ (xᵢ·yᵢ₊₁ − xᵢ₊₁·yᵢ)|</code>.
  </>,
];

function Solucion() {
  return (
    <>
      <h2>Enfoque</h2>
      <p>
        El problema combina dos cosas: un <strong>recorrido</strong> simple de la
        matriz para juntar las plantas infectadas, y un algoritmo{" "}
        <strong>geométrico</strong> (Graham + área) sobre esas posiciones.
      </p>
      <h2>1. Recorrer y juntar</h2>
      <p>
        Dos bucles anidados recorren todas las celdas; cada planta enferma se
        guarda como un punto <code>(columna, fila)</code>.
      </p>
      <h2>2. Convex hull + área</h2>
      <p>
        Con las posiciones infectadas, <code>graham_scan</code> devuelve el
        polígono que las envuelve, y la fórmula del shoelace nos da su área. Esa
        área (en celdas²) es la estimación de la superficie afectada.
      </p>
      <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 font-mono text-[12px] leading-relaxed text-zinc-100">
        <code>{CROP_CODE}</code>
      </pre>
      <p>
        Mirá la pestaña <strong>Animación</strong>: primero se recorre el campo
        marcando las infectadas, después se arma el casco y aparece el área.
      </p>
    </>
  );
}

function CropDemo() {
  const [seed, setSeed] = useState(0);
  const steps = useMemo(() => generateCropSteps(generateCropField(9, 9, 0.14)), [seed]);
  return (
    <div className="flex h-full flex-col">
      <RegenBar onClick={() => setSeed((s) => s + 1)} label="Otro campo" />
      <div className="min-h-0 flex-1">
        <AlgorithmPlayer
          key={seed}
          code={CROP_CODE}
          steps={steps}
          title="Recorrer el campo, hallar la plaga y estimar el área"
          renderVisualization={(step) => <CropField state={step.state} />}
        />
      </div>
    </div>
  );
}

function RegenBar({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
      <span className="text-xs text-zinc-500">Se genera al azar.</span>
      <button
        onClick={onClick}
        className="flex items-center gap-1.5 rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        {label}
      </button>
    </div>
  );
}
