import {
  Variable,
  Calculator,
  GitFork,
  Brackets,
  FunctionSquare,
  Boxes,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/**
 * Los puntos de la sección "Python" (fundamentos), fieles a las 7 secciones
 * numeradas del tour.py que el usuario muestra en clase.
 *
 * `ready` indica si la lección ya está construida; las que no, se muestran en
 * el sidebar/landing como "pronto" (sin link) para que la estructura completa
 * sea visible desde el día uno sin romper rutas del export estático.
 */
export type PythonPoint = {
  slug: string;
  title: string;
  short: string;
  icon: LucideIcon;
  ready: boolean;
};

export const PYTHON_POINTS: PythonPoint[] = [
  {
    slug: "variables-tipos",
    title: "Variables y tipos",
    short: "Tipado dinámico, type hints, print y f-strings",
    icon: Variable,
    ready: true,
  },
  {
    slug: "operaciones",
    title: "Operaciones básicas",
    short: "Aritmética, concatenación e interpolación",
    icon: Calculator,
    ready: true,
  },
  {
    slug: "control-flujo",
    title: "Control de flujo",
    short: "if / for / while / break / continue",
    icon: GitFork,
    ready: true,
  },
  {
    slug: "listas-diccionarios",
    title: "Listas y diccionarios",
    short: "Slicing, comprehensions y pares clave-valor",
    icon: Brackets,
    ready: true,
  },
  {
    slug: "funciones",
    title: "Funciones",
    short: "def, return, call stack y try/except",
    icon: FunctionSquare,
    ready: true,
  },
  {
    slug: "poo",
    title: "Programación orientada a objetos",
    short: "Clases, métodos y herencia",
    icon: Boxes,
    ready: true,
  },
  {
    slug: "avanzado",
    title: "Particularidades de Python",
    short: "*args/**kwargs, primera clase y decoradores",
    icon: Sparkles,
    ready: true,
  },
];

export function getPythonPoint(slug: string): PythonPoint | undefined {
  return PYTHON_POINTS.find((p) => p.slug === slug);
}
