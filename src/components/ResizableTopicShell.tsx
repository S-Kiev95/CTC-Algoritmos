"use client";

import { Panel, PanelGroup } from "react-resizable-panels";
import type { ReactNode } from "react";
import { ResizeHandle } from "./ResizeHandle";

/**
 * Shell vertical para una página de tema: header arriba, contenido abajo,
 * con una manija arrastrable entre los dos. El header puede colapsarse
 * casi por completo si querés más espacio para la animación; el contenido
 * tiene un mínimo razonable para que el reproductor siga siendo usable.
 *
 * El tamaño preferido se persiste en localStorage vía `autoSaveId`,
 * compartido entre todas las páginas de tema.
 */
export function ResizableTopicShell({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) {
  return (
    <PanelGroup direction="vertical" autoSaveId="topic-shell" className="h-full">
      <Panel
        defaultSize={26}
        minSize={6}
        className="min-h-0 overflow-auto bg-white dark:bg-zinc-950"
      >
        {header}
      </Panel>
      <ResizeHandle direction="vertical" />
      <Panel defaultSize={74} minSize={30} className="min-h-0">
        {children}
      </Panel>
    </PanelGroup>
  );
}
