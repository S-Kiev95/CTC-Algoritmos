import type { Step } from "@/lib/types";
import {
  type Board,
  type Player,
  emptyCells,
  generateMinimaxSteps,
  other,
  winnerInfo,
} from "./tateti";

/**
 * Árbol de decisión con **poda alfa-beta**. Misma estructura que el de Minimax,
 * pero cada nodo arrastra sus cotas α (lo mejor asegurado para MAX) y β (lo mejor
 * asegurado para MIN). Cuando α ≥ β en un nodo, las jugadas que faltan no pueden
 * cambiar la decisión: se **podan** (se crean como nodos grises, sin explorar).
 */
export type AbNode = {
  id: number;
  parent: number | null;
  move: number | null;
  kind: "max" | "min";
  board: Board;
  /** Valor final (null hasta calcularse; los podados quedan en null). */
  value: number | null;
  /** Cotas con las que se visitó el nodo (las heredadas del padre). */
  alpha: number;
  beta: number;
  depth: number;
  x: number;
  /** Rama cortada por la poda: nunca se exploró. */
  pruned: boolean;
  onBest: boolean;
};

export type AlfaBetaState = {
  tree: AbNode[];
  /** Nodos revelados hasta este paso (por id, en orden DFS). */
  revealed: number;
  current: number;
  /** Valores ya calculados por nodo. */
  values: Record<number, number>;
  /** Cotas α/β vigentes por nodo en este instante. */
  bounds: Record<number, { alpha: number; beta: number }>;
  /** Ids ya marcados como podados. */
  pruned: number[];
  /** Nodos efectivamente evaluados (no podados) hasta aquí. */
  explored: number;
  bestMove?: number | null;
  done?: boolean;
};

/** Posición de arranque de la demo de poda: turno de X (MAX), 4 casillas libres.
 *  Elegida para que la poda sea notoria: Minimax mira 28 nodos y, con el mismo
 *  orden de jugadas, alfa-beta explora solo 14 (la mitad). */
export const AB_DEMO_BOARD: Board = [null, null, "X", "O", null, null, "O", "X", "X"];
export const AB_DEMO_TURN: Player = "X";

const cellName = (m: number) => `(${Math.floor(m / 3)},${m % 3})`;
const fmtBound = (v: number) =>
  v === Infinity ? "+∞" : v === -Infinity ? "−∞" : v > 0 ? "+1" : v < 0 ? "−1" : "0";

export function generateAlfaBetaSteps(
  rootBoard: Board,
  turn: Player,
): {
  steps: Step<AlfaBetaState>[];
  tree: AbNode[];
  bestMove: number | null;
  minimaxNodes: number;
  abNodes: number;
} {
  const nodes: AbNode[] = [];
  const values: Record<number, number> = {};
  const bounds: Record<number, { alpha: number; beta: number }> = {};
  const prunedIds: number[] = [];
  const steps: Step<AlfaBetaState>[] = [];
  let nextId = 0;
  let explored = 0;

  const board = [...rootBoard];

  const snap = (current: number, extra: Partial<AlfaBetaState> = {}): AlfaBetaState => ({
    tree: nodes,
    revealed: nextId,
    current,
    values: { ...values },
    bounds: { ...bounds },
    pruned: [...prunedIds],
    explored,
    ...extra,
  });

  /** Crea un nodo "podado" (gris, sin explorar) para una jugada que no se mira. */
  function makePruned(parent: number, move: number, kind: "max" | "min", depth: number): void {
    board[move] = kind === "max" ? "X" : "O";
    nodes.push({
      id: nextId++,
      parent,
      move,
      kind,
      board: [...board],
      value: null,
      alpha: 0,
      beta: 0,
      depth,
      x: 0,
      pruned: true,
      onBest: false,
    });
    board[move] = null;
    prunedIds.push(nextId - 1);
  }

  function build(
    kind: "max" | "min",
    parent: number | null,
    move: number | null,
    depth: number,
    alpha: number,
    beta: number,
  ): number {
    const node: AbNode = {
      id: nextId++,
      parent,
      move,
      kind,
      board: [...board],
      value: null,
      alpha,
      beta,
      depth,
      x: 0,
      pruned: false,
      onBest: false,
    };
    nodes.push(node);
    explored++;
    bounds[node.id] = { alpha, beta };

    steps.push({
      state: snap(node.id),
      line: move === null ? 1 : 5,
      sound: "tick",
      note:
        move === null
          ? `Raíz (${kind === "max" ? "MAX, juega X" : "MIN, juega O"}). Empezamos con α = −∞, β = +∞.`
          : `${kind === "max" ? "X (MAX)" : "O (MIN)"} prueba ${cellName(move)}. Hereda α = ${fmtBound(alpha)}, β = ${fmtBound(beta)}.`,
    });

    const w = winnerInfo(board).result;
    if (w !== null) {
      const v = w === "X" ? 1 : w === "O" ? -1 : 0;
      node.value = v;
      values[node.id] = v;
      steps.push({
        state: snap(node.id),
        line: 2,
        sound: v === 0 ? "tick" : "found",
        note:
          w === "draw"
            ? "Hoja: empate → valor 0."
            : `Hoja: gana ${w} → valor ${v > 0 ? "+1" : "−1"}.`,
      });
      return node.id;
    }

    const player: Player = kind === "max" ? "X" : "O";
    const moves = emptyCells(board);
    let a = alpha;
    let b = beta;

    if (kind === "max") {
      let value = -Infinity;
      for (let i = 0; i < moves.length; i++) {
        const m = moves[i];
        board[m] = player;
        const childId = build("min", node.id, m, depth + 1, a, b);
        board[m] = null;
        value = Math.max(value, values[childId]);
        node.value = value;
        values[node.id] = value;
        a = Math.max(a, value);
        bounds[node.id] = { alpha: a, beta: b };
        steps.push({
          state: snap(node.id),
          line: 8,
          sound: "place",
          note: `MAX: valor parcial = ${fmtBound(value)}; subo α a ${fmtBound(a)}.`,
        });
        if (a >= b) {
          for (let j = i + 1; j < moves.length; j++) makePruned(node.id, moves[j], "min", depth + 1);
          steps.push({
            state: snap(node.id),
            line: 9,
            sound: "error",
            note: `α (${fmtBound(a)}) ≥ β (${fmtBound(b)}): poda β. Las ${moves.length - i - 1} jugada(s) restante(s) no se exploran.`,
          });
          break;
        }
      }
    } else {
      let value = Infinity;
      for (let i = 0; i < moves.length; i++) {
        const m = moves[i];
        board[m] = player;
        const childId = build("max", node.id, m, depth + 1, a, b);
        board[m] = null;
        value = Math.min(value, values[childId]);
        node.value = value;
        values[node.id] = value;
        b = Math.min(b, value);
        bounds[node.id] = { alpha: a, beta: b };
        steps.push({
          state: snap(node.id),
          line: 16,
          sound: "place",
          note: `MIN: valor parcial = ${fmtBound(value)}; bajo β a ${fmtBound(b)}.`,
        });
        if (b <= a) {
          for (let j = i + 1; j < moves.length; j++) makePruned(node.id, moves[j], "max", depth + 1);
          steps.push({
            state: snap(node.id),
            line: 17,
            sound: "error",
            note: `β (${fmtBound(b)}) ≤ α (${fmtBound(a)}): poda α. Las ${moves.length - i - 1} jugada(s) restante(s) no se exploran.`,
          });
          break;
        }
      }
    }

    return node.id;
  }

  const rootKind: "max" | "min" = turn === "X" ? "max" : "min";
  build(rootKind, null, null, 0, -Infinity, Infinity);

  // Camino óptimo: desde la raíz, seguir el hijo (no podado) cuyo valor iguala
  // el del padre.
  let chosenMove: number | null = null;
  let cur = 0;
  nodes[0].onBest = true;
  while (true) {
    const node = nodes[cur];
    const children = nodes.filter((c) => c.parent === node.id && !c.pruned);
    if (children.length === 0) break;
    const best = children.find((c) => c.value === node.value);
    if (!best) break;
    best.onBest = true;
    if (cur === 0) chosenMove = best.move;
    cur = best.id;
  }

  // Layout: x de hojas consecutivo; internos = promedio de hijos.
  const children = new Map<number, number[]>();
  for (const nd of nodes) {
    if (nd.parent !== null) {
      const arr = children.get(nd.parent) ?? [];
      arr.push(nd.id);
      children.set(nd.parent, arr);
    }
  }
  let leafX = 0;
  const assign = (id: number): number => {
    const kids = children.get(id) ?? [];
    if (kids.length === 0) {
      nodes[id].x = leafX++;
      return nodes[id].x;
    }
    const xs = kids.map(assign);
    nodes[id].x = xs.reduce((acc, v) => acc + v, 0) / xs.length;
    return nodes[id].x;
  };
  assign(0);

  const minimaxNodes = generateMinimaxSteps(rootBoard, turn).tree.length;
  const abNodes = explored;

  steps.push({
    state: snap(0, { bestMove: chosenMove, done: true }),
    line: 8,
    sound: "found",
    note:
      chosenMove === null
        ? "No hay jugadas."
        : `La raíz vale ${fmtBound(nodes[0].value ?? 0)}. Mejor jugada de ${turn}: ${cellName(chosenMove)}. Minimax habría mirado ${minimaxNodes} nodos; con poda, ${abNodes}.`,
  });

  return { steps, tree: nodes, bestMove: chosenMove, minimaxNodes, abNodes };
}
