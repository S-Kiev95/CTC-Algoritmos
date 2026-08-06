"use client";

import { useMemo, useState } from "react";
import { BookOpen, GitBranch, ListOrdered, Plus, Scale, Search } from "lucide-react";
import { AlgorithmPlayer } from "@/components/AlgorithmPlayer";
import { ResizableTopicShell } from "@/components/ResizableTopicShell";
import { Teoria } from "@/components/Teoria";
import { BSTView } from "@/components/algorithms/BSTView";
import { BalancedTreesView } from "@/components/algorithms/BalancedTreesView";
import {
  BALANCED_CODE,
  BALANCED_VALUES,
  generateBalancedSteps,
} from "@/lib/algorithms/binary-tree/balanced";
import {
  INSERT_BST_CODE,
  generateInsertBstSteps,
} from "@/lib/algorithms/binary-tree/insertBst";
import {
  SEARCH_BST_CODE,
  generateSearchBstSteps,
} from "@/lib/algorithms/binary-tree/searchBst";
import {
  INORDER_CODE,
  generateInorderSteps,
} from "@/lib/algorithms/binary-tree/inorderTraversal";
import {
  PREORDER_CODE,
  generatePreorderSteps,
} from "@/lib/algorithms/binary-tree/preorderTraversal";
import {
  POSTORDER_CODE,
  generatePostorderSteps,
} from "@/lib/algorithms/binary-tree/postorderTraversal";
import {
  SAMPLE_BST,
  SAMPLE_INSERT_VALUES,
} from "@/lib/algorithms/binary-tree/sampleBst";

type DemoKey = "teoria" | "insert" | "search" | "traversal" | "balanceados";
type TraversalOrder = "inorder" | "preorder" | "postorder";

const SEARCH_TARGETS = [
  { value: 60, label: "60 (existe, profundidad 2)" },
  { value: 50, label: "50 (raíz, instantáneo)" },
  { value: 20, label: "20 (existe, hoja)" },
  { value: 80, label: "80 (existe, último)" },
  { value: 35, label: "35 (no existe)" },
  { value: 100, label: "100 (no existe, mayor que todos)" },
];

const TRAVERSAL_ORDERS: {
  key: TraversalOrder;
  label: string;
  rule: string;
}[] = [
  {
    key: "inorder",
    label: "Inorden",
    rule: "izquierda → nodo → derecha · da los valores ordenados",
  },
  {
    key: "preorder",
    label: "Preorden",
    rule: "nodo → izquierda → derecha · raíz primero",
  },
  {
    key: "postorder",
    label: "Postorden",
    rule: "izquierda → derecha → nodo · raíz última",
  },
];

/** Secuencias de ejemplo para la demo de árboles balanceados. */
const BALANCED_PRESETS = [
  { label: "creciente", values: BALANCED_VALUES },
  { label: "desordenada", values: [70, 40, 10, 90, 30, 55, 20, 80, 60] },
  { label: "corta", values: [70, 40, 10] },
];

export default function ArbolesBinariosPage() {
  const [demo, setDemo] = useState<DemoKey>("teoria");
  const [searchTarget, setSearchTarget] = useState(60);
  const [traversalOrder, setTraversalOrder] =
    useState<TraversalOrder>("inorder");
  const [seqText, setSeqText] = useState(BALANCED_VALUES.join(", "));

  // Números separados por coma o espacio; se ignora lo que no sea número.
  const balancedValues = useMemo(
    () =>
      seqText
        .split(/[\s,]+/)
        .map((s) => Number(s))
        .filter((n) => Number.isFinite(n) && n !== 0)
        .slice(0, 20),
    [seqText],
  );

  const header = (
    <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <GitBranch className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Tema
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Árboles binarios de búsqueda (BST)
            </h1>
            <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
              Un caso especial de árbol binario donde cada nodo respeta la
              propiedad: <strong>todos los valores del subárbol izquierdo son
              menores</strong>, y <strong>todos los del derecho son mayores</strong>.
              Esa invariante permite operaciones en{" "}
              <span className="font-mono">O(log n)</span> en árboles
              balanceados (vs <span className="font-mono">O(n)</span> de una
              lista). La idea: cada comparación descarta la mitad del árbol.
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
              active={demo === "insert"}
              onClick={() => setDemo("insert")}
              icon={<Plus className="h-3.5 w-3.5" />}
            >
              Inserción
            </TabButton>
            <TabButton
              active={demo === "search"}
              onClick={() => setDemo("search")}
              icon={<Search className="h-3.5 w-3.5" />}
            >
              Búsqueda
            </TabButton>
            <TabButton
              active={demo === "traversal"}
              onClick={() => setDemo("traversal")}
              icon={<ListOrdered className="h-3.5 w-3.5" />}
            >
              Recorridos
            </TabButton>
            <TabButton
              active={demo === "balanceados"}
              onClick={() => setDemo("balanceados")}
              icon={<Scale className="h-3.5 w-3.5" />}
            >
              AVL vs Rojo-Negro
            </TabButton>
          </div>

          {demo === "search" && (
            <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-mono">objetivo =</span>
              <select
                value={searchTarget}
                onChange={(e) => setSearchTarget(Number(e.target.value))}
                className="rounded-md border border-zinc-200 bg-white px-2 py-1 font-mono text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                {SEARCH_TARGETS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          {demo === "traversal" && (
            <>
              <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-mono">orden =</span>
                <select
                  value={traversalOrder}
                  onChange={(e) =>
                    setTraversalOrder(e.target.value as TraversalOrder)
                  }
                  className="rounded-md border border-zinc-200 bg-white px-2 py-1 font-mono text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  {TRAVERSAL_ORDERS.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <span className="font-mono text-xs text-zinc-500">
                {
                  TRAVERSAL_ORDERS.find((t) => t.key === traversalOrder)
                    ?.rule
                }
              </span>
            </>
          )}

          {demo === "insert" && (
            <span className="font-mono text-xs text-zinc-500">
              valores = [{SAMPLE_INSERT_VALUES.join(", ")}]
            </span>
          )}

          {demo === "balanceados" && (
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-mono">insertar =</span>
                <input
                  value={seqText}
                  onChange={(e) => setSeqText(e.target.value)}
                  spellCheck={false}
                  className="w-56 rounded-md border border-zinc-200 bg-white px-2 py-1 font-mono text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </label>
              {BALANCED_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setSeqText(p.values.join(", "))}
                  className="rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {p.label}
                </button>
              ))}
              <span className="font-mono text-xs text-zinc-500">
                {balancedValues.length} valores
              </span>
            </div>
          )}
        </div>
    </header>
  );

  return (
    <ResizableTopicShell header={header}>
      {demo === "teoria" && <BSTTeoria />}
      {demo === "insert" && <InsertDemo />}
      {demo === "search" && (
        <SearchDemo key={`s-${searchTarget}`} target={searchTarget} />
      )}
      {demo === "traversal" && (
        <TraversalDemo key={`t-${traversalOrder}`} order={traversalOrder} />
      )}
      {demo === "balanceados" && (
        <BalancedDemo key={`b-${balancedValues.join("-")}`} values={balancedValues} />
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

function BSTTeoria() {
  return (
    <Teoria
      resumen={
        <>
          Jugamos a adivinar un número del 1 al 100. Si decís un número y te
          digo "es mayor" o "es menor", la <strong>mala estrategia</strong> es
          ir 1, 2, 3... La <strong>buena estrategia</strong> es preguntar por
          el 50, después 75 o 25, después 87 o 12... En 7 preguntas máximo
          adivinás cualquier número. Eso es un BST.
        </>
      }
      lectura={[
        {
          titulo: "Qué es un Árbol Binario de Búsqueda",
          contenido: (
            <>
              <p>
                Un árbol tiene una <strong>raíz</strong> arriba y de ahí bajan
                las ramas. Cada nodo tiene <em>máximo dos hijos</em>: uno a la
                izquierda y uno a la derecha. Esos hijos se conectan con
                referencias, igual que en las listas enlazadas, pero acá cada
                nodo conecta con dos.
              </p>
              <p>
                La <strong>regla</strong> que convierte un árbol binario en un
                BST es: los valores <em>menores</em> al actual van siempre a
                la izquierda, los <em>mayores</em> siempre a la derecha. Esa
                invariante se respeta en todos los niveles.
              </p>
            </>
          ),
        },
        {
          titulo: "¿Por qué tanta fama con reglas tan estrictas?",
          contenido: (
            <>
              <p>
                Porque si seguimos esa regla en cada nodo, la capacidad de
                búsqueda es brutal. En una hash table necesitamos conocer la{" "}
                <em>clave exacta</em> para acceder al valor, pero cuando
                buscamos un valor sin clave, el BST es la opción más poderosa.
              </p>
              <p>
                En un millón de elementos, podemos encontrar lo que buscamos
                en tan solo <strong>~20 pasos</strong>. No vamos nodo por nodo
                como en una lista enlazada (que serían hasta 1 millón de
                comparaciones); descartando mitades en 20 pasos encontramos
                cualquier cosa.
              </p>
              <p>
                Es gracias a los BST por lo cual las bases de datos pueden
                buscar entre miles de millones de registros en milisegundos.
              </p>
            </>
          ),
        },
        {
          titulo: "¿Dónde encontramos árboles en la vida cotidiana?",
          contenido: (
            <>
              <ul className="ml-5 list-disc space-y-1">
                <li>
                  <strong>Sistemas de archivos</strong>: las carpetas dentro
                  de las carpetas forman un árbol.
                </li>
                <li>
                  <strong>El DOM</strong> de una página web — etiquetas HTML
                  anidadas.
                </li>
                <li>
                  <strong>Índices de bases de datos</strong> — usan árboles
                  especiales llamados B-Trees.
                </li>
                <li>
                  <strong>Árboles de decisión</strong> en machine learning
                  clásico.
                </li>
                <li>
                  <strong>Monte Carlo Tree Search</strong>: la técnica que usó
                  AlphaGo (Deep Mind) para ganarle al campeón mundial de Go,
                  que explora millones de posibles jugadas representadas como
                  un árbol gigante.
                </li>
              </ul>
            </>
          ),
        },
        {
          titulo: "Cómo funciona la inserción",
          contenido: (
            <>
              <p>
                Si el árbol está vacío, el nodo nuevo se convierte en la raíz.
                Si no, comparamos: si el valor nuevo es menor que el del nodo
                actual, bajamos al hijo izquierdo y repetimos el proceso. Si
                es mayor, bajamos al derecho y repetimos. Seguimos bajando
                hasta encontrar un espacio vacío donde insertar.
              </p>
              <p>
                Esto es <strong>recursividad pura</strong> — cada paso
                descarta aproximadamente la mitad del árbol.
              </p>
            </>
          ),
        },
        {
          titulo: "El problema: un BST se puede desbalancear",
          contenido: (
            <>
              <p>
                Todo lo bueno del BST depende de que esté <strong>equilibrado</strong>.
                Si insertás los valores <em>en orden</em> (10, 20, 30, 40…), cada uno
                va siempre a la derecha del anterior: el árbol degenera en una{" "}
                <strong>lista enlazada</strong> y buscar vuelve a costar{" "}
                <span className="font-mono">O(n)</span>.
              </p>
              <p>
                La solución son los <strong>árboles balanceados</strong>, que se
                reacomodan solos con <strong>rotaciones</strong>: operaciones que
                cambian quién es padre de quién <em>sin romper el orden</em> del BST.
                Los dos más usados son el <strong>AVL</strong> y el{" "}
                <strong>Rojo-Negro</strong>.
              </p>
            </>
          ),
        },
        {
          titulo: "AVL: el estricto",
          contenido: (
            <>
              <p>
                Cada nodo guarda su <strong>factor de balance</strong>: la altura del
                subárbol derecho menos la del izquierdo. La regla es dura: ese número
                solo puede ser <strong>−1, 0 o +1</strong>.
              </p>
              <p>
                Si al insertar un nodo el factor llega a ±2, el árbol{" "}
                <strong>rota</strong> para arreglarlo. Hay cuatro casos, según de qué
                lado quedó el desbalance:
              </p>
              <ul className="ml-5 list-disc space-y-1">
                <li><strong>LL</strong> (pesa izquierda-izquierda): una rotación simple a la derecha.</li>
                <li><strong>RR</strong> (derecha-derecha): una rotación simple a la izquierda.</li>
                <li><strong>LR</strong> (izquierda-derecha): rotación doble — primero el hijo, después el nodo.</li>
                <li><strong>RL</strong> (derecha-izquierda): la doble simétrica.</li>
              </ul>
              <p>
                Al ser tan estricto queda <strong>bien bajito</strong> (búsquedas
                rapidísimas), pero paga el precio de <strong>rotar seguido</strong> al
                insertar y borrar.
              </p>
            </>
          ),
        },
        {
          titulo: "Rojo-Negro: el flexible",
          contenido: (
            <>
              <p>
                En vez de medir alturas, pinta cada nodo de{" "}
                <strong>rojo o negro</strong> y respeta estas reglas:
              </p>
              <ul className="ml-5 list-disc space-y-1">
                <li>La <strong>raíz</strong> es negra.</li>
                <li>Un nodo rojo <strong>no puede tener un hijo rojo</strong> (nunca dos rojos seguidos).</li>
                <li>
                  Todo camino desde un nodo hasta las hojas tiene la{" "}
                  <strong>misma cantidad de nodos negros</strong>.
                </li>
              </ul>
              <p>
                De esas reglas sale una garantía más floja que la del AVL: ningún
                camino puede ser más del <strong>doble</strong> de largo que otro. El
                árbol queda un poco más alto, pero necesita{" "}
                <strong>muchos menos arreglos</strong> al insertar. El nodo nuevo entra{" "}
                <em>rojo</em> y, si quedan dos rojos pegados, se recolorea o se rota.
              </p>
            </>
          ),
        },
        {
          titulo: "¿Cuál conviene?",
          contenido: (
            <>
              <ul className="ml-5 list-disc space-y-1">
                <li>
                  <strong>AVL</strong> cuando hacés <em>muchas búsquedas</em> y pocas
                  modificaciones: queda más bajo, así que buscar es más rápido. Se usa
                  mucho en índices de bases de datos en memoria.
                </li>
                <li>
                  <strong>Rojo-Negro</strong> cuando insertás y borrás <em>todo el
                  tiempo</em>: rota menos. Por eso lo usan el <code>map</code> y{" "}
                  <code>set</code> de C++, el <code>TreeMap</code> de Java y el
                  planificador de procesos de Linux.
                </li>
              </ul>
              <p>
                Los dos garantizan <span className="font-mono">O(log n)</span> para
                buscar, insertar y borrar. En la pestaña{" "}
                <strong>AVL vs Rojo-Negro</strong> podés insertar la misma secuencia en
                ambos y comparar la altura final y cuánto trabajó cada uno.
              </p>
            </>
          ),
        },
      ]}
      callouts={[
        {
          tipo: "atencion",
          texto: (
            <>
              Si insertás los valores en orden creciente (1, 2, 3, 4, 5) sobre
              un BST vacío, el árbol degenera en una lista enlazada inclinada
              a la derecha — perdés toda la ventaja. Por eso existen los{" "}
              <em>árboles balanceados</em> (AVL, Rojo-Negro) que rotan
              automáticamente para mantenerse balanceados.
            </>
          ),
        },
      ]}
      preguntas={[
        "¿Cuál es la regla fundamental que convierte un árbol binario común en un árbol binario de búsqueda? ¿Por qué esa regla es lo que permite buscar tan rápido?",
        "Tenés un ABB con 1 millón de nodos. En el peor caso, ¿cuántos pasos necesitás para encontrar un valor? Comparalo con una lista enlazada y con una hash table. ¿Cuándo elegirías cada una?",
        "Insertás los valores 5, 3, 7, 1, 4 en ese orden en un ABB vacío. Dibujá el árbol resultante a mano. ¿Qué pasa si los insertás en orden 1, 2, 3, 4, 5? ¿Qué problema genera eso?",
        "¿Por qué para buscar un valor desconocido un ABB es más poderoso que una hash table? ¿Qué limitación tiene la hash table en ese caso?",
        "El método insertar usa recursividad. Explicá con tus palabras qué hace en cada llamada recursiva y cuándo se detiene.",
        "¿Qué es el factor de balance de un nodo en un AVL y qué valores puede tomar?",
        "Nombrá las tres reglas de un árbol Rojo-Negro. ¿Qué garantiza el hecho de que todo camino tenga la misma cantidad de negros?",
        "Un AVL queda más bajo que un Rojo-Negro con los mismos datos. ¿Por qué entonces no se usa siempre AVL? ¿En qué caso conviene cada uno?",
      ]}
      ejercicio={{
        descripcion: (
          <>
            Implementá el juego de adivinar un número del 1 al 100, usando la
            estrategia "preguntar por la mitad" que es exactamente cómo busca
            un BST.
          </>
        ),
        codigo: `import random

def jugar():
    numero_secreto = random.randint(1, 100)
    intentos = 0

    print("=== Adivina el número ===")
    print("Pensé un número del 1 al 100. ¿Cuál es?")
    print()

    # 1. Hacé un bucle que siga preguntando hasta que el usuario adivine.
    #    Usá input() para pedir el número y int() para convertirlo.
    #    Manejá el caso donde el usuario ingrese algo que no sea número.

    # 2. En cada intento sumá 1 al contador de intentos.

    # 3. Compará el intento con numero_secreto:
    #    - Si es igual: mostrá cuántos intentos usó.
    #                   Si fueron 7 o menos, felicitalo por pensar como un ABB.
    #                   Si fueron más, desafialo a intentar dividir por la mitad.
    #                   Salí del bucle.
    #    - Si es mayor: avisá que es muy alto.
    #    - Si es menor: avisá que es muy bajo.

    pass


jugar()
`,
      }}
    />
  );
}

function InsertDemo() {
  const steps = useMemo(
    () => generateInsertBstSteps(SAMPLE_INSERT_VALUES),
    [],
  );
  return (
    <AlgorithmPlayer
      code={INSERT_BST_CODE}
      steps={steps}
      title={`Insertando [${SAMPLE_INSERT_VALUES.join(", ")}] uno por uno`}
      renderVisualization={(step) => <BSTView state={step.state} />}
    />
  );
}

function SearchDemo({ target }: { target: number }) {
  const steps = useMemo(
    () => generateSearchBstSteps(SAMPLE_BST, target),
    [target],
  );
  return (
    <AlgorithmPlayer
      code={SEARCH_BST_CODE}
      steps={steps}
      title={`buscar(raíz, ${target})`}
      renderVisualization={(step) => <BSTView state={step.state} />}
    />
  );
}

function BalancedDemo({ values }: { values: number[] }) {
  const steps = useMemo(() => generateBalancedSteps(values), [values]);
  if (values.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-zinc-500">
          Escribí algunos números (separados por coma) para insertarlos en los dos árboles.
        </p>
      </div>
    );
  }
  return (
    <AlgorithmPlayer
      code={BALANCED_CODE}
      steps={steps}
      title="La misma secuencia en un AVL y en un Rojo-Negro"
      renderVisualization={(step) => <BalancedTreesView state={step.state} />}
    />
  );
}

function TraversalDemo({ order }: { order: TraversalOrder }) {
  const { code, steps, title } = useMemo(() => {
    if (order === "preorder") {
      return {
        code: PREORDER_CODE,
        steps: generatePreorderSteps(SAMPLE_BST),
        title: "preorden(raíz) — recorre nodo → izq → der",
      };
    }
    if (order === "postorder") {
      return {
        code: POSTORDER_CODE,
        steps: generatePostorderSteps(SAMPLE_BST),
        title: "postorden(raíz) — recorre izq → der → nodo",
      };
    }
    return {
      code: INORDER_CODE,
      steps: generateInorderSteps(SAMPLE_BST),
      title: "inorden(raíz) — recorre izq → nodo → der",
    };
  }, [order]);

  return (
    <AlgorithmPlayer
      code={code}
      steps={steps}
      title={title}
      renderVisualization={(step) => <BSTView state={step.state} />}
    />
  );
}
