import type { Step, WatchEntry } from "@/lib/types";
import type { StackItem, StackState } from "./types";

export const EDITOR_HISTORY_CODE = `class Stack:
    def __init__(self):
        self.pila = []

    def push(self, valor):
        self.pila.append(valor)

    def pop(self):
        if not self.pila:
            return None
        return self.pila.pop()

    def peek(self):
        if not self.pila:
            return None
        return self.pila[-1]

    def esta_vacia(self):
        return len(self.pila) == 0


editor = Stack()
editor.push("escribir hola")
editor.push("escribir mundo")
editor.push("poner negrita")

print(editor.peek())        # poner negrita
print(editor.pop())         # poner negrita
print(editor.pop())         # escribir mundo
print(editor.esta_vacia())  # False
print(editor.pop())         # escribir hola
print(editor.esta_vacia())  # True
print(editor.pop())         # None (vacía, no explota)
`;

type Op =
  | { kind: "push"; value: string; codeLine: number; note: string }
  | { kind: "pop"; codeLine: number; note: string; expected?: string | null }
  | { kind: "peek"; codeLine: number; note: string }
  | { kind: "esta_vacia"; codeLine: number; note: string };

const SCRIPT: Op[] = [
  {
    kind: "push",
    value: "escribir hola",
    codeLine: 23,
    note: 'push("escribir hola") — primera acción del editor.',
  },
  {
    kind: "push",
    value: "escribir mundo",
    codeLine: 24,
    note: 'push("escribir mundo") — segunda acción, va arriba.',
  },
  {
    kind: "push",
    value: "poner negrita",
    codeLine: 25,
    note: 'push("poner negrita") — tercera acción, queda en el tope.',
  },
  {
    kind: "peek",
    codeLine: 27,
    note: "peek() — miro el tope sin sacarlo.",
  },
  {
    kind: "pop",
    codeLine: 28,
    note: "pop() — deshago la última acción (Ctrl+Z).",
    expected: "poner negrita",
  },
  {
    kind: "pop",
    codeLine: 29,
    note: "pop() otra vez — sale el último que queda arriba.",
    expected: "escribir mundo",
  },
  {
    kind: "esta_vacia",
    codeLine: 30,
    note: "esta_vacia() — todavía queda algo, debe dar False.",
  },
  {
    kind: "pop",
    codeLine: 31,
    note: "pop() — saco el último elemento.",
    expected: "escribir hola",
  },
  {
    kind: "esta_vacia",
    codeLine: 32,
    note: "esta_vacia() — ahora sí está vacía, debe dar True.",
  },
  {
    kind: "pop",
    codeLine: 33,
    note: "pop() en pila vacía — la implementación devuelve None, no explota.",
    expected: null,
  },
];

export function generateEditorHistorySteps(): Step<StackState>[] {
  const steps: Step<StackState>[] = [];
  let items: StackItem[] = [];
  let nextId = 0;

  function snap(
    line: number,
    note: string,
    extras: Partial<StackState> = {},
    watch?: WatchEntry[],
  ) {
    steps.push({
      state: {
        items: [...items],
        ...extras,
      },
      line,
      note,
      watch,
    });
  }

  snap(20, "Creo una pila vacía. self.pila = [].", { isEmpty: true });

  for (const op of SCRIPT) {
    if (op.kind === "push") {
      const id = `i${nextId++}`;
      // Mostrar valor "en vuelo" antes de empujarlo
      snap(
        op.codeLine,
        op.note,
        {
          operation: "push",
          flying: { id, value: op.value },
        },
        [
          { name: "valor", value: `"${op.value}"`, kind: "input", changed: true },
          { name: "len(pila)", value: String(items.length), kind: "computed" },
        ],
      );
      items.push({ id, value: op.value });
      snap(
        op.codeLine,
        `"${op.value}" queda en el tope. Tamaño: ${items.length}.`,
        {
          operation: "push",
          newId: id,
        },
        [
          { name: "len(pila)", value: String(items.length), kind: "computed", changed: true },
          { name: "tope", value: `"${op.value}"`, kind: "computed" },
        ],
      );
    } else if (op.kind === "pop") {
      if (items.length === 0) {
        snap(
          op.codeLine,
          "La pila está vacía → devuelvo None sin tocar nada.",
          { operation: "pop", returned: null, isEmpty: true },
          [
            { name: "len(pila)", value: "0", kind: "computed" },
            { name: "return", value: "None", kind: "output", changed: true },
          ],
        );
        continue;
      }
      const top = items[items.length - 1];
      // Resaltar el tope antes de sacarlo
      snap(
        op.codeLine,
        `Miro el tope para sacarlo: "${top.value}".`,
        {
          operation: "pop",
          highlightId: top.id,
        },
        [
          { name: "tope", value: `"${top.value}"`, kind: "computed", changed: true },
          { name: "len(pila)", value: String(items.length), kind: "computed" },
        ],
      );
      // Sacarlo — queda volando arriba para mostrar la salida
      const removed = items[items.length - 1];
      items = items.slice(0, -1);
      snap(
        op.codeLine,
        `pop devuelve "${removed.value}". Tamaño: ${items.length}.`,
        {
          operation: "pop",
          flying: { id: removed.id, value: removed.value },
          returned: removed.value,
          isEmpty: items.length === 0,
        },
        [
          {
            name: "return",
            value: `"${removed.value}"`,
            kind: "output",
            changed: true,
          },
          { name: "len(pila)", value: String(items.length), kind: "computed", changed: true },
        ],
      );
    } else if (op.kind === "peek") {
      if (items.length === 0) {
        snap(
          op.codeLine,
          "peek en pila vacía → None.",
          { operation: "peek", returned: null, isEmpty: true },
          [{ name: "return", value: "None", kind: "output", changed: true }],
        );
        continue;
      }
      const top = items[items.length - 1];
      snap(
        op.codeLine,
        `peek mira "${top.value}" sin sacarlo. Tamaño sigue ${items.length}.`,
        {
          operation: "peek",
          highlightId: top.id,
          returned: top.value,
        },
        [
          {
            name: "return",
            value: `"${top.value}"`,
            kind: "output",
            changed: true,
          },
          { name: "len(pila)", value: String(items.length), kind: "computed" },
        ],
      );
    } else if (op.kind === "esta_vacia") {
      const empty = items.length === 0;
      snap(
        op.codeLine,
        `esta_vacia() = ${empty ? "True" : "False"} (len = ${items.length}).`,
        { operation: "empty-check", returned: empty ? "True" : "False", isEmpty: empty },
        [
          { name: "len(pila)", value: String(items.length), kind: "computed" },
          {
            name: "return",
            value: empty ? "True" : "False",
            kind: "output",
            changed: true,
          },
        ],
      );
    }
  }

  return steps;
}
