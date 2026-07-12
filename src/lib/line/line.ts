/**
 * Trazado de líneas en una grilla. Dos métodos:
 *  - **interpolación lineal** (lerp + redondeo): simple y suficiente para
 *    movimiento, disparos y trayectorias.
 *  - **supercover**: todas las celdas que la línea toca, ideal para línea de
 *    visión (un muro que roza la línea la bloquea).
 * Reimplementación propia inspirada en el artículo de Red Blob Games.
 */

export type Pt = { x: number; y: number };

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerpPoint = (p0: Pt, p1: Pt, t: number): Pt => ({ x: lerp(p0.x, p1.x, t), y: lerp(p0.y, p1.y, t) });
const roundPoint = (p: Pt): Pt => ({ x: Math.round(p.x), y: Math.round(p.y) });

/** Distancia diagonal (Chebyshev): cuántos pasos hacen falta = puntos a muestrear. */
export const diagonalDistance = (p0: Pt, p1: Pt) => Math.max(Math.abs(p1.x - p0.x), Math.abs(p1.y - p0.y));

/** Línea por interpolación lineal: muestrea N+1 puntos y los redondea a celdas. */
export function line(p0: Pt, p1: Pt): Pt[] {
  const n = diagonalDistance(p0, p1);
  const pts: Pt[] = [];
  for (let step = 0; step <= n; step++) {
    const t = n === 0 ? 0 : step / n;
    pts.push(roundPoint(lerpPoint(p0, p1, t)));
  }
  return pts;
}

/**
 * Línea "supercover": todas las celdas por las que pasa el segmento (avanza en
 * ortogonal, y en diagonal solo cuando cruza justo por una esquina).
 */
export function supercover(p0: Pt, p1: Pt): Pt[] {
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const nx = Math.abs(dx);
  const ny = Math.abs(dy);
  const signX = dx > 0 ? 1 : -1;
  const signY = dy > 0 ? 1 : -1;

  const p: Pt = { x: p0.x, y: p0.y };
  const pts: Pt[] = [{ x: p.x, y: p.y }];
  let ix = 0;
  let iy = 0;
  while (ix < nx || iy < ny) {
    const decision = (1 + 2 * ix) * ny - (1 + 2 * iy) * nx;
    if (decision === 0) {
      p.x += signX;
      p.y += signY;
      ix++;
      iy++;
    } else if (decision < 0) {
      p.x += signX;
      ix++;
    } else {
      p.y += signY;
      iy++;
    }
    pts.push({ x: p.x, y: p.y });
  }
  return pts;
}

/**
 * ¿Hay línea de visión libre entre `from` y `to`? Usa supercover; si alguna
 * celda intermedia es pared (grid[r][c] === 1), está bloqueada.
 */
export function hasLineOfSight(grid: number[][], from: Pt, to: Pt): { clear: boolean; cells: Pt[]; blockedAt: Pt | null } {
  const cells = supercover(from, to);
  for (let i = 1; i < cells.length - 1; i++) {
    const { x, y } = cells[i];
    if (grid[y]?.[x] === 1) return { clear: false, cells, blockedAt: cells[i] };
  }
  return { clear: true, cells, blockedAt: null };
}
