import { Crown, Grid3x3, Hexagon, type LucideIcon } from "lucide-react";

/**
 * Metadata de los ejercicios prácticos.
 *
 * `kind`:
 * - "problema": ejercicio con enunciado + pistas + solución (gating de 3
 *   niveles: sección, ejercicio y solución).
 * - "demo": demostración sin letra (explicación + animación). Solo usa 2
 *   niveles: sección y el ítem; no tiene `solutionSlug`.
 *
 * Slugs de visibilidad en topic_visibility:
 * - `visibilitySlug` (`ej:<x>`): controla si el ítem se ve.
 * - `solutionSlug` (`ej:<x>:sol`): solo en "problema", controla la solución.
 * La sección entera además se gatea con el slug `ejercicios`.
 */
export type Exercise = {
  slug: string;
  title: string;
  short: string;
  icon: LucideIcon;
  kind: "problema" | "demo";
  visibilitySlug: string;
  solutionSlug?: string;
  ready: boolean;
};

/** Slug de visibilidad de la sección entera. */
export const EXERCISES_SECTION_SLUG = "ejercicios";

export const EXERCISES: Exercise[] = [
  {
    slug: "8-reinas",
    title: "Las 8 reinas",
    short: "Backtracking: ubicar 8 reinas sin que se ataquen",
    icon: Crown,
    kind: "problema",
    visibilitySlug: "ej:8-reinas",
    solutionSlug: "ej:8-reinas:sol",
    ready: true,
  },
  {
    slug: "laberinto-kruskal",
    title: "Laberinto (Kruskal)",
    short: "Generar un laberinto con Kruskal + Union-Find",
    icon: Grid3x3,
    kind: "demo",
    visibilitySlug: "ej:laberinto-kruskal",
    ready: true,
  },
  {
    slug: "graham",
    title: "Graham Scan",
    short: "Convex hull: estimar el área afectada por una plaga",
    icon: Hexagon,
    kind: "problema",
    visibilitySlug: "ej:graham",
    solutionSlug: "ej:graham:sol",
    ready: true,
  },
];

export function getExercise(slug: string): Exercise | undefined {
  return EXERCISES.find((e) => e.slug === slug);
}
