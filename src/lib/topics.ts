import {
  Repeat,
  Boxes,
  List,
  Hash,
  Network,
  GitBranch,
  Workflow,
  TrendingUp,
  ArrowDownUp,
  Layers,
  Inbox,
  Triangle,
  type LucideIcon,
} from "lucide-react";

export type Topic = {
  slug: string;
  title: string;
  short: string;
  description: string;
  icon: LucideIcon;
  status: "draft" | "ready";
};

export const TOPICS: Topic[] = [
  {
    slug: "notacion-big-o",
    title: "Notación Big O",
    short: "Cómo crece el costo de un algoritmo",
    description:
      "Análisis asintótico: O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ). Cómo elegir entre algoritmos comparando su crecimiento al escalar la entrada.",
    icon: TrendingUp,
    status: "draft",
  },
  {
    slug: "recursividad",
    title: "Recursividad",
    short: "Llamadas que se llaman a sí mismas",
    description:
      "Visualización de la pila de llamadas, casos base y casos recursivos. Ejemplos clásicos: factorial, Fibonacci, Torres de Hanoi.",
    icon: Repeat,
    status: "draft",
  },
  {
    slug: "arreglos",
    title: "Arreglos",
    short: "Memoria contigua e índices",
    description:
      "Acceso O(1) por índice, inserciones/eliminaciones O(n). Búsqueda lineal, búsqueda binaria, ordenamientos.",
    icon: Boxes,
    status: "draft",
  },
  {
    slug: "ordenacion",
    title: "Ordenación",
    short: "Estrategias para ordenar un arreglo",
    description:
      "Bubble, Insertion, Selection, Merge y Quick Sort. Cada uno con una estrategia distinta — comparaciones e intercambios visualizados paso a paso, sincronizados con el código.",
    icon: ArrowDownUp,
    status: "draft",
  },
  {
    slug: "listas-enlazadas",
    title: "Listas enlazadas",
    short: "Nodos conectados por punteros",
    description:
      "Simples, dobles y circulares. Inserción y eliminación O(1) si tenés el nodo, recorrido O(n).",
    icon: List,
    status: "draft",
  },
  {
    slug: "pilas",
    title: "Pilas (Stack)",
    short: "LIFO — último en entrar, primero en salir",
    description:
      "Push y pop. Ctrl+Z, botón atrás, call stack del lenguaje, validación de paréntesis. La estructura más usada implícitamente en programación.",
    icon: Layers,
    status: "draft",
  },
  {
    slug: "colas",
    title: "Colas (Queue)",
    short: "FIFO — primero en entrar, primero en salir",
    description:
      "Encolar y desencolar. Cola del banco, cola de impresión, mensajes pendientes, RabbitMQ y Kafka. Justicia pura por orden de llegada.",
    icon: Inbox,
    status: "draft",
  },
  {
    slug: "tablas-hash",
    title: "Tablas hash",
    short: "Clave → índice por función hash",
    description:
      "Función hash, colisiones, encadenamiento y direccionamiento abierto. Operaciones promedio O(1).",
    icon: Hash,
    status: "draft",
  },
  {
    slug: "arboles",
    title: "Árboles",
    short: "Jerarquías con un nodo raíz",
    description:
      "Conceptos generales: raíz, hijos, hojas, altura, profundidad. Recorridos en preorden, inorden y postorden.",
    icon: Network,
    status: "draft",
  },
  {
    slug: "arboles-binarios",
    title: "Árboles binarios",
    short: "Cada nodo tiene a lo sumo 2 hijos",
    description:
      "BST, balanceo (AVL, rojo-negro a nivel conceptual), heaps. Inserción, búsqueda y eliminación.",
    icon: GitBranch,
    status: "draft",
  },
  {
    slug: "heap",
    title: "Heap (Cola de prioridad)",
    short: "El más urgente siempre arriba",
    description:
      "Árbol especial donde la raíz es siempre el elemento de mayor (o menor) prioridad. Sala de urgencias, top-K rankings, usado por Dijkstra y Huffman.",
    icon: Triangle,
    status: "draft",
  },
  {
    slug: "grafos",
    title: "Grafos",
    short: "Nodos y aristas",
    description:
      "Dirigidos, no dirigidos, ponderados. Representaciones (matriz, lista de adyacencia). BFS, DFS, Dijkstra.",
    icon: Workflow,
    status: "draft",
  },
];

export function getTopic(slug: string): Topic | undefined {
  return TOPICS.find((t) => t.slug === slug);
}
