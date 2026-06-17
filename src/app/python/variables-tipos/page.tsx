"use client";

import { useMemo, useState } from "react";
import { BookOpen, Variable, Play } from "lucide-react";
import { AlgorithmPlayer } from "@/components/AlgorithmPlayer";
import { ResizableTopicShell } from "@/components/ResizableTopicShell";
import { Teoria } from "@/components/Teoria";
import { VariablesView } from "@/components/python/VariablesView";
import {
  VARIABLES_TIPOS_CODE,
  generateVariablesTiposSteps,
} from "@/lib/python/variablesTipos";

type Tab = "teoria" | "demo";

export default function VariablesTiposPage() {
  const [tab, setTab] = useState<Tab>("teoria");

  const header = (
    <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          <Variable className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Python · Fundamentos
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Variables y tipos
          </h1>
          <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
            Python es de <strong>tipado dinámico</strong>: no declarás el tipo,
            pero podés <em>sugerirlo</em> con type hints. <code>print()</code> y
            los <code>f-strings</code> para mostrar valores.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
          <TabButton
            active={tab === "teoria"}
            onClick={() => setTab("teoria")}
            icon={<BookOpen className="h-3.5 w-3.5" />}
          >
            Teoría
          </TabButton>
          <TabButton
            active={tab === "demo"}
            onClick={() => setTab("demo")}
            icon={<Play className="h-3.5 w-3.5" />}
          >
            Demo animada
          </TabButton>
        </div>
      </div>
    </header>
  );

  return (
    <ResizableTopicShell header={header}>
      {tab === "demo" && <VariablesDemo />}
      {tab === "teoria" && (
        <Teoria
          resumen={
            <>
              En Python una variable es solo un <strong>nombre</strong> que
              apunta a un valor. No declarás el tipo: lo deduce del valor que le
              asignás. Igual podés escribir <code>: int</code> como{" "}
              <em>type hint</em> para documentar tu intención.
            </>
          }
          lectura={[
            {
              titulo: "Tipado dinámico (con pistas opcionales)",
              contenido: (
                <>
                  <p>
                    En lenguajes como Java o C# tenés que decir el tipo de cada
                    variable. En Python no: <code>numero = 42</code> y listo,
                    Python sabe que es un <code>int</code>. Esto se llama{" "}
                    <em>tipado dinámico</em>.
                  </p>
                  <p>
                    Aun así, podés agregar un <strong>type hint</strong>:{" "}
                    <code>numero: int = 42</code>. No cambia el comportamiento —
                    Python no te frena si después le ponés otra cosa — pero
                    documenta el código y ayuda a los editores a avisarte de
                    errores.
                  </p>
                </>
              ),
            },
            {
              titulo: "Los tipos básicos",
              contenido: (
                <>
                  <p>
                    Cuatro que vas a usar todo el tiempo: <code>int</code>{" "}
                    (enteros), <code>float</code> (con decimales), <code>str</code>{" "}
                    (texto entre comillas) y <code>bool</code> (<code>True</code>{" "}
                    o <code>False</code>, siempre con mayúscula).
                  </p>
                </>
              ),
            },
            {
              titulo: "Mostrar valores: print y f-strings",
              contenido: (
                <>
                  <p>
                    <code>print()</code> imprime en la consola. Para mezclar
                    texto con variables, lo más cómodo es el <em>f-string</em>:
                    poné una <code>f</code> antes de las comillas y escribí las
                    variables entre llaves: <code>{`f"Hola, {nombre}"`}</code>.
                    Es como el <em>string interpolation</em> de otros lenguajes.
                  </p>
                </>
              ),
            },
          ]}
          callouts={[
            {
              tipo: "tip",
              texto: (
                <>
                  Pasá a la pestaña <strong>Demo animada</strong> para ver cómo
                  cada línea va creando variables en memoria y qué imprime la
                  consola, paso a paso.
                </>
              ),
            },
          ]}
          preguntas={[
            "¿Qué significa que Python sea de tipado dinámico?",
            "¿Para qué sirve un type hint si Python no lo obliga?",
            "¿Cuál es la diferencia entre int y float?",
            "¿Cómo se escriben los valores booleanos en Python?",
            "¿Qué ventaja tiene un f-string frente a concatenar con +?",
          ]}
        />
      )}
    </ResizableTopicShell>
  );
}

function VariablesDemo() {
  const steps = useMemo(() => generateVariablesTiposSteps(), []);
  return (
    <AlgorithmPlayer
      code={VARIABLES_TIPOS_CODE}
      steps={steps}
      title="Creando variables y mostrándolas"
      renderVisualization={(step) => <VariablesView state={step.state} />}
    />
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
      ].join(" ")}
    >
      {icon}
      {children}
    </button>
  );
}
