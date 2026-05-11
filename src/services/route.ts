import { isAMapReady } from "@/lib/amap";
import type {
  POIResult,
  UserLocation,
  TravelMode,
  RoutePlan,
  RouteSegment,
} from "@/types";

/** 计算两点间直线距离（Haversine 公式，单位：米） */
function haversine(
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

/** 贪心最近邻算法：从起点出发，每次选最近的未访问 POI */
function optimizeOrder(
  start: [number, number],
  pois: POIResult[]
): POIResult[] {
  if (pois.length <= 1) return pois;

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

/** 从路线 steps 中提取路径坐标 */
function extractPath(result: { routes: { steps: { path: [number, number][] }[] }[] }): [number, number][] {
  try {
    const steps = result.routes?.[0]?.steps;
    if (!steps) return [];
    const path: [number, number][] = [];
    for (const step of steps) {
      if (step.path && Array.isArray(step.path)) {
        path.push(...step.path);
      }
    }
    return path;
  } catch {
    return [];
  }
}

/** 计算单段路线 */
function calculateSegment(
  from: [number, number],
  to: [number, number],
  mode: TravelMode
): Promise<{ distance: number; duration: number; path: [number, number][] }> {
  return new Promise((resolve, reject) => {
    if (!isAMapReady()) {
      reject(new Error("地图 SDK 未就绪"));
      return;
    }

    try {
      let searcher: AMap.Driving | AMap.Walking | AMap.Riding;

      switch (mode) {
        case "walking":
          searcher = new window.AMap.Walking({ policy: 0 });
          break;
        case "bicycling":
          searcher = new window.AMap.Riding({ policy: 0 });
          break;
        case "driving":
        default:
          searcher = new window.AMap.Driving({
            policy: 0,
            extensions: "base",
          });
          break;
      }

      type RouteResult = { routes: { distance: number; time: number; steps: { path: [number, number][] }[] }[] };

      searcher.search(from, to, (status: string, result: RouteResult) => {
        if (status === "complete" && result.routes?.[0]) {
          resolve({
            distance: result.routes[0].distance,
            duration: result.routes[0].time,
            path: extractPath(result),
          });
        } else {
          // 降级：使用直线路径
          const dist = haversine(from[0], from[1], to[0], to[1]);
          const speeds = { driving: 8, bicycling: 3, walking: 1.2 };
          resolve({
            distance: Math.round(dist),
            duration: Math.round(dist / speeds[mode]),
            path: [from, to],
          });
        }
      });
    } catch {
      reject(new Error("路线计算失败"));
    }
  });
}

/** 完整路线规划 */
export async function planRoute(
  userLocation: UserLocation | null,
  pois: POIResult[],
  mode: TravelMode = "driving"
): Promise<RoutePlan> {
  if (pois.length === 0) {
    return { segments: [], totalDistance: 0, totalDuration: 0, order: [] };
  }

  // 起点：用户位置 或 成都默认中心
  const start: [number, number] = userLocation
    ? [userLocation.lng, userLocation.lat]
    : [104.0657, 30.6573];

  // 优化访问顺序
  const order = optimizeOrder(start, pois);

  // 计算每段路线
  const segments: RouteSegment[] = [];
  let prevPoint = start;
  let prevName = userLocation?.address || "当前位置";

  for (const poi of order) {
    const { distance, duration, path } = await calculateSegment(
      prevPoint,
      poi.location,
      mode
    );

    segments.push({
      from: { name: prevName, location: prevPoint },
      to: { name: poi.name, location: poi.location },
      distance,
      duration,
      mode,
      path,
    });

    prevPoint = poi.location;
    prevName = poi.name;
  }

  const totalDistance = segments.reduce((sum, s) => sum + s.distance, 0);
  const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0);

  return { segments, totalDistance, totalDuration, order };
}
