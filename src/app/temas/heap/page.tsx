"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  HeartPulse,
  Plus,
  Trash2,
  Triangle,
} from "lucide-react";
import { AlgorithmPlayer } from "@/components/AlgorithmPlayer";
import { ResizableTopicShell } from "@/components/ResizableTopicShell";
import { Teoria } from "@/components/Teoria";
import { HeapView } from "@/components/algorithms/HeapView";
import {
  HEAP_PUSH_CODE,
  generateHeapInsertSteps,
} from "@/lib/algorithms/heap/insert";
import {
  HEAP_POP_CODE,
  generateHeapPopSteps,
} from "@/lib/algorithms/heap/extract";
import {
  EMERGENCY_ROOM_CODE,
  generateEmergencyRoomSteps,
} from "@/lib/algorithms/heap/emergencyRoom";

type DemoKey = "teoria" | "insert" | "pop" | "er";

export default function HeapPage() {
  const [demo, setDemo] = useState<DemoKey>("teoria");

  const header = (
    <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <Triangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Tema
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Heap (Cola de prioridad)
            </h1>
            <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
              Un árbol especial con una regla mágica: el elemento de{" "}
              <strong>mayor prioridad siempre está en la raíz</strong>. No se
              atiende por orden de llegada, se atiende por urgencia.
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
              active={demo === "insert"}
              onClick={() => setDemo("insert")}
              icon={<Plus className="h-3.5 w-3.5" />}
            >
              Insertar (bubble-up)
            </TabButton>
            <TabButton
              active={demo === "pop"}
              onClick={() => setDemo("pop")}
              icon={<Trash2 className="h-3.5 w-3.5" />}
            >
              Extraer (bubble-down)
            </TabButton>
            <TabButton
              active={demo === "er"}
              onClick={() => setDemo("er")}
              icon={<HeartPulse className="h-3.5 w-3.5" />}
            >
              Sala de urgencias
            </TabButton>
          </div>
        </div>
    </header>
  );

  return (
    <ResizableTopicShell header={header}>
      {demo === "insert" && <InsertDemo />}
      {demo === "pop" && <PopDemo />}
      {demo === "er" && <ErDemo />}
      {demo === "teoria" && (
        <Teoria
          resumen={
            <>
              En la sala de urgencias de un hospital llega un señor con dolor
              de cabeza, una señora con fractura y un joven con infarto.{" "}
              <strong>¿A quién atienden primero?</strong> Al del infarto, obvio
              — aunque haya llegado último.
            </>
          }
          lectura={[
            {
              titulo: "La regla mágica",
              contenido: (
                <>
                  <p>
                    No se atiende por orden de llegada, se atiende por{" "}
                    <em>gravedad</em>. Siempre el más urgente primero. Eso es
                    un <strong>heap</strong>.
                  </p>
                  <p>
                    Técnicamente es un árbol especial con una regla muy
                    estricta: el elemento de mayor prioridad{" "}
                    <strong>siempre está en la raíz</strong>. Cuando metés o
                    sacás elementos, el heap reorganiza automáticamente el
                    árbol para mantener esa regla.
                  </p>
                </>
              ),
            },
            {
              titulo: "¿Por qué no ordenar toda la lista?",
              contenido: (
                <>
                  <p>
                    Porque ordenar todo cada vez que entra un elemento nuevo es
                    carísimo (<code>O(n log n)</code>). El heap solo reorganiza{" "}
                    <strong>lo mínimo necesario</strong> para garantizar que el
                    de arriba siga siendo el correcto. Insertar y sacar es{" "}
                    <code>O(log n)</code>, y mirar el de arriba sin sacarlo es{" "}
                    <code>O(1)</code>.
                  </p>
                </>
              ),
            },
            {
              titulo: "¿Dónde se usa en la vida real?",
              contenido: (
                <>
                  <p>
                    <strong>Google Maps y Waze</strong> usan heaps en el
                    algoritmo de Dijkstra para encontrar la ruta más corta
                    entre dos puntos. El sistema operativo usa heaps para
                    decidir qué proceso ejecutar primero.
                  </p>
                  <p>
                    Los sistemas que te muestran el top 10 de algo —rankings
                    de un videojuego, noticias más populares— usan heaps. Los
                    servidores de correo ordenan mensajes por prioridad.
                  </p>
                  <p>
                    Y el algoritmo de compresión de <strong>Huffman</strong>,
                    que se usa en formatos como ZIP y JPG, construye un árbol
                    óptimo usando un heap.
                  </p>
                </>
              ),
            },
            {
              titulo: "Ejemplo en código",
              contenido: (
                <>
                  <p>
                    Creamos un heap vacío de la librería <code>heapq</code> y
                    metemos cuatro pacientes con su nivel de prioridad, donde 1
                    es más urgente y 5 menos. Fíjate que los metemos{" "}
                    <em>en desorden a propósito</em>: dolor de cabeza con
                    prioridad 3, después infarto con prioridad 1, fractura con
                    prioridad 2, y resfriado con 5.
                  </p>
                  <p>
                    Pero cuando empezamos a sacarlos uno por uno, el heap los
                    entrega en el orden correcto de urgencia: primero infarto,
                    después fractura, después dolor de cabeza, al final
                    resfriado. <strong>Nunca lo ordenamos nosotros</strong>;
                    el heap lo hace solo cada vez que metemos o sacamos.
                  </p>
                </>
              ),
            },
          ]}
          callouts={[
            {
              tipo: "atencion",
              texto: (
                <>
                  Python's <code>heapq</code> implementa un{" "}
                  <strong>min-heap</strong>: el número más chico sale primero.
                  Si necesitás un max-heap, un truco común es guardar valores{" "}
                  <em>negados</em> y volver a negar al sacar.
                </>
              ),
            },
          ]}
          preguntas={[
            "¿Qué diferencia hay entre una cola normal (FIFO) y un heap? ¿Por qué la sala de urgencias no puede usar una cola normal?",
            "¿Por qué el heap no ordena todos los elementos, solo reorganiza lo mínimo necesario? ¿Qué ventaja tiene eso frente a ordenar una lista completa cada vez?",
            "En Python, heapq implementa un min-heap: el número más pequeño sale primero. En el ejemplo de urgencias, prioridad 1 es la más urgente. ¿Qué tendrías que cambiar si quisieras que prioridad 5 fuera la más urgente?",
            "¿Por qué Google Maps usa un heap en el algoritmo de Dijkstra? ¿Qué representa el elemento de mayor prioridad en ese contexto?",
            "¿Qué tienen en común la sala de urgencias, el sistema operativo eligiendo procesos y el ranking de un videojuego? ¿Qué problema resuelven todos con un heap?",
          ]}
          ejercicio={{
            descripcion: (
              <>Simulá el sistema de triaje de una sala de urgencias.</>
            ),
            codigo: `import heapq

class SalaUrgencias:
    def __init__(self):
        self.heap = []

    # 1. Agregá un paciente al heap.
    #    Cada paciente es una tupla (prioridad, nombre).
    #    Recordá: prioridad 1 = más urgente, 5 = menos urgente.
    def agregar_paciente(self, nombre, prioridad):
        # tu código acá
        pass

    # 2. Atendé y devolvé el paciente más urgente.
    #    Si no hay pacientes, devolvé None.
    def atender(self):
        # tu código acá
        pass

    # 3. Mirá quién es el próximo sin atenderlo todavía.
    #    Si no hay pacientes, devolvé None.
    def proximo(self):
        # tu código acá
        pass

    # 4. Devolvé cuántos pacientes están esperando.
    def cantidad_esperando(self):
        # tu código acá
        pass


# Usá la sala así:
sala = SalaUrgencias()
sala.agregar_paciente("Dolor de cabeza", 3)
sala.agregar_paciente("Infarto",         1)
sala.agregar_paciente("Fractura",        2)
sala.agregar_paciente("Resfriado",       5)

print("Próximo:", sala.proximo())              # Infarto
print("Esperando:", sala.cantidad_esperando()) # 4

print(sala.atender())   # Infarto
print(sala.atender())   # Fractura
print(sala.atender())   # Dolor de cabeza
print(sala.atender())   # Resfriado
print(sala.atender())   # None
`,
          }}
        />
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

function InsertDemo() {
  const steps = useMemo(
    () => generateHeapInsertSteps([3, 7, 5, 12, 9], [2, 4, 1]),
    [],
  );
  return (
    <AlgorithmPlayer
      code={HEAP_PUSH_CODE}
      steps={steps}
      title="heappush(heap, valor) — bubble-up"
      renderVisualization={(step) => <HeapView state={step.state} />}
    />
  );
}

function PopDemo() {
  const steps = useMemo(() => generateHeapPopSteps([2, 7, 3, 12, 9, 5], 3), []);
  return (
    <AlgorithmPlayer
      code={HEAP_POP_CODE}
      steps={steps}
      title="heappop(heap) — extraer mínimo (bubble-down)"
      renderVisualization={(step) => <HeapView state={step.state} />}
    />
  );
}

function ErDemo() {
  const steps = useMemo(() => generateEmergencyRoomSteps(), []);
  return (
    <AlgorithmPlayer
      code={EMERGENCY_ROOM_CODE}
      steps={steps}
      title="Sala de urgencias — atender por gravedad (menor = más urgente)"
      renderVisualization={(step) => <HeapView state={step.state} />}
    />
  );
}
