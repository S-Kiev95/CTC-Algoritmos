"use client";

import { useMemo, useState } from "react";
import { FootprintsIcon, Network, Ruler, Sigma } from "lucide-react";
import { AlgorithmPlayer } from "@/components/AlgorithmPlayer";
import { ResizableTopicShell } from "@/components/ResizableTopicShell";
import { TreeView } from "@/components/algorithms/TreeView";
import {
  TRAVERSE_CODE,
  generateTraverseSteps,
} from "@/lib/algorithms/tree/traverse";
import {
  COUNT_NODES_CODE,
  generateCountNodesSteps,
} from "@/lib/algorithms/tree/countNodes";
import {
  TREE_HEIGHT_CODE,
  generateTreeHeightSteps,
} from "@/lib/algorithms/tree/treeHeight";
import { SAMPLE_TREE } from "@/lib/algorithms/tree/sampleTree";

type DemoKey = "traverse" | "count" | "height";

export default function ArbolesPage() {
  const [demo, setDemo] = useState<DemoKey>("traverse");

  const header = (
    <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <Network className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Tema
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Árboles
            </h1>
            <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
              Un <strong>árbol</strong> es una estructura jerárquica que parte
              de un nodo <em>raíz</em>; cada nodo tiene cero o más{" "}
              <em>hijos</em>, y los nodos sin hijos se llaman <em>hojas</em>.
              La relación es siempre padre → hijo (un solo camino), nunca
              hay ciclos. Casi todo algoritmo sobre árboles se resuelve con{" "}
              <strong>recursión</strong>: aplico la misma lógica al subárbol
              de cada hijo, y combino sus resultados.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
            <TabButton
              active={demo === "traverse"}
              onClick={() => setDemo("traverse")}
              icon={<FootprintsIcon className="h-3.5 w-3.5" />}
            >
              Recorrido (DFS)
            </TabButton>
            <TabButton
              active={demo === "count"}
              onClick={() => setDemo("count")}
              icon={<Sigma className="h-3.5 w-3.5" />}
            >
              Contar nodos
            </TabButton>
            <TabButton
              active={demo === "height"}
              onClick={() => setDemo("height")}
              icon={<Ruler className="h-3.5 w-3.5" />}
            >
              Altura
            </TabButton>
          </div>
        </div>
    </header>
  );

  return (
    <ResizableTopicShell header={header}>
      {demo === "traverse" && <TraverseDemo />}
      {demo === "count" && <CountDemo />}
      {demo === "height" && <HeightDemo />}
    </ResizableTopicShell>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
      ].join(" ")}
    >
      {icon}
      {children}
    </button>
  );
}

function TraverseDemo() {
  const steps = useMemo(() => generateTraverseSteps(SAMPLE_TREE), []);
  return (
    <AlgorithmPlayer
      code={TRAVERSE_CODE}
      steps={steps}
      title="recorrer(raiz) — visita cada nodo en orden DFS"
      renderVisualization={(step) => <TreeView state={step.state} />}
    />
  );
}

function CountDemo() {
  const steps = useMemo(() => generateCountNodesSteps(SAMPLE_TREE), []);
  return (
    <AlgorithmPlayer
      code={COUNT_NODES_CODE}
      steps={steps}
      title="contar(raiz) — cantidad total de nodos"
      renderVisualization={(step) => <TreeView state={step.state} />}
    />
  );
}

function HeightDemo() {
  const steps = useMemo(() => generateTreeHeightSteps(SAMPLE_TREE), []);
  return (
    <AlgorithmPlayer
      code={TREE_HEIGHT_CODE}
      steps={steps}
      title="altura(raiz) — aristas del camino más largo a una hoja"
      renderVisualization={(step) => <TreeView state={step.state} />}
    />
  );
}
