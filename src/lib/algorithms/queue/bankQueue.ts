import type { Step, WatchEntry } from "@/lib/types";
import type { QueueItem, QueueState } from "./types";

export const BANK_QUEUE_CODE = `from collections import deque

class Cola:
    def __init__(self):
        self.queue = deque()

    def encolar(self, cliente):
        self.queue.append(cliente)

    def desencolar(self):
        if not self.queue:
            return None
        return self.queue.popleft()

    def proximo(self):
        if not self.queue:
            return None
        return self.queue[0]

    def cantidad_esperando(self):
        return len(self.queue)


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
`;

type Op =
  | { kind: "enqueue"; value: string; codeLine: number; note: string }
  | { kind: "dequeue"; codeLine: number; note: string }
  | { kind: "peek"; codeLine: number; note: string }
  | { kind: "size"; codeLine: number; note: string };

const SCRIPT: Op[] = [
  {
    kind: "enqueue",
    value: "Ana",
    codeLine: 26,
    note: 'encolar("Ana") — Ana entra al banco, va al fondo (que está vacío, queda primera).',
  },
  {
    kind: "enqueue",
    value: "Luis",
    codeLine: 27,
    note: 'encolar("Luis") — Luis se pone detrás de Ana.',
  },
  {
    kind: "enqueue",
    value: "María",
    codeLine: 28,
    note: 'encolar("María") — María se pone detrás de Luis.',
  },
  {
    kind: "peek",
    codeLine: 30,
    note: "proximo() — ¿quién sigue? Ana, pero no la atendemos todavía.",
  },
  {
    kind: "size",
    codeLine: 31,
    note: "cantidad_esperando() — hay 3 personas esperando.",
  },
  {
    kind: "dequeue",
    codeLine: 32,
    note: "desencolar() — atendemos a la primera en llegar: Ana.",
  },
  {
    kind: "dequeue",
    codeLine: 33,
    note: "desencolar() — sigue Luis. FIFO se respeta sin excepciones.",
  },
  {
    kind: "size",
    codeLine: 34,
    note: "cantidad_esperando() — queda solo 1 persona (María).",
  },
  {
    kind: "enqueue",
    value: "Pedro",
    codeLine: 35,
    note: 'encolar("Pedro") — llega Pedro, va al fondo (detrás de María).',
  },
  {
    kind: "size",
    codeLine: 36,
    note: "cantidad_esperando() — ahora hay 2: María y Pedro.",
  },
  {
    kind: "dequeue",
    codeLine: 37,
    note: "desencolar() — atendemos a María (llegó antes que Pedro).",
  },
  {
    kind: "dequeue",
    codeLine: 38,
    note: "desencolar() — atendemos a Pedro.",
  },
  {
    kind: "dequeue",
    codeLine: 39,
    note: "desencolar() en cola vacía — devuelve None, no explota.",
  },
];

export function generateBankQueueSteps(): Step<QueueState>[] {
  const steps: Step<QueueState>[] = [];
  let items: QueueItem[] = [];
  let nextId = 0;

  function snap(
    line: number,
    note: string,
    extras: Partial<QueueState> = {},
    watch?: WatchEntry[],
  ) {
    steps.push({
      state: { items: [...items], ...extras },
      line,
      note,
      watch,
    });
  }

  snap(23, "Banco recién abrió. La cola arranca vacía.", { isEmpty: true });

  for (const op of SCRIPT) {
    if (op.kind === "enqueue") {
      const id = `c${nextId++}`;
      snap(
        op.codeLine,
        op.note,
        {
          operation: "enqueue",
          flying: { id, value: op.value },
        },
        [
          { name: "cliente", value: `"${op.value}"`, kind: "input", changed: true },
          { name: "len(queue)", value: String(items.length), kind: "computed" },
        ],
      );
      items.push({ id, value: op.value });
      snap(
        op.codeLine,
        `${op.value} ahora está al fondo. Esperan ${items.length} persona${items.length === 1 ? "" : "s"}.`,
        { operation: "enqueue", newId: id },
        [
          { name: "len(queue)", value: String(items.length), kind: "computed", changed: true },
          { name: "frente", value: `"${items[0].value}"`, kind: "computed" },
          { name: "fondo", value: `"${items[items.length - 1].value}"`, kind: "computed" },
        ],
      );
    } else if (op.kind === "dequeue") {
      if (items.length === 0) {
        snap(
          op.codeLine,
          "Cola vacía → devuelvo None.",
          { operation: "dequeue", returned: null, isEmpty: true },
          [
            { name: "len(queue)", value: "0", kind: "computed" },
            { name: "return", value: "None", kind: "output", changed: true },
          ],
        );
        continue;
      }
      const front = items[0];
      snap(
        op.codeLine,
        `Atiendo al frente: ${front.value}.`,
        { operation: "dequeue", highlightId: front.id },
        [
          { name: "frente", value: `"${front.value}"`, kind: "computed", changed: true },
          { name: "len(queue)", value: String(items.length), kind: "computed" },
        ],
      );
      items = items.slice(1);
      snap(
        op.codeLine,
        `desencolar devolvió "${front.value}". Quedan ${items.length}.`,
        {
          operation: "dequeue",
          flying: { id: front.id, value: front.value },
          returned: front.value,
          isEmpty: items.length === 0,
        },
        [
          {
            name: "return",
            value: `"${front.value}"`,
            kind: "output",
            changed: true,
          },
          { name: "len(queue)", value: String(items.length), kind: "computed", changed: true },
        ],
      );
    } else if (op.kind === "peek") {
      if (items.length === 0) {
        snap(
          op.codeLine,
          "Cola vacía → próximo() devuelve None.",
          { operation: "peek", returned: null, isEmpty: true },
          [{ name: "return", value: "None", kind: "output", changed: true }],
        );
        continue;
      }
      const front = items[0];
      snap(
        op.codeLine,
        `proximo() mira a ${front.value} sin sacarla.`,
        {
          operation: "peek",
          highlightId: front.id,
          returned: front.value,
        },
        [
          { name: "return", value: `"${front.value}"`, kind: "output", changed: true },
          { name: "len(queue)", value: String(items.length), kind: "computed" },
        ],
      );
    } else if (op.kind === "size") {
      snap(
        op.codeLine,
        `cantidad_esperando() = ${items.length}.`,
        {
          operation: "size-check",
          returned: String(items.length),
          isEmpty: items.length === 0,
        },
        [
          {
            name: "return",
            value: String(items.length),
            kind: "output",
            changed: true,
          },
        ],
      );
    }
  }

  return steps;
}
