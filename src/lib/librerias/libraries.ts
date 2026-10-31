import { LayoutDashboard, Server, Database, Gamepad2, type LucideIcon } from "lucide-react";

/**
 * Librerías de utilidad (contenido de referencia).
 */
export type Library = {
  slug: string;
  title: string;
  short: string;
  icon: LucideIcon;
  ready: boolean;
};

export const LIBRARIES: Library[] = [
  {
    slug: "streamlit",
    title: "Streamlit",
    short: "Interfaces gráficas y dashboards solo con Python",
    icon: LayoutDashboard,
    ready: true,
  },
  {
    slug: "fastapi",
    title: "FastAPI",
    short: "APIs web rápidas con type hints y docs automáticas",
    icon: Server,
    ready: true,
  },
  {
    slug: "sqlmodel",
    title: "SQLModel",
    short: "Base de datos SQL con modelos Python (Pydantic + SQLAlchemy)",
    icon: Database,
    ready: true,
  },
  {
    slug: "pygame",
    title: "Pygame",
    short: "Videojuegos 2D en Python: pantalla, bucle, sprites, sonido",
    icon: Gamepad2,
    ready: true,
  },
];

export function getLibrary(slug: string): Library | undefined {
  return LIBRARIES.find((l) => l.slug === slug);
}
