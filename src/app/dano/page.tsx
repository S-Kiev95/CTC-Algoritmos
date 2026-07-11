"use client";

import { Dices, BarChart3 } from "lucide-react";
import { PythonLesson } from "@/components/python/PythonLesson";
import { DamageHistogram } from "@/components/damage/DamageHistogram";

export default function DanoPage() {
  return (
    <PythonLesson
      kicker="Probabilidad · Daño en juegos"
      teoriaLabel="Teoría"
      icon={<Dices className="h-5 w-5" />}
      title="Daño en juegos"
      subtitle={
        <>
          Cómo se calcula el <strong>daño</strong> con dados y por qué la{" "}
          <strong>forma de la distribución</strong> —no solo el promedio— cambia
          cómo se siente el juego.
        </>
      }
      teoria={{
        resumen: (
          <>
            Adaptación libre en español del{" "}
            <a
              href="https://www.redblobgames.com/articles/probability/damage-rolls.html"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sky-600 underline-offset-2 hover:underline dark:text-sky-400"
            >
              artículo sobre probabilidad y daño de Red Blob Games (Amit Patel)
            </a>
            . La explicación y los gráficos interactivos son propios; la idea y el
            recorrido son de Amit. Los histogramas muestran probabilidades{" "}
            <strong>exactas</strong> (calculadas, no simuladas).
          </>
        ),
        lectura: [
          {
            titulo: "Un dado: distribución plana",
            contenido: (
              <>
                <p>
                  La notación <code>NdS</code> significa &ldquo;tirar N dados de S
                  caras y sumar&rdquo;. Un dado solo (<code>1dS</code>) da una{" "}
                  <strong>distribución uniforme</strong>: todos los resultados son{" "}
                  <em>igual de probables</em>. Sacar un 1 es tan probable como sacar un
                  12.
                </p>
                <DamageHistogram n0={1} s0={12} interactive={false} />
              </>
            ),
          },
          {
            titulo: "Varios dados: campana",
            contenido: (
              <>
                <p>
                  Cuando <strong>sumás varios dados</strong>, los valores del medio se
                  vuelven mucho más probables que los extremos (hay muchas formas de
                  sumar 7 con dos dados, pero una sola de sumar 2). Aparece una{" "}
                  <strong>campana</strong>.
                </p>
                <DamageHistogram n0={2} s0={6} interactive={false} />
                <p>
                  Cuantos <strong>más dados</strong> (más chicos), más angosta la
                  campana: los resultados se apretujan cerca del promedio.
                </p>
                <DamageHistogram n0={6} s0={2} interactive={false} />
              </>
            ),
          },
          {
            titulo: "Mismo promedio, distinta “variabilidad”",
            contenido: (
              <>
                <p>
                  Acá está la idea central de diseño: dos tiradas pueden tener un{" "}
                  <strong>promedio parecido</strong> pero sentirse muy distinto. Con{" "}
                  <code>1d12</code> (promedio 6.5) el daño es <strong>impredecible</strong>{" "}
                  (a veces 1, a veces 12); con <code>6d2</code> (promedio 9) es{" "}
                  <strong>consistente</strong> (casi siempre cerca de 9).
                </p>
                <p>
                  Esa &ldquo;<strong>variabilidad</strong>&rdquo; (la{" "}
                  <em>desviación</em>) se controla con la <strong>cantidad de
                  dados</strong>: pocos dados = mucha suerte; muchos dados = más
                  predecible.
                </p>
              </>
            ),
          },
          {
            titulo: "Bonus y penalizaciones",
            contenido: (
              <>
                <p>
                  Sumar o restar una constante (<code>2d6+1</code>, <code>2d6-3</code>){" "}
                  <strong>corre</strong> toda la distribución a la derecha o a la
                  izquierda, sin cambiarle la forma. Así se modelan las armas (suman
                  daño) y la <strong>armadura</strong> (resta, con un mínimo de 0).
                </p>
              </>
            ),
          },
          {
            titulo: "Asimetría: tirar y descartar",
            contenido: (
              <>
                <p>
                  Para que una tirada favorezca los valores <em>altos</em> o{" "}
                  <em>bajos</em> se rompe la simetría. Lo más común: tirar dos veces y
                  quedarse con el mayor (<strong>&ldquo;con ventaja&rdquo;</strong>,
                  sesga hacia arriba) o con el menor (<strong>&ldquo;con
                  desventaja&rdquo;</strong>, sesga hacia abajo).
                </p>
                <p>
                  En la demo, cambiá el modo a <strong>ventaja</strong> o{" "}
                  <strong>desventaja</strong> y mirá cómo la campana se inclina.
                </p>
              </>
            ),
          },
          {
            titulo: "Golpes críticos",
            contenido: (
              <>
                <p>
                  Un <strong>crítico</strong> es un bonus que ocurre solo{" "}
                  <em>a veces</em>: con cierta probabilidad, se suma otra tirada. En el
                  histograma eso aparece como un <strong>segundo pico</strong> de daño
                  alto. Subí la &ldquo;probabilidad de crítico&rdquo; en la demo para
                  verlo crecer.
                </p>
              </>
            ),
          },
          {
            titulo: "Diseñar tu propia distribución",
            contenido: (
              <>
                <p>Para elegir cómo se siente el daño, decidís tres cosas:</p>
                <ul className="ml-5 list-disc space-y-1">
                  <li><strong>Rango</strong> (mínimo y máximo): con el tamaño de los dados y el bonus.</li>
                  <li><strong>Variabilidad</strong>: pocos dados (impredecible) vs muchos (consistente).</li>
                  <li><strong>Asimetría</strong>: ventaja / desventaja / críticos para inclinarla.</li>
                </ul>
                <p>
                  Y si ninguna combinación de dados te da lo que querés, siempre podés
                  usar una <strong>tabla de pesos</strong> (elegir a mano qué tan
                  probable es cada valor) — total flexibilidad.
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
                No mires solo el <strong>promedio</strong>: dos tiradas con el mismo
                promedio pueden dar experiencias opuestas según su{" "}
                <strong>variabilidad</strong> y <strong>asimetría</strong>.
              </>
            ),
          },
        ],
        preguntas: [
          "¿Qué forma tiene la distribución de un solo dado y por qué?",
          "¿Por qué al sumar varios dados aparece una campana?",
          "Dos tiradas tienen el mismo promedio; ¿qué las hace sentir distinto?",
          "¿Cómo se controla la variabilidad (la desviación) de una tirada?",
          "¿Qué le hace a la distribución sumar un bonus constante?",
          "¿Cómo se logra que una tirada favorezca los valores altos?",
          "¿Cómo se ve un golpe crítico en el histograma?",
        ],
      }}
      demos={[
        {
          id: "histograma",
          label: "Histograma",
          icon: <BarChart3 className="h-3.5 w-3.5" />,
          render: () => (
            <div className="flex h-full w-full items-start justify-center overflow-auto p-4">
              <DamageHistogram />
            </div>
          ),
        },
      ]}
    />
  );
}
