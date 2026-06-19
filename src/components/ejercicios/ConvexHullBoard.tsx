"use client";

import { motion, useReducedMotion } from "framer-motion";
import { transitions } from "@/lib/transitions";
import type { GrahamState } from "@/lib/ejercicios/graham";

const W = 380;
const H = 320;
const PAD = 26;

/**
 * Plano cartesiano para Graham scan: puntos, p0 (azul), rayos en orden polar,
 * el casco en construcción (línea), el punto candidato (ámbar), el descartado
 * (rojo) y, al cerrar, el polígono relleno con su área.
 */
export function ConvexHullBoard({ state }: { state: GrahamState }) {
  const reduced = useReducedMotion();
  const { points, p0, order, hull, current, popped, closed, area } = state;

  if (points.length === 0) return null;

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs) - 1;
  const maxX = Math.max(...xs) + 1;
  const minY = Math.min(...ys) - 1;
  const maxY = Math.max(...ys) + 1;
  const sx = (x: number) => PAD + ((x - minX) / (maxX - minX)) * (W - 2 * PAD);
  const sy = (y: number) => H - PAD - ((y - minY) / (maxY - minY)) * (H - 2 * PAD);

  const hullStr = hull.map((i) => `${sx(points[i].x)},${sy(points[i].y)}`).join(" ");
  const last = hull.length > 0 ? points[hull[hull.length - 1]] : null;
  const cand = current != null ? points[current] : null;

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3">
      <div className="flex w-full items-center justify-between text-xs text-zinc-500">
        <span>
          Puntos en el casco:{" "}
          <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
            {hull.length}
          </span>
        </span>
        {closed && (
          <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            Área ≈ {(area ?? 0).toFixed(1)}
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
      >
        {/* Rayos polares desde p0 (mientras se construye) */}
        {!closed && order && p0 != null &&
          order.slice(1).map((i) => (
            <line
              key={`ray-${i}`}
              x1={sx(points[p0].x)}
              y1={sy(points[p0].y)}
              x2={sx(points[i].x)}
              y2={sy(points[i].y)}
              stroke="currentColor"
              className="text-sky-300/40 dark:text-sky-500/20"
              strokeWidth={1}
            />
          ))}

        {/* Casco: polígono relleno al cerrar, línea mientras se construye */}
        {closed ? (
          <motion.polygon
            points={hullStr}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={transitions.smooth}
            className="fill-emerald-400/20 stroke-emerald-500"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        ) : (
          hull.length >= 2 && (
            <polyline
              points={hullStr}
              fill="none"
              className="stroke-zinc-700 dark:stroke-zinc-200"
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
          )
        )}

        {/* Línea tentativa al candidato */}
        {!closed && last && cand && (
          <line
            x1={sx(last.x)}
            y1={sy(last.y)}
            x2={sx(cand.x)}
            y2={sy(cand.y)}
            stroke="currentColor"
            className="text-amber-500"
            strokeWidth={2}
            strokeDasharray="4 3"
          />
        )}

        {/* Puntos */}
        {points.map((p, i) => {
          const isP0 = i === p0;
          const isCurrent = i === current;
          const isPopped = i === popped;
          const inHull = hull.includes(i);
          const color = isP0
            ? "fill-sky-500"
            : isPopped
              ? "fill-rose-500"
              : isCurrent
                ? "fill-amber-500"
                : inHull
                  ? "fill-emerald-500"
                  : "fill-zinc-400 dark:fill-zinc-500";
          return (
            <motion.circle
              key={i}
              cx={sx(p.x)}
              cy={sy(p.y)}
              animate={{ r: isCurrent || isP0 ? 6 : 4 }}
              transition={transitions.snappy}
              className={color}
            />
          );
        })}
      </svg>

      <p className="text-center text-xs text-zinc-400">
        Azul: p0 · ámbar: candidato · rojo: descartado · verde: en el casco
      </p>
    </div>
  );
}
