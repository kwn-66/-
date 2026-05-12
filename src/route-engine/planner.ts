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

/** 估算速度 (m/s)，用于 AMap 不可用时的 fallback */
const SPEEDS: Record<string, number> = {
  driving: 8,
  bicycling: 3,
  walking: 1.2,
  subway: 7,
  bus: 5,
};

function fallbackSegment(
  from: [number, number],
  to: [number, number],
  mode: TravelMode
): { distance: number; duration: number; path: [number, number][] } {
  const dist = haversine(from[0], from[1], to[0], to[1]);
  return {
    distance: Math.round(dist),
    duration: Math.round(dist / (SPEEDS[mode] || 5)),
    path: [from, to],
  };
}

/** 计算单段路线（非公交方式） */
function calculateSegment(
  from: [number, number],
  to: [number, number],
  mode: TravelMode
): Promise<{ distance: number; duration: number; path: [number, number][] }> {
  return new Promise((resolve) => {
    if (!isAMapReady()) {
      resolve(fallbackSegment(from, to, mode));
      return;
    }

    try {
      let searcher: AMap.Driving | AMap.Walking | AMap.Riding;

      switch (mode) {
        case "walking":
          if (!window.AMap.Walking) { resolve(fallbackSegment(from, to, mode)); return; }
          searcher = new window.AMap.Walking({ policy: 0 });
          break;
        case "bicycling":
          if (!window.AMap.Riding) { resolve(fallbackSegment(from, to, mode)); return; }
          searcher = new window.AMap.Riding({ policy: 0 });
          break;
        case "driving":
        default:
          if (!window.AMap.Driving) { resolve(fallbackSegment(from, to, mode)); return; }
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
          resolve(fallbackSegment(from, to, mode));
        }
      });
    } catch {
      resolve(fallbackSegment(from, to, mode));
    }
  });
}

/**
 * 计算公交换乘路线，展开为独立 segments
 *
 * AMap.Transfer 返回类似：
 *   WALK → SUBWAY → WALK
 *   或 WALK → BUS → WALK
 *
 * 每个子段独立为一个 RouteSegment
 */
function calculateTransitSegments(
  from: [number, number],
  to: [number, number],
  fromName: string,
  toName: string,
  preferredMode: TravelMode,
  poiCategoryIcon?: string,
  poiCategoryName?: string
): Promise<RouteSegment[]> {
  return new Promise((resolve) => {
    if (!isAMapReady() || !window.AMap.Transfer) {
      resolve(fallbackTransitSegment(from, to, fromName, toName, preferredMode, poiCategoryIcon, poiCategoryName));
      return;
    }

    try {
      const transfer = new window.AMap.Transfer({ policy: 0, extensions: "base" });

      transfer.search(from, to, (status: string, result: AMap.TransferResult) => {
        if (status === "complete" && result.routes?.[0]?.segments) {
          const segments: RouteSegment[] = [];
          let prevName = fromName;
          let prevLoc = from;

          for (const seg of result.routes[0].segments) {
            const isLast = seg === result.routes[0].segments[result.routes[0].segments.length - 1];
            const nextName = isLast ? toName : (seg.transit?.end_stop?.name || seg.transit?.start_stop?.name || toName);
            const nextLoc: [number, number] = isLast
              ? to
              : [seg.transit?.end_stop?.location?.lng || to[0], seg.transit?.end_stop?.location?.lat || to[1]];

            let mode: TravelMode = "walking";

            if (seg.transit_mode === "SUBWAY" || seg.transit_mode === "地铁") {
              mode = "subway";
            } else if (seg.transit_mode === "BUS" || seg.transit_mode === "公交") {
              mode = "bus";
            }

            segments.push({
              from: { name: prevName, location: prevLoc },
              to: {
                name: nextName,
                location: nextLoc,
                categoryIcon: isLast ? poiCategoryIcon : undefined,
                categoryName: isLast ? poiCategoryName : undefined,
              },
              distance: seg.distance,
              duration: seg.time,
              mode,
              path: seg.path || [prevLoc, nextLoc],
              transitName: seg.transit?.name,
              stationCount: seg.transit?.via_num,
            });

            prevName = nextName;
            prevLoc = nextLoc;
          }

          resolve(segments.length > 0 ? segments : fallbackTransitSegment(from, to, fromName, toName, preferredMode, poiCategoryIcon, poiCategoryName));
        } else {
          resolve(fallbackTransitSegment(from, to, fromName, toName, preferredMode, poiCategoryIcon, poiCategoryName));
        }
      });
    } catch {
      resolve(fallbackTransitSegment(from, to, fromName, toName, preferredMode, poiCategoryIcon, poiCategoryName));
    }
  });
}

function fallbackTransitSegment(
  from: [number, number],
  to: [number, number],
  fromName: string,
  toName: string,
  mode: TravelMode,
  poiCategoryIcon?: string,
  poiCategoryName?: string
): RouteSegment[] {
  const dist = haversine(from[0], from[1], to[0], to[1]);
  return [
    {
      from: { name: fromName, location: from },
      to: { name: toName, location: to, categoryIcon: poiCategoryIcon, categoryName: poiCategoryName },
      distance: Math.round(dist),
      duration: Math.round(dist / (SPEEDS[mode] || 5)),
      mode,
      path: [from, to],
    },
  ];
}

/**
 * 智能混合交通路线规划（单方案）
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

  const order = optimizeOrder(start, pois);
  return buildPlanFromOrder(userLocation, order, prefs);
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

  // ---- 方案3：最省时间（长距离默认驾车+公交） ----
  const fastPrefs: TransportPrefs = {
    walking: prefs.walking,
    bicycling: false,
    driving: true,
    subway: true,
    bus: true,
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

/** 按给定顺序构建完整路线（逐段计算，公交换乘自动展开，不做路径优化） */
export async function buildPlanFromOrder(
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

  for (let i = 0; i < order.length; i++) {
    const poi = order[i];
    const straightDist = haversine(
      prevPoint[0],
      prevPoint[1],
      poi.location[0],
      poi.location[1]
    );
    const bestMode = decideBestMode(straightDist, prefs);

    if (bestMode === "subway" || bestMode === "bus") {
      const subSegs = await calculateTransitSegments(
        prevPoint,
        poi.location,
        prevName,
        poi.name,
        bestMode,
        poi.categoryIcon,
        poi.categoryName
      );
      // 最后一个子段标记 orderIndex
      if (subSegs.length > 0) {
        subSegs[subSegs.length - 1].orderIndex = i;
      }
      segments.push(...subSegs);
    } else {
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
        orderIndex: i,
      });
    }

    prevPoint = poi.location;
    prevName = poi.name;
  }

  const totalDistance = segments.reduce((sum, s) => sum + s.distance, 0);
  const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0);

  return { segments, totalDistance, totalDuration, order };
}
