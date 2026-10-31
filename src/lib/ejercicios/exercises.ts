import { Crown, Grid3x3, Hexagon, Sprout, type LucideIcon } from "lucide-react";

/**
 * Metadata de los ejercicios prácticos.
 *
 * `kind`:
 * - "problema": ejercicio con enunciado + pistas + solución.
 * - "demo": demostración sin letra (explicación + animación).
 */
export type Exercise = {
  slug: string;
  title: string;
  short: string;
  icon: LucideIcon;
  kind: "problema" | "demo";
  ready: boolean;
};

export const EXERCISES: Exercise[] = [
  {
    slug: "8-reinas",
    title: "Las 8 reinas",
    short: "Backtracking: ubicar 8 reinas sin que se ataquen",
    icon: Crown,
    kind: "problema",
    ready: true,
  },
  {
    slug: "laberinto-kruskal",
    title: "Laberinto (Kruskal)",
    short: "Generar un laberinto con Kruskal + Union-Find",
    icon: Grid3x3,
    kind: "demo",
    ready: true,
  },
  {
    slug: "laberinto-prim",
    title: "Laberinto (Prim)",
    short: "Generar un laberinto que crece desde una celda",
    icon: Sprout,
    kind: "demo",
    ready: true,
  },
  {
    slug: "graham",
    title: "Graham Scan",
    short: "Convex hull: estimar el área afectada por una plaga",
    icon: Hexagon,
    kind: "problema",
    ready: true,
  },
];

export function getExercise(slug: string): Exercise | undefined {
  return EXERCISES.find((e) => e.slug === slug);
}
