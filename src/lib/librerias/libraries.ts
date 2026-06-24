import { LayoutDashboard, type LucideIcon } from "lucide-react";

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
];

export function getLibrary(slug: string): Library | undefined {
  return LIBRARIES.find((l) => l.slug === slug);
}
