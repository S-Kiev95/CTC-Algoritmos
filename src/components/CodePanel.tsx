"use client";

type Props = {
  code: string;
  /** Línea 1-indexed que se está ejecutando. 0 o negativo = ninguna. */
  activeLine: number;
};

/**
 * Panel de código con resaltado de la línea activa.
 * Por ahora usa un renderizado plano con tipografía monoespaciada;
 * más adelante lo cambiamos por Shiki para colores tipo VSCode.
 */
export function CodePanel({ code, activeLine }: Props) {
  const lines = code.replace(/\n$/, "").split("\n");

  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-100">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          Código · Python
        </span>
        <span className="font-mono text-xs text-zinc-500">
          {activeLine > 0 ? `línea ${activeLine}` : "—"}
        </span>
      </div>

      <pre className="flex-1 overflow-auto font-mono text-sm leading-relaxed">
        <code className="block">
          {lines.map((line, i) => {
            const lineNo = i + 1;
            const isActive = lineNo === activeLine;
            return (
              <div
                key={i}
                className={[
                  "flex px-4 transition-colors",
                  isActive
                    ? "bg-amber-400/15 border-l-2 border-amber-400"
                    : "border-l-2 border-transparent",
                ].join(" ")}
              >
                <span className="mr-4 w-8 shrink-0 select-none text-right text-zinc-600">
                  {lineNo}
                </span>
                <span className="whitespace-pre">{line || " "}</span>
              </div>
            );
          })}
        </code>
      </pre>
    </div>
  );
}
