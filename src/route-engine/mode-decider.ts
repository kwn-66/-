import type { TravelMode, TransportPrefs, TransitType } from "@/types";

/** 距离阈值（米） */
const WALK_MAX = 1000;
const BIKE_MAX = 5000;
const BIKE_OPTIMAL = 3000;
const TRANSIT_MIN = 2000; // 2km 以上考虑公交

/**
 * 根据距离和用户偏好，决定该段最佳交通方式
 */
export function decideBestMode(
  distanceMeters: number,
  prefs: TransportPrefs
): TravelMode {
  const { walking, bicycling, driving, transit } = prefs;

  if (distanceMeters <= 800 && walking) return "walking";
  if (distanceMeters <= BIKE_OPTIMAL && bicycling) return "bicycling";
  if (distanceMeters >= TRANSIT_MIN && transit) return "transit";
  if (driving) return "driving";

  if (distanceMeters <= WALK_MAX && walking) return "walking";
  if (distanceMeters <= BIKE_MAX && bicycling) return "bicycling";
  if (transit) return "transit";
  if (driving) return "driving";

  if (bicycling) return "bicycling";
  if (walking) return "walking";

  return "driving";
}

/** 获取交通方式的中文标签 */
export function modeLabel(mode: TravelMode): string {
  switch (mode) {
    case "walking":
      return "步行";
    case "bicycling":
      return "骑行";
    case "driving":
      return "驾车";
    case "transit":
      return "公交/地铁";
  }
}

/** 交通方式对应的路线颜色 */
export function modeColor(mode: TravelMode, transitType?: TransitType): string {
  switch (mode) {
    case "walking":
      return "#5AC8FA"; // 浅蓝
    case "bicycling":
      return "#34C759"; // 绿色
    case "driving":
      return "#FF6B35"; // 橙色
    case "transit":
      return transitType === "bus" ? "#FF3B30" : "#AF52DE"; // 公交红 / 地铁紫
  }
}
