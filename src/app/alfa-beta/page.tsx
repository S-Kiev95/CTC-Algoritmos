"use client";

import { useMemo } from "react";
import { Scissors, GitBranch } from "lucide-react";
import Link from "next/link";
import { AlgorithmPlayer } from "@/components/AlgorithmPlayer";
import { PythonLesson } from "@/components/python/PythonLesson";
import { TatetiBoard } from "@/components/minimax/TatetiBoard";
import { AlfaBetaTree } from "@/components/minimax/AlfaBetaTree";
import { winnerInfo } from "@/lib/minimax/tateti";
import {
  AB_DEMO_BOARD,
  AB_DEMO_TURN,
  generateAlfaBetaSteps,
  type AlfaBetaState,
} from "@/lib/minimax/alfabeta";

const ALFABETA_CODE = `def alfabeta(tablero, jugador, alfa, beta):
    if hay_ganador(tablero): return valor(tablero)  # hoja
    if jugador == "X":                # MAX
        v = -inf
        for jugada in libres(tablero):
            tablero[jugada] = "X"
            v = max(v, alfabeta(tablero, "O", alfa, beta))
            alfa = max(alfa, v)
            if alfa >= beta: break    # poda beta
            tablero[jugada] = None
        return v
    v = inf                           # MIN (O)
    for jugada in libres(tablero):
        tablero[jugada] = "O"
        v = min(v, alfabeta(tablero, "X", alfa, beta))
        beta = min(beta, v)
        if beta <= alfa: break        # poda alfa
        tablero[jugada] = None
    return v
`;

export default function AlfaBetaPage() {
  return (
    <PythonLesson
      kicker="Optimización · Poda alfa-beta"
      teoriaLabel="Teoría"
      icon={<Scissors className="h-5 w-5" />}
      title="Poda alfa-beta"
      subtitle={
        <>
          La misma decisión que <strong>Minimax</strong>, pero{" "}
          <strong>explorando muchísimos menos nodos</strong>: descartamos ramas que
          ya no pueden cambiar el resultado.
        </>
      }
      teoria={{
        resumen: (
          <>
            La <strong>poda alfa-beta</strong> es una optimización de{" "}
            <Link href="/minimax" className="font-medium text-sky-600 underline-offset-2 hover:underline dark:text-sky-400">
              Minimax
            </Link>
            . Da <strong>exactamente el mismo resultado</strong> (el mismo valor en
            la raíz y la misma mejor jugada), pero evita explorar ramas que{" "}
            <em>no pueden</em> influir en la decisión. Para eso lleva dos cotas que
            viajan por el árbol: <code>α</code> y <code>β</code>.
          </>
        ),
        lectura: [
          {
            titulo: "Qué son α y β",
            contenido: (
              <>
                <p>
                  <strong>α (alfa)</strong> es <em>lo mejor que MAX (X) ya tiene
                  asegurado</em> en el camino actual: un piso. <strong>β (beta)</strong>{" "}
                  es <em>lo mejor que MIN (O) ya tiene asegurado</em>: un techo.
                  Empezamos con <code>α = −∞</code> y <code>β = +∞</code> y se van
                  ajustando a medida que bajamos.
                </p>
                <p>
                  En un nodo MAX, cada hijo puede <strong>subir α</strong>; en un
                  nodo MIN, cada hijo puede <strong>bajar β</strong>. Esas cotas se
                  heredan hacia abajo: un nodo recibe el α y el β de su padre.
                </p>
              </>
            ),
          },
          {
            titulo: "La regla de poda: α ≥ β",
            contenido: (
              <>
                <p>
                  Mientras exploramos los hijos de un nodo, si en algún momento{" "}
                  <strong>α ≥ β</strong>, <strong>podamos</strong>: dejamos de mirar
                  los hijos que faltan. ¿Por qué? Porque el jugador de{" "}
                  <em>arriba</em> ya tiene una opción mejor garantizada y nunca
                  elegiría este nodo, mire lo que mire después.
                </p>
                <p>
                  En un nodo MAX, cuando un hijo hace que <code>α ≥ β</code>, el
                  padre MIN ya no va a dejar que MAX llegue acá → <em>corte β</em>.
                  En un nodo MIN, cuando <code>β ≤ α</code>, el padre MAX ya tiene
                  algo mejor → <em>corte α</em>. Las ramas cortadas se dibujan{" "}
                  <strong>grises con una tijera ✂</strong>.
                </p>
              </>
            ),
          },
          {
            titulo: "Mismo resultado, menos trabajo",
            contenido: (
              <>
                <p>
                  La poda <strong>no cambia la respuesta</strong>: las ramas que
                  descarta no podían mejorar la decisión. Solo ahorra cálculo. En el
                  mejor caso (cuando probamos primero las mejores jugadas) el costo
                  baja de <code>O(b^d)</code> a aproximadamente{" "}
                  <code>O(b^(d/2))</code> — es como <em>duplicar la profundidad</em>{" "}
                  que se puede analizar con el mismo tiempo.
                </p>
                <p>
                  Por eso el <strong>orden de las jugadas</strong> importa tanto: si
                  mirás primero las jugadas prometedoras, podás antes y más.
                </p>
              </>
            ),
          },
        ],
        callouts: [
          {
            tipo: "tip",
            texto: (
              <>
                En la demo, el mismo árbol de tateti que en Minimax se recorre con
                α/β. Mirá el contador: <strong>Minimax visita 28 nodos</strong> y la
                poda explora <strong>solo 14</strong>. Las ramas con ✂ son las que
                nos ahorramos.
              </>
            ),
          },
        ],
        preguntas: [
          "¿Qué representan α y β?",
          "¿Cuál es la condición que dispara la poda?",
          "¿Por qué podar no cambia la jugada que elige el algoritmo?",
          "¿Por qué el orden en que se prueban las jugadas afecta cuánto se poda?",
          "En el mejor caso, ¿de qué orden pasa a ser el costo respecto a Minimax?",
        ],
      }}
      demos={[
        {
          id: "poda",
          label: "Árbol con poda",
          icon: <GitBranch className="h-3.5 w-3.5" />,
          render: () => <AlfaBetaDemo />,
        },
      ]}
    />
  );
}

function AlfaBetaDemo() {
  const { steps, minimaxNodes } = useMemo(
    () => generateAlfaBetaSteps(AB_DEMO_BOARD, AB_DEMO_TURN),
    [],
  );
  return (
    <AlgorithmPlayer
      code={ALFABETA_CODE}
      steps={steps}
      layout="stacked"
      title="Alfa-beta recorriendo el árbol y podando ramas"
      renderVisualization={(step) => (
        <AlfaBetaVis state={step.state} minimaxNodes={minimaxNodes} />
      )}
    />
  );
}

function AlfaBetaVis({
  state,
  minimaxNodes,
}: {
  state: AlfaBetaState;
  minimaxNodes: number;
}) {
  const { tree, revealed, current, values, bounds, pruned, explored } = state;
  const node = tree[current];
  const b = bounds[current];
  const line = winnerInfo(node?.board ?? []).line;
  return (
    <div className="flex w-full max-w-3xl flex-wrap items-start justify-center gap-6">
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Posición del nodo
          </p>
          <TatetiBoard
            board={node?.board ?? []}
            winLine={line}
            highlight={node?.move ?? null}
            size={44}
          />
        </div>
        {b && (
          <div className="flex gap-2 text-sm">
            <span className="rounded-md bg-sky-50 px-2 py-1 font-mono text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
              α = {b.alpha === -Infinity ? "−∞" : b.alpha === Infinity ? "+∞" : b.alpha > 0 ? "+1" : b.alpha < 0 ? "−1" : "0"}
            </span>
            <span className="rounded-md bg-rose-50 px-2 py-1 font-mono text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
              β = {b.beta === -Infinity ? "−∞" : b.beta === Infinity ? "+∞" : b.beta > 0 ? "+1" : b.beta < 0 ? "−1" : "0"}
            </span>
          </div>
        )}
        <div className="flex flex-col items-center gap-1 text-xs text-zinc-500">
          <div className="flex items-center gap-3">
            <span>
              Minimax:{" "}
              <strong className="text-zinc-700 dark:text-zinc-300">{minimaxNodes}</strong>{" "}
              nodos
            </span>
            <span>
              α-β:{" "}
              <strong className="text-emerald-600 dark:text-emerald-400">{explored}</strong>{" "}
              explorados
            </span>
          </div>
          {pruned.length > 0 && (
            <span className="text-zinc-400">{pruned.length} rama(s) podada(s) ✂</span>
          )}
        </div>
      </div>
      <AlfaBetaTree
        tree={tree}
        revealed={revealed}
        current={current}
        values={values}
        bounds={bounds}
        pruned={pruned}
      />
    </div>
  );
}
