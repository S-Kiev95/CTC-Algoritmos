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
  /** El nodo rompe la regla: |balance| ≥ 2 en AVL, o rojo con padre rojo en RN. */
  alert?: boolean;
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
  const b = bf(n);
  return {
    value: n.value,
    balance: b,
    alert: Math.abs(b) > 1,
    left: avlSnap(n.left),
    right: avlSnap(n.right),
  };
}

const cloneAvl = (n: AvlNode | null): AvlNode | null =>
  n ? { value: n.value, h: n.h, left: cloneAvl(n.left), right: cloneAvl(n.right) } : null;

/** Inserta como un BST común, **sin** rebalancear: sirve para mostrar el árbol
 *  roto un instante antes de la rotación. */
function avlInsertPlain(node: AvlNode | null, value: number): AvlNode {
  if (!node) return { value, h: 1, left: null, right: null };
  if (value < node.value) node.left = avlInsertPlain(node.left, value);
  else if (value > node.value) node.right = avlInsertPlain(node.right, value);
  else return node;
  return fix(node);
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

function rbSnap(n: RbNode | null, parentRed = false): SnapNode | null {
  if (!n) return null;
  const isRed = n.color === "R";
  return {
    value: n.value,
    color: n.color,
    alert: isRed && parentRed, // dos rojos seguidos: rompe la regla
    left: rbSnap(n.left, isRed),
    right: rbSnap(n.right, isRed),
  };
}

const cloneRb = (n: RbNode | null): RbNode | null =>
  n ? { value: n.value, color: n.color, left: cloneRb(n.left), right: cloneRb(n.right) } : null;

/** Inserta el nodo nuevo en rojo **sin** arreglar los rojos seguidos. */
function rbInsPlain(node: RbNode | null, value: number): RbNode {
  if (!node) return { value, color: "R", left: null, right: null };
  if (value < node.value) node.left = rbInsPlain(node.left, value);
  else if (value > node.value) node.right = rbInsPlain(node.right, value);
  return node;
}

/** ¿Algún nodo del árbol está marcado como problemático? */
function hasAlert(n: SnapNode | null): boolean {
  if (!n) return false;
  return !!n.alert || hasAlert(n.left) || hasAlert(n.right);
}

/** Nodo (valor) que rompe la regla, para nombrarlo en la explicación. */
function findAlert(n: SnapNode | null): number | null {
  if (!n) return null;
  if (n.alert) return n.value;
  return findAlert(n.left) ?? findAlert(n.right);
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
  /** "roto" = recién insertado, antes de arreglar. "ok" = ya rebalanceado. */
  phase: "roto" | "ok";
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

  const build = (
    avl: SnapNode | null,
    rb: SnapNode | null,
    inserted: number | null,
    avlOp: string | null,
    rbOp: string | null,
    phase: "roto" | "ok",
    extra: Partial<BalancedState> = {},
  ): BalancedState => ({
    avl,
    rb,
    inserted,
    avlOp,
    rbOp,
    avlRots,
    rbFixes,
    avlHeight: heightOf(avl),
    rbHeight: heightOf(rb),
    phase,
    ...extra,
  });

  steps.push({
    state: build(null, null, null, null, null, "ok"),
    line: 2,
    note: "Vamos a insertar los mismos valores en un AVL y en un Rojo-Negro, y comparar cómo queda cada uno.",
  });

  for (const v of values) {
    // 1) Cómo quedaría si lo insertáramos como en un BST común, sin arreglar.
    const avlRoto = avlSnap(avlInsertPlain(cloneAvl(avlRoot), v));
    const rbRoto = rbSnap(rbInsPlain(cloneRb(rbRoot), v));
    const avlMal = findAlert(avlRoto);
    const rbMal = hasAlert(rbRoto);

    // Contadores previos: el paso "roto" todavía no rotó nada.
    const rotsAntes = avlRots;
    const fixesAntes = rbFixes;

    // 2) La inserción de verdad, con rebalanceo.
    const avlCtx = { rots: 0, op: null as string | null };
    avlRoot = avlInsert(avlRoot, v, avlCtx);
    avlRots += avlCtx.rots;
    const rbCtx = { fixes: 0 };
    rbRoot = rbInsert(rbRoot, v, rbCtx);
    rbFixes += rbCtx.fixes;

    const avlOp = avlCtx.op;
    const rbOp = rbCtx.fixes > 0 ? `${rbCtx.fixes} arreglo(s): sube el del medio, sus hijos quedan negros` : null;
    const huboLio = avlMal !== null || rbMal;

    if (huboLio) {
      // Paso "roto": se ve el problema antes de corregirlo.
      const aviso: string[] = [];
      if (avlMal !== null) aviso.push(`en el AVL el nodo ${avlMal} quedó con factor ±2`);
      if (rbMal) aviso.push("en el Rojo-Negro quedaron dos rojos seguidos");
      steps.push({
        state: build(avlRoto, rbRoto, v, null, null, "roto", {
          avlRots: rotsAntes,
          rbFixes: fixesAntes,
        }),
        line: 4,
        sound: "error",
        note: `Insertamos ${v} como en un BST normal y se rompió la regla: ${aviso.join(" y ")}. Hay que reacomodar.`,
      });
      // Paso "ok": el árbol ya reordenado.
      const arreglo: string[] = [];
      arreglo.push(avlOp ? `AVL: ${avlOp}` : "AVL: quedó bien sin rotar");
      arreglo.push(rbOp ? `Rojo-Negro: ${rbOp}` : "Rojo-Negro: alcanzó con recolorear");
      steps.push({
        state: build(avlSnap(avlRoot), rbSnap(rbRoot), v, avlOp, rbOp, "ok"),
        line: avlOp ? 12 : 24,
        sound: "place",
        note: `Reacomodado. ${arreglo.join(". ")}.`,
      });
    } else {
      steps.push({
        state: build(avlSnap(avlRoot), rbSnap(rbRoot), v, null, null, "ok"),
        line: 4,
        sound: "tick",
        note: `Insertamos ${v}: entró en su lugar y ningún nodo rompió la regla, así que no hubo que tocar nada.`,
      });
    }
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
    state: build(avlSnap(avlRoot), rbSnap(rbRoot), null, null, null, "ok", { done: true }),
    line: 27,
    sound: "found",
    note: `Listo. AVL: altura ${avlH} con ${avlRots} rotaciones. Rojo-Negro: altura ${rbH} con ${rbFixes} arreglos. ${cierre}`,
  });

  return steps;
}

/**
 * Valores de la demo. Elegidos para que aparezcan **los cuatro casos de
 * rotación** del AVL (LL, RR, LR y RL) y además se vea el intercambio entre los
 * dos árboles: el AVL termina de altura 4 con 6 rotaciones y el Rojo-Negro de
 * altura 5 con 5 arreglos.
 */
export const BALANCED_VALUES = [35, 50, 80, 75, 95, 70, 40, 20, 15, 45];
