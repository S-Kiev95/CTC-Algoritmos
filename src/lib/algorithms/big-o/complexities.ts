/**
 * Clases de complejidad típicas que aparecen en un curso de algoritmos.
 * Cada una incluye su función para calcular operaciones, un color, y
 * ejemplos concretos de algoritmos que ya están en la app — así los
 * alumnos pueden saltar entre las visualizaciones de Big O y los temas
 * específicos.
 */

export type ComplexityKey =
  | "O1"
  | "Olog"
  | "On"
  | "Onlogn"
  | "On2"
  | "O2n";

export type Complexity = {
  key: ComplexityKey;
  label: string;
  name: string;
  /** Ejemplos concretos de algoritmos con esta complejidad. */
  examples: string[];
  /** Hex para el chart. Cada color corresponde a un tono de Tailwind. */
  color: string;
  /** Color suave (con baja opacidad) para fills. */
  colorSoft: string;
  /** Función que da las operaciones para un n dado. */
  fn: (n: number) => number;
};

export const COMPLEXITIES: Complexity[] = [
  {
    key: "O1",
    label: "O(1)",
    name: "Constante",
    examples: ["Acceso por índice en arreglo", "Insertar al inicio de lista enlazada"],
    color: "#10b981", // emerald-500
    colorSoft: "rgba(16, 185, 129, 0.15)",
    fn: () => 1,
  },
  {
    key: "Olog",
    label: "O(log n)",
    name: "Logarítmica",
    examples: ["Búsqueda binaria", "Operaciones en árbol balanceado"],
    color: "#06b6d4", // cyan-500
    colorSoft: "rgba(6, 182, 212, 0.15)",
    fn: (n) => (n <= 1 ? 1 : Math.log2(n)),
  },
  {
    key: "On",
    label: "O(n)",
    name: "Lineal",
    examples: ["Búsqueda lineal", "Recorrer una lista enlazada"],
    color: "#3b82f6", // blue-500
    colorSoft: "rgba(59, 130, 246, 0.15)",
    fn: (n) => n,
  },
  {
    key: "Onlogn",
    label: "O(n log n)",
    name: "Linearítmica",
    examples: ["Merge sort", "Quick sort (caso promedio)"],
    color: "#a855f7", // purple-500
    colorSoft: "rgba(168, 85, 247, 0.15)",
    fn: (n) => (n <= 1 ? 1 : n * Math.log2(n)),
  },
  {
    key: "On2",
    label: "O(n²)",
    name: "Cuadrática",
    examples: ["Bubble sort", "Selection sort", "Insertion sort (peor caso)"],
    color: "#f97316", // orange-500
    colorSoft: "rgba(249, 115, 22, 0.15)",
    fn: (n) => n * n,
  },
  {
    key: "O2n",
    label: "O(2ⁿ)",
    name: "Exponencial",
    examples: [
      "Fibonacci recursivo ingenuo",
      "Granos de arroz en el tablero",
      "Recorrer todos los subconjuntos",
    ],
    color: "#ef4444", // red-500
    colorSoft: "rgba(239, 68, 68, 0.15)",
    fn: (n) => Math.pow(2, n),
  },
];

/**
 * Formatea un número de operaciones a un string legible.
 * Soporta números enormes con notación científica.
 */
export function formatOps(n: number): string {
  if (!Number.isFinite(n)) return "∞";
  if (n < 1) return n.toFixed(2);
  if (n < 1000) {
    return n >= 100 ? Math.round(n).toLocaleString("es-AR") : n.toFixed(1);
  }
  if (n < 1e6) return Math.round(n).toLocaleString("es-AR");
  if (n < 1e9) return `${(n / 1e6).toFixed(2)} M`;
  if (n < 1e12) return `${(n / 1e9).toFixed(2)} G`;
  if (n < 1e15) return `${(n / 1e12).toFixed(2)} T`;
  return n.toExponential(2);
}

/**
 * Estima el tiempo real asumiendo 1 GHz (1 op = 1 ns) y formatea humano.
 * Es una buena aproximación para una CPU moderna ejecutando una operación
 * simple por ciclo.
 */
export function formatTime(ops: number): string {
  if (!Number.isFinite(ops)) return "∞";
  const ns = ops; // 1 ns por op asumiendo 1 GHz

  if (ns < 1) return "< 1 ns";
  if (ns < 1e3) return `${ns.toFixed(0)} ns`;
  if (ns < 1e6) return `${(ns / 1e3).toFixed(1)} µs`;
  if (ns < 1e9) return `${(ns / 1e6).toFixed(1)} ms`;

  const seconds = ns / 1e9;
  if (seconds < 60) return `${seconds.toFixed(1)} s`;
  const minutes = seconds / 60;
  if (minutes < 60) return `${minutes.toFixed(1)} min`;
  const hours = minutes / 60;
  if (hours < 24) return `${hours.toFixed(1)} h`;
  const days = hours / 24;
  if (days < 365) return `${days.toFixed(0)} días`;
  const years = days / 365.25;
  if (years < 1000) return `${years.toFixed(0)} años`;
  if (years < 1e6) return `${(years / 1000).toFixed(1)}k años`;
  if (years < 1e9) return `${(years / 1e6).toFixed(1)}M años`;
  if (years < 1e12) return `${(years / 1e9).toFixed(1)}B años`;
  // La edad del universo es ~13.8B años; cualquier cosa mayor es absurdo
  return `${years.toExponential(1)} años`;
}
