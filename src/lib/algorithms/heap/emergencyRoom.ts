import type { Step, WatchEntry } from "@/lib/types";
import {
  leftIdx,
  parentIdx,
  rightIdx,
  type HeapItem,
  type HeapState,
} from "./types";

export const EMERGENCY_ROOM_CODE = `import heapq

# Sala de urgencias: prioridad = gravedad (1 = más grave, 10 = menos)
# heapq es min-heap → atendemos primero al de menor número.

cola = []
heapq.heappush(cola, (5, "Luis"))   # llega Luis, gravedad 5
heapq.heappush(cola, (8, "Sofía"))  # llega Sofía, gravedad 8
heapq.heappush(cola, (2, "Carlos")) # ¡Carlos llega grave! gravedad 2
heapq.heappush(cola, (6, "María"))  # María, gravedad 6

# Atender uno por uno: siempre sale el de mayor prioridad
while cola:
    gravedad, nombre = heapq.heappop(cola)
    print(f"Atendiendo a {nombre} (gravedad {gravedad})")

# Salida (en este orden):
#   Atendiendo a Carlos (gravedad 2)
#   Atendiendo a Luis   (gravedad 5)
#   Atendiendo a María  (gravedad 6)
#   Atendiendo a Sofía  (gravedad 8)
`;

type Op =
  | { kind: "push"; key: number; label: string; codeLine: number }
  | { kind: "pop"; codeLine: number };

const SCRIPT: Op[] = [
  { kind: "push", key: 5, label: "Luis", codeLine: 7 },
  { kind: "push", key: 8, label: "Sofía", codeLine: 8 },
  { kind: "push", key: 2, label: "Carlos", codeLine: 9 },
  { kind: "push", key: 6, label: "María", codeLine: 10 },
  { kind: "pop", codeLine: 14 },
  { kind: "pop", codeLine: 14 },
  { kind: "pop", codeLine: 14 },
  { kind: "pop", codeLine: 14 },
];

/**
 * Mezcla inserciones y extracciones para mostrar la cola de prioridad
 * funcionando como sala de urgencias. La gravedad es el `key` (menor =
 * más urgente). El `label` es el nombre del paciente.
 */
export function generateEmergencyRoomSteps(): Step<HeapState>[] {
  const steps: Step<HeapState>[] = [];
  const items: HeapItem[] = [];
  let nextId = 0;

  function snap(
    line: number,
    note: string,
    extras: Partial<HeapState> = {},
    watch?: WatchEntry[],
  ) {
    steps.push({
      state: { items: items.map((it) => ({ ...it })), ...extras },
      line,
      note,
      watch,
    });
  }

  snap(5, "Sala de urgencias vacía. Esperando pacientes.");

  for (const op of SCRIPT) {
    if (op.kind === "push") {
      const item: HeapItem = {
        id: `p-${nextId++}-${op.label}`,
        key: op.key,
        label: op.label,
      };

      snap(
        op.codeLine,
        `Llega ${op.label} con gravedad ${op.key}. Lo agrego al final y luego sube.`,
        { operation: "push", flying: item },
        [
          { name: "paciente", value: op.label, kind: "input", changed: true },
          { name: "gravedad", value: String(op.key), kind: "input" },
        ],
      );

      items.push(item);
      let idx = items.length - 1;
      snap(
        op.codeLine,
        `${op.label} entra en el índice ${idx}.`,
        { operation: "push", cursorId: item.id },
      );

      while (idx > 0) {
        const pIdx = parentIdx(idx);
        const child = items[idx];
        const parent = items[pIdx];

        snap(
          op.codeLine,
          `Comparo ${child.label} (g=${child.key}) con padre ${parent.label} (g=${parent.key}).`,
          {
            operation: "bubble-up",
            cursorId: child.id,
            comparing: [child.id, parent.id],
          },
          [
            { name: child.label ?? "hijo", value: String(child.key), kind: "computed", changed: true },
            { name: parent.label ?? "padre", value: String(parent.key), kind: "computed" },
          ],
        );

        if (child.key < parent.key) {
          items[idx] = parent;
          items[pIdx] = child;
          snap(
            op.codeLine,
            `${child.label} es MÁS urgente que ${parent.label} → sube al índice ${pIdx}.`,
            {
              operation: "bubble-up",
              cursorId: child.id,
              swapped: [child.id, parent.id],
            },
          );
          idx = pIdx;
        } else {
          snap(
            op.codeLine,
            `${parent.label} es igual o más urgente que ${child.label} → ${child.label} se queda acá.`,
            {
              operation: "bubble-up",
              cursorId: child.id,
            },
          );
          break;
        }
      }

      if (idx === 0) {
        snap(
          op.codeLine,
          `${op.label} (g=${op.key}) llegó a la raíz: es el más urgente.`,
          { operation: "done", cursorId: items[0].id },
          [
            { name: "más urgente", value: items[0].label ?? "—", kind: "output", changed: true },
          ],
        );
      }
    } else {
      // pop — atender al de mayor prioridad
      if (items.length === 0) {
        snap(op.codeLine, "Sala vacía.", { operation: "done" });
        continue;
      }
      const root = items[0];
      snap(
        op.codeLine,
        `Atender al más urgente: ${root.label} (gravedad ${root.key}).`,
        { operation: "pop", cursorId: root.id, extracted: root },
        [
          {
            name: "atendiendo",
            value: `${root.label} (g=${root.key})`,
            kind: "output",
            changed: true,
          },
        ],
      );

      if (items.length === 1) {
        items.pop();
        snap(op.codeLine, "Sala queda vacía.", {
          operation: "done",
          extracted: root,
        });
        continue;
      }

      const last = items[items.length - 1];
      items[0] = last;
      items.pop();
      snap(
        op.codeLine,
        `Pongo a ${last.label} en la raíz como placeholder. Tiene que bajar a su lugar.`,
        {
          operation: "bubble-down",
          cursorId: last.id,
          movingFromBottomId: last.id,
          extracted: root,
        },
      );

      let idx = 0;
      while (true) {
        const l = leftIdx(idx);
        const r = rightIdx(idx);
        if (l >= items.length) break;

        const cur = items[idx];
        const left = items[l];
        const right = r < items.length ? items[r] : null;
        let smaller = left;
        let smallerIdx = l;
        if (right && right.key < left.key) {
          smaller = right;
          smallerIdx = r;
        }

        snap(
          op.codeLine,
          right
            ? `Comparo ${cur.label} (g=${cur.key}) con hijos ${left.label} (g=${left.key}) y ${right.label} (g=${right.key}). Más urgente: ${smaller.label}.`
            : `Comparo ${cur.label} con su único hijo ${left.label}.`,
          {
            operation: "bubble-down",
            cursorId: cur.id,
            comparing: [cur.id, smaller.id],
            extracted: root,
          },
        );

        if (cur.key <= smaller.key) {
          snap(
            op.codeLine,
            `${cur.label} es tan o más urgente que ${smaller.label} → se queda acá.`,
            {
              operation: "done",
              cursorId: cur.id,
              extracted: root,
            },
          );
          break;
        }

        items[idx] = smaller;
        items[smallerIdx] = cur;
        snap(
          op.codeLine,
          `${cur.label} baja al índice ${smallerIdx}, ${smaller.label} sube.`,
          {
            operation: "bubble-down",
            cursorId: cur.id,
            swapped: [cur.id, smaller.id],
            extracted: root,
          },
        );
        idx = smallerIdx;
      }

      snap(
        op.codeLine,
        items.length > 0
          ? `Próximo más urgente: ${items[0].label} (g=${items[0].key}).`
          : "Sala vacía.",
        { operation: "done", extracted: root },
      );
    }
  }

  return steps;
}
