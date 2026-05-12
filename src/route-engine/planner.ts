import { isAMapReady } from "@/lib/amap";
import { optimizeOrder, haversine } from "./optimizer";
import { decideBestMode } from "./mode-decider";
import type {
  POIResult,
  UserLocation,
  TravelMode,
  TransportPrefs,
  RoutePlan,
  RouteSegment,
  MultiRoutePlan,
} from "@/types";

/** 从路线 steps 中提取路径坐标 */
function extractPath(result: {
  routes: { steps: { path: [number, number][] }[] }[];
}): [number, number][] {
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

/** 计算单段路线（指定交通方式） */
function calculateSegment(
  from: [number, number],
  to: [number, number],
  mode: TravelMode
): Promise<{ distance: number; duration: number; path: [number, number][] }> {
  return new Promise((resolve) => {
    if (!isAMapReady()) {
      const dist = haversine(from[0], from[1], to[0], to[1]);
      resolve({ distance: Math.round(dist), duration: 0, path: [from, to] });
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
          searcher = new window.AMap.Driving({ policy: 0, extensions: "base" });
          break;
      }

      type RouteResult = {
        routes: {
          distance: number;
          time: number;
          steps: { path: [number, number][] }[];
        }[];
      };

      searcher.search(from, to, (status: string, result: RouteResult) => {
        if (status === "complete" && result.routes?.[0]) {
          resolve({
            distance: result.routes[0].distance,
            duration: result.routes[0].time,
            path: extractPath(result),
          });
        } else {
          const dist = haversine(from[0], from[1], to[0], to[1]);
          const speeds: Record<TravelMode, number> = {
            driving: 8,
            bicycling: 3,
            walking: 1.2,
          };
          resolve({
            distance: Math.round(dist),
            duration: Math.round(dist / speeds[mode]),
            path: [from, to],
          });
        }
      });
    } catch {
      const dist = haversine(from[0], from[1], to[0], to[1]);
      resolve({ distance: Math.round(dist), duration: 0, path: [from, to] });
    }
  });
}

/**
 * 智能混合交通路线规划
 *
 * 1. 用贪心最近邻算法优化访问顺序
 * 2. 对每一段，根据距离和用户偏好自动选择最佳交通方式
 * 3. 每段独立调用高德 API 获取实际路径
 */
export async function planSmartRoute(
  userLocation: UserLocation | null,
  pois: POIResult[],
  prefs: TransportPrefs
): Promise<RoutePlan> {
  if (pois.length === 0) {
    return { segments: [], totalDistance: 0, totalDuration: 0, order: [] };
  }

  const start: [number, number] = userLocation
    ? [userLocation.lng, userLocation.lat]
    : [104.0657, 30.6573];

  // Step 1: 优化访问顺序
  const order = optimizeOrder(start, pois);

  // Step 2: 逐段计算（每段独立决定交通方式）
  const segments: RouteSegment[] = [];
  let prevPoint = start;
  let prevName = userLocation?.address || "当前位置";

  for (const poi of order) {
    // 先用直线距离评估最佳方式
    const straightDist = haversine(
      prevPoint[0],
      prevPoint[1],
      poi.location[0],
      poi.location[1]
    );
    const bestMode = decideBestMode(straightDist, prefs);

    const { distance, duration, path } = await calculateSegment(
      prevPoint,
      poi.location,
      bestMode
    );

    segments.push({
      from: { name: prevName, location: prevPoint },
      to: {
        name: poi.name,
        location: poi.location,
        categoryIcon: poi.categoryIcon,
        categoryName: poi.categoryName,
      },
      distance,
      duration,
      mode: bestMode,
      path,
    });

    prevPoint = poi.location;
    prevName = poi.name;
  }

  const totalDistance = segments.reduce((sum, s) => sum + s.distance, 0);
  const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0);

  return { segments, totalDistance, totalDuration, order };
}

/**
 * 多方案路线规划
 *
 * 方案1「最优路线」：贪心最近邻 + 混合交通，距离优先递进
 * 方案2「口碑优先」：优先访问 POI 密集区域（热门商圈），再递进
 * 方案3「最省时间」：长距离段强制驾车，时间最小化
 */
export async function planMultiRoute(
  userLocation: UserLocation | null,
  pois: POIResult[],
  prefs: TransportPrefs
): Promise<MultiRoutePlan> {
  const plans: RoutePlan[] = [];
  const labels: string[] = [];

  if (pois.length === 0) {
    return {
      plans: [
        { segments: [], totalDistance: 0, totalDuration: 0, order: [] },
      ],
      labels: ["最优路线"],
      currentIndex: 0,
    };
  }

  // ---- 方案1：最优路线（贪心最近邻 + 混合交通） ----
  const plan1 = await planSmartRoute(userLocation, pois, prefs);
  plans.push(plan1);
  labels.push("最优路线");

  // ---- 方案2：口碑优先（POI 密集区优先） ----
  // 计算 POI 集群中心，优先访问靠近中心的店（热门商圈）
  const cx = pois.reduce((s, p) => s + p.location[0], 0) / pois.length;
  const cy = pois.reduce((s, p) => s + p.location[1], 0) / pois.length;
  const centroid: [number, number] = [cx, cy];

  // 按距离集群中心排序（近=热门），然后贪心路径优化
  const popularOrder = optimizeOrder(
    userLocation
      ? [userLocation.lng, userLocation.lat]
      : centroid,
    [...pois].sort(
      (a, b) =>
        haversine(centroid[0], centroid[1], a.location[0], a.location[1]) -
        haversine(centroid[0], centroid[1], b.location[0], b.location[1])
    )
  );

  const plan2 = await buildPlanFromOrder(
    userLocation,
    popularOrder,
    prefs
  );
  plans.push(plan2);
  labels.push("口碑优先");

  // ---- 方案3：最省时间（长距离强制驾车） ----
  const fastPrefs: TransportPrefs = {
    walking: prefs.walking,
    bicycling: false,
    driving: true,
  };

  const plan3 = await buildPlanFromOrder(
    userLocation,
    optimizeOrder(
      userLocation
        ? [userLocation.lng, userLocation.lat]
        : [104.0657, 30.6573],
      [...pois]
    ),
    fastPrefs
  );
  plans.push(plan3);
  labels.push("最省时间");

  return { plans, labels, currentIndex: 0 };
}

/** 按给定顺序构建完整路线（复用逐段计算逻辑） */
async function buildPlanFromOrder(
  userLocation: UserLocation | null,
  order: POIResult[],
  prefs: TransportPrefs
): Promise<RoutePlan> {
  const start: [number, number] = userLocation
    ? [userLocation.lng, userLocation.lat]
    : [104.0657, 30.6573];

  const segments: RouteSegment[] = [];
  let prevPoint = start;
  let prevName = userLocation?.address || "当前位置";

  for (const poi of order) {
    const straightDist = haversine(
      prevPoint[0],
      prevPoint[1],
      poi.location[0],
      poi.location[1]
    );
    const bestMode = decideBestMode(straightDist, prefs);

    const { distance, duration, path } = await calculateSegment(
      prevPoint,
      poi.location,
      bestMode
    );

    segments.push({
      from: { name: prevName, location: prevPoint },
      to: {
        name: poi.name,
        location: poi.location,
        categoryIcon: poi.categoryIcon,
        categoryName: poi.categoryName,
      },
      distance,
      duration,
      mode: bestMode,
      path,
    });

    prevPoint = poi.location;
    prevName = poi.name;
  }

  const totalDistance = segments.reduce((sum, s) => sum + s.distance, 0);
  const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0);

  return { segments, totalDistance, totalDuration, order };
}
