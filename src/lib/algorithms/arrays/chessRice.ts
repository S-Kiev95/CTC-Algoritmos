import type { Step, WatchEntry } from "@/lib/types";
import { cellKey, type ChessRiceState } from "./types";

export const CHESS_RICE_CODE = `def colocar(fila, col, total):
    if fila == 8:
        return total
    if col == 8:
        return colocar(fila + 1, 0, total)
    granos = 2 ** (fila * 8 + col)
    return colocar(fila, col + 1, total + granos)
`;

/**
 * El problema clásico: en cada casilla de un tablero de ajedrez se coloca
 * el doble de granos de arroz que en la anterior. Empieza con 1 grano
 * y en la casilla 64 hay 2⁶³ granos. El total es 2⁶⁴ - 1.
 *
 * Usamos BigInt internamente y exportamos como string. El watch panel
 * muestra `fila`, `col`, `total`, `granos` — los parámetros de la
 * recursión y la variable local que se computa en cada llamada.
 */
export function generateChessRiceSteps(size: number = 8): Step<ChessRiceState>[] {
  const steps: Step<ChessRiceState>[] = [];
  const grains: Record<string, string> = {};
  let depth = 0;

  function snap(
    line: number,
    note: string,
    cursor: { row: number; col: number } | undefined,
    total: bigint,
    extra: {
      currentGrains?: bigint;
      currentExponent?: number;
      done?: boolean;
      watch?: WatchEntry[];
    } = {},
  ): void {
    const { watch, ...stateExtras } = extra;
    steps.push({
      state: {
        size,
        grains: { ...grains },
        cursor,
        total: total.toString(),
        depth,
        currentGrains: stateExtras.currentGrains?.toString(),
        currentExponent: stateExtras.currentExponent,
        done: stateExtras.done,
      },
      line,
      note,
      watch,
    });
  }

  function paramsWatch(fila: number, col: number, total: bigint): WatchEntry[] {
    return [
      { name: "fila", value: String(fila), kind: "input" },
      { name: "col", value: String(col), kind: "input" },
      { name: "total", value: formatBig(total), kind: "input" },
    ];
  }

  function colocar(fila: number, col: number, total: bigint): bigint {
    depth += 1;
    const cursor = { row: fila, col };

    snap(
      1,
      `Llamada colocar(fila=${fila}, col=${col}). Profundidad ${depth}.`,
      cursor,
      total,
      {
        watch: [
          {
            name: "fila",
            value: String(fila),
            kind: "input",
            changed: true,
          },
          {
            name: "col",
            value: String(col),
            kind: "input",
            changed: true,
          },
          { name: "total", value: formatBig(total), kind: "input" },
        ],
      },
    );

    snap(2, `¿fila == ${size}?`, cursor, total, {
      watch: paramsWatch(fila, col, total),
    });
    if (fila === size) {
      snap(3, `Termino: devuelvo el total acumulado.`, undefined, total, {
        done: true,
        watch: [
          ...paramsWatch(fila, col, total),
          {
            name: "return",
            value: formatBig(total),
            kind: "output",
            changed: true,
          },
        ],
      });
      depth -= 1;
      return total;
    }

    snap(4, `¿col == ${size}?`, cursor, total, {
      watch: paramsWatch(fila, col, total),
    });
    if (col === size) {
      snap(
        5,
        `Fin de fila ${fila}. Salto a la fila ${fila + 1}.`,
        cursor,
        total,
        { watch: paramsWatch(fila, col, total) },
      );
      const result = colocar(fila + 1, 0, total);
      depth -= 1;
      return result;
    }

    const exponent = fila * size + col;
    const granos = BigInt(1) << BigInt(exponent);
    snap(
      6,
      `Coloco granos = 2^${exponent} = ${formatBig(granos)} en (${fila}, ${col}).`,
      cursor,
      total,
      {
        currentGrains: granos,
        currentExponent: exponent,
        watch: [
          ...paramsWatch(fila, col, total),
          {
            name: "granos",
            value: `2^${exponent} = ${formatBig(granos)}`,
            kind: "computed",
            changed: true,
          },
        ],
      },
    );

    grains[cellKey(fila, col)] = granos.toString();
    const newTotal = total + granos;

    snap(
      7,
      `Avanzo a (${fila}, ${col + 1}). Total acumulado: ${formatBig(newTotal)}.`,
      cursor,
      newTotal,
      {
        currentGrains: granos,
        currentExponent: exponent,
        watch: [
          ...paramsWatch(fila, col, total),
          {
            name: "granos",
            value: `2^${exponent} = ${formatBig(granos)}`,
            kind: "computed",
          },
          {
            name: "total + granos",
            value: formatBig(newTotal),
            kind: "computed",
            changed: true,
          },
        ],
      },
    );

    const result = colocar(fila, col + 1, newTotal);
    depth -= 1;
    return result;
  }

  const finalTotal = colocar(0, 0, BigInt(0));

  steps.push({
    state: {
      size,
      grains: { ...grains },
      cursor: undefined,
      total: finalTotal.toString(),
      depth: 0,
      done: true,
    },
    line: 0,
    note: `Total final: ${formatBig(finalTotal)} granos. Más arroz del que se ha cosechado en toda la historia humana.`,
    watch: [
      {
        name: "total",
        value: formatBig(finalTotal),
        kind: "output",
      },
    ],
  });

  return steps;
}

function formatBig(n: bigint): string {
  return n.toLocaleString("es-AR");
}
