"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, Repeat } from "lucide-react";
import { AlgorithmPlayer } from "@/components/AlgorithmPlayer";
import { CallStack } from "@/components/algorithms/CallStack";
import {
  FACTORIAL_CODE,
  generateFactorialSteps,
} from "@/lib/algorithms/recursion/factorial";
import {
  FIBONACCI_CODE,
  generateFibonacciSteps,
} from "@/lib/algorithms/recursion/fibonacci";
import type { RecursionState } from "@/lib/algorithms/recursion/types";
import type { Step } from "@/lib/types";

type AlgoKey = "factorial" | "fibonacci";

type AlgoConfig = {
  key: AlgoKey;
  label: string;
  code: string;
  inputLabel: string;
  inputMin: number;
  inputMax: number;
  inputDefault: number;
  generate: (n: number) => Step<RecursionState>[];
};

const ALGOS: Record<AlgoKey, AlgoConfig> = {
  factorial: {
    key: "factorial",
    label: "Factorial",
    code: FACTORIAL_CODE,
    inputLabel: "n",
    inputMin: 0,
    inputMax: 7,
    inputDefault: 4,
    generate: generateFactorialSteps,
  },
  fibonacci: {
    key: "fibonacci",
    label: "Fibonacci",
    code: FIBONACCI_CODE,
    inputLabel: "n",
    inputMin: 0,
    inputMax: 6,
    inputDefault: 4,
    generate: generateFibonacciSteps,
  },
};

export default function RecursividadPage() {
  const [algoKey, setAlgoKey] = useState<AlgoKey>("factorial");
  const algo = ALGOS[algoKey];
  const [n, setN] = useState<number>(algo.inputDefault);

  // Si cambiás el algoritmo, ajusto n al default del nuevo si quedó fuera de rango.
  function selectAlgo(key: AlgoKey) {
    setAlgoKey(key);
    const next = ALGOS[key];
    if (n < next.inputMin || n > next.inputMax) {
      setN(next.inputDefault);
    }
  }

  const steps = useMemo(() => algo.generate(n), [algo, n]);

  // Key combinado: si cambia, el AlgorithmPlayer se remonta y el reproductor vuelve a 0.
  const playerKey = `${algoKey}-${n}`;

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <Repeat className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Tema
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Recursividad
            </h1>
            <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
              Una función que se llama a sí misma. Cada llamada apila un{" "}
              <em>frame</em> con sus argumentos. El frame se desapila cuando la
              función retorna.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
            {(Object.values(ALGOS) as AlgoConfig[]).map((a) => {
              const active = a.key === algoKey;
              return (
                <button
                  key={a.key}
                  onClick={() => selectAlgo(a.key)}
                  className={[
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
                  ].join(" ")}
                >
                  {a.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-mono">{algo.inputLabel} =</span>
            <div className="inline-flex items-center rounded-md border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => setN(Math.max(algo.inputMin, n - 1))}
                disabled={n <= algo.inputMin}
                aria-label="Disminuir n"
                className="flex h-7 w-7 items-center justify-center rounded-l-md text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-7 select-none text-center font-mono text-sm tabular-nums text-zinc-900 dark:text-zinc-100">
                {n}
              </span>
              <button
                type="button"
                onClick={() => setN(Math.min(algo.inputMax, n + 1))}
                disabled={n >= algo.inputMax}
                aria-label="Aumentar n"
                className="flex h-7 w-7 items-center justify-center rounded-r-md text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <span className="text-xs text-zinc-400">
              ({algo.inputMin}–{algo.inputMax})
            </span>
          </div>

          <span className="ml-auto font-mono text-xs text-zinc-500">
            {steps.length} pasos
          </span>
        </div>
      </header>

      <div className="flex-1 min-h-0">
        <AlgorithmPlayer<RecursionState>
          key={playerKey}
          code={algo.code}
          steps={steps}
          title={`${algo.label}(${n})`}
          renderVisualization={(step) => <CallStack state={step.state} />}
        />
      </div>
    </div>
  );
}
