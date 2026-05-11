import type { POIResult } from "@/types";

/** Haversine 直线距离（米） */
export function haversine(
  lng1: number,
  lat1: number,
  lng2: number,
  lat2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * 贪心最近邻算法
 * 从起点出发，每次选择直线距离最近的未访问 POI
 */
export function optimizeOrder(
  start: [number, number],
  pois: POIResult[]
): POIResult[] {
  if (pois.length <= 1) return [...pois];

  const remaining = [...pois];
  const ordered: POIResult[] = [];
  let current = start;

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const d = haversine(
        current[0],
        current[1],
        remaining[i].location[0],
        remaining[i].location[1]
      );
      if (d < nearestDist) {
        nearestDist = d;
        nearestIdx = i;
      }
    }

    const selected = remaining.splice(nearestIdx, 1)[0];
    ordered.push(selected);
    current = selected.location;
  }

  return ordered;
}
