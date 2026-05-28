import type { Step, WatchEntry } from "@/lib/types";
import {
  hashString,
  hashBreakdownText,
  type HashEntry,
  type HashTableState,
} from "./types";

export const CHAINING_SEARCH_CODE = `def buscar(tabla, clave):
    indice = hash_clave(clave, len(tabla))
    for k, v in tabla[indice]:
        if k == clave:
            return v
    return None
`;

/**
 * Búsqueda en una tabla con encadenamiento. Saltamos directamente al bucket
 * por hash y luego recorremos el chain comparando claves. Si el chain es
 * largo, esto se degrada a O(n) — el punto educativo es ver el contraste
 * entre un chain corto (rápido) y uno largo (lento).
 */
export function generateChainingSearchSteps(
  prebuiltBuckets: HashEntry[][],
  size: number,
  target: string,
): Step<HashTableState>[] {
  const steps: Step<HashTableState>[] = [];
  const buckets = prebuiltBuckets.map((b) => [...b]);

  function snap(
    line: number,
    note: string,
    extras: Partial<HashTableState> & { watch?: WatchEntry[] } = {},
  ): void {
    const { watch, ...stateExtras } = extras;
    steps.push({
      state: {
        size,
        mode: "chaining",
        buckets: buckets.map((b) => [...b]),
        ...stateExtras,
      },
      line,
      note,
      watch,
    });
  }

  const hash = hashString(target, size);
  const breakdown = hashBreakdownText(target, size);

  const baseInputs: WatchEntry[] = [
    { name: "clave", value: `"${target}"`, kind: "input" },
  ];

  snap(1, `Llamada a buscar(tabla, "${target}").`, { watch: baseInputs });

  snap(
    2,
    `Calculo hash("${target}") = ${hash}. Salto directamente a bucket [${hash}].`,
    {
      hashBreakdown: breakdown,
      targetBucket: hash,
      probeBucket: hash,
      watch: [
        ...baseInputs,
        {
          name: "indice",
          value: String(hash),
          kind: "computed",
          changed: true,
        },
      ],
    },
  );

  const chain = buckets[hash];

  if (chain.length === 0) {
    snap(
      5,
      `Bucket [${hash}] está vacío. La clave no está. Devuelvo None.`,
      {
        targetBucket: hash,
        probeBucket: hash,
        notFound: true,
        watch: [
          ...baseInputs,
          { name: "indice", value: String(hash), kind: "computed" },
          {
            name: "return",
            value: "None",
            kind: "output",
            changed: true,
          },
        ],
      },
    );
    return steps;
  }

  for (const entry of chain) {
    snap(3, `Comparo: "${entry.key}" == "${target}"?`, {
      targetBucket: hash,
      probeBucket: hash,
      comparingEntryId: entry.id,
      watch: [
        ...baseInputs,
        { name: "indice", value: String(hash), kind: "computed" },
        { name: "k", value: `"${entry.key}"`, kind: "computed", changed: true },
        { name: "v", value: String(entry.value), kind: "computed" },
      ],
    });

    if (entry.key === target) {
      snap(4, `¡Coincide! Devuelvo el valor: ${entry.value}.`, {
        targetBucket: hash,
        probeBucket: hash,
        foundEntryId: entry.id,
        watch: [
          ...baseInputs,
          { name: "indice", value: String(hash), kind: "computed" },
          { name: "k", value: `"${entry.key}"`, kind: "computed" },
          { name: "v", value: String(entry.value), kind: "computed" },
          {
            name: "return",
            value: String(entry.value),
            kind: "output",
            changed: true,
          },
        ],
      });
      return steps;
    }
  }

  snap(
    5,
    `Recorrí todo el chain del bucket [${hash}] sin coincidencias. Devuelvo None.`,
    {
      targetBucket: hash,
      probeBucket: hash,
      notFound: true,
      watch: [
        ...baseInputs,
        { name: "indice", value: String(hash), kind: "computed" },
        {
          name: "return",
          value: "None",
          kind: "output",
          changed: true,
        },
      ],
    },
  );

  return steps;
}
