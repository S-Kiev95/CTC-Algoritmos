import type { Step, WatchEntry } from "@/lib/types";
import type { CallFrame, RecursionState } from "./types";

export const FIBONACCI_CODE = `def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)
`;

/**
 * Ejecuta fib(n) recursivo (versión ingenua, sin memoización) y emite
 * un Step por cada momento clave. El watch panel muestra `n` (parámetro),
 * `left` (resultado de fib(n-1)) y `right` (resultado de fib(n-2)) a medida
 * que están disponibles.
 */
export function generateFibonacciSteps(n: number): Step<RecursionState>[] {
  const steps: Step<RecursionState>[] = [];
  const stack: CallFrame[] = [];
  let idCounter = 0;

  function snap(
    line: number,
    note: string,
    watch?: WatchEntry[],
  ): void {
    steps.push({
      state: {
        stack: stack.map((f) => ({ ...f })),
      },
      line,
      note,
      watch,
    });
  }

  function setOthersWaiting(): void {
    for (let i = 0; i < stack.length - 1; i++) {
      stack[i].status = "waiting";
    }
  }

  function call(value: number): number {
    const id = `f${idCounter++}`;
    setOthersWaiting();
    const frame: CallFrame = {
      id,
      fn: "fib",
      args: [value],
      status: "active",
    };
    stack.push(frame);
    snap(1, `Llamada a fib(${value}). Se apila un nuevo frame.`, [
      { name: "n", value: String(value), kind: "input", changed: true },
    ]);
    snap(2, `Evalúo la guarda: ¿${value} <= 1?`, [
      { name: "n", value: String(value), kind: "input" },
    ]);

    if (value <= 1) {
      snap(3, `Caso base: devolver ${value}.`, [
        { name: "n", value: String(value), kind: "input" },
        {
          name: "return",
          value: String(value),
          kind: "output",
          changed: true,
        },
      ]);
      frame.returnValue = value;
      frame.status = "returning";
      snap(3, `fib(${value}) = ${value}. Pop del frame.`, [
        { name: "n", value: String(value), kind: "input" },
        { name: "return", value: String(value), kind: "output" },
      ]);
      stack.pop();
      return value;
    }

    snap(
      4,
      `Caso recursivo: primero pido fib(${value - 1}) (rama izquierda).`,
      [{ name: "n", value: String(value), kind: "input" }],
    );
    const left = call(value - 1);

    frame.status = "active";
    snap(
      4,
      `fib(${value - 1}) = ${left}. Ahora pido fib(${value - 2}) (rama derecha).`,
      [
        { name: "n", value: String(value), kind: "input" },
        {
          name: "left",
          value: String(left),
          kind: "computed",
          changed: true,
        },
      ],
    );
    const right = call(value - 2);

    frame.status = "active";
    snap(
      4,
      `fib(${value - 1}) + fib(${value - 2}) = ${left} + ${right} = ${left + right}.`,
      [
        { name: "n", value: String(value), kind: "input" },
        { name: "left", value: String(left), kind: "computed" },
        {
          name: "right",
          value: String(right),
          kind: "computed",
          changed: true,
        },
      ],
    );
    const result = left + right;
    frame.returnValue = result;
    frame.status = "returning";
    snap(4, `fib(${value}) = ${result}. Pop del frame.`, [
      { name: "n", value: String(value), kind: "input" },
      { name: "left", value: String(left), kind: "computed" },
      { name: "right", value: String(right), kind: "computed" },
      {
        name: "return",
        value: `${left} + ${right} = ${result}`,
        kind: "output",
        changed: true,
      },
    ]);
    stack.pop();
    return result;
  }

  const finalResult = call(n);
  steps.push({
    state: { stack: [], finalResult },
    line: 0,
    note: `Pila vacía. Resultado final: fib(${n}) = ${finalResult}.`,
    watch: [
      { name: "fib(n)", value: String(finalResult), kind: "output" },
    ],
  });

  return steps;
}
