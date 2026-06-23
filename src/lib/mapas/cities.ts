import { MapPin, type LucideIcon } from "lucide-react";

/**
 * Ciudades para la sección de mapas. Cada ciudad define un bounding box chico
 * (zona céntrica) para que el grafo de calles sea manejable para animar.
 * `bbox` = [sur, oeste, norte, este] (orden de Overpass).
 *
 * Visibilidad: la sección entera con `mapas`; cada ciudad con `mapa:<slug>`.
 */
export type City = {
  slug: string;
  title: string;
  short: string;
  icon: LucideIcon;
  /** [sur, oeste, norte, este]. */
  bbox: [number, number, number, number];
  visibilitySlug: string;
  ready: boolean;
};

export const MAPS_SECTION_SLUG = "mapas";

export const CITIES: City[] = [
  {
    slug: "salto",
    title: "Salto (Uruguay)",
    short: "Centro de Salto sobre el río Uruguay",
    icon: MapPin,
    bbox: [-31.392, -57.974, -31.38, -57.96],
    visibilitySlug: "mapa:salto",
    ready: true,
  },
  {
    slug: "buenos-aires",
    title: "Buenos Aires",
    short: "Microcentro porteño",
    icon: MapPin,
    bbox: [-34.611, -58.39, -34.599, -58.374],
    visibilitySlug: "mapa:buenos-aires",
    ready: false,
  },
  {
    slug: "nueva-york",
    title: "Nueva York",
    short: "Midtown Manhattan",
    icon: MapPin,
    bbox: [40.752, -73.993, 40.764, -73.978],
    visibilitySlug: "mapa:nueva-york",
    ready: false,
  },
  {
    slug: "roma",
    title: "Roma",
    short: "Centro histórico",
    icon: MapPin,
    bbox: [41.884, 12.485, 41.896, 12.499],
    visibilitySlug: "mapa:roma",
    ready: false,
  },
];

export function getCity(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}
