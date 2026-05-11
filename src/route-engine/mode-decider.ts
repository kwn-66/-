import type { TravelMode, TransportPrefs } from "@/types";

/** 距离阈值（米） */
const WALK_MAX = 1000; // 超过 1km 不推荐步行
const BIKE_MAX = 5000; // 超过 5km 不推荐骑行
const BIKE_OPTIMAL = 3000; // 3km 内骑行最合适

/**
 * 根据距离和用户偏好，决定该段最佳交通方式
 *
 * 规则：
 * 1. ≤ 800m → 步行最优
 * 2. 800m ~ 3km → 骑行最优
 * 3. > 3km → 驾车最优
 * 4. 如果用户禁用某方式，则选次优可用方式
 * 5. 所有方式都被禁用时，选距离允许的最慢方式
 */
export function decideBestMode(
  distanceMeters: number,
  prefs: TransportPrefs
): TravelMode {
  const { walking, bicycling, driving } = prefs;

  // 默认最优：按距离推荐
  if (distanceMeters <= 800 && walking) return "walking";
  if (distanceMeters <= BIKE_OPTIMAL && bicycling) return "bicycling";
  if (driving) return "driving";

  // 最优被禁用，降级选择
  if (distanceMeters <= WALK_MAX && walking) return "walking";
  if (distanceMeters <= BIKE_MAX && bicycling) return "bicycling";
  if (driving) return "driving";

  // 长距离但驾车被禁用：骑行 > 步行
  if (bicycling) return "bicycling";
  if (walking) return "walking";

  // 全部禁用（不可能发生，兜底）
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
  }
}

/** 交通方式对应的路线颜色（Apple Maps 风格） */
export function modeColor(mode: TravelMode): string {
  switch (mode) {
    case "walking":
      return "#5AC8FA"; // 浅蓝
    case "bicycling":
      return "#34C759"; // 绿色
    case "driving":
      return "#FF6B35"; // 橙色
  }
}
