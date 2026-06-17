import type { Step } from "@/lib/types";

/** Una variable en "memoria" tal como se muestra en VariablesView. */
export type PyVar = {
  name: string;
  /** Tipo Python: int, float, str, bool. */
  type: string;
  /** Valor renderizado como texto (con comillas si es str). */
  value: string;
};

export type VariablesState = {
  /** Variables definidas hasta este instante. */
  vars: PyVar[];
  /** Nombre de la variable creada/modificada en este paso (se resalta). */
  active?: string;
  /** Líneas impresas en la consola hasta este instante. */
  output: string[];
};

// El código que se muestra en el panel derecho. Los números de línea de cada
// paso (1-indexed) tienen que coincidir con este string.
export const VARIABLES_TIPOS_CODE = `# Variables y tipos basicos
# Python es de tipado dinamico: no se declara el tipo.
numero: int = 42          # entero
pi: float = 3.14159       # flotante
nombre: str = "Ana"       # cadena (string)
activo: bool = True       # booleano

# print() muestra valores. Con f-string se interpolan variables.
print(f"Hola, {nombre}")

# Las operaciones respetan el tipo de cada valor.
suma = numero + 10
texto = f"{nombre} tiene {numero} anios."
print(texto)
`;

/**
 * Pasos precomputados para la lección de variables y tipos. Cada paso "ejecuta"
 * una línea: o crea una variable (aparece en la memoria) o imprime en consola.
 */
export function generateVariablesTiposSteps(): Step<VariablesState>[] {
  const steps: Step<VariablesState>[] = [];

  const numero: PyVar = { name: "numero", type: "int", value: "42" };
  const pi: PyVar = { name: "pi", type: "float", value: "3.14159" };
  const nombre: PyVar = { name: "nombre", type: "str", value: '"Ana"' };
  const activo: PyVar = { name: "activo", type: "bool", value: "True" };
  const suma: PyVar = { name: "suma", type: "int", value: "52" };
  const texto: PyVar = {
    name: "texto",
    type: "str",
    value: '"Ana tiene 42 anios."',
  };

  steps.push({
    state: { vars: [numero], active: "numero", output: [] },
    line: 3,
    note: "Se crea numero. El type hint `: int` documenta el tipo, pero Python no lo obliga.",
  });
  steps.push({
    state: { vars: [numero, pi], active: "pi", output: [] },
    line: 4,
    note: "pi es float: lleva parte decimal.",
  });
  steps.push({
    state: { vars: [numero, pi, nombre], active: "nombre", output: [] },
    line: 5,
    note: "nombre es str: texto entre comillas.",
  });
  steps.push({
    state: { vars: [numero, pi, nombre, activo], active: "activo", output: [] },
    line: 6,
    note: "activo es bool: True o False, con mayúscula.",
  });
  steps.push({
    state: {
      vars: [numero, pi, nombre, activo],
      output: ["Hola, Ana"],
    },
    line: 9,
    note: "f-string: {nombre} se reemplaza por su valor al imprimir.",
  });
  steps.push({
    state: {
      vars: [numero, pi, nombre, activo, suma],
      active: "suma",
      output: ["Hola, Ana"],
    },
    line: 12,
    note: "numero + 10 → 52. El resultado sigue siendo int.",
  });
  steps.push({
    state: {
      vars: [numero, pi, nombre, activo, suma, texto],
      active: "texto",
      output: ["Hola, Ana"],
    },
    line: 13,
    note: "Se arma un str interpolando numero y nombre.",
  });
  steps.push({
    state: {
      vars: [numero, pi, nombre, activo, suma, texto],
      output: ["Hola, Ana", "Ana tiene 42 anios."],
    },
    line: 14,
    note: "Se imprime el texto ya armado.",
  });

  return steps;
}
