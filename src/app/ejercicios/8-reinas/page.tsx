"use client";

import { useMemo } from "react";
import { AlgorithmPlayer } from "@/components/AlgorithmPlayer";
import { ExerciseLesson } from "@/components/ejercicios/ExerciseLesson";
import { QueensBoard } from "@/components/ejercicios/QueensBoard";
import { getExercise } from "@/lib/ejercicios/exercises";
import {
  OCHO_REINAS_CODE,
  generateOchoReinasSteps,
} from "@/lib/ejercicios/ochoReinas";

const exercise = getExercise("8-reinas")!;

export default function OchoReinasPage() {
  return (
    <ExerciseLesson
      exercise={exercise}
      subtitle={
        <>
          Ubicar 8 reinas en un tablero de ajedrez de modo que{" "}
          <strong>ninguna ataque a otra</strong>. Un clásico para entender{" "}
          <em>backtracking</em>.
        </>
      }
      enunciado={<Enunciado />}
      pistas={PISTAS}
      solucion={<Solucion />}
      animacion={() => <Animacion />}
    />
  );
}

function Enunciado() {
  return (
    <>
      <p>
        En el ajedrez, la <strong>reina</strong> puede moverse cualquier cantidad
        de casillas en horizontal, vertical y diagonal. El desafío clásico de las{" "}
        <strong>8 reinas</strong> consiste en lo siguiente:
      </p>
      <p>
        <strong>
          Colocá 8 reinas en un tablero de 8×8 de manera que ninguna pueda
          capturar a otra.
        </strong>{" "}
        Es decir: no puede haber dos reinas en la misma fila, ni en la misma
        columna, ni en la misma diagonal.
      </p>
      <h2>Lo que se pide</h2>
      <p>
        Escribir un programa que encuentre una forma válida de ubicar las 8
        reinas (existen 92 soluciones distintas; con encontrar una alcanza).
      </p>
      <h2>Para pensar antes de codear</h2>
      <p>
        ¿Cuántas reinas puede haber como máximo en una misma columna? Si la
        respuesta es <em>una sola</em>, ya tenés una forma de organizar la
        búsqueda: ir columna por columna, decidiendo en qué fila va la reina de
        cada una.
      </p>
    </>
  );
}

const PISTAS = [
  <>
    Como no puede haber dos reinas en la misma columna, pensá el problema{" "}
    <strong>columna por columna</strong>: por cada columna elegís una sola fila.
  </>,
  <>
    Antes de colocar una reina en (columna, fila), verificá que no choque con
    ninguna de las ya puestas: misma <strong>fila</strong> o misma{" "}
    <strong>diagonal</strong> (la columna ya está garantizada).
  </>,
  <>
    Dos casillas están en la misma diagonal si la diferencia de filas es igual a
    la diferencia de columnas: <code>abs(f1 - f2) == abs(c1 - c2)</code>.
  </>,
  <>
    Si en una columna ninguna fila es válida, significa que una decisión anterior
    fue mala: <strong>volvé atrás</strong> (backtracking) y probá otra fila en la
    columna previa.
  </>,
  <>
    Esto se implementa naturalmente con <strong>recursión</strong>: una función
    que intenta colocar la reina de la columna <code>col</code> y se llama a sí
    misma para <code>col + 1</code>.
  </>,
];

function Solucion() {
  return (
    <>
      <h2>La idea: backtracking</h2>
      <p>
        El <em>backtracking</em> es una búsqueda que prueba opciones y, cuando
        llega a un callejón sin salida, <strong>deshace la última decisión</strong>{" "}
        y prueba otra. Acá: avanzamos columna por columna colocando una reina; si
        en alguna columna no hay ninguna fila válida, retrocedemos a la columna
        anterior y movemos esa reina.
      </p>
      <h2>Cómo se verifica un conflicto</h2>
      <p>
        Como recorremos de izquierda a derecha y ponemos una sola reina por
        columna, la columna nunca repite. Solo hay que chequear, contra cada reina
        ya colocada, que no comparta <strong>fila</strong> (<code>f == fila</code>)
        ni <strong>diagonal</strong> (<code>abs(f - fila) == abs(c - col)</code>).
      </p>
      <h2>El código</h2>
      <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 font-mono text-[12px] leading-relaxed text-zinc-100">
        <code>{OCHO_REINAS_CODE}</code>
      </pre>
      <h2>Por qué funciona</h2>
      <p>
        <code>colocar(col)</code> prueba cada fila de la columna actual. Si una es
        segura, coloca la reina y se llama a sí misma para la siguiente columna. Si
        esa llamada termina devolviendo <code>True</code>, propagamos el éxito
        hacia arriba. Si devuelve <code>False</code>, <strong>quitamos</strong> la
        reina (la línea <code>tablero[col] = -1</code>) y seguimos con la próxima
        fila. Cuando <code>col == n</code>, las 8 reinas están puestas: encontramos
        una solución. Mirá la pestaña <strong>Animación</strong> para verlo en
        acción.
      </p>
    </>
  );
}

function Animacion() {
  const steps = useMemo(() => generateOchoReinasSteps(8), []);
  return (
    <AlgorithmPlayer
      code={OCHO_REINAS_CODE}
      steps={steps}
      title="Backtracking sobre el tablero 8×8 (hasta la primera solución)"
      renderVisualization={(step) => <QueensBoard state={step.state} />}
    />
  );
}
