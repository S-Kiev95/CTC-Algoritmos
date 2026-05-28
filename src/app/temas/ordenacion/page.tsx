"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, Shuffle } from "lucide-react";
import { AlgorithmPlayer } from "@/components/AlgorithmPlayer";
import { SortBars } from "@/components/algorithms/SortBars";
import {
  BUBBLE_SORT_CODE,
  generateBubbleSortSteps,
} from "@/lib/algorithms/sorting/bubbleSort";
import {
  SELECTION_SORT_CODE,
  generateSelectionSortSteps,
} from "@/lib/algorithms/sorting/selectionSort";
import {
  INSERTION_SORT_CODE,
  generateInsertionSortSteps,
} from "@/lib/algorithms/sorting/insertionSort";
import {
  MERGE_SORT_CODE,
  generateMergeSortSteps,
} from "@/lib/algorithms/sorting/mergeSort";
import {
  QUICK_SORT_CODE,
  generateQuickSortSteps,
} from "@/lib/algorithms/sorting/quickSort";

type AlgoKey =
  | "bubble"
  | "selection"
  | "insertion"
  | "merge"
  | "quick";

type AlgoConfig = {
  key: AlgoKey;
  label: string;
  short: string;
  big_o: string;
  code: string;
  generate: (values: number[]) => ReturnType<
    typeof generateBubbleSortSteps
  >;
};

const ALGOS: AlgoConfig[] = [
  {
    key: "bubble",
    label: "Bubble",
    short: "Compara adyacentes, intercambia",
    big_o: "O(n²)",
    code: BUBBLE_SORT_CODE,
    generate: generateBubbleSortSteps,
  },
  {
    key: "selection",
    label: "Selection",
    short: "Busca el mínimo, lo trae al frente",
    big_o: "O(n²)",
    code: SELECTION_SORT_CODE,
    generate: generateSelectionSortSteps,
  },
  {
    key: "insertion",
    label: "Insertion",
    short: "Inserta cada elemento en su lugar",
    big_o: "O(n²)",
    code: INSERTION_SORT_CODE,
    generate: generateInsertionSortSteps,
  },
  {
    key: "merge",
    label: "Merge",
    short: "Divide y vence; combina mitades ordenadas",
    big_o: "O(n log n)",
    code: MERGE_SORT_CODE,
    generate: generateMergeSortSteps,
  },
  {
    key: "quick",
    label: "Quick",
    short: "Partición por pivote",
    big_o: "O(n log n) promedio",
    code: QUICK_SORT_CODE,
    generate: generateQuickSortSteps,
  },
];

const DEFAULT_VALUES = [5, 3, 8, 1, 4, 7];

const PRESETS: { label: string; values: number[] }[] = [
  { label: "Por defecto", values: [5, 3, 8, 1, 4, 7] },
  { label: "Reverso (peor caso)", values: [8, 7, 6, 5, 4, 3, 2, 1] },
  { label: "Casi ordenado", values: [1, 2, 4, 3, 5, 6, 7, 8] },
  { label: "Ya ordenado (mejor caso)", values: [1, 2, 3, 4, 5, 6, 7, 8] },
  { label: "Aleatorio chico", values: [4, 2, 7, 1, 9, 3, 6, 5, 8] },
];

function shuffle(values: number[]): number[] {
  const arr = [...values];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function OrdenacionPage() {
  const [algoKey, setAlgoKey] = useState<AlgoKey>("bubble");
  const [values, setValues] = useState<number[]>(DEFAULT_VALUES);

  const algo = ALGOS.find((a) => a.key === algoKey)!;
  const steps = useMemo(() => algo.generate(values), [algo, values]);

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <ArrowDownUp className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Tema
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Ordenación
            </h1>
            <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
              Cinco estrategias clásicas. Mismo input, distintos enfoques —
              contá las <em>comparaciones</em> y los <em>intercambios</em> en
              cada uno y compará. Las barras son alturas proporcionales al
              valor.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {/* Tabs de algoritmos */}
          <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
            {ALGOS.map((a) => (
              <button
                key={a.key}
                onClick={() => setAlgoKey(a.key)}
                title={`${a.short} · ${a.big_o}`}
                className={[
                  "flex flex-col items-center gap-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  algoKey === a.key
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
                ].join(" ")}
              >
                <span>{a.label}</span>
                <span className="font-mono text-[10px] opacity-60">
                  {a.big_o}
                </span>
              </button>
            ))}
          </div>

          {/* Presets */}
          <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span>Input:</span>
            <select
              onChange={(e) => {
                const preset = PRESETS.find((p) => p.label === e.target.value);
                if (preset) setValues(preset.values);
              }}
              className="rounded-md border border-zinc-200 bg-white px-2 py-1 font-mono text-xs text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              defaultValue=""
            >
              <option value="" disabled>
                elegir preset
              </option>
              {PRESETS.map((p) => (
                <option key={p.label} value={p.label}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={() => setValues(shuffle(values))}
            className="flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Shuffle className="h-3.5 w-3.5" />
            Mezclar
          </button>

          <span className="ml-auto font-mono text-xs text-zinc-500">
            {steps.length} pasos · arr = [{values.join(", ")}]
          </span>
        </div>
      </header>

      <div className="min-h-0 flex-1">
        <AlgorithmPlayer
          key={`${algoKey}-${values.join("-")}`}
          code={algo.code}
          steps={steps}
          title={`${algo.label} sort — ${algo.big_o}`}
          renderVisualization={(step) => <SortBars state={step.state} />}
        />
      </div>
    </div>
  );
}
