/** 高德地图 POI 搜索结果 */
export interface POIResult {
  id: string;
  name: string;
  address: string;
  location: [number, number]; // [lng, lat]
  city?: string;
  distance?: number;
  /** 所属分类 ID（浏览发现模式） */
  categoryId?: string;
  /** 所属分类名称 */
  categoryName?: string;
  /** 所属分类图标 */
  categoryIcon?: string;
}

/** 按分类分组的结果 */
export interface CategoryGroup {
  categoryId: string;
  categoryName: string;
  icon: string;
  pois: POIResult[];
}

/** 店铺输入项 */
export interface ShopInput {
  id: string;
  name: string;
  poi?: POIResult | null;
  loading?: boolean;
}

/** 单一交通方式 */
export type TravelMode = "walking" | "bicycling" | "driving" | "subway" | "bus";

/** 交通方式偏好设置 */
export interface TransportPrefs {
  walking: boolean;
  bicycling: boolean;
  driving: boolean;
  subway: boolean;
  bus: boolean;
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
    categoryIcon?: string;
    categoryName?: string;
  };
  to: {
    name: string;
    location: [number, number];
    categoryIcon?: string;
    categoryName?: string;
  };
  distance: number;
  duration: number;
  mode: TravelMode;
  path: [number, number][];
  /** 线路名，如 "地铁2号线"、"公交34路" */
  transitName?: string;
  /** 途经站数 */
  stationCount?: number;
  /** 对应的 POI order 索引（仅 POI 目的段有值，用于排序） */
  orderIndex?: number;
}

/** 完整路线规划结果 */
export interface RoutePlan {
  segments: RouteSegment[];
  totalDistance: number;
  totalDuration: number;
  order: POIResult[];
}

/** 多方案路线规划结果 */
export interface MultiRoutePlan {
  plans: RoutePlan[];
  labels: string[];
  currentIndex: number;
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

/** 成都区域 */
export interface District {
  code: string;
  name: string;
  center: [number, number];
  zoom: number;
}

/** 分类 */
export interface Category {
  id: string;
  name: string;
  icon: string;
  type: "food" | "entertainment";
  keyword: string;
}

/** 已保存的路线 */
export interface SavedRoute {
  id: string;
  title: string;
  createdAt: string;
  city: string;
  districts: string[];
  categories: string[];
  stores: POIResult[];
  plan: RoutePlan;
}

/** 底部面板 Tab 类型 */
export type PanelTab = "manual" | "discover" | "route" | "saved";

/** 城市配置 */
export interface CityConfig {
  code: string;
  name: string;
  center: [number, number];
  zoom: number;
  districts: District[];
  categories: Category[];
}
