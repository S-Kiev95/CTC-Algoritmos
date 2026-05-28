import type { Step, WatchEntry } from "@/lib/types";
import type { CallFrame, RecursionState } from "./types";

export const FACTORIAL_CODE = `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
`;

/**
 * Ejecuta factorial(n) emitiendo un Step por cada momento "interesante":
 * entrada a la función, evaluación de la guarda, caso base, llamada recursiva,
 * y retorno. Cada step lleva la línea del código fuente correspondiente.
 *
 * El watch panel muestra las variables del frame activo: `n` siempre, y
 * `sub` (resultado de la llamada recursiva) cuando ya está disponible.
 */
export function generateFactorialSteps(n: number): Step<RecursionState>[] {
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
      fn: "factorial",
      args: [value],
      status: "active",
    };
    stack.push(frame);
    snap(1, `Llamada a factorial(${value}). Se apila un nuevo frame.`, [
      { name: "n", value: String(value), kind: "input", changed: true },
    ]);
    snap(2, `Evalúo la guarda: ¿${value} <= 1?`, [
      { name: "n", value: String(value), kind: "input" },
    ]);

    if (value <= 1) {
      snap(3, `Caso base alcanzado: devolver 1.`, [
        { name: "n", value: String(value), kind: "input" },
        { name: "return", value: "1", kind: "output", changed: true },
      ]);
      frame.returnValue = 1;
      frame.status = "returning";
      snap(3, `factorial(${value}) = 1. El frame está listo para hacer pop.`, [
        { name: "n", value: String(value), kind: "input" },
        { name: "return", value: "1", kind: "output" },
      ]);
      stack.pop();
      return 1;
    }

    snap(4, `Caso recursivo: necesito factorial(${value - 1}).`, [
      { name: "n", value: String(value), kind: "input" },
    ]);
    const sub = call(value - 1);

    // Al volver de la llamada recursiva, este frame vuelve a ser el activo.
    frame.status = "active";
    snap(
      4,
      `factorial(${value - 1}) devolvió ${sub}. Ahora calculo ${value} * ${sub}.`,
      [
        { name: "n", value: String(value), kind: "input" },
        {
          name: "sub",
          value: String(sub),
          kind: "computed",
          changed: true,
        },
      ],
    );
    const result = value * sub;
    frame.returnValue = result;
    frame.status = "returning";
    snap(4, `factorial(${value}) = ${result}. Pop del frame.`, [
      { name: "n", value: String(value), kind: "input" },
      { name: "sub", value: String(sub), kind: "computed" },
      {
        name: "return",
        value: `${value} * ${sub} = ${result}`,
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
    note: `Pila vacía. Resultado final: factorial(${n}) = ${finalResult}.`,
    watch: [
      {
        name: "factorial(n)",
        value: String(finalResult),
        kind: "output",
      },
    ],
  });

  return steps;
}
