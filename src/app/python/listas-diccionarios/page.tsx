"use client";

import { useMemo } from "react";
import { Brackets, ListOrdered, Sparkles } from "lucide-react";
import { AlgorithmPlayer } from "@/components/AlgorithmPlayer";
import { PythonLesson } from "@/components/python/PythonLesson";
import { ListDictView } from "@/components/python/ListDictView";
import {
  LISTAS_CODE,
  COMPREHENSION_CODE,
  generateListasSteps,
  generateComprehensionSteps,
} from "@/lib/python/listasDiccionarios";

export default function ListasDiccionariosPage() {
  return (
    <PythonLesson
      icon={<Brackets className="h-5 w-5" />}
      title="Listas y diccionarios"
      subtitle={
        <>
          Las dos colecciones que más vas a usar: <strong>listas</strong>{" "}
          (ordenadas, por índice) y <strong>diccionarios</strong> (pares
          clave-valor).
        </>
      }
      teoria={{
        resumen: (
          <>
            Una <strong>lista</strong> <code>[]</code> guarda elementos en orden y
            se accede por índice (desde 0). Un <strong>diccionario</strong>{" "}
            <code>{`{}`}</code> guarda pares <em>clave → valor</em> y se accede por
            la clave.
          </>
        ),
        lectura: [
          {
            titulo: "Listas: agregar, sacar, acceder",
            contenido: (
              <>
                <p>
                  <code>append()</code> agrega al final, <code>pop()</code> saca
                  el último (y lo devuelve), <code>remove(x)</code> saca el{" "}
                  <em>valor</em> x (no la posición). Accedés por índice con{" "}
                  <code>numeros[0]</code>, y con índices negativos contás desde el
                  final: <code>numeros[-1]</code> es el último.
                </p>
              </>
            ),
          },
          {
            titulo: "Slicing (rebanado)",
            contenido: (
              <>
                <p>
                  <code>numeros[1:3]</code> devuelve una sublista con los índices
                  1 y 2 — el límite de la derecha <em>no</em> se incluye.{" "}
                  <code>numeros[:2]</code> desde el inicio, <code>numeros[2:]</code>{" "}
                  hasta el final.
                </p>
              </>
            ),
          },
          {
            titulo: "List comprehensions",
            contenido: (
              <>
                <p>
                  Una forma corta de crear listas:{" "}
                  <code>[n**3 for n in numeros]</code>. Se lee como{" "}
                  <em>[operación · bucle · iterable]</em>, y podés filtrar al final
                  con una condición: <code>[n for n in numeros if n % 2 == 0]</code>.
                </p>
              </>
            ),
          },
          {
            titulo: "Diccionarios",
            contenido: (
              <>
                <p>
                  Son como los objetos de otros lenguajes:{" "}
                  <code>{`persona = {"nombre": "Ana", "edad": 25}`}</code>. Accedés
                  y modificás por clave: <code>persona[&quot;edad&quot;] = 26</code>.
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
                En la segunda demo vas a ver cómo una comprehension recorre la
                lista de origen y va construyendo la nueva, elemento por elemento.
              </>
            ),
          },
        ],
        preguntas: [
          "¿Desde qué número empiezan los índices de una lista?",
          "¿Qué diferencia hay entre remove(2) y pop()?",
          "¿Qué devuelve numeros[1:3] y por qué no incluye el índice 3?",
          "¿Cómo se lee una list comprehension?",
          "¿Cómo se accede al valor de una clave en un diccionario?",
        ],
      }}
      demos={[
        {
          id: "listas",
          label: "Listas",
          icon: <ListOrdered className="h-3.5 w-3.5" />,
          render: () => <ListasDemo />,
        },
        {
          id: "comprehension",
          label: "Comprehensions y dict",
          icon: <Sparkles className="h-3.5 w-3.5" />,
          render: () => <ComprehensionDemo />,
        },
      ]}
    />
  );
}

function ListasDemo() {
  const steps = useMemo(() => generateListasSteps(), []);
  return (
    <AlgorithmPlayer
      code={LISTAS_CODE}
      steps={steps}
      title="Operaciones sobre una lista"
      renderVisualization={(step) => <ListDictView state={step.state} />}
    />
  );
}

function ComprehensionDemo() {
  const steps = useMemo(() => generateComprehensionSteps(), []);
  return (
    <AlgorithmPlayer
      code={COMPREHENSION_CODE}
      steps={steps}
      title="Comprehensions y diccionarios"
      renderVisualization={(step) => <ListDictView state={step.state} />}
    />
  );
}
