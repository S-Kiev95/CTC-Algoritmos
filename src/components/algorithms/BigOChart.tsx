"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import {
  COMPLEXITIES,
  type Complexity,
  type ComplexityKey,
} from "@/lib/algorithms/big-o/complexities";
import { transitions } from "@/lib/transitions";

type Props = {
  n: number;
  maxN: number;
  scale: "linear" | "log";
  enabled?: Set<ComplexityKey>;
};

const CHART_W = 760;
const CHART_H = 420;
const PAD = { top: 32, right: 80, bottom: 40, left: 60 };

/**
 * Chart SVG comparativo de las clases de complejidad.
 *
 * - El cap del eje Y se calcula dinámicamente según las clases habilitadas:
 *   las polinomiales no quedan aplastadas si el alumno apaga O(2ⁿ).
 * - Labels de cada curva al borde derecho (donde termina la línea), así
 *   no hace falta legend separado.
 * - Curvas que se escapan del cap se "cortan" pero queda un indicador
 *   visual de "se va arriba" — eso es justamente la lección.
 */
export function BigOChart({ n, maxN, scale, enabled }: Props) {
  const reduced = useReducedMotion();

  const visibleClasses = useMemo(
    () => COMPLEXITIES.filter((c) => !enabled || enabled.has(c.key)),
    [enabled],
  );

  const { yCap, yScaleFn, yTicks } = useMemo(() => {
    // Valor máximo entre todas las CLASES HABILITADAS en n=maxN.
    const maxObserved = Math.max(
      ...visibleClasses.map((c) => c.fn(maxN)),
      10,
    );

    // Máximo polinomial (excluyendo a 2ⁿ) — clave para que en lineal la
    // exponencial pueda escaparse por arriba como en los charts clásicos.
    const visiblePolynomials = visibleClasses.filter((c) => c.key !== "O2n");
    const maxPolynomial =
      visiblePolynomials.length > 0
        ? Math.max(...visiblePolynomials.map((c) => c.fn(maxN)), 10)
        : maxObserved;

    let cap: number;
    if (scale === "linear") {
      // En lineal escalamos a la mayor curva POLINOMIAL habilitada. Si
      // O(2ⁿ) está prendida, va a escaparse por arriba — eso es justamente
      // la lección visual del "crecimiento exponencial explota".
      cap = maxPolynomial * 1.15;
    } else {
      // En log, redondear al siguiente potencia de 10 incluyendo todo.
      const log = Math.log10(maxObserved);
      cap = Math.pow(10, Math.ceil(log));
    }

    const yScale =
      scale === "linear"
        ? (y: number) => Math.min(y, cap) / cap
        : (y: number) => {
            if (y < 1) return 0;
            return Math.log10(y) / Math.log10(cap);
          };

    const ticks: { value: number; label: string }[] = [];
    if (scale === "linear") {
      // 5 ticks equiespaciados con números "redondeables"
      const step = niceNumber(cap / 5);
      for (let v = 0; v <= cap; v += step) {
        ticks.push({ value: v, label: formatTickLinear(v) });
        if (ticks.length > 8) break; // safety
      }
    } else {
      // Solo décadas enteras, con espaciado de 2 si son muchas
      const maxDecade = Math.ceil(Math.log10(cap));
      const stride = maxDecade > 8 ? 2 : 1;
      for (let i = 0; i <= maxDecade; i += stride) {
        const v = Math.pow(10, i);
        ticks.push({ value: v, label: formatTickLog(i) });
      }
      // Asegurar que el último tick (cap) esté presente
      if (ticks[ticks.length - 1].value !== cap) {
        ticks.push({ value: cap, label: formatTickLog(maxDecade) });
      }
    }

    return { yCap: cap, yScaleFn: yScale, yTicks: ticks };
  }, [scale, maxN, visibleClasses]);

  const innerW = CHART_W - PAD.left - PAD.right;
  const innerH = CHART_H - PAD.top - PAD.bottom;

  function toX(x: number): number {
    return PAD.left + (x / maxN) * innerW;
  }

  function toY(y: number): number {
    return PAD.top + (1 - yScaleFn(y)) * innerH;
  }

  // Generar polylines. Cuando la curva supera el cap, agregamos un punto
  // exacto en el borde (interpolado linealmente con el sample anterior) y
  // CORTAMOS la línea — así no queda un artefacto horizontal al techo.
  const SAMPLES = 240;
  const lines = visibleClasses.map((c) => {
    const pts: string[] = [];
    let escapesTop = false;
    let exitX: number | null = null;

    for (let i = 0; i <= SAMPLES; i++) {
      const x = (i / SAMPLES) * maxN;
      const y = c.fn(x);

      if (y > yCap) {
        escapesTop = true;
        // Si el sample anterior estaba bajo el cap, agregamos el punto
        // exacto donde la curva cruza el techo
        if (i > 0) {
          const prevX = ((i - 1) / SAMPLES) * maxN;
          const prevY = c.fn(prevX);
          if (prevY < yCap && y > prevY) {
            const t = (yCap - prevY) / (y - prevY);
            const crossX = prevX + t * (x - prevX);
            pts.push(`${toX(crossX).toFixed(2)},${toY(yCap).toFixed(2)}`);
            exitX = crossX;
          }
        }
        break; // No dibujamos más allá del cap
      }

      pts.push(`${toX(x).toFixed(2)},${toY(y).toFixed(2)}`);
    }

    // Label: si la curva se escapa, lo ponemos al borde derecho a la altura
    // del techo (con flecha ↗). Si no, donde termina la curva.
    const yAtMax = c.fn(maxN);
    const labelY =
      escapesTop ? toY(yCap) + 4 : toY(Math.max(yAtMax, 1));

    return {
      complexity: c,
      pointsAttr: pts.join(" "),
      labelY,
      escapesTop,
      exitX,
    };
  });

  const cursorX = toX(n);

  return (
    <div className="w-full max-w-4xl">
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="w-full text-zinc-700 dark:text-zinc-300"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid horizontal */}
        {yTicks.map((tick, i) => (
          <g key={`gh-${i}`}>
            <line
              x1={PAD.left}
              y1={toY(tick.value)}
              x2={CHART_W - PAD.right}
              y2={toY(tick.value)}
              stroke="currentColor"
              strokeOpacity={0.08}
              strokeDasharray="2 4"
            />
            <text
              x={PAD.left - 8}
              y={toY(tick.value) + 4}
              textAnchor="end"
              className="fill-current text-[10px] opacity-60"
            >
              {tick.label}
            </text>
          </g>
        ))}

        {/* Ticks del eje X */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const v = Math.round(p * maxN);
          return (
            <g key={`gx-${i}`}>
              <line
                x1={toX(v)}
                y1={CHART_H - PAD.bottom}
                x2={toX(v)}
                y2={CHART_H - PAD.bottom + 4}
                stroke="currentColor"
                strokeOpacity={0.4}
              />
              <text
                x={toX(v)}
                y={CHART_H - PAD.bottom + 18}
                textAnchor="middle"
                className="fill-current text-[10px] opacity-60"
              >
                {v}
              </text>
            </g>
          );
        })}

        {/* Ejes */}
        <line
          x1={PAD.left}
          y1={PAD.top}
          x2={PAD.left}
          y2={CHART_H - PAD.bottom}
          stroke="currentColor"
          strokeOpacity={0.45}
        />
        <line
          x1={PAD.left}
          y1={CHART_H - PAD.bottom}
          x2={CHART_W - PAD.right}
          y2={CHART_H - PAD.bottom}
          stroke="currentColor"
          strokeOpacity={0.45}
        />

        {/* Label "ops" arriba del eje Y, sin pisar ticks */}
        <text
          x={PAD.left}
          y={PAD.top - 12}
          textAnchor="middle"
          className="fill-current text-[10px] font-semibold opacity-60"
        >
          ops
        </text>

        {/* Label "n" debajo del eje X, esquina derecha */}
        <text
          x={CHART_W - PAD.right + 8}
          y={CHART_H - PAD.bottom + 4}
          className="fill-current text-[11px] font-semibold opacity-70"
        >
          n
        </text>

        {/* Curvas */}
        {lines.map(({ complexity, pointsAttr }) => (
          <motion.polyline
            key={complexity.key}
            points={pointsAttr}
            fill="none"
            stroke={complexity.color}
            strokeWidth={2.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduced ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={transitions.smooth}
          />
        ))}

        {/* Labels de cada curva al borde derecho */}
        {lines.map(({ complexity, labelY, escapesTop }) => (
          <ChartLineLabel
            key={`label-${complexity.key}`}
            complexity={complexity}
            x={CHART_W - PAD.right + 6}
            y={labelY}
            escapesTop={escapesTop}
          />
        ))}

        {/* Cursor vertical */}
        <motion.line
          x1={cursorX}
          y1={PAD.top}
          x2={cursorX}
          y2={CHART_H - PAD.bottom}
          stroke="#f59e0b"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          animate={{ x1: cursorX, x2: cursorX }}
          transition={transitions.spring}
        />

        {/* Dots en cada curva al cruzar el cursor */}
        {visibleClasses.map((complexity) => {
          const y = complexity.fn(n);
          const yClipped = Math.max(0, Math.min(y, yCap));
          const dotY = toY(yClipped);
          const offChart = y > yCap;
          return (
            <motion.circle
              key={`dot-${complexity.key}`}
              animate={{ cx: cursorX, cy: dotY }}
              transition={transitions.spring}
              r={offChart ? 4 : 5.5}
              fill={complexity.color}
              stroke="white"
              strokeWidth={1.5}
              opacity={offChart ? 0.5 : 1}
            />
          );
        })}

        {/* Label de n actual sobre el cursor */}
        <motion.g animate={{ x: cursorX }} transition={transitions.spring}>
          <rect
            x={-22}
            y={PAD.top - 24}
            width={44}
            height={18}
            rx={4}
            fill="#f59e0b"
          />
          <text
            x={0}
            y={PAD.top - 11}
            textAnchor="middle"
            className="fill-white text-[11px] font-semibold"
          >
            n = {n}
          </text>
        </motion.g>
      </svg>
    </div>
  );
}

/**
 * Label de la curva al borde derecho con el label O(...) y, si la curva
 * se sale del chart, una flecha hacia arriba indicando "se va".
 */
function ChartLineLabel({
  complexity,
  x,
  y,
  escapesTop,
}: {
  complexity: Complexity;
  x: number;
  y: number;
  escapesTop: boolean;
}) {
  return (
    <g>
      {escapesTop && (
        <text
          x={x - 4}
          y={y - 3}
          textAnchor="start"
          className="fill-current text-[10px] opacity-70"
          style={{ fill: complexity.color }}
        >
          ↗
        </text>
      )}
      <text
        x={x + (escapesTop ? 8 : 0)}
        y={y + 4}
        textAnchor="start"
        className="text-[11px] font-mono font-semibold"
        style={{ fill: complexity.color }}
      >
        {complexity.label}
      </text>
    </g>
  );
}

/**
 * Redondea un número a algo "nice" para usar como step de ticks.
 * Ej: 17 → 20, 437 → 500, 4321 → 5000.
 */
function niceNumber(n: number): number {
  if (n <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(n)));
  const normalized = n / magnitude;
  let nice: number;
  if (normalized <= 1) nice = 1;
  else if (normalized <= 2) nice = 2;
  else if (normalized <= 5) nice = 5;
  else nice = 10;
  return nice * magnitude;
}

function formatTickLinear(v: number): string {
  if (v === 0) return "0";
  if (v < 1000) return v.toFixed(v < 10 ? 1 : 0);
  if (v < 1e6) return `${(v / 1000).toFixed(0)}k`;
  if (v < 1e9) return `${(v / 1e6).toFixed(0)}M`;
  return v.toExponential(0);
}

function formatTickLog(decade: number): string {
  if (decade === 0) return "1";
  if (decade <= 3) return `10${supDigit(decade)}`;
  return `10${supDigit(decade)}`;
}

function supDigit(n: number): string {
  const sup = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  return String(n)
    .split("")
    .map((d) => sup[Number(d)] ?? d)
    .join("");
}
