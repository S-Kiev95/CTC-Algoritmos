"use client";

import { useMemo } from "react";
import { GitFork, Play, SkipForward } from "lucide-react";
import { AlgorithmPlayer } from "@/components/AlgorithmPlayer";
import { PythonLesson } from "@/components/python/PythonLesson";
import { FlowView } from "@/components/python/FlowView";
import {
  FLUJO_CODE,
  BREAK_CONTINUE_CODE,
  generateFlujoSteps,
  generateBreakContinueSteps,
} from "@/lib/python/controlFlujo";

export default function ControlFlujoPage() {
  return (
    <PythonLesson
      icon={<GitFork className="h-5 w-5" />}
      title="Control de flujo"
      subtitle={
        <>
          Decidir y repetir: <code>if/else</code>, bucles <code>for</code> y{" "}
          <code>while</code>, y cómo cortarlos o saltearlos con{" "}
          <code>break</code> y <code>continue</code>.
        </>
      }
      teoria={{
        resumen: (
          <>
            La <strong>indentación</strong> (los espacios al inicio de la línea)
            es la que define qué está adentro de un <code>if</code> o de un
            bucle. No hay llaves: el sangrado <em>es</em> la estructura.
          </>
        ),
        lectura: [
          {
            titulo: "Condicionales: if / else",
            contenido: (
              <>
                <p>
                  <code>if</code> ejecuta un bloque solo si la condición es{" "}
                  <code>True</code>; el <code>else</code> es el camino contrario.
                  También existe el <em>operador ternario</em> para asignar en una
                  línea: <code>nombre = &quot;Juan&quot; if numero &gt; 40 else &quot;Ana&quot;</code>.
                </p>
              </>
            ),
          },
          {
            titulo: "Bucles: for y while",
            contenido: (
              <>
                <p>
                  El <code>for ... in</code> recorre cualquier iterable (una
                  lista, un <code>range()</code>…) — es como el <em>foreach</em> de
                  otros lenguajes. El <code>while</code> repite mientras una
                  condición siga siendo <code>True</code>.
                </p>
                <p>
                  Ojo: en Python no existe <code>++</code>. Para sumar uno se usa{" "}
                  <code>contador += 1</code>.
                </p>
              </>
            ),
          },
          {
            titulo: "Cortar y saltear: break y continue",
            contenido: (
              <>
                <p>
                  <code>break</code> corta el bucle por completo. <code>continue</code>{" "}
                  saltea solo la vuelta actual y sigue con la próxima. Mirá la
                  segunda demo para verlos en acción.
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
                Tanto <code>for</code> como <code>while</code> pueden llevar un{" "}
                <code>else</code> que corre si el bucle terminó sin{" "}
                <code>break</code> — útil para búsquedas.
              </>
            ),
          },
        ],
        preguntas: [
          "¿Qué define en Python qué líneas están dentro de un if o un bucle?",
          "¿Qué diferencia hay entre for y while?",
          "¿Por qué se usa contador += 1 en lugar de contador++?",
          "¿Qué hace break y en qué se diferencia de continue?",
          "¿Cómo se recorre una lista con for ... in?",
        ],
      }}
      demos={[
        {
          id: "flujo",
          label: "if / for / while",
          icon: <Play className="h-3.5 w-3.5" />,
          render: () => <FlujoDemo />,
        },
        {
          id: "break-continue",
          label: "break / continue",
          icon: <SkipForward className="h-3.5 w-3.5" />,
          render: () => <BreakContinueDemo />,
        },
      ]}
    />
  );
}

function FlujoDemo() {
  const steps = useMemo(() => generateFlujoSteps(), []);
  return (
    <AlgorithmPlayer
      code={FLUJO_CODE}
      steps={steps}
      title="Condicionales y bucles, paso a paso"
      renderVisualization={(step) => <FlowView state={step.state} />}
    />
  );
}

function BreakContinueDemo() {
  const steps = useMemo(() => generateBreakContinueSteps(), []);
  return (
    <AlgorithmPlayer
      code={BREAK_CONTINUE_CODE}
      steps={steps}
      title="break corta, continue saltea"
      renderVisualization={(step) => <FlowView state={step.state} />}
    />
  );
}
