"use client";

import { useMemo } from "react";
import { Boxes, Play } from "lucide-react";
import { AlgorithmPlayer } from "@/components/AlgorithmPlayer";
import { PythonLesson } from "@/components/python/PythonLesson";
import { ObjectView } from "@/components/python/ObjectView";
import { POO_CODE, generatePooSteps } from "@/lib/python/poo";

export default function PooPage() {
  return (
    <PythonLesson
      icon={<Boxes className="h-5 w-5" />}
      title="Programación orientada a objetos"
      subtitle={
        <>
          Modelar cosas con <strong>clases</strong> e <strong>instancias</strong>,
          y reutilizar código con <strong>herencia</strong>.
        </>
      }
      teoria={{
        resumen: (
          <>
            Una <strong>clase</strong> es un molde; una <strong>instancia</strong>{" "}
            es un objeto concreto hecho con ese molde. <code>self</code> es la
            instancia actual (el <em>this</em> de otros lenguajes).
          </>
        ),
        lectura: [
          {
            titulo: "Clase, constructor y self",
            contenido: (
              <>
                <p>
                  El constructor siempre se llama <code>__init__</code> y recibe{" "}
                  <code>self</code> como primer parámetro. Dentro guardás los datos
                  de la instancia: <code>self.nombre = nombre</code>. Los métodos
                  también reciben <code>self</code> para acceder a esos datos.
                </p>
              </>
            ),
          },
          {
            titulo: "Herencia y super()",
            contenido: (
              <>
                <p>
                  <code>class Estudiante(Persona)</code> hace que Estudiante{" "}
                  <em>herede</em> todo lo de Persona. Con{" "}
                  <code>super().__init__(...)</code> reutilizás el constructor del
                  padre en lugar de repetirlo. Si no redefinís un método, se usa el
                  del padre.
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
                En la demo, fijate que <code>juan</code> (Estudiante) puede{" "}
                <code>saludar()</code> aunque Estudiante no define ese método: lo
                hereda de Persona.
              </>
            ),
          },
        ],
        preguntas: [
          "¿Cuál es la diferencia entre una clase y una instancia?",
          "¿Cómo se llama siempre el constructor en Python?",
          "¿Qué representa self?",
          "¿Para qué sirve super().__init__()?",
          "¿Por qué juan puede usar saludar() sin que Estudiante lo defina?",
        ],
      }}
      demos={[
        {
          id: "poo",
          label: "Demo animada",
          icon: <Play className="h-3.5 w-3.5" />,
          render: () => <PooDemo />,
        },
      ]}
    />
  );
}

function PooDemo() {
  const steps = useMemo(() => generatePooSteps(), []);
  return (
    <AlgorithmPlayer
      code={POO_CODE}
      steps={steps}
      title="Clases, instancias y herencia"
      renderVisualization={(step) => <ObjectView state={step.state} />}
    />
  );
}
