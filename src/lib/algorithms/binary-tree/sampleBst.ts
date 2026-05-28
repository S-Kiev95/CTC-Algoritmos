import type { BstNode } from "./types";

/**
 * Valores que se insertan en el demo de inserción y que forman el BST de
 * ejemplo para los demos de búsqueda e inorden.
 *
 * El orden de inserción [50, 30, 70, 20, 40, 60, 80] produce un BST
 * perfectamente balanceado:
 *
 *           50
 *          /  \
 *        30    70
 *       / \    / \
 *      20  40 60  80
 *
 * Inorden: [20, 30, 40, 50, 60, 70, 80] — ordenado, justamente la propiedad
 * clave del BST.
 */
export const SAMPLE_INSERT_VALUES = [50, 30, 70, 20, 40, 60, 80];

/**
 * BST pre-construido para los demos de búsqueda y recorrido (no tiene
 * sentido reconstruirlo desde cero cada vez). Es el resultado de insertar
 * SAMPLE_INSERT_VALUES en ese orden.
 */
export const SAMPLE_BST: BstNode = {
  id: "n50",
  value: 50,
  left: {
    id: "n30",
    value: 30,
    left: { id: "n20", value: 20 },
    right: { id: "n40", value: 40 },
  },
  right: {
    id: "n70",
    value: 70,
    left: { id: "n60", value: 60 },
    right: { id: "n80", value: 80 },
  },
};
