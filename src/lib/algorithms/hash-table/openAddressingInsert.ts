import type { Step, WatchEntry } from "@/lib/types";
import {
  hashString,
  hashBreakdownText,
  type HashEntry,
  type HashTableState,
} from "./types";

export const OPEN_ADDRESSING_INSERT_CODE = `def hash_clave(clave, tamano):
    return sum(ord(c) for c in clave) % tamano

def insertar(tabla, clave, valor):
    indice = hash_clave(clave, len(tabla))
    while tabla[indice] is not None:
        indice = (indice + 1) % len(tabla)
    tabla[indice] = (clave, valor)
`;

type Pair = { key: string; value: number };

/**
 * Inserción con direccionamiento abierto y sondeo lineal: si el bucket
 * objetivo está ocupado, probar el siguiente (índice + 1) % tamaño hasta
 * encontrar un slot libre.
 */
export function generateOpenAddressingInsertSteps(
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
        mode: "openAddressing",
        buckets: buckets.map((b) => [...b]),
        ...stateExtras,
      },
      line,
      note,
      watch,
    });
  }

  snap(
    0,
    `Tabla vacía de ${size} slots. Cada bucket guarda como máximo 1 entrada.`,
  );

  pairs.forEach((pair, idx) => {
    const entry: HashEntry = {
      id: `e${idx}`,
      key: pair.key,
      value: pair.value,
    };
    const hash = hashString(pair.key, size);
    const breakdown = hashBreakdownText(pair.key, size);

    const baseInputs: WatchEntry[] = [
      { name: "clave", value: `"${pair.key}"`, kind: "input" },
      { name: "valor", value: String(pair.value), kind: "input" },
    ];

    snap(4, `Llamada a insertar(tabla, "${pair.key}", ${pair.value}).`, {
      pendingEntry: entry,
      watch: baseInputs,
    });

    snap(2, `Calculo hash. sum(ord(c) for c in "${pair.key}") % ${size}.`, {
      pendingEntry: entry,
      hashBreakdown: breakdown,
      watch: [
        ...baseInputs,
        {
          name: "return",
          value: String(hash),
          kind: "output",
          changed: true,
        },
      ],
    });

    snap(5, `indice = ${hash}.`, {
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

    let probeIndex = hash;
    const probed: number[] = [];

    while (buckets[probeIndex].length > 0) {
      probed.push(probeIndex);
      const occupant = buckets[probeIndex][0];
      snap(
        6,
        `Slot [${probeIndex}] está ocupado por "${occupant.key}". Sondeo el siguiente.`,
        {
          pendingEntry: entry,
          hashBreakdown: breakdown,
          targetBucket: hash,
          probeBucket: probeIndex,
          probedBuckets: [...probed],
          watch: [
            ...baseInputs,
            {
              name: "indice",
              value: String(probeIndex),
              kind: "computed",
            },
            {
              name: `tabla[${probeIndex}]`,
              value: `("${occupant.key}", ${occupant.value})`,
              kind: "computed",
            },
          ],
        },
      );
      const oldIndex = probeIndex;
      probeIndex = (probeIndex + 1) % size;
      snap(
        7,
        `indice = (${oldIndex} + 1) % ${size} = ${probeIndex}.`,
        {
          pendingEntry: entry,
          hashBreakdown: breakdown,
          targetBucket: hash,
          probeBucket: probeIndex,
          probedBuckets: [...probed],
          watch: [
            ...baseInputs,
            {
              name: "indice",
              value: String(probeIndex),
              kind: "computed",
              changed: true,
            },
          ],
        },
      );
    }

    snap(
      8,
      probed.length === 0
        ? `Slot [${probeIndex}] está libre. Coloco la entrada.`
        : `Slot [${probeIndex}] está libre. Coloco después de ${probed.length} sondeo${probed.length === 1 ? "" : "s"}.`,
      {
        pendingEntry: entry,
        hashBreakdown: breakdown,
        targetBucket: hash,
        probeBucket: probeIndex,
        probedBuckets: [...probed],
        watch: [
          ...baseInputs,
          { name: "indice", value: String(probeIndex), kind: "computed" },
          {
            name: `tabla[${probeIndex}]`,
            value: "None",
            kind: "computed",
          },
        ],
      },
    );

    buckets[probeIndex].push(entry);

    snap(0, `Entrada colocada en slot [${probeIndex}].`, {
      placedAt: probeIndex,
      probedBuckets: probed.length > 0 ? [...probed] : undefined,
      watch: [
        {
          name: `tabla[${probeIndex}]`,
          value: `("${pair.key}", ${pair.value})`,
          kind: "output",
          changed: true,
        },
      ],
    });
  });

  steps.push({
    state: {
      size,
      mode: "openAddressing",
      buckets: buckets.map((b) => [...b]),
    },
    line: 0,
    note: `Tabla completa. Sin chains: si la tabla se llena demasiado, la performance se degrada — hay que redimensionar (rehash).`,
  });

  return steps;
}
