import type { TravelMode, TransportPrefs } from "@/types";

/**
 * 根据距离和用户偏好智能决定出行方式。
 *
 * 每个距离段有优先级：
 * - 0~800m：步行 > 骑行 > 驾车 > 地铁 > 公交
 * - 800m~3km：骑行 > 驾车 > 地铁 > 公交 > 步行
 * - 3km~15km：驾车 > 地铁 > 公交 > 骑行 > 步行
 * - 15km+：地铁 > 公交 > 驾车 > 骑行 > 步行
 *
 * 只从用户勾选的方式中选取，未勾选的跳过。
 */
export function decideBestMode(
  distanceMeters: number,
  prefs: TransportPrefs
): TravelMode {
  const { walking, bicycling, driving, subway, bus } = prefs;

  if (distanceMeters <= 800) {
    if (walking) return "walking";
    if (bicycling) return "bicycling";
    if (driving) return "driving";
    if (subway) return "subway";
    if (bus) return "bus";
  } else if (distanceMeters <= 3000) {
    if (bicycling) return "bicycling";
    if (driving) return "driving";
    if (subway) return "subway";
    if (bus) return "bus";
    if (walking) return "walking";
  } else if (distanceMeters <= 15000) {
    if (driving) return "driving";
    if (subway) return "subway";
    if (bus) return "bus";
    if (bicycling) return "bicycling";
    if (walking) return "walking";
  } else {
    if (subway) return "subway";
    if (bus) return "bus";
    if (driving) return "driving";
    if (bicycling) return "bicycling";
    if (walking) return "walking";
  }

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
