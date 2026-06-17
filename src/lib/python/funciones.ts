import type { Step } from "@/lib/types";
import type { CallStackState } from "@/components/python/CallStackView";
import type { FlowState } from "@/components/python/FlowView";

// ── Demo 1: llamadas y retorno (call stack) ───────────────────────────────
export const FUNCIONES_CODE = `def saludar(nombre):
    return f"Hola, {nombre}!"

def cuadrado(x):
    return x * x

mensaje = saludar("Ana")
print(mensaje)
print(cuadrado(4))
`;

export function generateFuncionesSteps(): Step<CallStackState>[] {
  return [
    {
      state: {
        stack: [{ id: "s1", fn: "saludar", args: ['"Ana"'], status: "active" }],
        vars: [{ name: "nombre", value: '"Ana"' }],
        output: [],
      },
      line: 7,
      note: "Se llama a saludar('Ana'): se apila un frame y nombre toma ese valor.",
    },
    {
      state: {
        stack: [
          {
            id: "s1",
            fn: "saludar",
            args: ['"Ana"'],
            returnValue: '"Hola, Ana!"',
            status: "returning",
          },
        ],
        output: [],
      },
      line: 2,
      note: "La función arma el string y lo devuelve con return.",
    },
    {
      state: {
        stack: [],
        vars: [{ name: "mensaje", value: '"Hola, Ana!"' }],
        output: [],
      },
      line: 7,
      note: "El frame se desapila y el valor devuelto queda en mensaje.",
    },
    {
      state: { stack: [], vars: [{ name: "mensaje", value: '"Hola, Ana!"' }], output: ["Hola, Ana!"] },
      line: 8,
      note: "print muestra el contenido de mensaje.",
    },
    {
      state: {
        stack: [{ id: "s2", fn: "cuadrado", args: ["4"], status: "active" }],
        vars: [{ name: "x", value: "4" }],
        output: ["Hola, Ana!"],
      },
      line: 9,
      note: "Nueva llamada: cuadrado(4). x toma el valor 4.",
    },
    {
      state: {
        stack: [
          { id: "s2", fn: "cuadrado", args: ["4"], returnValue: "16", status: "returning" },
        ],
        output: ["Hola, Ana!"],
      },
      line: 5,
      note: "Devuelve x * x = 16.",
    },
    {
      state: { stack: [], output: ["Hola, Ana!", "16"] },
      line: 9,
      note: "Se imprime el 16 que devolvió la función.",
    },
  ];
}

// ── Demo 2: try / except / else / finally ─────────────────────────────────
export const TRY_EXCEPT_CODE = `try:
    resultado = 10 / 0
except ZeroDivisionError as e:
    print("Error:", e)
else:
    print("Exito:", resultado)
finally:
    print("Esto corre siempre")
`;

const BLOCKS = ["try", "except", "else", "finally"];

export function generateTryExceptSteps(): Step<FlowState>[] {
  return [
    {
      state: { items: BLOCKS, cursor: 0, output: [] },
      line: 2,
      note: "Entra al try e intenta 10 / 0.",
    },
    {
      state: { items: BLOCKS, cursor: 1, output: [] },
      line: 3,
      note: "10 / 0 lanza ZeroDivisionError: salta al except que lo captura.",
    },
    {
      state: { items: BLOCKS, cursor: 1, output: ["Error: division by zero"] },
      line: 4,
      note: "Se maneja el error sin que el programa se rompa.",
    },
    {
      state: { items: BLOCKS, cursor: 1, skipped: 2, output: ["Error: division by zero"] },
      line: 5,
      note: "El else solo corre si NO hubo error, así que se saltea.",
    },
    {
      state: {
        items: BLOCKS,
        cursor: 3,
        skipped: 2,
        output: ["Error: division by zero", "Esto corre siempre"],
      },
      line: 8,
      note: "El finally corre siempre, haya habido error o no.",
    },
  ];
}
