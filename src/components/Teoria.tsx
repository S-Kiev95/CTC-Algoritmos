"use client";

import { BookOpenCheck, Code2, HelpCircle, Lightbulb } from "lucide-react";
import type { ReactNode } from "react";

type TeoriaProps = {
  /** Resumen corto al inicio (1-3 frases con la idea central). */
  resumen?: ReactNode;
  /** Bloques de lectura: títulos con párrafos. */
  lectura: { titulo?: string; contenido: ReactNode }[];
  /** Callouts opcionales: tips, analogías, advertencias. */
  callouts?: { tipo?: "tip" | "atencion" | "ejemplo"; texto: ReactNode }[];
  /** Lista de preguntas de comprensión. */
  preguntas?: string[];
  /** Bloque de código del ejercicio (Python). */
  ejercicio?: {
    descripcion: ReactNode;
    codigo: string;
  };
};

/**
 * Layout reusable para una tab "Teoría" de un tema. Pensado como
 * material de lectura tipo apunte de clase: una columna principal
 * legible, callouts opcionales, preguntas numeradas, ejercicio de código
 * destacado. No es interactivo — solo texto formateado.
 */
export function Teoria({
  resumen,
  lectura,
  callouts = [],
  preguntas = [],
  ejercicio,
}: TeoriaProps) {
  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-3xl px-6 py-8">
        {resumen && (
          <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            {resumen}
          </div>
        )}

        {/* Cuerpo de lectura */}
        <div className="space-y-6">
          {lectura.map((bloque, i) => (
            <section key={i}>
              {bloque.titulo && (
                <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {bloque.titulo}
                </h2>
              )}
              <div className="space-y-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 [&_code]:rounded [&_code]:bg-zinc-200/60 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12px] [&_code]:text-zinc-800 dark:[&_code]:bg-zinc-800 dark:[&_code]:text-zinc-200 [&_em]:font-medium [&_em]:text-zinc-900 dark:[&_em]:text-zinc-100 [&_strong]:text-zinc-900 dark:[&_strong]:text-zinc-50">
                {bloque.contenido}
              </div>
            </section>
          ))}
        </div>

        {/* Callouts */}
        {callouts.length > 0 && (
          <div className="mt-6 space-y-3">
            {callouts.map((c, i) => {
              const isAttention = c.tipo === "atencion";
              const isExample = c.tipo === "ejemplo";
              const styles = isAttention
                ? "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-100"
                : isExample
                  ? "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-700/50 dark:bg-sky-950/40 dark:text-sky-100"
                  : "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700/50 dark:bg-emerald-950/40 dark:text-emerald-100";
              return (
                <div
                  key={i}
                  className={[
                    "flex gap-3 rounded-lg border p-3 text-[13px] leading-relaxed",
                    styles,
                  ].join(" ")}
                >
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>{c.texto}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Preguntas de comprensión */}
        {preguntas.length > 0 && (
          <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-zinc-500" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Preguntas de comprensión
              </h2>
            </div>
            <ol className="ml-5 list-decimal space-y-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {preguntas.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
          </section>
        )}

        {/* Ejercicio de código */}
        {ejercicio && (
          <section className="mt-6 overflow-hidden rounded-lg border border-zinc-300 bg-zinc-950 dark:border-zinc-700">
            <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2">
              <Code2 className="h-4 w-4 text-emerald-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Ejercicio · Python
              </h2>
            </div>
            <div className="px-4 py-3 text-[13px] leading-relaxed text-zinc-300">
              {ejercicio.descripcion}
            </div>
            <pre className="overflow-x-auto border-t border-zinc-800 bg-zinc-950 px-4 py-3 text-[12px] leading-relaxed text-zinc-100">
              <code>{ejercicio.codigo}</code>
            </pre>
          </section>
        )}

        <div className="mt-8 flex items-center gap-2 text-[11px] text-zinc-400">
          <BookOpenCheck className="h-3.5 w-3.5" />
          Material para leer antes/durante la clase.
        </div>
      </div>
    </div>
  );
}
