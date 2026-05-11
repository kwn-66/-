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

/** 单一交通方式 */
export type TravelMode = "walking" | "bicycling" | "driving";

/** 交通方式偏好设置 */
export interface TransportPrefs {
  walking: boolean;
  bicycling: boolean;
  driving: boolean;
}

/** 每段路线推荐的交通方式元信息 */
export interface SegmentModeInfo {
  mode: TravelMode;
  label: string;
  color: string;
}

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
  distance: number;
  duration: number;
  mode: TravelMode;
  path: [number, number][];
}

/** 完整路线规划结果 */
export interface RoutePlan {
  segments: RouteSegment[];
  totalDistance: number;
  totalDuration: number;
  order: POIResult[]; // 最优访问顺序（已排序）
}

/** 用户位置 */
export interface UserLocation {
  lng: number;
  lat: number;
  address?: string;
}

/** 动画状态 */
export type AnimationStatus = "idle" | "playing" | "paused";

/** 动画控制 */
export interface AnimationState {
  status: AnimationStatus;
  currentSegmentIndex: number;
  /** 当前动画进度 0-1 */
  progress: number;
}
