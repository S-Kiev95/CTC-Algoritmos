import type { Step } from "@/lib/types";

export type Player = "X" | "O";
export type Cell = Player | null;
export type Board = Cell[]; // 9 casillas, índices 0..8

export const LINES: number[][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // filas
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columnas
  [0, 4, 8], [2, 4, 6],            // diagonales
];

export type WinInfo = { result: Player | "draw" | null; line: number[] | null };

export function winnerInfo(board: Board): WinInfo {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { result: board[a] as Player, line };
    }
  }
  if (board.every((c) => c !== null)) return { result: "draw", line: null };
  return { result: null, line: null };
}

export const winner = (board: Board): Player | "draw" | null =>
  winnerInfo(board).result;

export const emptyCells = (board: Board): number[] =>
  board.flatMap((c, i) => (c === null ? [i] : []));

export const other = (p: Player): Player => (p === "X" ? "O" : "X");

// ── Minimax para JUGAR (con profundidad: prefiere ganar pronto / perder tarde) ──
// Valor desde la perspectiva de X (MAX). X maximiza, O minimiza.
function score(board: Board, turn: Player, depth: number): number {
  const w = winner(board);
  if (w === "X") return 10 - depth;
  if (w === "O") return depth - 10;
  if (w === "draw") return 0;
  const vals = emptyCells(board).map((m) => {
    board[m] = turn;
    const v = score(board, other(turn), depth + 1);
    board[m] = null;
    return v;
  });
  return turn === "X" ? Math.max(...vals) : Math.min(...vals);
}

/** Mejor jugada (óptima) para `turn`. La IA es imbatible. */
export function bestMove(board: Board, turn: Player): number {
  let best = -Infinity;
  let move = emptyCells(board)[0];
  for (const m of emptyCells(board)) {
    board[m] = turn;
    // Puntaje desde la óptica del jugador actual (maximiza su propio resultado).
    const raw = score(board, other(turn), 1);
    const v = turn === "X" ? raw : -raw;
    board[m] = null;
    if (v > best) {
      best = v;
      move = m;
    }
  }
  return move;
}

// ── Árbol de decisión para la DEMO animada (valores limpios ±1 / 0) ──────────
export type MmNode = {
  id: number;
  parent: number | null;
  /** Casilla jugada para llegar a este nodo (null en la raíz). */
  move: number | null;
  /** "max" = turno de X; "min" = turno de O. */
  kind: "max" | "min";
  board: Board;
  value: number;
  depth: number;
  x: number;
  onBest: boolean;
};

export type MinimaxState = {
  board: Board;
  tree: MmNode[];
  /** Nodos revelados hasta este paso (por id, en orden DFS). */
  revealed: number;
  current: number;
  /** Valores ya calculados por nodo. */
  values: Record<number, number>;
  bestMove?: number | null;
  done?: boolean;
};

/** Posición de arranque de la demo: turno de X (MAX), 3 casillas libres (5,6,7).
 *  X tiene una jugada ganadora en la casilla 5 (línea 2-5-8); si juega otra, O
 *  gana. Árbol chico (9 nodos) para ver clara la propagación de valores. */
export const DEMO_BOARD: Board = ["X", "O", "X", "O", "O", null, null, null, "X"];
export const DEMO_TURN: Player = "X";

const cellName = (m: number) => `(${Math.floor(m / 3)},${m % 3})`;

export function generateMinimaxSteps(
  rootBoard: Board,
  turn: Player,
): { steps: Step<MinimaxState>[]; tree: MmNode[]; bestMove: number | null } {
  const nodes: MmNode[] = [];
  const values: Record<number, number> = {};
  const steps: Step<MinimaxState>[] = [];
  let nextId = 0;

  const board = [...rootBoard];

  const snap = (current: number, extra: Partial<MinimaxState> = {}): MinimaxState => ({
    board: [...nodes[current].board],
    tree: nodes,
    revealed: nextId,
    current,
    values: { ...values },
    ...extra,
  });

  function build(kind: "max" | "min", parent: number | null, move: number | null, depth: number): number {
    const node: MmNode = {
      id: nextId++,
      parent,
      move,
      kind,
      board: [...board],
      value: 0,
      depth,
      x: 0,
      onBest: false,
    };
    nodes.push(node);

    steps.push({
      state: snap(node.id),
      line: 5,
      sound: "tick",
      note:
        move === null
          ? `Posición actual. Le toca a ${turn} (${kind === "max" ? "MAX: busca el mayor valor" : "MIN: busca el menor valor"}).`
          : `${kind === "max" ? "X (MAX)" : "O (MIN)"} prueba jugar ${cellName(move)}.`,
    });

    const w = winnerInfo(board).result;
    if (w !== null) {
      node.value = w === "X" ? 1 : w === "O" ? -1 : 0;
      values[node.id] = node.value;
      steps.push({
        state: snap(node.id),
        line: 2,
        sound: node.value === 0 ? "tick" : "found",
        note:
          w === "draw"
            ? "Hoja: empate → valor 0."
            : `Hoja: gana ${w} → valor ${node.value > 0 ? "+1" : "−1"}.`,
      });
      return node.id;
    }

    const player: Player = kind === "max" ? "X" : "O";
    const childIds: number[] = [];
    for (const m of emptyCells(board)) {
      board[m] = player;
      childIds.push(build(kind === "max" ? "min" : "max", node.id, m, depth + 1));
      board[m] = null;
    }

    const childVals = childIds.map((c) => nodes[c].value);
    node.value = kind === "max" ? Math.max(...childVals) : Math.min(...childVals);
    values[node.id] = node.value;
    steps.push({
      state: snap(node.id),
      line: kind === "max" ? 8 : 11,
      sound: "place",
      note: `${kind === "max" ? "MAX (X) toma el máximo" : "MIN (O) toma el mínimo"} de sus hijos = ${node.value}.`,
    });
    return node.id;
  }

  const rootKind: "max" | "min" = turn === "X" ? "max" : "min";
  build(rootKind, null, null, 0);

  // Camino óptimo: desde la raíz, seguir el hijo cuyo valor iguala el del padre.
  let chosenMove: number | null = null;
  let cur = 0;
  nodes[0].onBest = true;
  while (true) {
    const node = nodes[cur];
    const children = nodes.filter((c) => c.parent === node.id);
    if (children.length === 0) break;
    const best = children.find((c) => c.value === node.value)!;
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
    nodes[id].x = xs.reduce((a, b) => a + b, 0) / xs.length;
    return nodes[id].x;
  };
  assign(0);

  steps.push({
    state: snap(0, { bestMove: chosenMove, done: true }),
    line: 11,
    sound: "found",
    note:
      chosenMove === null
        ? "No hay jugadas."
        : `La raíz vale ${nodes[0].value}. La mejor jugada de ${turn} es ${cellName(chosenMove)} (camino dorado).`,
  });

  return { steps, tree: nodes, bestMove: chosenMove };
}
