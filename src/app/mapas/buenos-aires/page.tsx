"use client";

import { CityRouteExplorer } from "@/components/mapas/CityRouteExplorer";
import { getCity } from "@/lib/mapas/cities";

export default function BuenosAiresPage() {
  return <CityRouteExplorer city={getCity("buenos-aires")!} />;
}
