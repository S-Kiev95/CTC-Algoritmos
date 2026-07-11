"use client";

import { useMemo, useState } from "react";
import {
  addConst,
  critical,
  maxOfTwo,
  minOfTwo,
  stats,
  sumDice,
  toBars,
  type Dist,
} from "@/lib/damage/damage";

type Mode = "normal" | "ventaja" | "desventaja" | "critico";

function buildDist(n: number, s: number, bonus: number, mode: Mode, crit: number): Dist {
  let d = sumDice(n, s);
  if (mode === "ventaja") d = maxOfTwo(d);
  else if (mode === "desventaja") d = minOfTwo(d);
  else if (mode === "critico") d = critical(d, sumDice(n, s), crit / 100);
  if (bonus !== 0) d = addConst(d, bonus, true);
  return d;
}

const fmt = (x: number) => (Number.isInteger(x) ? `${x}` : x.toFixed(2));

/** Gráfico de barras de una distribución de daño (probabilidades exactas). */
function Chart({ dist }: { dist: Dist }) {
  const bars = toBars(dist);
  const st = stats(dist);
  const maxP = Math.max(...bars.map((b) => b.prob), 1e-9);
  const W = 460;
  const H = 190;
  const padX = 8;
  const padTop = 10;
  const padBottom = 22;
  const chartH = H - padTop - padBottom;
  const bw = (W - padX * 2) / bars.length;
  const xOf = (i: number) => padX + i * bw;
  // Posición X de la media (interpolada entre valores).
  const meanX = padX + ((st.mean - bars[0].value) / Math.max(1, bars.length - 1)) * (bars.length - 1) * bw + bw / 2;
  const showEvery = bars.length > 16 ? 2 : 1;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* barras */}
        {bars.map((b, i) => {
          const h = (b.prob / maxP) * chartH;
          return (
            <g key={b.value}>
              <rect
                x={xOf(i) + bw * 0.12}
                y={padTop + chartH - h}
                width={bw * 0.76}
                height={h}
                rx={2}
                className="fill-sky-500"
              />
              {i % showEvery === 0 && (
                <text x={xOf(i) + bw / 2} y={H - 8} textAnchor="middle" className="fill-zinc-400 text-[9px]">
                  {b.value}
                </text>
              )}
            </g>
          );
        })}
        {/* línea de la media */}
        <line x1={meanX} y1={padTop} x2={meanX} y2={padTop + chartH} className="stroke-amber-500" strokeWidth={1.5} strokeDasharray="3 3" />
        <text x={meanX} y={padTop - 1} textAnchor="middle" className="fill-amber-500 text-[9px] font-semibold">
          media {fmt(st.mean)}
        </text>
      </svg>
      <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-zinc-500">
        <span>mín: <strong className="text-zinc-700 dark:text-zinc-300">{st.min}</strong></span>
        <span>promedio: <strong className="text-amber-600 dark:text-amber-400">{fmt(st.mean)}</strong></span>
        <span>máx: <strong className="text-zinc-700 dark:text-zinc-300">{st.max}</strong></span>
        <span>desviación: <strong className="text-zinc-700 dark:text-zinc-300">{fmt(st.std)}</strong> {st.std < 1.6 ? "(consistente)" : st.std > 2.8 ? "(muy variable)" : ""}</span>
      </div>
    </div>
  );
}

function Seg({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-md px-2 py-1 text-xs font-medium transition-colors",
        active ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/**
 * Histograma de daño configurable (o fijo, para ilustraciones). Muestra la
 * distribución EXACTA de una tirada tipo NdS + bonus, con modos de asimetría.
 */
export function DamageHistogram({
  n0 = 2,
  s0 = 6,
  bonus0 = 0,
  mode0 = "normal",
  interactive = true,
}: {
  n0?: number;
  s0?: number;
  bonus0?: number;
  mode0?: Mode;
  interactive?: boolean;
}) {
  const [n, setN] = useState(n0);
  const [s, setS] = useState(s0);
  const [bonus, setBonus] = useState(bonus0);
  const [mode, setMode] = useState<Mode>(mode0);
  const [crit, setCrit] = useState(20);

  const dist = useMemo(() => buildDist(n, s, bonus, mode, crit), [n, s, bonus, mode, crit]);

  const notation = `${n}d${s}${bonus > 0 ? `+${bonus}` : bonus < 0 ? `${bonus}` : ""}`;

  if (!interactive) {
    return (
      <div className="my-3 rounded-lg border border-zinc-200 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
        <p className="mb-1 text-center text-xs font-semibold text-zinc-500">{notation}</p>
        <Chart dist={dist} />
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-zinc-500">
        <label className="flex items-center gap-1.5">
          dados (N)
          <input type="range" min={1} max={6} value={n} onChange={(e) => setN(Number(e.target.value))} className="h-1 w-20 accent-sky-500" />
          <span className="w-3 font-mono text-zinc-700 dark:text-zinc-300">{n}</span>
        </label>
        <div className="flex items-center gap-1">
          caras
          {[2, 3, 4, 6, 8, 10, 12].map((v) => (
            <Seg key={v} active={s === v} onClick={() => setS(v)}>d{v}</Seg>
          ))}
        </div>
        <label className="flex items-center gap-1.5">
          bonus
          <input type="range" min={-5} max={10} value={bonus} onChange={(e) => setBonus(Number(e.target.value))} className="h-1 w-20 accent-amber-500" />
          <span className="w-6 font-mono text-zinc-700 dark:text-zinc-300">{bonus >= 0 ? `+${bonus}` : bonus}</span>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="flex gap-1 rounded-md border border-zinc-200 p-0.5 dark:border-zinc-800">
          <Seg active={mode === "normal"} onClick={() => setMode("normal")}>normal</Seg>
          <Seg active={mode === "ventaja"} onClick={() => setMode("ventaja")}>ventaja</Seg>
          <Seg active={mode === "desventaja"} onClick={() => setMode("desventaja")}>desventaja</Seg>
          <Seg active={mode === "critico"} onClick={() => setMode("critico")}>crítico</Seg>
        </div>
        {mode === "critico" && (
          <label className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            prob. crítico
            <input type="range" min={0} max={100} value={crit} onChange={(e) => setCrit(Number(e.target.value))} className="h-1 w-24 accent-rose-500" />
            <span className="w-8 font-mono text-zinc-700 dark:text-zinc-300">{crit}%</span>
          </label>
        )}
      </div>

      <p className="font-mono text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        {notation}
        {mode === "ventaja" && " · el mayor de 2"}
        {mode === "desventaja" && " · el menor de 2"}
        {mode === "critico" && ` · crítico +${notation} (${crit}%)`}
      </p>
      <Chart dist={dist} />

      <p className="max-w-lg text-center text-[11px] text-zinc-400">
        Probá: 1 dado grande (ej. <strong>1d12</strong>) da una distribución{" "}
        <strong>plana</strong> (muy variable); muchos dados chicos (ej.{" "}
        <strong>6d2</strong>) dan una <strong>campana</strong> angosta (consistente),
        aunque tengan un promedio parecido.
      </p>
    </div>
  );
}
