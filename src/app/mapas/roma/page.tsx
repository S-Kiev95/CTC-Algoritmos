"use client";

import { CityRouteExplorer } from "@/components/mapas/CityRouteExplorer";
import { getCity } from "@/lib/mapas/cities";

export default function RomaPage() {
  return <CityRouteExplorer city={getCity("roma")!} />;
}
