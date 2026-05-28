"use client";

import { useMemo, useState } from "react";
import { BookOpen, Hash, Plus, Route, Search } from "lucide-react";
import { AlgorithmPlayer } from "@/components/AlgorithmPlayer";
import { Teoria } from "@/components/Teoria";
import { HashTable } from "@/components/algorithms/HashTable";
import {
  CHAINING_INSERT_CODE,
  generateChainingInsertSteps,
} from "@/lib/algorithms/hash-table/chainingInsert";
import {
  OPEN_ADDRESSING_INSERT_CODE,
  generateOpenAddressingInsertSteps,
} from "@/lib/algorithms/hash-table/openAddressingInsert";
import {
  CHAINING_SEARCH_CODE,
  generateChainingSearchSteps,
} from "@/lib/algorithms/hash-table/chainingSearch";
import { hashString, type HashEntry } from "@/lib/algorithms/hash-table/types";

type DemoKey = "teoria" | "chaining" | "openAddressing" | "search";

const TABLE_SIZE = 7;

const PAIRS = [
  { key: "ana", value: 25 },
  { key: "luis", value: 30 },
  { key: "eva", value: 28 },
  { key: "juan", value: 22 }, // colisiona con ana en bucket 3
  { key: "leo", value: 35 },
];

const SEARCH_TARGETS = [
  { key: "juan", label: "juan (en un chain)" },
  { key: "ana", label: "ana (primero del chain)" },
  { key: "eva", label: "eva (sin chain)" },
  { key: "carlos", label: "carlos (no existe)" },
];

/**
 * Construye los buckets que resultan de aplicar chaining-insert a los pares,
 * sin generar los pasos. Se usa para precargar la tabla en el demo de búsqueda.
 */
function buildPrebuiltBuckets(): HashEntry[][] {
  const buckets: HashEntry[][] = Array.from({ length: TABLE_SIZE }, () => []);
  PAIRS.forEach((p, idx) => {
    const entry: HashEntry = { id: `e${idx}`, key: p.key, value: p.value };
    const idx2 = hashString(p.key, TABLE_SIZE);
    buckets[idx2].push(entry);
  });
  return buckets;
}

export default function TablasHashPage() {
  const [demo, setDemo] = useState<DemoKey>("teoria");
  const [searchTarget, setSearchTarget] = useState<string>("juan");

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <Hash className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Tema
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Tablas hash
            </h1>
            <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
              Una <em>función hash</em> mapea cada clave a un índice de la
              tabla. Operaciones promedio{" "}
              <span className="font-mono">O(1)</span>; peor caso{" "}
              <span className="font-mono">O(n)</span> cuando hay muchas
              colisiones. Para resolverlas hay dos estrategias clásicas:{" "}
              <strong>encadenamiento</strong> y{" "}
              <strong>direccionamiento abierto</strong>.
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          hash(clave) = sum(ord(c) for c in clave) % {TABLE_SIZE} &nbsp;·&nbsp;
          pares: {PAIRS.map((p) => `("${p.key}", ${p.value})`).join(", ")}
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
              active={demo === "chaining"}
              onClick={() => setDemo("chaining")}
              icon={<Plus className="h-3.5 w-3.5" />}
            >
              Inserción · Encadenamiento
            </TabButton>
            <TabButton
              active={demo === "openAddressing"}
              onClick={() => setDemo("openAddressing")}
              icon={<Route className="h-3.5 w-3.5" />}
            >
              Inserción · Direcc. abierto
            </TabButton>
            <TabButton
              active={demo === "search"}
              onClick={() => setDemo("search")}
              icon={<Search className="h-3.5 w-3.5" />}
            >
              Búsqueda · Encadenamiento
            </TabButton>
          </div>

          {demo === "search" && (
            <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-mono">clave =</span>
              <select
                value={searchTarget}
                onChange={(e) => setSearchTarget(e.target.value)}
                className="rounded-md border border-zinc-200 bg-white px-2 py-1 font-mono text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                {SEARCH_TARGETS.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1">
        {demo === "teoria" && <HashTeoria />}
        {demo === "chaining" && <ChainingDemo />}
        {demo === "openAddressing" && <OpenAddressingDemo />}
        {demo === "search" && (
          <SearchDemo key={`s-${searchTarget}`} target={searchTarget} />
        )}
      </div>
    </div>
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

function HashTeoria() {
  return (
    <Teoria
      resumen={
        <>
          Probablemente la estructura más importante de todas. Si solo
          aprendés una de este apunte, que sea la <strong>Hash Table</strong>{" "}
          (también llamada diccionario, mapa u objeto según el lenguaje — el
          concepto es el mismo).
        </>
      }
      lectura={[
        {
          titulo: "La analogía del diccionario de papel",
          contenido: (
            <>
              <p>
                Si buscás la palabra <em>manzana</em>, no empezás buscando en
                la página uno: vas directo a la sección de la <strong>M</strong>.
                Una hash table hace exactamente eso, pero con matemáticas por
                detrás.
              </p>
            </>
          ),
        },
        {
          titulo: "¿Cómo funciona por dentro?",
          contenido: (
            <>
              <p>
                Cuando guardás un valor con una clave —por ejemplo, la palabra{" "}
                <em>manzana</em> como clave y sus datos como valor— la hash
                table toma esa clave y la pasa por una <strong>función hash</strong>.
                Esta función convierte el texto en un número, y ese número es
                la <strong>posición exacta</strong> en la tabla donde se guarda
                el valor.
              </p>
              <p>
                Cuando querés buscar después, la función genera siempre el{" "}
                <em>mismo número</em> frente a la misma clave y va directo a la
                tabla para obtener el valor almacenado. Es un solo paso, no
                importa si tenés 100 registros o 100 millones.
              </p>
            </>
          ),
        },
        {
          titulo: "¿Dónde la usás sin saberlo?",
          contenido: (
            <>
              <p>
                El caché de tu navegador, las sesiones de usuarios cuando
                iniciás sesión, contar palabras en un texto, detectar
                duplicados, buscar usuarios por email, los índices de las bases
                de datos, las variables de entorno de tu sistema operativo.
              </p>
              <p>
                <strong>Es probablemente la estructura más usada del mundo
                real.</strong>
              </p>
            </>
          ),
        },
        {
          titulo: "Las colisiones (el pero)",
          contenido: (
            <>
              <p>
                Dos claves distintas pueden hash-ear al mismo número (al mismo
                bucket). Eso se llama <em>colisión</em> y siempre va a pasar
                eventualmente — el dominio de claves es infinito, los buckets
                son finitos.
              </p>
              <p>
                Hay dos estrategias clásicas: <strong>encadenamiento</strong>{" "}
                (las entradas que colisionan conviven en una lista dentro del
                bucket) y <strong>direccionamiento abierto</strong> (si el slot
                está ocupado, "sondeamos" el siguiente). Ambas se muestran en
                las tabs de Inserción.
              </p>
            </>
          ),
        },
      ]}
      callouts={[
        {
          tipo: "tip",
          texto: (
            <>
              Para contar palabras en un texto, recorrés palabra por palabra y
              hacés <code>tabla[palabra] += 1</code>. En tres líneas tenés un
              contador de frecuencias.
            </>
          ),
        },
      ]}
      preguntas={[
        "Explicá con tus palabras qué hace la función hash. ¿Por qué es importante que la misma clave siempre genere el mismo número?",
        "Tenés 100 millones de usuarios guardados en una hash table. Buscás uno por su email. ¿Cuántas operaciones hace la computadora? Comparalo con lo que haría un array buscando el mismo email sin conocer el índice.",
        "¿Qué diferencia hay entre una hash table y un array si en ambos el acceso es rápido? ¿Cuándo usarías cada uno?",
        "El contador de palabras del ejemplo recorre el texto palabra por palabra. ¿Por qué usar una hash table para contar es más eficiente que usar una lista?",
        "De los ejemplos de la letra (caché, sesiones, duplicados, índices de base de datos), elegí uno y explicá en detalle por qué una hash table es la estructura ideal para ese caso.",
      ]}
      ejercicio={{
        descripcion: (
          <>
            Practicá las operaciones más comunes con un diccionario Python.
          </>
        ),
        codigo: `# En Python la hash table es el diccionario: {}

# 1. Creá un inventario de frutas donde la clave es el nombre
#    y el valor es un diccionario con "color" y "cantidad".
#    Incluí al menos: manzana, durazno, pera.
inventario = {}
# tu código acá

# 2. Accedé e imprimí el color de la manzana y la cantidad de duraznos.
#    Una operación cada una. Sin recorrer nada.

# 3. Actualizá la cantidad de manzanas: llegaron 50 unidades más.
#    Sumá al valor existente, no lo reemplaces.

# 4. Agregá "uva" con color "verde" y cantidad 200.

# 5. Verificá si "sandía" está en el inventario antes de accederla.
#    Imprimí "Existe" o "No existe" según corresponda.
#    Pista: usá el operador \`in\`. ¿Por qué es mejor que intentar
#    acceder directamente y capturar un error?

# 6. Recorré todo el inventario e imprimí cada fruta con su información.
#    Formato: "manzana → color: rojo, cantidad: X"
`,
      }}
    />
  );
}

function ChainingDemo() {
  const steps = useMemo(
    () => generateChainingInsertSteps(PAIRS, TABLE_SIZE),
    [],
  );
  return (
    <AlgorithmPlayer
      code={CHAINING_INSERT_CODE}
      steps={steps}
      title="insertar(...) — encadenamiento"
      renderVisualization={(step) => <HashTable state={step.state} />}
    />
  );
}

function OpenAddressingDemo() {
  const steps = useMemo(
    () => generateOpenAddressingInsertSteps(PAIRS, TABLE_SIZE),
    [],
  );
  return (
    <AlgorithmPlayer
      code={OPEN_ADDRESSING_INSERT_CODE}
      steps={steps}
      title="insertar(...) — direccionamiento abierto"
      renderVisualization={(step) => <HashTable state={step.state} />}
    />
  );
}

function SearchDemo({ target }: { target: string }) {
  const steps = useMemo(() => {
    const buckets = buildPrebuiltBuckets();
    return generateChainingSearchSteps(buckets, TABLE_SIZE, target);
  }, [target]);
  return (
    <AlgorithmPlayer
      code={CHAINING_SEARCH_CODE}
      steps={steps}
      title={`buscar(tabla, "${target}")`}
      renderVisualization={(step) => <HashTable state={step.state} />}
    />
  );
}
