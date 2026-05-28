import type { TreeNode } from "./types";

/**
 * Árbol genérico de ejemplo. Estructura irregular a propósito para que
 * los alumnos vean variedad de ramificaciones:
 *
 *              A
 *            / | \
 *           B  C  D
 *          /|     |
 *         E F     G
 *                /|\
 *               H I J
 *
 * Total: 10 nodos. B tiene 2 hijos, C es hoja directa, D tiene un único
 * hijo (G) que a su vez se ramifica en 3 hojas. Altura del árbol = 3
 * (camino A → D → G → {H, I o J}).
 */
export const SAMPLE_TREE: TreeNode = {
  id: "a",
  value: "A",
  children: [
    {
      id: "b",
      value: "B",
      children: [
        { id: "e", value: "E" },
        { id: "f", value: "F" },
      ],
    },
    { id: "c", value: "C" },
    {
      id: "d",
      value: "D",
      children: [
        {
          id: "g",
          value: "G",
          children: [
            { id: "h", value: "H" },
            { id: "i", value: "I" },
            { id: "j", value: "J" },
          ],
        },
      ],
    },
  ],
};
