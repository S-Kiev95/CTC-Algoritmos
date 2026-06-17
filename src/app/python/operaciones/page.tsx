"use client";

import { useMemo } from "react";
import { Calculator, Play } from "lucide-react";
import { AlgorithmPlayer } from "@/components/AlgorithmPlayer";
import { PythonLesson } from "@/components/python/PythonLesson";
import { VariablesView } from "@/components/python/VariablesView";
import {
  OPERACIONES_CODE,
  generateOperacionesSteps,
} from "@/lib/python/operaciones";

export default function OperacionesPage() {
  return (
    <PythonLesson
      icon={<Calculator className="h-5 w-5" />}
      title="Operaciones básicas"
      subtitle={
        <>
          Aritmética con números y dos formas de combinar texto:{" "}
          <strong>concatenar con +</strong> o usar <code>f-strings</code>.
        </>
      }
      teoria={{
        resumen: (
          <>
            Las operaciones respetan el <strong>tipo</strong> de cada valor:{" "}
            <code>+</code> suma números pero <em>concatena</em> textos. Mezclar
            tipos sin convertir da error.
          </>
        ),
        lectura: [
          {
            titulo: "Aritmética",
            contenido: (
              <>
                <p>
                  Los operadores son los esperables: <code>+</code>, <code>-</code>,{" "}
                  <code>*</code>, <code>/</code>. También está <code>**</code>{" "}
                  (potencia) y <code>%</code> (resto de la división).
                </p>
              </>
            ),
          },
          {
            titulo: "Combinar texto: + vs f-string",
            contenido: (
              <>
                <p>
                  Con <code>+</code> pegás strings, pero si querés meter un número
                  tenés que convertirlo con <code>str(numero)</code>; si no, Python
                  se queja. El <em>f-string</em> evita todo eso:{" "}
                  <code>{`f"{nombre} tiene {numero} anios."`}</code> inserta cada
                  variable directamente, sin conversiones a mano.
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
                Regla práctica: para mostrar valores, casi siempre conviene el
                f-string. Es más corto y se lee mejor.
              </>
            ),
          },
        ],
        preguntas: [
          "¿Qué hace el operador + entre dos strings?",
          "¿Por qué hay que usar str(numero) al concatenar con +?",
          "¿Qué ventaja tiene un f-string frente a concatenar con +?",
          "¿Qué calculan los operadores ** y %?",
        ],
      }}
      demos={[
        {
          id: "ops",
          label: "Demo animada",
          icon: <Play className="h-3.5 w-3.5" />,
          render: () => <OperacionesDemo />,
        },
      ]}
    />
  );
}

function OperacionesDemo() {
  const steps = useMemo(() => generateOperacionesSteps(), []);
  return (
    <AlgorithmPlayer
      code={OPERACIONES_CODE}
      steps={steps}
      title="Operando y combinando valores"
      renderVisualization={(step) => <VariablesView state={step.state} />}
    />
  );
}
