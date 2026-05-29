"use client";

import { useMemo, useState } from "react";
import { ArrowDownToLine, BookOpen, List, Trash2 } from "lucide-react";
import { AlgorithmPlayer } from "@/components/AlgorithmPlayer";
import { ResizableTopicShell } from "@/components/ResizableTopicShell";
import { Teoria } from "@/components/Teoria";
import { LinkedList } from "@/components/algorithms/LinkedList";
import {
  TRAVERSE_CODE,
  generateTraverseSteps,
} from "@/lib/algorithms/linked-list/traverse";
import {
  INSERT_HEAD_CODE,
  generateInsertHeadSteps,
} from "@/lib/algorithms/linked-list/insertHead";
import {
  REMOVE_CODE,
  generateRemoveSteps,
} from "@/lib/algorithms/linked-list/remove";

type DemoKey = "teoria" | "recorrer" | "insertar" | "eliminar";

const TRAVERSE_VALUES = [3, 7, 1, 9];
const INSERT_INITIAL = [3, 7, 1];
const REMOVE_VALUES = [3, 7, 1, 9, 4];

export default function ListasEnlazadasPage() {
  const [demo, setDemo] = useState<DemoKey>("teoria");
  const [newValue, setNewValue] = useState(5);
  const [removeTarget, setRemoveTarget] = useState(1);

  const header = (
    <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <List className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Tema
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Listas enlazadas
            </h1>
            <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
              A diferencia de los arreglos, los nodos no son contiguos en
              memoria: cada uno guarda su valor y una referencia al siguiente.
              Insertar y eliminar es <span className="font-mono">O(1)</span>{" "}
              <em>si</em> tenés el nodo predecesor.
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
              active={demo === "recorrer"}
              onClick={() => setDemo("recorrer")}
              icon={<List className="h-3.5 w-3.5" />}
            >
              Recorrido
            </TabButton>
            <TabButton
              active={demo === "insertar"}
              onClick={() => setDemo("insertar")}
              icon={<ArrowDownToLine className="h-3.5 w-3.5" />}
            >
              Insertar al inicio
            </TabButton>
            <TabButton
              active={demo === "eliminar"}
              onClick={() => setDemo("eliminar")}
              icon={<Trash2 className="h-3.5 w-3.5" />}
            >
              Eliminar
            </TabButton>
          </div>

          {demo === "insertar" && (
            <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-mono">valor =</span>
              <input
                type="number"
                value={newValue}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (!Number.isNaN(v)) setNewValue(v);
                }}
                className="w-16 rounded-md border border-zinc-200 bg-white px-2 py-1 font-mono text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </label>
          )}

          {demo === "eliminar" && (
            <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-mono">objetivo =</span>
              <select
                value={removeTarget}
                onChange={(e) => setRemoveTarget(Number(e.target.value))}
                className="rounded-md border border-zinc-200 bg-white px-2 py-1 font-mono text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                {REMOVE_VALUES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
                <option value={99}>99 (no existe)</option>
              </select>
            </label>
          )}
        </div>
    </header>
  );

  return (
    <ResizableTopicShell header={header}>
      {demo === "teoria" && <ListasTeoria />}
      {demo === "recorrer" && <RecorrerDemo />}
      {demo === "insertar" && (
        <InsertarDemo key={`i-${newValue}`} newValue={newValue} />
      )}
      {demo === "eliminar" && (
        <EliminarDemo key={`e-${removeTarget}`} target={removeTarget} />
      )}
    </ResizableTopicShell>
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

function ListasTeoria() {
  return (
    <Teoria
      resumen={
        <>
          Cuando eras niño seguramente jugaste a la búsqueda del tesoro. La
          primera pista te decía "Ve al árbol". En el árbol había otra pista:
          "Ve a la cocina". <strong>Cada pista solo sabe dónde está la
          siguiente.</strong> No puedes saltar a la pista cinco directamente.
          Eso es una lista enlazada.
        </>
      }
      lectura={[
        {
          titulo: "¿Qué es una referencia?",
          contenido: (
            <>
              <p>
                Una referencia es básicamente una dirección que te dice "el
                siguiente dato está acá en la memoria del ordenador". Pensalo
                como el número de una casa: si yo te doy el número y la calle,
                podés llegar aunque estés del otro lado de la ciudad. La
                referencia no es mi casa, es la <em>dirección</em> que te lleva
                a ella.
              </p>
              <p>
                Cuando un nodo tiene una referencia a otro, significa que
                guarda la dirección de memoria de ese otro nodo, no almacena el
                nodo vecino completo. Eso es mucho más eficiente porque no
                duplica información.
              </p>
            </>
          ),
        },
        {
          titulo: "Estructura de un nodo",
          contenido: (
            <>
              <p>
                En una lista enlazada, cada elemento se llama <em>nodo</em> y
                cada nodo guarda dos cosas:
              </p>
              <ul className="ml-5 list-disc space-y-1">
                <li>
                  El <strong>valor</strong> (lo que querés guardar).
                </li>
                <li>
                  Una <strong>referencia al siguiente</strong> nodo.
                </li>
              </ul>
              <p>
                El último apunta a <code>null</code>, y ahí termina la lista.
              </p>
            </>
          ),
        },
        {
          titulo: "Inserción: la magia de las referencias",
          contenido: (
            <>
              <p>
                Si querés meter un nodo nuevo entre dos existentes, solo
                cambiás dos referencias. El nodo anterior ahora apunta al
                nuevo, y el nuevo apunta al que seguía. <strong>No moviste un
                solo dato.</strong>
              </p>
              <p>
                Meter un nodo en una lista de 1 millón de elementos toma lo
                mismo que meterlo en una de tres — siempre <code>O(1)</code> si
                ya tenés el predecesor.
              </p>
            </>
          ),
        },
        {
          titulo: "La desventaja: la búsqueda",
          contenido: (
            <>
              <p>
                Si querés el elemento número 500, tenés que ir nodo por nodo
                desde el principio siguiendo las referencias. No hay atajo
                directo como en el array — es <code>O(n)</code>.
              </p>
              <p>
                Usala cuando insertás y eliminás constantemente, pero no
                necesitás buscar elementos por posiciones específicas.
              </p>
            </>
          ),
        },
        {
          titulo: "Base de otras estructuras",
          contenido: (
            <>
              <p>
                Las listas enlazadas son la base para construir{" "}
                <strong>pilas</strong> y <strong>colas</strong>, que por dentro
                las usan.
              </p>
            </>
          ),
        },
      ]}
      preguntas={[
        "¿Qué diferencia hay entre guardar un nodo completo dentro de otro nodo y guardar una referencia? ¿Por qué la referencia es más eficiente?",
        "Tenés una lista enlazada de 1 millón de nodos. Querés insertar un nodo nuevo entre el nodo 500.000 y el 500.001. ¿Cuántos datos se mueven? ¿Qué cambia exactamente?",
        "Tenés la misma lista de 1 millón de nodos. Querés acceder al elemento número 750.000. ¿Qué tiene que hacer la computadora? Comparalo con lo que haría un array.",
        "¿Por qué el último nodo apunta a null? ¿Qué pasaría si no lo hiciera?",
        "El método agregar_al_inicio() funciona igual de rápido con 0 nodos que con 1 millón. ¿Por qué? ¿Qué operaciones hace exactamente?",
        "¿En qué caso elegirías una lista enlazada sobre un array y en cuál elegirías un array sobre una lista enlazada?",
      ]}
      ejercicio={{
        descripcion: (
          <>
            Tenés una playlist de radio en vivo donde las canciones se agregan
            constantemente al principio (la más reciente siempre va primera) y
            necesitás recorrerla para mostrar el historial.
          </>
        ),
        codigo: `class Nodo:
    def __init__(self, valor):
        self.valor = valor
        self.siguiente = None


class ListaEnlazada:
    def __init__(self):
        self.cabeza = None

    def agregar_al_inicio(self, valor):
        nuevo = Nodo(valor)
        nuevo.siguiente = self.cabeza
        self.cabeza = nuevo

    # 1. Imprimí todos los valores desde la cabeza hasta el último nodo.
    #    Pista: usá un while y seguí las referencias.
    def recorrer(self):
        # tu código acá
        pass

    # 2. Devolvé cuántos nodos tiene la lista.
    #    No podés usar len() — contá uno por uno.
    #    (¿Qué dice eso sobre el costo de esta operación?)
    def contar_nodos(self):
        # tu código acá
        pass

    # 3. Insertá un nodo nuevo en la posición indicada.
    #    Ejemplo: insertar_en(2, "Canción X") la pone en posición 2.
    #    Pensá cuántas referencias cambian antes de escribir.
    def insertar_en(self, indice, valor):
        # tu código acá
        pass


# Usá la lista así:
historial = ListaEnlazada()
historial.agregar_al_inicio("Bohemian Rhapsody")
historial.agregar_al_inicio("Stairway to Heaven")
historial.agregar_al_inicio("Hotel California")

# Después de implementar los métodos:
historial.recorrer()
# Esperado: Hotel California → Stairway to Heaven → Bohemian Rhapsody

print(historial.contar_nodos())  # Esperado: 3

historial.insertar_en(1, "Imagine")
historial.recorrer()
# Esperado: Hotel California → Imagine → Stairway to Heaven → Bohemian Rhapsody
`,
      }}
    />
  );
}

function RecorrerDemo() {
  const steps = useMemo(() => generateTraverseSteps(TRAVERSE_VALUES), []);
  return (
    <AlgorithmPlayer
      code={TRAVERSE_CODE}
      steps={steps}
      title={`recorrer(cabeza) — lista: [${TRAVERSE_VALUES.join(" → ")}]`}
      renderVisualization={(step) => <LinkedList state={step.state} />}
    />
  );
}

function InsertarDemo({ newValue }: { newValue: number }) {
  const steps = useMemo(
    () => generateInsertHeadSteps(INSERT_INITIAL, newValue),
    [newValue],
  );
  return (
    <AlgorithmPlayer
      code={INSERT_HEAD_CODE}
      steps={steps}
      title={`insertar_al_inicio(cabeza, ${newValue})`}
      renderVisualization={(step) => <LinkedList state={step.state} />}
    />
  );
}

function EliminarDemo({ target }: { target: number }) {
  const steps = useMemo(
    () => generateRemoveSteps(REMOVE_VALUES, target),
    [target],
  );
  return (
    <AlgorithmPlayer
      code={REMOVE_CODE}
      steps={steps}
      title={`eliminar(cabeza, objetivo=${target})`}
      renderVisualization={(step) => <LinkedList state={step.state} />}
    />
  );
}
