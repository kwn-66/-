"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import AMapContainer from "@/components/AMapContainer";
import ShopInput from "@/components/ShopInput";
import RouteCard from "@/components/RouteCard";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useMarkers } from "@/hooks/useMarkers";
import { useRouteLine } from "@/hooks/useRouteLine";
import { useRouteAnimation } from "@/hooks/useRouteAnimation";
import { searchAllShops } from "@/services/poi";
import { planSmartRoute } from "@/route-engine/planner";
import type {
  UserLocation,
  ShopInput as ShopInputType,
  RoutePlan,
  TransportPrefs,
  POIResult,
} from "@/types";

const CHENGDU_CENTER: [number, number] = [104.0657, 30.6573];

/** 默认交通偏好：全部开启（系统智能选择） */
const DEFAULT_PREFS: TransportPrefs = {
  walking: true,
  bicycling: true,
  driving: true,
};

export default function Home() {
  const [map, setMap] = useState<AMap.Map | null>(null);
  const { locating, getUserLocation, error: geoError } = useGeolocation();
  const { showMarkers, clearMarkers } = useMarkers();
  const { drawRoute, clearLines, setOnHover } = useRouteLine();
  const routeAnimation = useRouteAnimation();
  const userMarkerRef = useRef<AMap.Marker | null>(null);

  const [shops, setShops] = useState<ShopInputType[]>([
    { id: "shop_initial", name: "" },
  ]);
  const [planning, setPlanning] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [foundPOIs, setFoundPOIs] = useState<POIResult[]>([]);
  const [routePlan, setRoutePlan] = useState<RoutePlan | null>(null);
  const [transportPrefs, setTransportPrefs] = useState<TransportPrefs>(DEFAULT_PREFS);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

  // 动画时禁用交通方式切换
  const prefsEffective = useMemo(() => {
    if (routeAnimation.animState.status === "playing") return transportPrefs;
    return transportPrefs;
  }, [transportPrefs, routeAnimation.animState.status]);

  // 页面加载后自动定位
  useEffect(() => {
    getUserLocation().then(setUserLocation);
  }, [getUserLocation]);

  const handleMapReady = useCallback((mapInstance: AMap.Map) => {
    setMap(mapInstance);
    if (!window.AMap) return;

    const markerContent = document.createElement("div");
    markerContent.innerHTML = `
      <div style="
        width: 16px; height: 16px;
        background: #007aff;
        border: 3px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,122,255,0.4);
      "></div>
    `;
    const marker = new window.AMap.Marker({
      position: CHENGDU_CENTER,
      content: markerContent,
      offset: { x: -8, y: -8 },
      zIndex: 100,
    });
    marker.setMap(mapInstance);
    userMarkerRef.current = marker;
  }, []);

  const moveToUserLocation = useCallback(
    (loc: UserLocation) => {
      if (!map) return;
      map.setCenter([loc.lng, loc.lat]);
      map.setZoom(15);
      if (userMarkerRef.current) {
        userMarkerRef.current.setPosition([loc.lng, loc.lat]);
      }
    },
    [map]
  );

  const handleLocate = useCallback(async () => {
    const loc = await getUserLocation();
    setUserLocation(loc);
    moveToUserLocation(loc);
  }, [getUserLocation, moveToUserLocation]);

  /** 规划路线 */
  const handlePlanRoute = useCallback(async () => {
    const validShops = shops.filter((s) => s.name.trim());
    if (validShops.length === 0) return;

    setPlanning(true);
    clearMarkers();
    clearLines();
    routeAnimation.cleanup();
    setRoutePlan(null);
    setFoundPOIs([]);

    setShops((prev) =>
      prev.map((s) => (s.name.trim() ? { ...s, loading: true } : s))
    );

    // POI 搜索
    const results = await searchAllShops(validShops);
    setShops(results);

    const pois = results
      .filter(
        (
          s
        ): s is ShopInputType & {
          poi: NonNullable<ShopInputType["poi"]>;
        } => !!s.poi
      )
      .map((s) => s.poi);

    if (pois.length === 0) {
      setPlanning(false);
      return;
    }

    // 智能混合路线规划
    const plan = await planSmartRoute(userLocation, pois, transportPrefs);

    // 用优化后的 order 更新 POI（确保 Marker 编号同步）
    setFoundPOIs(plan.order);
    setRoutePlan(plan);

    // 按优化顺序显示 Marker
    if (map) showMarkers(map, plan.order);

    // 绘制路线
    if (map) drawRoute(map, plan);

    // 初始化动画
    if (map) routeAnimation.init(map, plan);

    setPlanning(false);
  }, [
    shops, map, userLocation, transportPrefs,
    showMarkers, clearMarkers, clearLines, drawRoute,
    routeAnimation,
  ]);

  /** 交通偏好变化时重新规划 */
  const handleTransportPrefsChange = useCallback(
    async (prefs: TransportPrefs) => {
      setTransportPrefs(prefs);
      if (foundPOIs.length === 0) return;

      clearLines();
      routeAnimation.cleanup();
      setPlanning(true);

      const plan = await planSmartRoute(userLocation, foundPOIs, prefs);
      setRoutePlan(plan);

      if (map) drawRoute(map, plan);
      if (map) routeAnimation.init(map, plan);

      setPlanning(false);
    },
    [foundPOIs, userLocation, map, clearLines, drawRoute, routeAnimation]
  );

  // 路线 hover 回传
  useEffect(() => {
    setOnHover((idx: number | null) => setHoveredSegment(idx));
  }, [setOnHover]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* 顶部 */}
      <header className="px-4 pt-4 pb-2 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">成都探店路线规划</h1>
          <p className="text-xs text-muted mt-0.5">
            智能混合交通 · 自动最优路线
          </p>
        </div>
        <button
          onClick={handleLocate}
          disabled={locating}
          className="shrink-0 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
        >
          {locating ? (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            </svg>
          )}
        </button>
      </header>

      {geoError && (
        <div className="px-4 pb-1">
          <p className="text-xs text-muted">{geoError}</p>
        </div>
      )}

      {/* 店铺输入 */}
      <ShopInput shops={shops} onShopsChange={setShops} onPlanRoute={handlePlanRoute} />

      {/* 地图 */}
      <div className="flex-1 min-h-0 mx-4 rounded-xl overflow-hidden shadow-md">
        <AMapContainer onMapReady={handleMapReady} />
      </div>

      {/* 底部路线详情 */}
      <RouteCard
        planning={planning}
        routePlan={routePlan}
        transportPrefs={prefsEffective}
        onTransportPrefsChange={handleTransportPrefsChange}
        animStatus={routeAnimation.animState.status}
        animSegmentIndex={
          routeAnimation.animState.status === "playing"
            ? routeAnimation.animState.currentSegmentIndex
            : hoveredSegment ?? undefined
        }
        onPlay={routeAnimation.play}
        onPause={routeAnimation.pause}
        onReset={routeAnimation.reset}
      />
    </div>
  );
}
