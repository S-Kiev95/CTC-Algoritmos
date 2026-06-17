"use client";

import { useMemo } from "react";
import { FunctionSquare, Play, ShieldAlert } from "lucide-react";
import { AlgorithmPlayer } from "@/components/AlgorithmPlayer";
import { PythonLesson } from "@/components/python/PythonLesson";
import { CallStackView } from "@/components/python/CallStackView";
import { FlowView } from "@/components/python/FlowView";
import {
  FUNCIONES_CODE,
  TRY_EXCEPT_CODE,
  generateFuncionesSteps,
  generateTryExceptSteps,
} from "@/lib/python/funciones";

export default function FuncionesPage() {
  return (
    <PythonLesson
      icon={<FunctionSquare className="h-5 w-5" />}
      title="Funciones"
      subtitle={
        <>
          Bloques de código reutilizables con <code>def</code> y{" "}
          <code>return</code>, cómo se apilan al llamarse, y el manejo de errores
          con <code>try/except</code>.
        </>
      }
      teoria={{
        resumen: (
          <>
            Una función se define con <code>def</code>, recibe{" "}
            <strong>parámetros</strong> y puede <strong>devolver</strong> un valor
            con <code>return</code>. Cada llamada crea un <em>frame</em> en la pila
            de llamadas, que se desapila al terminar.
          </>
        ),
        lectura: [
          {
            titulo: "def y return",
            contenido: (
              <>
                <p>
                  <code>def cuadrado(x):</code> define una función; el cuerpo va
                  indentado. <code>return</code> devuelve un valor al lugar donde
                  se la llamó. Si no hay <code>return</code>, devuelve{" "}
                  <code>None</code>.
                </p>
              </>
            ),
          },
          {
            titulo: "La pila de llamadas",
            contenido: (
              <>
                <p>
                  Cuando llamás a una función, Python apila un frame con sus
                  parámetros; cuando termina, lo desapila y el valor devuelto
                  vuelve al código que la llamó. Es la misma pila que ves en{" "}
                  <em>recursividad</em>, pero acá con llamadas simples.
                </p>
              </>
            ),
          },
          {
            titulo: "Manejo de errores: try / except",
            contenido: (
              <>
                <p>
                  El <code>try</code> envuelve código que podría fallar; si lanza
                  un error, el <code>except</code> lo captura y el programa sigue.
                  Hay dos extras: <code>else</code> corre si <em>no</em> hubo error,
                  y <code>finally</code> corre <strong>siempre</strong>.
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
                <code>finally</code> es ideal para limpiar recursos (cerrar un
                archivo, una conexión) pase lo que pase.
              </>
            ),
          },
        ],
        preguntas: [
          "¿Qué devuelve una función que no tiene return?",
          "¿Qué pasa con el frame de una función cuando termina?",
          "¿Para qué sirve el bloque except?",
          "¿Cuándo corre el bloque else de un try?",
          "¿En qué se diferencia finally de else?",
        ],
      }}
      demos={[
        {
          id: "callstack",
          label: "Llamadas y retorno",
          icon: <Play className="h-3.5 w-3.5" />,
          render: () => <FuncionesDemo />,
        },
        {
          id: "try",
          label: "try / except",
          icon: <ShieldAlert className="h-3.5 w-3.5" />,
          render: () => <TryExceptDemo />,
        },
      ]}
    />
  );
}

function FuncionesDemo() {
  const steps = useMemo(() => generateFuncionesSteps(), []);
  return (
    <AlgorithmPlayer
      code={FUNCIONES_CODE}
      steps={steps}
      title="Llamar funciones y recibir su retorno"
      renderVisualization={(step) => <CallStackView state={step.state} />}
    />
  );
}

function TryExceptDemo() {
  const steps = useMemo(() => generateTryExceptSteps(), []);
  return (
    <AlgorithmPlayer
      code={TRY_EXCEPT_CODE}
      steps={steps}
      title="Capturar un error sin romper el programa"
      renderVisualization={(step) => <FlowView state={step.state} />}
    />
  );
}
