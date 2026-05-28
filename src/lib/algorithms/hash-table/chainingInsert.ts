import type { Step, WatchEntry } from "@/lib/types";
import {
  hashString,
  hashBreakdownText,
  type HashEntry,
  type HashTableState,
} from "./types";

export const CHAINING_INSERT_CODE = `def hash_clave(clave, tamano):
    return sum(ord(c) for c in clave) % tamano

def insertar(tabla, clave, valor):
    indice = hash_clave(clave, len(tabla))
    tabla[indice].append((clave, valor))
`;

type Pair = { key: string; value: number };

/**
 * Inserta varias entradas en una tabla con encadenamiento. Cada inserción
 * emite los pasos: presentación → cálculo del hash → módulo → ubicación
 * en el bucket. Las colisiones se resuelven agregando al final del chain.
 */
export function generateChainingInsertSteps(
  pairs: Pair[],
  size: number,
): Step<HashTableState>[] {
  const steps: Step<HashTableState>[] = [];
  const buckets: HashEntry[][] = Array.from({ length: size }, () => []);

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

  snap(0, `Tabla vacía de ${size} buckets. Listos para insertar.`);

  pairs.forEach((pair, idx) => {
    const entry: HashEntry = {
      id: `e${idx}`,
      key: pair.key,
      value: pair.value,
    };
    const hash = hashString(pair.key, size);
    const breakdown = hashBreakdownText(pair.key, size);
    const sum = Array.from(pair.key).reduce(
      (a, c) => a + c.charCodeAt(0),
      0,
    );

    const baseInputs: WatchEntry[] = [
      { name: "clave", value: `"${pair.key}"`, kind: "input" },
      { name: "valor", value: String(pair.value), kind: "input" },
      { name: "len(tabla)", value: String(size), kind: "input" },
    ];

    snap(4, `Llamada a insertar(tabla, "${pair.key}", ${pair.value}).`, {
      pendingEntry: entry,
      watch: baseInputs,
    });

    snap(
      5,
      `Calculo el índice. hash_clave("${pair.key}", ${size}) entra en juego.`,
      {
        pendingEntry: entry,
        watch: [
          ...baseInputs,
          { name: "indice", value: "?", kind: "computed" },
        ],
      },
    );

    snap(2, `sum(ord(c) for c in "${pair.key}") % ${size}.`, {
      pendingEntry: entry,
      hashBreakdown: breakdown,
      watch: [
        { name: "clave", value: `"${pair.key}"`, kind: "input" },
        { name: "tamano", value: String(size), kind: "input" },
        { name: "sum", value: String(sum), kind: "computed", changed: true },
        {
          name: "return",
          value: `${sum} % ${size} = ${hash}`,
          kind: "output",
          changed: true,
        },
      ],
    });

    snap(5, `indice = ${hash}. Apunto a bucket [${hash}].`, {
      pendingEntry: entry,
      hashBreakdown: breakdown,
      targetBucket: hash,
      watch: [
        ...baseInputs,
        {
          name: "indice",
          value: String(hash),
          kind: "computed",
          changed: true,
        },
      ],
    });

    const isCollision = buckets[hash].length > 0;
    const bucketBefore = buckets[hash]
      .map((e) => `("${e.key}", ${e.value})`)
      .join(", ");

    if (isCollision) {
      snap(
        6,
        `Bucket [${hash}] ya tiene ${buckets[hash].length} entrada${buckets[hash].length === 1 ? "" : "s"}: colisión. Con encadenamiento, agrego al final del chain.`,
        {
          pendingEntry: entry,
          hashBreakdown: breakdown,
          targetBucket: hash,
          watch: [
            ...baseInputs,
            { name: "indice", value: String(hash), kind: "computed" },
            {
              name: `tabla[${hash}]`,
              value: `[${bucketBefore}]`,
              kind: "computed",
            },
          ],
        },
      );
    } else {
      snap(6, `Bucket [${hash}] está libre. Coloco la entrada.`, {
        pendingEntry: entry,
        hashBreakdown: breakdown,
        targetBucket: hash,
        watch: [
          ...baseInputs,
          { name: "indice", value: String(hash), kind: "computed" },
          {
            name: `tabla[${hash}]`,
            value: "[]",
            kind: "computed",
          },
        ],
      });
    }

    // Mutar buckets
    buckets[hash].push(entry);
    const bucketAfter = buckets[hash]
      .map((e) => `("${e.key}", ${e.value})`)
      .join(", ");

    snap(
      0,
      isCollision
        ? `Chain en bucket [${hash}] ahora tiene ${buckets[hash].length} entradas.`
        : `Entrada colocada en bucket [${hash}].`,
      {
        placedAt: hash,
        watch: [
          {
            name: `tabla[${hash}]`,
            value: `[${bucketAfter}]`,
            kind: "output",
            changed: true,
          },
        ],
      },
    );
  });

  steps.push({
    state: {
      size,
      mode: "chaining",
      buckets: buckets.map((b) => [...b]),
    },
    line: 0,
    note: (() => {
      const colisiones = buckets.filter((b) => b.length > 1).length;
      return `Tabla completa: ${pairs.length} entradas, ${colisiones} ${colisiones === 1 ? "colisión encadenada" : "colisiones encadenadas"}.`;
    })(),
  });

  return steps;
}
