/**
 * Distribuciones de probabilidad para "tiradas de daño" (estilo dados de rol).
 * Se calculan de forma **exacta** (por convolución), no por muestreo, así los
 * histogramas son las probabilidades reales. Inspirado en el artículo de
 * Red Blob Games sobre probabilidad y daño.
 */

/** Distribución discreta: valor → probabilidad. */
export type Dist = Map<number, number>;

/** Un dado de S caras: uniforme de 1 a S. */
export function die(s: number): Dist {
  const d: Dist = new Map();
  for (let v = 1; v <= s; v++) d.set(v, 1 / s);
  return d;
}

/** Distribución de la suma de dos distribuciones independientes (convolución). */
export function convolve(a: Dist, b: Dist): Dist {
  const out: Dist = new Map();
  for (const [va, pa] of a) {
    for (const [vb, pb] of b) {
      const v = va + vb;
      out.set(v, (out.get(v) ?? 0) + pa * pb);
    }
  }
  return out;
}

/** N dados de S caras (NdS). N = 0 → siempre 0. */
export function sumDice(n: number, s: number): Dist {
  if (n <= 0) return new Map([[0, 1]]);
  let d = die(s);
  for (let i = 1; i < n; i++) d = convolve(d, die(s));
  return d;
}

/** Suma una constante (bonus/penalización). Con `clampZero`, nada baja de 0. */
export function addConst(d: Dist, k: number, clampZero = false): Dist {
  const out: Dist = new Map();
  for (const [v, p] of d) {
    const nv = clampZero ? Math.max(0, v + k) : v + k;
    out.set(nv, (out.get(nv) ?? 0) + p);
  }
  return out;
}

/** Probabilidad acumulada P(X ≤ v) como función. */
function cdfOf(d: Dist): (v: number) => number {
  const entries = [...d.entries()].sort((a, b) => a[0] - b[0]);
  return (v: number) => {
    let acc = 0;
    for (const [val, p] of entries) {
      if (val <= v) acc += p;
      else break;
    }
    return acc;
  };
}

/** Máximo de DOS tiradas independientes de la misma distribución ("con ventaja"). */
export function maxOfTwo(d: Dist): Dist {
  const cdf = cdfOf(d);
  const out: Dist = new Map();
  for (const v of d.keys()) {
    // P(max = v) = P(ambas ≤ v) − P(ambas ≤ v−1) = cdf(v)² − cdf(v−1)²
    const p = cdf(v) ** 2 - cdf(v - 1) ** 2;
    if (p > 0) out.set(v, p);
  }
  return out;
}

/** Mínimo de dos tiradas ("con desventaja"). */
export function minOfTwo(d: Dist): Dist {
  const cdf = cdfOf(d);
  const out: Dist = new Map();
  for (const v of d.keys()) {
    // P(min = v) = P(ambas ≥ v) − P(ambas ≥ v+1) = (1−cdf(v−1))² − (1−cdf(v))²
    const p = (1 - cdf(v - 1)) ** 2 - (1 - cdf(v)) ** 2;
    if (p > 0) out.set(v, p);
  }
  return out;
}

/** Mezcla: con prob. `p` se suma `extra` (golpe crítico). */
export function critical(base: Dist, extra: Dist, p: number): Dist {
  const withCrit = convolve(base, extra);
  const out: Dist = new Map();
  for (const [v, prob] of base) out.set(v, (out.get(v) ?? 0) + (1 - p) * prob);
  for (const [v, prob] of withCrit) out.set(v, (out.get(v) ?? 0) + p * prob);
  return out;
}

export type Stats = { min: number; max: number; mean: number; variance: number; std: number };

export function stats(d: Dist): Stats {
  let mean = 0;
  let min = Infinity;
  let max = -Infinity;
  for (const [v, p] of d) {
    mean += v * p;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  let variance = 0;
  for (const [v, p] of d) variance += (v - mean) ** 2 * p;
  return { min, max, mean, variance, std: Math.sqrt(variance) };
}

/** Devuelve la distribución como pares ordenados por valor (para graficar). */
export function toBars(d: Dist): { value: number; prob: number }[] {
  return [...d.entries()].sort((a, b) => a[0] - b[0]).map(([value, prob]) => ({ value, prob }));
}
