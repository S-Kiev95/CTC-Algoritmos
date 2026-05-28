/**
 * Presets de transición para Framer Motion.
 * Mantener consistente la sensación táctil en toda la app.
 */
export const transitions = {
  spring: {
    type: "spring" as const,
    stiffness: 300,
    damping: 24,
  },
  springBouncy: {
    type: "spring" as const,
    stiffness: 500,
    damping: 18,
  },
  springStiff: {
    type: "spring" as const,
    stiffness: 700,
    damping: 32,
  },
  smooth: {
    type: "tween" as const,
    duration: 0.3,
    ease: "easeInOut" as const,
  },
  snappy: {
    type: "tween" as const,
    duration: 0.15,
    ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  },
};
