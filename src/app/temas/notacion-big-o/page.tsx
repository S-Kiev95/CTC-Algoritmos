"use client";

import { useState } from "react";
import { Minus, Plus, TrendingUp } from "lucide-react";
import { BigOChart } from "@/components/algorithms/BigOChart";
import { ComplexityCards } from "@/components/algorithms/ComplexityCards";
import {
  COMPLEXITIES,
  type ComplexityKey,
} from "@/lib/algorithms/big-o/complexities";

type ScaleMode = "linear" | "log";

const MAX_N_OPTIONS = [20, 50, 100, 1000] as const;

export default function NotacionBigOPage() {
  const [n, setN] = useState(10);
  const [maxN, setMaxN] = useState<number>(20);
  const [scale, setScale] = useState<ScaleMode>("linear");
  // Por default mostramos las clases más comunes y dejamos O(2ⁿ) apagada:
  // así las polinomiales se ven bien y el alumno habilita la exponencial
  // cuando querramos hacer el "boom".
  const [enabled, setEnabled] = useState<Set<ComplexityKey>>(
    new Set<ComplexityKey>(["O1", "Olog", "On", "Onlogn", "On2"]),
  );

  function toggleClass(key: ComplexityKey) {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // Si cambia maxN, clamp n a ese rango
  function setMaxNClamped(newMax: number) {
    setMaxN(newMax);
    if (n > newMax) setN(newMax);
  }

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <header className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Tema
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Notación Big O
            </h1>
            <p className="mt-0.5 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
              Big O describe <strong>cómo crece</strong> el costo de un
              algoritmo cuando crece la entrada — no su tiempo en segundos,
              sino su <em>forma</em>. Movés el slider de <code>n</code> y ves
              cuántas operaciones requeriría cada clase de complejidad, y
              cuánto tomaría asumiendo 1 operación por nanosegundo.
            </p>
          </div>
        </header>

        {/* Controles */}
        <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          {/* Slider de n */}
          <div className="flex flex-1 items-center gap-3 min-w-[260px]">
            <span className="font-mono text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              n =
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setN(Math.max(1, n - 1))}
                disabled={n <= 1}
                aria-label="Disminuir n"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-12 select-none text-center font-mono text-base font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                {n}
              </span>
              <button
                onClick={() => setN(Math.min(maxN, n + 1))}
                disabled={n >= maxN}
                aria-label="Aumentar n"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <input
              type="range"
              min={1}
              max={maxN}
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
              className="flex-1 accent-amber-500"
            />
          </div>

          {/* Selector de maxN */}
          <label className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500">rango:</span>
            <select
              value={maxN}
              onChange={(e) => setMaxNClamped(Number(e.target.value))}
              className="rounded-md border border-zinc-200 bg-white px-2 py-1 font-mono text-sm focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
            >
              {MAX_N_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  0 — {v}
                </option>
              ))}
            </select>
          </label>

          {/* Toggle escala */}
          <div className="inline-flex rounded-md border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
            <ScaleButton
              active={scale === "linear"}
              onClick={() => setScale("linear")}
            >
              lineal
            </ScaleButton>
            <ScaleButton
              active={scale === "log"}
              onClick={() => setScale("log")}
            >
              log
            </ScaleButton>
          </div>
        </div>

        {/* Toggles por clase */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Mostrar:
          </span>
          {COMPLEXITIES.map((c) => {
            const active = enabled.has(c.key);
            return (
              <button
                key={c.key}
                onClick={() => toggleClass(c.key)}
                className={[
                  "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-mono transition-all",
                  active
                    ? "border-transparent text-white"
                    : "border-zinc-300 text-zinc-500 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300",
                ].join(" ")}
                style={
                  active
                    ? {
                        backgroundColor: c.color,
                      }
                    : undefined
                }
              >
                <span
                  className="h-1.5 w-3 rounded-full"
                  style={{
                    backgroundColor: active ? "white" : c.color,
                    opacity: active ? 0.9 : 0.5,
                  }}
                />
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Chart */}
        <div className="mb-6 flex justify-center rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <BigOChart n={n} maxN={maxN} scale={scale} enabled={enabled} />
        </div>

        {/* Cards */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            A <span className="font-mono">n = {n}</span>, cuánto cuesta cada
            clase
          </h2>
          <ComplexityCards n={n} enabled={enabled} />
        </div>

        {/* Notas pedagógicas */}
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/40 dark:bg-amber-950/30">
          <h3 className="mb-2 text-sm font-semibold text-amber-900 dark:text-amber-200">
            Qué Big O <strong>NO</strong> es
          </h3>
          <ul className="space-y-1.5 text-sm text-amber-900/90 dark:text-amber-200/90">
            <li>
              <strong>No es tiempo en segundos.</strong> Una operación a 1 GHz
              tarda 1 ns; en una CPU más lenta tarda más. Big O ignora la
              constante.
            </li>
            <li>
              <strong>No es el caso promedio.</strong> Salvo aclaración, Big O
              describe el <em>peor caso</em>. El caso promedio se anota como
              Θ.
            </li>
            <li>
              <strong>No mira constantes ni términos menores.</strong>{" "}
              <code>3n² + 100n + 50</code> es <code>O(n²)</code>: nos interesa
              el término que domina al crecer n.
            </li>
            <li>
              <strong>No siempre es el costo real.</strong> Un algoritmo{" "}
              <code>O(n²)</code> con constantes bajas puede ser más rápido que
              uno <code>O(n log n)</code> para n chico. Big O importa{" "}
              <em>al escalar</em>.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function ScaleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-sm px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
