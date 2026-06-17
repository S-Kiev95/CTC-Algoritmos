"use client";

import { useMemo } from "react";
import { Sparkles, Package, Wand2 } from "lucide-react";
import { AlgorithmPlayer } from "@/components/AlgorithmPlayer";
import { PythonLesson } from "@/components/python/PythonLesson";
import { PackingView } from "@/components/python/PackingView";
import {
  ARGS_KWARGS_CODE,
  DECORADOR_CODE,
  generateArgsKwargsSteps,
  generateDecoradorSteps,
} from "@/lib/python/avanzado";

export default function AvanzadoPage() {
  return (
    <PythonLesson
      icon={<Sparkles className="h-5 w-5" />}
      title="Particularidades de Python"
      subtitle={
        <>
          Lo que hace a Python, Python: <code>*args</code>/<code>**kwargs</code>,
          funciones como objetos de primera clase y <strong>decoradores</strong>.
        </>
      }
      teoria={{
        resumen: (
          <>
            En Python las <strong>funciones son objetos</strong>: las podés pasar
            como argumento, devolverlas y guardarlas en variables. De ahí salen
            los decoradores.
          </>
        ),
        lectura: [
          {
            titulo: "Detalles que ya viste en acción",
            contenido: (
              <>
                <p>
                  La <strong>indentación</strong> define los bloques (no hay
                  llaves). <code>None</code> es el equivalente a <em>null</em>.
                  Podés <strong>desempaquetar</strong> varias variables a la vez:{" "}
                  <code>x, y = 1, 2</code> e incluso intercambiarlas con{" "}
                  <code>x, y = y, x</code>. Y <code>type(v)</code> te dice el tipo,
                  mientras <code>str(v)</code> o <code>int(v)</code> convierten.
                </p>
              </>
            ),
          },
          {
            titulo: "*args y **kwargs",
            contenido: (
              <>
                <p>
                  El <code>*</code> empaqueta los argumentos posicionales en una{" "}
                  <em>tupla</em> (<code>args</code>); el <code>**</code> empaqueta
                  los nombrados en un <em>diccionario</em> (<code>kwargs</code>).
                  Sirven para funciones que aceptan una cantidad variable de
                  argumentos.
                </p>
              </>
            ),
          },
          {
            titulo: "Decoradores",
            contenido: (
              <>
                <p>
                  Un decorador es una función que <em>envuelve</em> a otra para
                  agregarle comportamiento antes y/o después, sin tocar su código.
                  Se aplica con <code>@nombre</code> arriba de la función. Como las
                  funciones son objetos, el decorador recibe la función original y
                  devuelve una <em>envoltura</em>.
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
                En la demo de decoradores, fijate el orden: primero corre lo de
                &quot;antes&quot;, después la función original, y por último lo de
                &quot;después&quot;.
              </>
            ),
          },
        ],
        preguntas: [
          "¿Qué quiere decir que las funciones sean objetos de primera clase?",
          "¿En qué estructura empaqueta *args los argumentos? ¿Y **kwargs?",
          "¿Qué es None?",
          "¿Cómo intercambiarías dos variables en una sola línea?",
          "¿Qué hace un decorador y cómo se aplica?",
        ],
      }}
      demos={[
        {
          id: "args",
          label: "*args / **kwargs",
          icon: <Package className="h-3.5 w-3.5" />,
          render: () => <ArgsKwargsDemo />,
        },
        {
          id: "decorador",
          label: "Decoradores",
          icon: <Wand2 className="h-3.5 w-3.5" />,
          render: () => <DecoradorDemo />,
        },
      ]}
    />
  );
}

function ArgsKwargsDemo() {
  const steps = useMemo(() => generateArgsKwargsSteps(), []);
  return (
    <AlgorithmPlayer
      code={ARGS_KWARGS_CODE}
      steps={steps}
      title="Empaquetando argumentos"
      renderVisualization={(step) => <PackingView state={step.state} />}
    />
  );
}

function DecoradorDemo() {
  const steps = useMemo(() => generateDecoradorSteps(), []);
  return (
    <AlgorithmPlayer
      code={DECORADOR_CODE}
      steps={steps}
      title="Una función que envuelve a otra"
      renderVisualization={(step) => <PackingView state={step.state} />}
    />
  );
}
