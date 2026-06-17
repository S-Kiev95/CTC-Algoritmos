import type { Step } from "@/lib/types";
import type { FlowState } from "@/components/python/FlowView";

// ── Demo 1: if / for / while ──────────────────────────────────────────────
export const FLUJO_CODE = `# if / else
numero = 7
if numero > 5:
    print("mayor que 5")
else:
    print("5 o menor")

# for sobre una lista
frutas = ["manzana", "banana", "cereza"]
for fruta in frutas:
    print(fruta)

# while con contador
contador = 0
while contador < 3:
    contador += 1
print("fin")
`;

const FRUTAS = ["manzana", "banana", "cereza"];

export function generateFlujoSteps(): Step<FlowState>[] {
  const steps: Step<FlowState>[] = [];
  const out: string[] = [];

  steps.push({
    state: { condition: { label: "numero > 5", value: true }, vars: [{ name: "numero", value: "7" }], output: [...out] },
    line: 3,
    note: "Se evalúa la condición del if. 7 > 5 es True.",
  });
  out.push("mayor que 5");
  steps.push({
    state: { vars: [{ name: "numero", value: "7" }], output: [...out] },
    line: 4,
    note: "Como fue True, entra al bloque del if (el else se saltea).",
  });

  // for
  steps.push({
    state: { items: FRUTAS, cursor: null, output: [...out] },
    line: 9,
    note: "Una lista para recorrer.",
  });
  FRUTAS.forEach((fruta, i) => {
    steps.push({
      state: { items: FRUTAS, cursor: i, vars: [{ name: "fruta", value: `"${fruta}"` }], output: [...out] },
      line: 10,
      note: `Iteración ${i + 1}: fruta toma el valor "${fruta}".`,
    });
    out.push(fruta);
    steps.push({
      state: { items: FRUTAS, cursor: i, vars: [{ name: "fruta", value: `"${fruta}"` }], output: [...out] },
      line: 11,
      note: "Se imprime la fruta actual.",
    });
  });

  // while
  steps.push({
    state: { vars: [{ name: "contador", value: "0" }], output: [...out] },
    line: 14,
    note: "Arranca el contador en 0.",
  });
  for (let c = 0; c < 3; c++) {
    steps.push({
      state: { condition: { label: `contador < 3  (${c} < 3)`, value: true }, vars: [{ name: "contador", value: String(c) }], output: [...out] },
      line: 15,
      note: "La condición se cumple, entra al bucle.",
    });
    steps.push({
      state: { vars: [{ name: "contador", value: String(c + 1) }], output: [...out] },
      line: 16,
      note: "contador += 1 (en Python no existe ++).",
    });
  }
  steps.push({
    state: { condition: { label: "contador < 3  (3 < 3)", value: false }, vars: [{ name: "contador", value: "3" }], output: [...out] },
    line: 15,
    note: "Ahora 3 < 3 es False: el while termina.",
  });
  out.push("fin");
  steps.push({
    state: { vars: [{ name: "contador", value: "3" }], output: [...out] },
    line: 17,
    note: "Sale del bucle y sigue con la línea de abajo.",
  });

  return steps;
}

// ── Demo 2: break / continue ──────────────────────────────────────────────
export const BREAK_CONTINUE_CODE = `# continue: saltea el 2
for i in range(5):
    if i == 2:
        continue
    print(i)

# break: corta en el 3
for i in range(5):
    if i == 3:
        break
    print(i)
`;

const RANGE5 = ["0", "1", "2", "3", "4"];

export function generateBreakContinueSteps(): Step<FlowState>[] {
  const steps: Step<FlowState>[] = [];
  const out: string[] = [];

  // continue
  for (let i = 0; i < 5; i++) {
    const isTwo = i === 2;
    steps.push({
      state: { items: RANGE5, cursor: i, condition: { label: `i == 2  (${i} == 2)`, value: isTwo }, vars: [{ name: "i", value: String(i) }], output: [...out] },
      line: 3,
      note: isTwo ? "i vale 2: la condición es True." : `i vale ${i}: la condición es False.`,
    });
    if (isTwo) {
      steps.push({
        state: { items: RANGE5, cursor: i, skipped: i, vars: [{ name: "i", value: String(i) }], output: [...out] },
        line: 4,
        note: "continue saltea el resto del cuerpo y pasa a la próxima vuelta. No imprime el 2.",
      });
      continue;
    }
    out.push(String(i));
    steps.push({
      state: { items: RANGE5, cursor: i, vars: [{ name: "i", value: String(i) }], output: [...out] },
      line: 5,
      note: "Se imprime i.",
    });
  }

  // break
  for (let i = 0; i < 5; i++) {
    const isThree = i === 3;
    steps.push({
      state: { items: RANGE5, cursor: i, condition: { label: `i == 3  (${i} == 3)`, value: isThree }, vars: [{ name: "i", value: String(i) }], output: [...out] },
      line: 9,
      note: isThree ? "i vale 3: la condición es True." : `i vale ${i}: la condición es False.`,
    });
    if (isThree) {
      steps.push({
        state: { items: RANGE5, cursor: i, vars: [{ name: "i", value: String(i) }], output: [...out] },
        line: 10,
        note: "break corta el bucle por completo: no sigue con el 4.",
      });
      break;
    }
    out.push(String(i));
    steps.push({
      state: { items: RANGE5, cursor: i, vars: [{ name: "i", value: String(i) }], output: [...out] },
      line: 11,
      note: "Se imprime i.",
    });
  }

  return steps;
}
