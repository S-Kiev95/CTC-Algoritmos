import type { Step } from "@/lib/types";
import type {
  ListDictState,
  ListCellState,
} from "@/components/python/ListDictView";

// ── Demo 1: operaciones con listas ────────────────────────────────────────
export const LISTAS_CODE = `numeros = [1, 2, 3, 4]
numeros.append(5)       # agrega al final
numeros.remove(2)       # saca el VALOR 2 (no el indice)
ultimo = numeros.pop()  # saca y devuelve el ultimo
print(numeros[0])       # acceso por indice
print(numeros[1:3])     # slicing: indices 1 y 2
`;

export function generateListasSteps(): Step<ListDictState>[] {
  const L = (
    values: string[],
    extra: Partial<ListCellState> = {},
  ): ListCellState => ({
    values,
    label: "numeros",
    ...extra,
  });
  return [
    {
      state: { list: L(["1", "2", "3", "4"]), output: [] },
      line: 1,
      note: "Una lista (el equivalente a un array).",
    },
    {
      state: { list: L(["1", "2", "3", "4", "5"], { highlight: [4] }), output: [] },
      line: 2,
      note: "append(5) agrega el 5 al final.",
    },
    {
      state: { list: L(["1", "3", "4", "5"]), output: [] },
      line: 3,
      note: "remove(2) busca y saca el valor 2 (no la posición 2).",
    },
    {
      state: { list: L(["1", "3", "4"]), output: [], caption: "ultimo = 5" },
      line: 4,
      note: "pop() saca y devuelve el último (5), que guardamos en ultimo.",
    },
    {
      state: { list: L(["1", "3", "4"], { highlight: [0] }), output: ["1"] },
      line: 5,
      note: "Acceso por índice: numeros[0] es el primer elemento.",
    },
    {
      state: {
        list: L(["1", "3", "4"], { highlight: [1, 2] }),
        output: ["1", "[3, 4]"],
      },
      line: 6,
      note: "Slicing numeros[1:3]: del índice 1 al 2 (el 3 no se incluye).",
    },
  ];
}

// ── Demo 2: comprehensions y diccionarios ─────────────────────────────────
export const COMPREHENSION_CODE = `numeros = [1, 2, 3, 4, 5]
cubos = [n**3 for n in numeros]   # [operacion for x in iterable]
print(cubos)

persona = {"nombre": "Ana", "edad": 25}
persona["edad"] = 26              # modificar un valor
print(persona["nombre"])
`;

export function generateComprehensionSteps(): Step<ListDictState>[] {
  const nums = [1, 2, 3, 4, 5];
  const steps: Step<ListDictState>[] = [];
  const cubos: string[] = [];

  steps.push({
    state: {
      source: { values: nums.map(String), label: "numeros" },
      list: { values: [], label: "cubos" },
      output: [],
    },
    line: 1,
    note: "Una lista de origen para transformar.",
  });

  nums.forEach((n, i) => {
    cubos.push(String(n ** 3));
    steps.push({
      state: {
        source: { values: nums.map(String), label: "numeros", cursor: i },
        list: { values: [...cubos], label: "cubos", highlight: [i] },
        output: [],
        caption: `${n}**3 = ${n ** 3}  →  se agrega a cubos`,
      },
      line: 2,
      note: "La comprehension recorre cada n y guarda n**3. [operación · bucle · iterable].",
    });
  });

  steps.push({
    state: {
      source: { values: nums.map(String), label: "numeros" },
      list: { values: [...cubos], label: "cubos" },
      output: ["[1, 8, 27, 64, 125]"],
    },
    line: 3,
    note: "El resultado: una lista nueva, en una sola línea.",
  });

  // diccionario
  steps.push({
    state: {
      dict: [
        { key: '"nombre"', value: '"Ana"' },
        { key: '"edad"', value: "25" },
      ],
      output: ["[1, 8, 27, 64, 125]"],
    },
    line: 5,
    note: "Un diccionario: pares clave → valor (como un objeto en otros lenguajes).",
  });
  steps.push({
    state: {
      dict: [
        { key: '"nombre"', value: '"Ana"' },
        { key: '"edad"', value: "26", active: true },
      ],
      output: ["[1, 8, 27, 64, 125]"],
    },
    line: 6,
    note: "Se modifica el valor de la clave edad.",
  });
  steps.push({
    state: {
      dict: [
        { key: '"nombre"', value: '"Ana"', active: true },
        { key: '"edad"', value: "26" },
      ],
      output: ["[1, 8, 27, 64, 125]", "Ana"],
    },
    line: 7,
    note: "Se accede por clave: persona['nombre'] devuelve 'Ana'.",
  });

  return steps;
}
