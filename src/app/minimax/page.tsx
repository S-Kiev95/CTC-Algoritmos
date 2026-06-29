"use client";

import { useMemo } from "react";
import { Brain, GitBranch, Gamepad2 } from "lucide-react";
import { AlgorithmPlayer } from "@/components/AlgorithmPlayer";
import { PythonLesson } from "@/components/python/PythonLesson";
import { TatetiBoard } from "@/components/minimax/TatetiBoard";
import { MinimaxTree } from "@/components/minimax/MinimaxTree";
import { TatetiGame } from "@/components/minimax/TatetiGame";
import {
  DEMO_BOARD,
  DEMO_TURN,
  generateMinimaxSteps,
  winnerInfo,
  type MinimaxState,
} from "@/lib/minimax/tateti";

const MINIMAX_CODE = `def minimax(tablero, jugador):
    if hay_ganador(tablero): return valor(tablero)   # hoja: +1 / -1 / 0
    valores = []
    for jugada in libres(tablero):
        tablero[jugada] = jugador
        valores.append(minimax(tablero, rival(jugador)))
        tablero[jugada] = None
    if jugador == "X": return max(valores)   # MAX elige el mayor
    # jugador == "O"
    return min(valores)                       # MIN elige el menor
`;

export default function MinimaxPage() {
  return (
    <PythonLesson
      kicker="Algoritmo · Minimax"
      teoriaLabel="Teoría"
      icon={<Brain className="h-5 w-5" />}
      title="Minimax"
      subtitle={
        <>
          Cómo una IA juega <strong>óptimamente</strong> a juegos de dos
          jugadores, mirando todas las jugadas posibles y suponiendo que el rival
          también juega lo mejor que puede.
        </>
      }
      teoria={{
        resumen: (
          <>
            Minimax es un algoritmo de <strong>búsqueda adversaria</strong>: sirve
            para juegos por turnos de dos jugadores donde lo que es bueno para uno
            es malo para el otro (suma cero), como el tateti, las damas o el
            ajedrez. Explora el <strong>árbol de todas las jugadas posibles</strong>{" "}
            y elige el mejor movimiento <em>asumiendo que el rival también juega
            perfecto</em>.
          </>
        ),
        lectura: [
          {
            titulo: "Dos jugadores: MAX y MIN",
            contenido: (
              <>
                <p>
                  Le ponemos un número a cada final del juego desde la óptica de
                  uno de los jugadores. Para el tateti: <code>+1</code> si gana X,{" "}
                  <code>−1</code> si gana O, <code>0</code> si es empate.
                </p>
                <p>
                  Entonces <strong>X quiere maximizar</strong> ese número (es el
                  jugador <em>MAX</em>) y <strong>O quiere minimizarlo</strong> (es{" "}
                  <em>MIN</em>). En cada turno, el jugador que mueve elige la
                  jugada que más le conviene <em>a él</em>.
                </p>
              </>
            ),
          },
          {
            titulo: "El árbol de juego",
            contenido: (
              <>
                <p>
                  Desde la posición actual, cada jugada posible abre una rama; del
                  tablero resultante salen las jugadas del rival, y así
                  sucesivamente hasta llegar a posiciones <strong>terminales</strong>{" "}
                  (alguien ganó o empate). Eso forma el <strong>árbol de
                  decisión</strong>.
                </p>
                <p>
                  Minimax <strong>evalúa las hojas</strong> y después{" "}
                  <strong>propaga los valores hacia arriba</strong>: en un nodo de
                  MAX se toma el <em>máximo</em> de los hijos; en uno de MIN, el{" "}
                  <em>mínimo</em>. El valor que llega a la raíz dice el resultado
                  con juego perfecto, y el camino que lo produce es la jugada a
                  elegir.
                </p>
              </>
            ),
          },
          {
            titulo: "¿Dónde se usa?",
            contenido: (
              <>
                <p>
                  En la IA de juegos de tablero por turnos: tateti, damas, Connect
                  4, ajedrez (con variantes). En juegos chicos como el tateti se
                  puede explorar el árbol <em>entero</em> y jugar perfecto; en
                  juegos grandes el árbol es enorme, así que se corta a cierta
                  profundidad y se usa una <em>función de evaluación</em>.
                </p>
              </>
            ),
          },
          {
            titulo: "Poda alfa-beta (optimización)",
            contenido: (
              <>
                <p>
                  El árbol crece muy rápido. La <strong>poda alfa-beta</strong> es
                  una mejora que descarta ramas que no pueden cambiar la decisión
                  (porque ya hay una opción mejor garantizada), dando el{" "}
                  <em>mismo</em> resultado que Minimax pero explorando muchísimos
                  menos nodos.
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
                En la pestaña <strong>Árbol de decisión</strong> mirá cómo aparecen
                los valores en las hojas y suben: MAX se queda con el mayor, MIN
                con el menor. En <strong>Jugar</strong>, probá ganarle a la IA (no
                vas a poder 😉).
              </>
            ),
          },
        ],
        preguntas: [
          "¿Qué tipo de juegos resuelve Minimax?",
          "¿Qué significa que un jugador sea MAX y el otro MIN?",
          "¿Qué valor le damos a un empate, a que gane X y a que gane O?",
          "¿Cómo se calcula el valor de un nodo a partir de sus hijos?",
          "¿Por qué en juegos grandes (como el ajedrez) no se explora el árbol entero?",
          "¿Qué ventaja da la poda alfa-beta?",
        ],
      }}
      demos={[
        {
          id: "arbol",
          label: "Árbol de decisión",
          icon: <GitBranch className="h-3.5 w-3.5" />,
          render: () => <MinimaxDemo />,
        },
        {
          id: "jugar",
          label: "Jugar",
          icon: <Gamepad2 className="h-3.5 w-3.5" />,
          render: () => <TatetiGame />,
        },
      ]}
    />
  );
}

function MinimaxDemo() {
  const { steps } = useMemo(() => generateMinimaxSteps(DEMO_BOARD, DEMO_TURN), []);
  return (
    <AlgorithmPlayer
      code={MINIMAX_CODE}
      steps={steps}
      title="Minimax explorando el árbol y propagando valores"
      renderVisualization={(step) => <MinimaxVis state={step.state} />}
    />
  );
}

function MinimaxVis({ state }: { state: MinimaxState }) {
  const { board, tree, revealed, current, values } = state;
  const node = tree[current];
  const line = winnerInfo(board).line;
  return (
    <div className="flex w-full max-w-3xl flex-wrap items-start justify-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Posición del nodo
        </p>
        <TatetiBoard board={board} winLine={line} highlight={node?.move ?? null} size={46} />
      </div>
      <MinimaxTree tree={tree} revealed={revealed} current={current} values={values} />
    </div>
  );
}
