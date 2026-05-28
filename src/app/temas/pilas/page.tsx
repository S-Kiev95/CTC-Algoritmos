"use client";

import { useMemo, useState } from "react";
import { BookOpen, Layers, Undo2 } from "lucide-react";
import { AlgorithmPlayer } from "@/components/AlgorithmPlayer";
import { Teoria } from "@/components/Teoria";
import { StackView } from "@/components/algorithms/StackView";
import {
  EDITOR_HISTORY_CODE,
  generateEditorHistorySteps,
} from "@/lib/algorithms/stack/editorHistory";

type DemoKey = "teoria" | "editor";

export default function PilasPage() {
  const [demo, setDemo] = useState<DemoKey>("teoria");

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <Layers className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Tema
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Pilas (Stack)
            </h1>
            <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
              Estructura <strong>LIFO</strong> (Last In, First Out). Solo dos
              operaciones: <code>push</code> y <code>pop</code>. Esa limitación
              intencional es lo que la hace rapidísima y predecible.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
            <TabButton
              active={demo === "teoria"}
              onClick={() => setDemo("teoria")}
              icon={<BookOpen className="h-3.5 w-3.5" />}
            >
              Teoría
            </TabButton>
            <TabButton
              active={demo === "editor"}
              onClick={() => setDemo("editor")}
              icon={<Undo2 className="h-3.5 w-3.5" />}
            >
              Editor con Ctrl+Z
            </TabButton>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1">
        {demo === "editor" && <EditorDemo />}
        {demo === "teoria" && (
          <Teoria
          resumen={
            <>
              Como una pila de platos en un restaurante: el lavaplatos apila
              uno encima de otro, y cuando el mesero necesita uno{" "}
              <strong>agarra el de arriba</strong>, nunca el del fondo. El
              último que entra es el primero que sale.
            </>
          }
          lectura={[
            {
              titulo: "Las dos operaciones únicas",
              contenido: (
                <>
                  <p>
                    Una pila solo permite hacer dos cosas: <code>push</code>{" "}
                    para meter algo arriba, y <code>pop</code> para sacar lo de
                    arriba. Esa restricción intencional es justamente lo que la
                    hace rápida y predecible — no se pueden hacer operaciones
                    en medio, no se puede saltar elementos.
                  </p>
                </>
              ),
            },
            {
              titulo: "¿Dónde la usás sin darte cuenta?",
              contenido: (
                <>
                  <p>
                    Cada vez que apretás <code>Ctrl+Z</code> en cualquier
                    programa, estás haciendo <code>pop</code> de una pila. Cada
                    acción que hacés se apila, y deshacer saca la última. Por
                    eso podés deshacer muchas veces seguidas hasta volver al
                    principio.
                  </p>
                  <p>
                    El botón <em>Atrás</em> del navegador funciona igual: cada
                    página visitada se apila.
                  </p>
                </>
              ),
            },
            {
              titulo: "Las pilas en los lenguajes de programación",
              contenido: (
                <>
                  <p>
                    Cuando una función llama a otra función, el lenguaje
                    internamente usa una pila de llamadas conocida como{" "}
                    <em>call stack</em> para saber a dónde regresar cuando la
                    función termine.
                  </p>
                  <p>
                    Si alguna vez viste el error <code>stack overflow</code>,
                    viene literalmente de llenar esa pila con demasiadas
                    llamadas anidadas, lo que provoca una caída del sistema por
                    falta de memoria.
                  </p>
                  <p>
                    También se usan para validar paréntesis en ecuaciones
                    matemáticas, y en los compiladores e intérpretes para
                    procesar expresiones.
                  </p>
                </>
              ),
            },
            {
              titulo: "Ejemplo en código",
              contenido: (
                <>
                  <p>
                    Usamos una lista como pila — una lista cumple perfecto con
                    lo que necesitamos. Metemos tres elementos usando{" "}
                    <code>push</code>: <code>"escribir hola"</code>,{" "}
                    <code>"escribir mundo"</code>,{" "}
                    <code>"poner negrita"</code>. Por dentro, la pila apila los
                    elementos dejando el último siempre encima.
                  </p>
                  <p>
                    Cuando hacemos <code>pop</code>, la pila nos devuelve{" "}
                    <code>"poner negrita"</code> porque es la última que
                    metimos. Si hiciéramos <code>pop</code> otra vez, saldría{" "}
                    <code>"escribir mundo"</code>. Exactamente como el Ctrl+Z
                    del editor de texto.
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
                  Las pilas también son la base interna de muchas estructuras y
                  algoritmos — por ejemplo, DFS recursivo usa la call stack del
                  lenguaje, y DFS iterativo usa una pila explícita.
                </>
              ),
            },
          ]}
          preguntas={[
            "¿Qué significa que una pila sea una estructura LIFO?",
            "En el ejemplo de los platos del restaurante, ¿por qué no se toma el plato del fondo?",
            "¿Cuáles son las dos operaciones principales de una pila?",
            "¿Qué hace la operación push?",
            "¿Qué hace la operación pop?",
            'Si agregamos en este orden: "A", "B", "C", ¿qué elemento sale primero al hacer pop?',
            "¿Por qué el botón Ctrl+Z funciona utilizando una pila?",
            "¿Cómo usa el navegador web las pilas cuando presionamos Atrás?",
            "¿Qué es el call stack en programación?",
            "¿Qué provoca el error Stack Overflow?",
            "¿Por qué las pilas son útiles para validar paréntesis en expresiones matemáticas?",
            "En el ejemplo del editor de texto, ¿qué elemento se devuelve primero al hacer pop?",
          ]}
          ejercicio={{
            descripcion: (
              <>
                Implementá un historial de acciones de un editor de texto
                simple, igual que el Ctrl+Z.
              </>
            ),
            codigo: `class Stack:
    def __init__(self):
        self.pila = []

    # 1. Agregá un elemento encima de la pila.
    def push(self, valor):
        # tu código acá
        pass

    # 2. Sacá y devolvé el elemento de arriba.
    #    Si la pila está vacía, devolvé None en lugar de lanzar un error.
    def pop(self):
        # tu código acá
        pass

    # 3. Mirá el elemento de arriba sin sacarlo.
    #    Esto se llama "peek" y es útil para consultar sin modificar la pila.
    def peek(self):
        # tu código acá
        pass

    # 4. Devolvé True si la pila está vacía, False si no.
    def esta_vacia(self):
        # tu código acá
        pass


# Usá el stack así:
editor = Stack()
editor.push("escribir hola")
editor.push("escribir mundo")
editor.push("poner negrita")

print(editor.peek())        # poner negrita  (no se saca, solo se mira)
print(editor.pop())         # poner negrita  (se deshace)
print(editor.pop())         # escribir mundo (se deshace)
print(editor.esta_vacia())  # False
print(editor.pop())         # escribir hola  (se deshace)
print(editor.esta_vacia())  # True
print(editor.pop())         # None (pila vacía, no explota)
`,
          }}
        />
        )}
      </div>
    </div>
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

function EditorDemo() {
  const steps = useMemo(() => generateEditorHistorySteps(), []);
  return (
    <AlgorithmPlayer
      code={EDITOR_HISTORY_CODE}
      steps={steps}
      title="Editor de texto con Ctrl+Z (push / pop / peek)"
      renderVisualization={(step) => <StackView state={step.state} />}
    />
  );
}
