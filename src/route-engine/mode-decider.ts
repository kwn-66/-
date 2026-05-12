import type { TravelMode, TransportPrefs } from "@/types";

const WALK_MAX = 1000;
const BIKE_MAX = 5000;
const BIKE_OPTIMAL = 3000;
const TRANSIT_MIN = 2000;

export function decideBestMode(
  distanceMeters: number,
  prefs: TransportPrefs
): TravelMode {
  const { walking, bicycling, driving, subway, bus } = prefs;
  const transitOk = subway || bus;

  if (distanceMeters <= 800 && walking) return "walking";
  if (distanceMeters <= BIKE_OPTIMAL && bicycling) return "bicycling";
  if (distanceMeters >= TRANSIT_MIN && transitOk) return subway ? "subway" : "bus";
  if (driving) return "driving";

  if (distanceMeters <= WALK_MAX && walking) return "walking";
  if (distanceMeters <= BIKE_MAX && bicycling) return "bicycling";
  if (subway) return "subway";
  if (bus) return "bus";
  if (driving) return "driving";

  if (bicycling) return "bicycling";
  if (walking) return "walking";

  return "driving";
}

export function modeLabel(mode: TravelMode): string {
  switch (mode) {
    case "walking": return "步行";
    case "bicycling": return "骑行";
    case "driving": return "驾车";
    case "subway": return "地铁";
    case "bus": return "公交";
  }
}

export function modeColor(mode: TravelMode): string {
  switch (mode) {
    case "walking": return "#5AC8FA"; // 浅蓝
    case "bicycling": return "#34C759"; // 绿色
    case "driving": return "#FF6B35"; // 橙色
    case "subway": return "#AF52DE"; // 紫色
    case "bus": return "#FF3B30"; // 红色
  }
}
