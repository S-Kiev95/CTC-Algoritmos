"use client";

import { useMemo, useState } from "react";
import { BookOpen, Boxes, Grid3x3, Wheat } from "lucide-react";
import { AlgorithmPlayer } from "@/components/AlgorithmPlayer";
import { ResizableTopicShell } from "@/components/ResizableTopicShell";
import { Teoria } from "@/components/Teoria";
import { Array1D } from "@/components/algorithms/Array1D";
import { Grid2D } from "@/components/algorithms/Grid2D";
import { ChessRiceBoard } from "@/components/algorithms/ChessRiceBoard";
import {
  LINEAR_SEARCH_CODE,
  generateLinearSearchSteps,
} from "@/lib/algorithms/arrays/linearSearch";
import {
  ROW_MAJOR_CODE,
  generateRowMajorSteps,
} from "@/lib/algorithms/arrays/rowMajor2d";
import {
  CHESS_RICE_CODE,
  generateChessRiceSteps,
} from "@/lib/algorithms/arrays/chessRice";

type DemoKey = "teoria" | "busqueda" | "recorrido2d" | "ajedrez";

const DEFAULT_ARRAY = [3, 7, 1, 9, 4, 8, 2];

const DEFAULT_MATRIX = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
];

export default function ArreglosPage() {
  const [demo, setDemo] = useState<DemoKey>("teoria");
  const [target, setTarget] = useState<number>(9);
  const [boardSize, setBoardSize] = useState<number>(4);

  const header = (
    <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          <Boxes className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Tema
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Arreglos
            </h1>
            <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
              Memoria contigua e indexable. El acceso por índice es{" "}
              <span className="font-mono">O(1)</span>; recorrer todo el arreglo
              es <span className="font-mono">O(n)</span>.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
            <TabButton
              active={demo === "teoria"}
              onClick={() => setDemo("teoria")}
              icon={<BookOpen className="h-3.5 w-3.5" />}
            >
              Teoría
            </TabButton>
            <TabButton
              active={demo === "busqueda"}
              onClick={() => setDemo("busqueda")}
              icon={<Boxes className="h-3.5 w-3.5" />}
            >
              1D: Búsqueda lineal
            </TabButton>
            <TabButton
              active={demo === "recorrido2d"}
              onClick={() => setDemo("recorrido2d")}
              icon={<Grid3x3 className="h-3.5 w-3.5" />}
            >
              2D: Recorrido
            </TabButton>
            <TabButton
              active={demo === "ajedrez"}
              onClick={() => setDemo("ajedrez")}
              icon={<Wheat className="h-3.5 w-3.5" />}
            >
              Granos de arroz
            </TabButton>
          </div>

          {demo === "busqueda" && (
            <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-mono">objetivo =</span>
              <select
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="rounded-md border border-zinc-200 bg-white px-2 py-1 font-mono text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                {DEFAULT_ARRAY.map((v) => (
                  <option key={v} value={v}>
                    {v} (existe)
                  </option>
                ))}
                <option value={99}>99 (no existe)</option>
              </select>
            </label>
          )}

          {demo === "ajedrez" && (
            <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-mono">tablero =</span>
              <select
                value={boardSize}
                onChange={(e) => setBoardSize(Number(e.target.value))}
                className="rounded-md border border-zinc-200 bg-white px-2 py-1 font-mono text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value={3}>3 × 3</option>
                <option value={4}>4 × 4</option>
                <option value={5}>5 × 5</option>
                <option value={6}>6 × 6</option>
                <option value={8}>8 × 8 (clásico)</option>
              </select>
              <span className="text-xs text-zinc-400">
                ojo: 8×8 ≈ 384 pasos
              </span>
            </label>
          )}
        </div>

        {demo === "ajedrez" && (
          <ChessStoryNote />
        )}
    </header>
  );

  return (
    <ResizableTopicShell header={header}>
      {demo === "teoria" && <ArreglosTeoria />}
      {demo === "busqueda" && (
        <BusquedaDemo key={`b-${target}`} target={target} />
      )}
      {demo === "recorrido2d" && <Recorrido2DDemo key="r2d" />}
      {demo === "ajedrez" && (
        <AjedrezDemo key={`a-${boardSize}`} size={boardSize} />
      )}
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

function ChessStoryNote() {
  return (
    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
      <p className="font-semibold">La leyenda del inventor del ajedrez</p>
      <p className="mt-1 leading-relaxed">
        Cuenta la historia que el inventor del ajedrez pidió como recompensa un
        grano de arroz en la primera casilla, dos en la segunda, cuatro en la
        tercera... duplicando hasta la 64. El rey accedió, sin saber que la
        suma resulta en{" "}
        <span className="font-mono">2⁶⁴ − 1 ≈ 18,4 trillones</span> de granos.
        Acá lo recorremos con una función recursiva: cada casilla es una
        llamada que avanza a la siguiente.
      </p>
    </div>
  );
}

function ArreglosTeoria() {
  return (
    <Teoria
      resumen={
        <>
          Imaginate el estacionamiento de un centro comercial: cada espacio
          tiene un número pintado en el suelo, 0, 1, 2... hasta el 1000. Si te
          digo que tu carro está en el espacio 747, vas directo a esa posición,
          no revisás espacio por espacio. <strong>Eso es un array.</strong>
        </>
      }
      lectura={[
        {
          titulo: "¿Por qué es tan rápido el acceso por índice?",
          contenido: (
            <>
              <p>
                En memoria, los elementos están guardados uno pegado al otro en
                bloques del mismo tamaño. La computadora hace una cuenta
                simple: <code>dirección_inicial + índice × tamaño</code>, y así
                es capaz de llegar al dato en unas simples sumas.
              </p>
              <p>
                No importa si tenés 10 elementos o 10 millones: acceder a la
                información es una operación computacional instantánea —{" "}
                <code>O(1)</code>.
              </p>
            </>
          ),
        },
        {
          titulo: "El talón de Aquiles: insertar en el medio",
          contenido: (
            <>
              <p>
                Si querés meter un elemento en el medio, tenés que correr todos
                los demás elementos siguientes un espacio a la derecha.
                Imaginate mover 500 autos del estacionamiento a la derecha para
                meter uno nuevo en la posición del medio.
              </p>
              <p>
                Por eso las operaciones de inserción son lentas y costosas; se
                debe crear un nuevo array con la nueva longitud y reinsertar
                todo de nuevo en las posiciones correspondientes.
              </p>
            </>
          ),
        },
        {
          titulo: "Cuándo usar un array",
          contenido: (
            <>
              <p>
                <strong>Tip:</strong> usá un array cuando <em>leés más de lo
                que modificás</em>. Si tu uso principal es acceder a elementos
                por posición y rara vez insertás en el medio, el array es la
                estructura ideal.
              </p>
            </>
          ),
        },
      ]}
      callouts={[
        {
          tipo: "ejemplo",
          texto: (
            <>
              Insertar Honda en la posición 1 de{" "}
              <code>[Toyota, Mazda, Ford, BMW, Audi, Tesla]</code> obliga a
              correr Mazda, Ford, BMW, Audi y Tesla una posición a la derecha
              para hacer espacio. Si tuvieras un millón de elementos, tendrías
              que mover un millón.
            </>
          ),
        },
      ]}
      preguntas={[
        "¿Por qué acceder a un elemento de un array por su índice es siempre igual de rápido, sin importar si el array tiene 10 o 10 millones de elementos?",
        "Tenés un array de 500 autos. Insertás un auto nuevo en la posición 0. ¿Cuántos elementos se desplazan? ¿Y si lo insertás al final?",
        "¿En qué situación te conviene usar un array y en cuál sería una mala elección? Justificá con un ejemplo concreto.",
        "¿Qué diferencia hay en costo computacional entre push() (agregar al final) y splice() (insertar en el medio)?",
      ]}
      ejercicio={{
        descripcion: (
          <>
            Practicá las operaciones básicas de arrays y observá la diferencia
            de costo entre acceso, agregar al final, e insertar en el medio.
          </>
        ),
        codigo: `# Array de autos
autos = ["Toyota", "Mazda", "Ford", "BMW", "Audi"]

# 1. Acceso por índice — O(1), instantáneo
print(autos[2])             # Ford

# 2. Agregar al final — O(1) amortizado
autos.append("Tesla")
print(autos)                # [..., Tesla]

# 3. Insertar en el medio — O(n), lento
autos.insert(1, "Honda")    # mueve todo desde índice 1 a la derecha
print(autos)                # [Toyota, Honda, Mazda, Ford, BMW, Audi, Tesla]

# 4. Eliminar del medio — O(n), también lento
autos.pop(2)                # saca "Mazda", corre todo a la izquierda

# Ejercicio:
# Escribí una función que reciba un array y un índice,
# y devuelva CUÁNTOS elementos se moverían si insertaras
# un elemento nuevo en esa posición.
def movimientos_al_insertar(arr, indice):
    # tu código acá
    pass

print(movimientos_al_insertar([1, 2, 3, 4, 5], 0))   # 5
print(movimientos_al_insertar([1, 2, 3, 4, 5], 5))   # 0
print(movimientos_al_insertar([1, 2, 3, 4, 5], 2))   # 3
`,
      }}
    />
  );
}

function BusquedaDemo({ target }: { target: number }) {
  const steps = useMemo(
    () => generateLinearSearchSteps(DEFAULT_ARRAY, target),
    [target],
  );
  return (
    <AlgorithmPlayer
      code={LINEAR_SEARCH_CODE}
      steps={steps}
      title={`busqueda_lineal([${DEFAULT_ARRAY.join(", ")}], ${target})`}
      renderVisualization={(step) => <Array1D state={step.state} />}
    />
  );
}

function Recorrido2DDemo() {
  const steps = useMemo(() => generateRowMajorSteps(DEFAULT_MATRIX), []);
  return (
    <AlgorithmPlayer
      code={ROW_MAJOR_CODE}
      steps={steps}
      title={`recorrer(matriz ${DEFAULT_MATRIX.length}×${DEFAULT_MATRIX[0].length})`}
      renderVisualization={(step) => <Grid2D state={step.state} />}
    />
  );
}

function AjedrezDemo({ size }: { size: number }) {
  const steps = useMemo(() => generateChessRiceSteps(size), [size]);
  return (
    <AlgorithmPlayer
      code={CHESS_RICE_CODE}
      steps={steps}
      title={`colocar(0, 0, 0) — tablero ${size}×${size}`}
      renderVisualization={(step) => <ChessRiceBoard state={step.state} />}
    />
  );
}
