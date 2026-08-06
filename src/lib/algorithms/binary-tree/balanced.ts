import type { Step } from "@/lib/types";

/**
 * Árboles binarios de búsqueda **balanceados**: AVL y Rojo-Negro.
 *
 * Los dos resuelven el mismo problema (que el BST no degenere en una lista)
 * pero con criterios distintos:
 *  - **AVL**: muy estricto. La diferencia de altura entre los dos subárboles de
 *    cada nodo nunca pasa de 1. Queda más bajo → búsquedas más rápidas, pero
 *    rota más al insertar.
 *  - **Rojo-Negro**: más permisivo. Solo garantiza que ningún camino sea más
 *    del doble de largo que otro. Rota menos → inserciones más baratas.
 */

export type Color = "R" | "B";

/** Nodo "de foto" (inmutable) que se dibuja en cada paso. */
export type SnapNode = {
  value: number;
  color?: Color;
  /** Factor de balance (altura derecha − izquierda), solo para el AVL. */
  balance?: number;
  left: SnapNode | null;
  right: SnapNode | null;
};

// ── AVL ──────────────────────────────────────────────────────────────────────

type AvlNode = { value: number; h: number; left: AvlNode | null; right: AvlNode | null };

const h = (n: AvlNode | null) => (n ? n.h : 0);
const fix = (n: AvlNode) => {
  n.h = 1 + Math.max(h(n.left), h(n.right));
  return n;
};
const bf = (n: AvlNode | null) => (n ? h(n.right) - h(n.left) : 0);

function rotRight(n: AvlNode): AvlNode {
  const l = n.left!;
  n.left = l.right;
  l.right = n;
  fix(n);
  return fix(l);
}
function rotLeft(n: AvlNode): AvlNode {
  const r = n.right!;
  n.right = r.left;
  r.left = n;
  fix(n);
  return fix(r);
}

/** Inserta en el AVL y devuelve la nueva raíz, anotando la rotación aplicada. */
function avlInsert(
  node: AvlNode | null,
  value: number,
  ctx: { rots: number; op: string | null },
): AvlNode {
  if (!node) return { value, h: 1, left: null, right: null };
  if (value < node.value) node.left = avlInsert(node.left, value, ctx);
  else if (value > node.value) node.right = avlInsert(node.right, value, ctx);
  else return node; // duplicado: no se inserta
  fix(node);

  const b = bf(node);
  if (b < -1) {
    // Pesa la izquierda.
    if (bf(node.left) > 0) {
      node.left = rotLeft(node.left!); // caso izquierda-derecha
      ctx.rots += 2;
      ctx.op = "rotación doble izquierda-derecha (LR)";
    } else {
      ctx.rots += 1;
      ctx.op = "rotación simple a la derecha (LL)";
    }
    return rotRight(node);
  }
  if (b > 1) {
    // Pesa la derecha.
    if (bf(node.right) < 0) {
      node.right = rotRight(node.right!); // caso derecha-izquierda
      ctx.rots += 2;
      ctx.op = "rotación doble derecha-izquierda (RL)";
    } else {
      ctx.rots += 1;
      ctx.op = "rotación simple a la izquierda (RR)";
    }
    return rotLeft(node);
  }
  return node;
}

function avlSnap(n: AvlNode | null): SnapNode | null {
  if (!n) return null;
  return { value: n.value, balance: bf(n), left: avlSnap(n.left), right: avlSnap(n.right) };
}

// ── Rojo-Negro (inserción funcional de Okasaki) ──────────────────────────────

type RbNode = { value: number; color: Color; left: RbNode | null; right: RbNode | null };

const red = (n: RbNode | null) => !!n && n.color === "R";

/**
 * Reequilibra un nodo negro que tiene un hijo rojo con otro hijo rojo debajo.
 * Los cuatro casos (izq-izq, izq-der, der-izq, der-der) terminan en la misma
 * forma: el del medio sube en rojo y sus dos hijos quedan negros.
 */
function rbBalance(node: RbNode, ctx: { fixes: number }): RbNode {
  if (node.color !== "B") return node;

  /**
   * Los cuatro casos terminan siempre igual: `mid` sube en rojo con dos hijos
   * negros, `lo` (con los subárboles a, b) y `hi` (con c, d).
   */
  const lift = (
    lo: RbNode, hi: RbNode, mid: RbNode,
    a: RbNode | null, b: RbNode | null, c: RbNode | null, d: RbNode | null,
  ): RbNode => {
    ctx.fixes++;
    lo.left = a; lo.right = b; lo.color = "B";
    hi.left = c; hi.right = d; hi.color = "B";
    mid.left = lo; mid.right = hi; mid.color = "R";
    return mid;
  };

  const l = node.left;
  const r = node.right;

  // izquierda-izquierda
  if (red(l) && red(l!.left)) {
    const y = l!, x = y.left!;
    return lift(x, node, y, x.left, x.right, y.right, node.right);
  }
  // izquierda-derecha
  if (red(l) && red(l!.right)) {
    const x = l!, y = x.right!;
    return lift(x, node, y, x.left, y.left, y.right, node.right);
  }
  // derecha-izquierda
  if (red(r) && red(r!.left)) {
    const z = r!, y = z.left!;
    return lift(node, z, y, node.left, y.left, y.right, z.right);
  }
  // derecha-derecha
  if (red(r) && red(r!.right)) {
    const y = r!, z = y.right!;
    return lift(node, z, y, node.left, y.left, z.left, z.right);
  }
  return node;
}

function rbIns(node: RbNode | null, value: number, ctx: { fixes: number }): RbNode {
  if (!node) return { value, color: "R", left: null, right: null };
  if (value < node.value) node.left = rbIns(node.left, value, ctx);
  else if (value > node.value) node.right = rbIns(node.right, value, ctx);
  else return node;
  return rbBalance(node, ctx);
}

function rbInsert(root: RbNode | null, value: number, ctx: { fixes: number }): RbNode {
  const n = rbIns(root, value, ctx);
  n.color = "B"; // la raíz siempre es negra
  return n;
}

function rbSnap(n: RbNode | null): SnapNode | null {
  if (!n) return null;
  return { value: n.value, color: n.color, left: rbSnap(n.left), right: rbSnap(n.right) };
}

// ── Altura y validaciones ────────────────────────────────────────────────────

export function heightOf(n: SnapNode | null): number {
  return n ? 1 + Math.max(heightOf(n.left), heightOf(n.right)) : 0;
}

/** ¿Cumple la propiedad de orden del BST? */
export function isBst(n: SnapNode | null, lo = -Infinity, hi = Infinity): boolean {
  if (!n) return true;
  if (n.value <= lo || n.value >= hi) return false;
  return isBst(n.left, lo, n.value) && isBst(n.right, n.value, hi);
}

/** AVL: |altura(der) − altura(izq)| ≤ 1 en todos los nodos. */
export function isAvlBalanced(n: SnapNode | null): boolean {
  if (!n) return true;
  if (Math.abs(heightOf(n.right) - heightOf(n.left)) > 1) return false;
  return isAvlBalanced(n.left) && isAvlBalanced(n.right);
}

/** Rojo-Negro: raíz negra, ningún rojo con hijo rojo, y misma cantidad de
 *  negros en todo camino de la raíz a una hoja. */
export function isRedBlackValid(root: SnapNode | null): boolean {
  if (!root) return true;
  if (root.color !== "B") return false;
  let ok = true;
  const blackHeight = (n: SnapNode | null): number => {
    if (!n) return 1;
    if (n.color === "R" && (n.left?.color === "R" || n.right?.color === "R")) ok = false;
    const l = blackHeight(n.left);
    const r = blackHeight(n.right);
    if (l !== r) ok = false;
    return l + (n.color === "B" ? 1 : 0);
  };
  blackHeight(root);
  return ok;
}

// ── Pasos para la animación comparativa ──────────────────────────────────────

export type BalancedState = {
  avl: SnapNode | null;
  rb: SnapNode | null;
  /** Valor recién insertado (se resalta en ambos árboles). */
  inserted: number | null;
  avlOp: string | null;
  rbOp: string | null;
  avlRots: number;
  rbFixes: number;
  avlHeight: number;
  rbHeight: number;
  done?: boolean;
};

export const BALANCED_CODE = `# AVL: rebalancea si la diferencia de alturas pasa de 1
def insertar_avl(nodo, v):
    if nodo is None: return Nodo(v)
    if v < nodo.valor: nodo.izq = insertar_avl(nodo.izq, v)
    else:              nodo.der = insertar_avl(nodo.der, v)
    actualizar_altura(nodo)

    b = altura(nodo.der) - altura(nodo.izq)      # factor de balance
    if b < -1:                                   # pesa la izquierda
        if balance(nodo.izq) > 0:
            nodo.izq = rotar_izq(nodo.izq)       # caso LR
        return rotar_der(nodo)
    if b > 1:                                    # pesa la derecha
        if balance(nodo.der) < 0:
            nodo.der = rotar_der(nodo.der)       # caso RL
        return rotar_izq(nodo)
    return nodo

# Rojo-Negro: el nodo nuevo entra ROJO y se arregla si quedan dos rojos juntos
def insertar_rn(nodo, v):
    if nodo is None: return Nodo(v, color=ROJO)
    if v < nodo.valor: nodo.izq = insertar_rn(nodo.izq, v)
    else:              nodo.der = insertar_rn(nodo.der, v)
    return arreglar(nodo)        # sube el del medio en rojo, hijos negros

raiz = insertar_rn(raiz, v)
raiz.color = NEGRO               # la raiz siempre es negra
`;

/** Inserta los valores uno por uno en ambos árboles y registra cada paso. */
export function generateBalancedSteps(values: number[]): Step<BalancedState>[] {
  const steps: Step<BalancedState>[] = [];
  let avlRoot: AvlNode | null = null;
  let rbRoot: RbNode | null = null;
  let avlRots = 0;
  let rbFixes = 0;

  const snap = (
    inserted: number | null,
    avlOp: string | null,
    rbOp: string | null,
    extra: Partial<BalancedState> = {},
  ): BalancedState => {
    const avl = avlSnap(avlRoot);
    const rb = rbSnap(rbRoot);
    return {
      avl,
      rb,
      inserted,
      avlOp,
      rbOp,
      avlRots,
      rbFixes,
      avlHeight: heightOf(avl),
      rbHeight: heightOf(rb),
      ...extra,
    };
  };

  steps.push({
    state: snap(null, null, null),
    line: 2,
    note: "Vamos a insertar los mismos valores en un AVL y en un Rojo-Negro, y comparar cómo queda cada uno.",
  });

  for (const v of values) {
    const avlCtx = { rots: 0, op: null as string | null };
    avlRoot = avlInsert(avlRoot, v, avlCtx);
    avlRots += avlCtx.rots;

    const rbCtx = { fixes: 0 };
    rbRoot = rbInsert(rbRoot, v, rbCtx);
    rbFixes += rbCtx.fixes;

    const avlOp = avlCtx.op;
    const rbOp = rbCtx.fixes > 0 ? `${rbCtx.fixes} arreglo(s): sube el del medio, hijos negros` : null;

    const partes = [`Insertamos ${v}.`];
    if (avlOp) partes.push(`AVL: ${avlOp}.`);
    else partes.push("AVL: no hizo falta rotar.");
    if (rbOp) partes.push(`Rojo-Negro: ${rbOp}.`);
    else partes.push("Rojo-Negro: alcanzó con pintarlo.");

    steps.push({
      state: snap(v, avlOp, rbOp),
      line: avlOp ? 12 : 24,
      sound: avlOp || rbOp ? "place" : "tick",
      note: partes.join(" "),
    });
  }

  const avlH = heightOf(avlSnap(avlRoot));
  const rbH = heightOf(rbSnap(rbRoot));

  // La conclusión sale de los números de esta corrida, no de un texto fijo.
  let cierre: string;
  if (avlH < rbH && avlRots > rbFixes) {
    cierre = "Se ve el intercambio: el AVL quedó más bajo (mejor para buscar) pero trabajó más; el Rojo-Negro se acomodó con menos arreglos (mejor para insertar).";
  } else if (avlH < rbH) {
    cierre = "El AVL quedó más bajo, así que buscar en él cuesta menos.";
  } else if (avlH === rbH) {
    cierre = "Con esta secuencia los dos llegaron a la misma altura: la diferencia aparece con más datos o con otro orden de inserción.";
  } else {
    cierre = "Acá el Rojo-Negro quedó más bajo, algo poco habitual: depende del orden en que entran los datos.";
  }

  steps.push({
    state: snap(null, null, null, { done: true }),
    line: 27,
    sound: "found",
    note: `Listo. AVL: altura ${avlH} con ${avlRots} rotaciones. Rojo-Negro: altura ${rbH} con ${rbFixes} arreglos. ${cierre}`,
  });

  return steps;
}

/** Valores de la demo: en orden creciente (el peor caso para un BST común, que
 *  degeneraría en una lista). Con estos diez se ve el intercambio: el AVL queda
 *  de altura 4 rotando 6 veces, y el Rojo-Negro de altura 5 con 5 arreglos. */
export const BALANCED_VALUES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
