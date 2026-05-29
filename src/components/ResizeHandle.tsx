"use client";

import { PanelResizeHandle } from "react-resizable-panels";

/**
 * Manija para arrastrar y redimensionar paneles. Línea sutil que se
 * destaca al hover y se ilumina más fuerte al arrastrar.
 *
 * El área de hit es más ancha que la línea visual (±6px alrededor) para
 * que sea fácil agarrarla con el mouse sin tener que apuntar exacto.
 *
 * Variantes:
 * - "default": fondo claro/oscuro según tema, ideal entre paneles del tema.
 * - "onCode": fondo oscuro fijo, ideal cuando los dos lados del split son
 *   el panel de código (todo bg-zinc-950).
 */
export function ResizeHandle({
  direction,
  variant = "default",
}: {
  direction: "horizontal" | "vertical";
  variant?: "default" | "onCode";
}) {
  const isHorizontal = direction === "horizontal";

  const colorClasses =
    variant === "onCode"
      ? "bg-zinc-800 hover:bg-zinc-700 data-[resize-handle-state=drag]:bg-sky-500"
      : "bg-zinc-200 hover:bg-sky-400/60 dark:bg-zinc-800 dark:hover:bg-sky-500/60 data-[resize-handle-state=drag]:bg-sky-500 dark:data-[resize-handle-state=drag]:bg-sky-400";

  return (
    <PanelResizeHandle
      className={[
        "group relative shrink-0 transition-colors",
        isHorizontal ? "w-1 cursor-col-resize" : "h-1 cursor-row-resize",
        colorClasses,
      ].join(" ")}
    >
      {/* Área de hit invisible (±6px) para tolerar imprecisión del mouse. */}
      <span
        className={[
          "absolute",
          isHorizontal
            ? "inset-y-0 -left-1.5 -right-1.5"
            : "inset-x-0 -top-1.5 -bottom-1.5",
        ].join(" ")}
        aria-hidden
      />
    </PanelResizeHandle>
  );
}
