import type { Step } from "@/lib/types";
import type { VariablesState, PyVar } from "@/lib/python/variablesTipos";

// Reutilizamos VariablesView (memoria + consola) para esta lección.
export const OPERACIONES_CODE = `# Operaciones basicas
numero = 42
suma = numero + 10        # aritmetica
producto = numero * 2
nombre = "Ana"

# Concatenacion con + (hay que convertir el int a str)
texto = nombre + " tiene " + str(numero) + " anios."

# Lo mismo con f-string: mas corto y legible
texto_f = f"{nombre} tiene {numero} anios."
print(texto_f)
`;

export function generateOperacionesSteps(): Step<VariablesState>[] {
  const numero: PyVar = { name: "numero", type: "int", value: "42" };
  const suma: PyVar = { name: "suma", type: "int", value: "52" };
  const producto: PyVar = { name: "producto", type: "int", value: "84" };
  const nombre: PyVar = { name: "nombre", type: "str", value: '"Ana"' };
  const texto: PyVar = {
    name: "texto",
    type: "str",
    value: '"Ana tiene 42 anios."',
  };
  const textoF: PyVar = {
    name: "texto_f",
    type: "str",
    value: '"Ana tiene 42 anios."',
  };

  return [
    {
      state: { vars: [numero], active: "numero", output: [] },
      line: 2,
      note: "Punto de partida: numero = 42.",
    },
    {
      state: { vars: [numero, suma], active: "suma", output: [] },
      line: 3,
      note: "Suma aritmética: 42 + 10 = 52.",
    },
    {
      state: { vars: [numero, suma, producto], active: "producto", output: [] },
      line: 4,
      note: "Producto: 42 * 2 = 84.",
    },
    {
      state: {
        vars: [numero, suma, producto, nombre],
        active: "nombre",
        output: [],
      },
      line: 5,
      note: "Un texto para combinar después.",
    },
    {
      state: {
        vars: [numero, suma, producto, nombre, texto],
        active: "texto",
        output: [],
      },
      line: 8,
      note: "Con + concatenás strings, pero numero es int: hay que pasarlo con str().",
    },
    {
      state: {
        vars: [numero, suma, producto, nombre, texto, textoF],
        active: "texto_f",
        output: [],
      },
      line: 11,
      note: "El f-string hace lo mismo, más corto: las variables van entre llaves.",
    },
    {
      state: {
        vars: [numero, suma, producto, nombre, texto, textoF],
        output: ["Ana tiene 42 anios."],
      },
      line: 12,
      note: "Se imprime el resultado.",
    },
  ];
}
