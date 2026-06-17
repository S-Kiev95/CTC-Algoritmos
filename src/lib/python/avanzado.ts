import type { Step } from "@/lib/types";
import type { PackingState } from "@/components/python/PackingView";

// ── Demo 1: *args y **kwargs ──────────────────────────────────────────────
export const ARGS_KWARGS_CODE = `def suma(*args, **kwargs):
    return sum(args) + sum(kwargs.values())

print(suma(1, 2, 3, a=10, b=20))
`;

export function generateArgsKwargsSteps(): Step<PackingState>[] {
  const call = "suma(1, 2, 3, a=10, b=20)";
  return [
    {
      state: { call, output: [], caption: "Python separa los argumentos posicionales de los nombrados." },
      line: 4,
      note: "Se llama a suma con 3 posicionales y 2 con nombre.",
    },
    {
      state: { call, argsTuple: ["1", "2", "3"], output: [] },
      line: 1,
      note: "*args empaqueta los posicionales en una tupla.",
    },
    {
      state: {
        call,
        argsTuple: ["1", "2", "3"],
        kwargsDict: [
          { k: "a", v: "10" },
          { k: "b", v: "20" },
        ],
        output: [],
      },
      line: 1,
      note: "**kwargs empaqueta los nombrados en un diccionario.",
    },
    {
      state: {
        call,
        argsTuple: ["1", "2", "3"],
        kwargsDict: [
          { k: "a", v: "10" },
          { k: "b", v: "20" },
        ],
        result: "sum(args)=6  +  sum(kwargs.values())=30  =  36",
        output: [],
      },
      line: 2,
      note: "Se suman los valores de ambos paquetes.",
    },
    {
      state: {
        call,
        argsTuple: ["1", "2", "3"],
        kwargsDict: [
          { k: "a", v: "10" },
          { k: "b", v: "20" },
        ],
        result: "36",
        output: ["36"],
      },
      line: 4,
      note: "Se imprime el resultado.",
    },
  ];
}

// ── Demo 2: decoradores ───────────────────────────────────────────────────
export const DECORADOR_CODE = `def decorador(func):
    def envoltura(*args, **kwargs):
        print("antes")
        resultado = func(*args, **kwargs)
        print("despues")
        return resultado
    return envoltura

@decorador
def saludar(nombre):
    print(f"Hola, {nombre}")

saludar("Ana")
`;

export function generateDecoradorSteps(): Step<PackingState>[] {
  const call = "saludar('Ana')";
  return [
    {
      state: {
        call,
        output: [],
        caption: "@decorador reemplazó saludar por la envoltura. Llamar a saludar llama a la envoltura.",
      },
      line: 13,
      note: "Se llama a saludar('Ana'), que en realidad es la envoltura.",
    },
    {
      state: { call, decorator: { phase: "before" }, output: ["antes"] },
      line: 3,
      note: "La envoltura corre código ANTES de la función original.",
    },
    {
      state: { call, decorator: { phase: "call" }, output: ["antes", "Hola, Ana"] },
      line: 4,
      note: "Recién acá llama a la función original (saludar), que imprime su saludo.",
    },
    {
      state: {
        call,
        decorator: { phase: "after" },
        output: ["antes", "Hola, Ana", "despues"],
      },
      line: 5,
      note: "Y corre código DESPUÉS. Así un decorador agrega comportamiento sin tocar la función.",
    },
    {
      state: {
        call,
        decorator: { phase: "after" },
        result: "None",
        output: ["antes", "Hola, Ana", "despues"],
      },
      line: 6,
      note: "Devuelve lo que devolvió la función original (acá None).",
    },
  ];
}
