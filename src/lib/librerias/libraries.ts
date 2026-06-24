import { LayoutDashboard, Server, Database, type LucideIcon } from "lucide-react";

/**
 * Librerías de utilidad (contenido de referencia). Visibilidad: la sección con
 * `librerias` y cada librería con `lib:<slug>`.
 */
export type Library = {
  slug: string;
  title: string;
  short: string;
  icon: LucideIcon;
  visibilitySlug: string;
  ready: boolean;
};

export const LIBRARIES_SECTION_SLUG = "librerias";

export const LIBRARIES: Library[] = [
  {
    slug: "streamlit",
    title: "Streamlit",
    short: "Interfaces gráficas y dashboards solo con Python",
    icon: LayoutDashboard,
    visibilitySlug: "lib:streamlit",
    ready: true,
  },
  {
    slug: "fastapi",
    title: "FastAPI",
    short: "APIs web rápidas con type hints y docs automáticas",
    icon: Server,
    visibilitySlug: "lib:fastapi",
    ready: true,
  },
  {
    slug: "sqlmodel",
    title: "SQLModel",
    short: "Base de datos SQL con modelos Python (Pydantic + SQLAlchemy)",
    icon: Database,
    visibilitySlug: "lib:sqlmodel",
    ready: true,
  },
];

export function getLibrary(slug: string): Library | undefined {
  return LIBRARIES.find((l) => l.slug === slug);
}
