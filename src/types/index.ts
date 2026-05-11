/** 高德地图 POI 搜索结果 */
export interface POIResult {
  id: string;
  name: string;
  address: string;
  location: [number, number]; // [lng, lat]
  city?: string;
  distance?: number;
}

/** 店铺输入项 */
export interface ShopInput {
  id: string;
  name: string;
  poi?: POIResult | null;
  loading?: boolean;
}

/** 交通方式 */
export type TravelMode = "walking" | "bicycling" | "driving";

/** 路线规划中的某一段 */
export interface RouteSegment {
  from: {
    name: string;
    location: [number, number];
  };
  to: {
    name: string;
    location: [number, number];
  };
  distance: number; // 米
  duration: number; // 秒
  mode: TravelMode;
  path: [number, number][]; // 路径坐标点
}

/** 完整路线规划结果 */
export interface RoutePlan {
  segments: RouteSegment[];
  totalDistance: number;
  totalDuration: number;
  order: POIResult[]; // 最优访问顺序
}

/** 用户位置 */
export interface UserLocation {
  lng: number;
  lat: number;
  address?: string;
}
