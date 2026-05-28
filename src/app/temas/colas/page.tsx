"use client";

import { useMemo, useState } from "react";
import { BookOpen, Building2, Inbox } from "lucide-react";
import { AlgorithmPlayer } from "@/components/AlgorithmPlayer";
import { Teoria } from "@/components/Teoria";
import { QueueView } from "@/components/algorithms/QueueView";
import {
  BANK_QUEUE_CODE,
  generateBankQueueSteps,
} from "@/lib/algorithms/queue/bankQueue";

type DemoKey = "teoria" | "banco";

export default function ColasPage() {
  const [demo, setDemo] = useState<DemoKey>("teoria");

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <Inbox className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Tema
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Colas (Queue)
            </h1>
            <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
              Estructura <strong>FIFO</strong> (First In, First Out). Justicia
              pura: el primero que llega es el primero que sale. Es el opuesto
              exacto de la pila.
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
              active={demo === "banco"}
              onClick={() => setDemo("banco")}
              icon={<Building2 className="h-3.5 w-3.5" />}
            >
              Cola del banco
            </TabButton>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1">
        {demo === "banco" && <BancoDemo />}
        {demo === "teoria" && (
          <Teoria
          resumen={
            <>
              Como la fila del banco un viernes a fin de mes: el primero que
              llega es el primero que atienden.{" "}
              <strong>Nada de colarse.</strong>
            </>
          }
          lectura={[
            {
              titulo: "Las dos operaciones",
              contenido: (
                <>
                  <p>
                    <strong>Encolar (enqueue)</strong>: agregar un elemento al
                    final de la cola.
                  </p>
                  <p>
                    <strong>Desencolar (dequeue)</strong>: sacar el elemento
                    del principio.
                  </p>
                  <p>
                    Siempre se respeta el orden de llegada, sin excepciones. A
                    eso le llamamos <strong>FIFO</strong>: First In, First Out.
                  </p>
                </>
              ),
            },
            {
              titulo: "¿Dónde has usado colas sin darte cuenta?",
              contenido: (
                <>
                  <p>
                    La <em>cola de impresión</em>: el primer documento que
                    mandaste a la impresora es el primero que sale.
                  </p>
                  <p>
                    Los mensajes de WhatsApp pendientes cuando no hay señal se
                    envían en orden cuando vuelve la conexión.
                  </p>
                  <p>
                    Los servidores web cuando reciben miles de peticiones al
                    mismo tiempo las organizan con sistemas de colas antes de
                    procesarlas. Los procesos del sistema operativo esperando
                    turno para usar el procesador también.
                  </p>
                </>
              ),
            },
            {
              titulo: "En producción a escala real",
              contenido: (
                <>
                  <p>
                    Los sistemas de mensajería como <strong>RabbitMQ</strong> o{" "}
                    <strong>Kafka</strong>, que usan empresas como Uber y
                    Netflix para manejar millones de eventos por segundo, están
                    construidos alrededor del concepto de cola.
                  </p>
                  <p>
                    También los sistemas de tareas en segundo plano —cuando
                    subís una foto a una app y se procesa después sin bloquear
                    la interfaz— usan colas para manejar el trabajo.
                  </p>
                </>
              ),
            },
            {
              titulo: "Ejemplo en código",
              contenido: (
                <>
                  <p>
                    Creamos una cola vacía con <code>collections.deque</code> y
                    agregamos tres clientes al final: Ana primero, Luis segundo
                    y María tercero. Por dentro, la cola se ve así:{" "}
                    <code>[Ana, Luis, María]</code>.
                  </p>
                  <p>
                    Cuando llamamos a la operación de sacar del principio, nos
                    devuelve <code>Ana</code> porque fue la primera que llegó.
                    Ahora quedan <code>Luis</code> y <code>María</code>, y el
                    siguiente en ser atendido va a ser <code>Luis</code>.
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
                  En Python no usamos una lista normal para una cola:{" "}
                  <code>list.pop(0)</code> es <code>O(n)</code> porque tiene
                  que correr todos los elementos. <code>collections.deque</code>{" "}
                  hace ambas puntas en <code>O(1)</code>.
                </>
              ),
            },
          ]}
          preguntas={[
            "¿Qué significa FIFO y en qué se diferencia fundamentalmente del LIFO del stack? Usá el ejemplo del banco para explicarlo.",
            "¿Por qué Python recomienda usar collections.deque para una cola en lugar de una lista normal? ¿Qué problema tiene la lista cuando sacás elementos del principio?",
            "Describí el estado interno de la cola después de cada operación: encolar(\"Ana\"), encolar(\"Luis\"), encolar(\"María\"), desencolar(), encolar(\"Pedro\").",
            "De los ejemplos de la letra (impresora, WhatsApp, servidores, sistema operativo), elegí uno y explicá con detalle por qué una pila sería un desastre en ese caso.",
            "¿Qué tienen en común RabbitMQ y Kafka con la cola del banco? ¿Qué problema resuelven a escala?",
          ]}
          ejercicio={{
            descripcion: <>Simulá el sistema de atención de un banco.</>,
            codigo: `from collections import deque

class Cola:
    def __init__(self):
        self.queue = deque()

    # 1. Agregá un cliente al final de la cola.
    def encolar(self, cliente):
        # tu código acá
        pass

    # 2. Atendé y devolvé el primer cliente de la cola.
    #    Si está vacía, devolvé None.
    def desencolar(self):
        # tu código acá
        pass

    # 3. Mirá quién es el próximo sin sacarlo.
    def proximo(self):
        # tu código acá
        pass

    # 4. Devolvé cuántas personas están esperando.
    def cantidad_esperando(self):
        # tu código acá
        pass


# Usá la cola así:
banco = Cola()
banco.encolar("Ana")
banco.encolar("Luis")
banco.encolar("María")

print(banco.proximo())              # Ana
print(banco.cantidad_esperando())   # 3
print(banco.desencolar())           # Ana
print(banco.desencolar())           # Luis
print(banco.cantidad_esperando())   # 1
banco.encolar("Pedro")
print(banco.cantidad_esperando())   # 2
print(banco.desencolar())           # María
print(banco.desencolar())           # Pedro
print(banco.desencolar())           # None
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

function BancoDemo() {
  const steps = useMemo(() => generateBankQueueSteps(), []);
  return (
    <AlgorithmPlayer
      code={BANK_QUEUE_CODE}
      steps={steps}
      title="Cola de atención del banco (encolar / desencolar / proximo)"
      renderVisualization={(step) => <QueueView state={step.state} />}
    />
  );
}
