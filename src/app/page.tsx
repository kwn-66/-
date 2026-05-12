"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import AMapContainer from "@/components/AMapContainer";
import ShopInput from "@/components/ShopInput";
import RouteCard from "@/components/RouteCard";
import DistrictFilter from "@/features/district/DistrictFilter";
import CategoryCards from "@/features/category/CategoryCards";
import StoreFeed from "@/features/store-feed/StoreFeed";
import RoutePool from "@/features/route-pool/RoutePool";
import SavedRoutes from "@/features/saved-routes/SavedRoutes";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useMarkers } from "@/hooks/useMarkers";
import { useRouteLine } from "@/hooks/useRouteLine";
import { useRouteAnimation } from "@/hooks/useRouteAnimation";
import { searchAllShops, searchMultiCategories } from "@/services/poi";
import { planSmartRoute } from "@/route-engine/planner";
import { saveRoute as persistRoute } from "@/features/saved-routes/storage";
import { CHENGDU_DISTRICTS, CHENGDU_CATEGORIES } from "@/config/chengdu";
import type {
  UserLocation,
  ShopInput as ShopInputType,
  RoutePlan,
  TransportPrefs,
  POIResult,
  PanelTab,
  SavedRoute,
} from "@/types";

const CHENGDU_CENTER: [number, number] = [104.0657, 30.6573];

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

  // ---- Tab 状态 ----
  const [activeTab, setActiveTab] = useState<PanelTab>("manual");

  // ---- 手动输入 ----
  const [shops, setShops] = useState<ShopInputType[]>([
    { id: "shop_initial", name: "" },
  ]);
  const [planning, setPlanning] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [foundPOIs, setFoundPOIs] = useState<POIResult[]>([]);
  const [routePlan, setRoutePlan] = useState<RoutePlan | null>(null);
  const [transportPrefs, setTransportPrefs] = useState<TransportPrefs>(DEFAULT_PREFS);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

  // ---- 浏览发现 ----
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(["all"]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [feedPOIs, setFeedPOIs] = useState<POIResult[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [routePool, setRoutePool] = useState<POIResult[]>([]);

  // ---- 我的路线 ----
  const [savedRoutesKey, setSavedRoutesKey] = useState(0);

  // ---- 保存路线 ----
  const [saveDisabled, setSaveDisabled] = useState(false);

  // 动画禁用交通切换
  const prefsEffective = useMemo(() => {
    return transportPrefs;
  }, [transportPrefs]);

  // ---- 页面加载自动定位 ----
  useEffect(() => {
    getUserLocation().then(setUserLocation);
  }, [getUserLocation]);

  // ---- 地图就绪 ----
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

  // ---- 区域切换 → 聚焦地图 ----
  const handleDistrictChange = useCallback(
    (codes: string[]) => {
      setSelectedDistricts(codes);
      if (map) {
        const dist = CHENGDU_DISTRICTS.find((d) => d.code === codes[0]);
        if (dist) {
          map.setCenter(dist.center);
          map.setZoom(dist.zoom);
        }
      }
    },
    [map]
  );

  // ---- 分类区域变化 → 搜索 POI ----
  useEffect(() => {
    if (activeTab !== "discover") return;
    if (selectedCategories.length === 0) {
      setFeedPOIs([]);
      return;
    }

    let cancelled = false;
    setFeedLoading(true);

    const district = selectedDistricts[0];
    const districtName =
      district && district !== "all"
        ? CHENGDU_DISTRICTS.find((d) => d.code === district)?.name
        : undefined;

    const keywords = selectedCategories
      .map((id) => CHENGDU_CATEGORIES.find((c) => c.id === id)?.keyword)
      .filter(Boolean) as string[];

    searchMultiCategories(keywords, districtName).then((pois) => {
      if (cancelled) return;
      setFeedPOIs(pois);
      setFeedLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [selectedCategories, selectedDistricts, activeTab]);

  // ---- 路线池操作 ----
  const handleTogglePool = useCallback((poi: POIResult) => {
    setRoutePool((prev) => {
      const exists = prev.find((p) => p.id === poi.id);
      if (exists) return prev.filter((p) => p.id !== poi.id);
      return [...prev, poi];
    });
  }, []);

  const handleRemoveFromPool = useCallback((id: string) => {
    setRoutePool((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // ---- 通用路线规划 ----
  const doPlanRoute = useCallback(
    async (pois: POIResult[]) => {
      setPlanning(true);
      clearMarkers();
      clearLines();
      routeAnimation.cleanup();
      setRoutePlan(null);

      if (pois.length === 0) {
        setPlanning(false);
        return;
      }

      // 路线优化
      const plan = await planSmartRoute(userLocation, pois, transportPrefs);

      setFoundPOIs(plan.order);
      setRoutePlan(plan);

      // 地图显示
      if (map) showMarkers(map, plan.order);
      if (map) drawRoute(map, plan);
      if (map) routeAnimation.init(map, plan);

      setPlanning(false);
      setActiveTab("route");
    },
    [
      userLocation, transportPrefs, map,
      showMarkers, clearMarkers, clearLines, drawRoute, routeAnimation,
    ]
  );

  // ---- 手动输入：搜索并规划 ----
  const handleManualPlan = useCallback(async () => {
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

    const results = await searchAllShops(validShops);
    setShops(results);

    const pois = results
      .filter(
        (s): s is ShopInputType & { poi: NonNullable<ShopInputType["poi"]> } =>
          !!s.poi
      )
      .map((s) => s.poi);

    if (pois.length === 0) {
      setPlanning(false);
      return;
    }

    await doPlanRoute(pois);
  }, [shops, map, userLocation, transportPrefs, clearMarkers, clearLines, drawRoute, routeAnimation, doPlanRoute]);

  // ---- 浏览发现：路线池规划 ----
  const handlePoolPlan = useCallback(async () => {
    if (routePool.length < 2) return;
    await doPlanRoute(routePool);
  }, [routePool, doPlanRoute]);

  // ---- AI 推荐：自动选评分最高的3家 ----
  const handleAutoRecommend = useCallback(async () => {
    const top3 = feedPOIs.slice(0, 3);
    setRoutePool(top3);
    await doPlanRoute(top3);
  }, [feedPOIs, doPlanRoute]);

  // ---- 交通偏好变化 ----
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

  // ---- 保存路线 ----
  const handleSaveRoute = useCallback(
    (title: string) => {
      if (!routePlan || foundPOIs.length === 0) return;
      const saved: SavedRoute = {
        id: `route_${Date.now()}`,
        title,
        createdAt: new Date().toISOString(),
        city: "成都",
        districts: selectedDistricts,
        categories: selectedCategories,
        stores: foundPOIs,
        plan: routePlan,
      };
      persistRoute(saved);
      setSaveDisabled(true);
      setTimeout(() => setSaveDisabled(false), 2000);
    },
    [routePlan, foundPOIs, selectedDistricts, selectedCategories]
  );

  // ---- 查看已保存路线 ----
  const handleViewSaved = useCallback(
    (route: SavedRoute) => {
      setFoundPOIs(route.stores);
      setRoutePlan(route.plan);
      setTransportPrefs(DEFAULT_PREFS);
      if (map) {
        showMarkers(map, route.stores);
        drawRoute(map, route.plan);
        routeAnimation.init(map, route.plan);
      }
      setActiveTab("route");
    },
    [map, showMarkers, drawRoute, routeAnimation]
  );

  // ---- 路线 hover ----
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

      {/* 地图 */}
      <div className="flex-1 min-h-0 mx-4 rounded-xl overflow-hidden shadow-md">
        <AMapContainer onMapReady={handleMapReady} />
      </div>

      {/* 底部面板 */}
      <div className="shrink-0">
        {/* Tab 按钮 */}
        <div className="flex px-4 pt-2 pb-1">
          {([
            ["manual", "手动输入"],
            ["discover", "浏览发现"],
            ["route", "路线详情"],
            ["saved", "我的路线"],
          ] as [PanelTab, string][]).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 面板内容 */}
        <div className="px-4 pb-4">
          {/* 手动输入 */}
          {activeTab === "manual" && (
            <ShopInput
              shops={shops}
              onShopsChange={setShops}
              onPlanRoute={handleManualPlan}
            />
          )}

          {/* 浏览发现 */}
          {activeTab === "discover" && (
            <div className="space-y-3">
              <DistrictFilter
                districts={CHENGDU_DISTRICTS}
                selected={selectedDistricts}
                onChange={handleDistrictChange}
              />
              <CategoryCards
                categories={CHENGDU_CATEGORIES}
                selected={selectedCategories}
                onChange={setSelectedCategories}
              />
              {selectedCategories.length > 0 && (
                <StoreFeed
                  pois={feedPOIs}
                  selected={routePool}
                  loading={feedLoading}
                  onToggle={handleTogglePool}
                />
              )}
              {feedPOIs.length > 0 && routePool.length === 0 && (
                <button
                  onClick={handleAutoRecommend}
                  disabled={planning}
                  className="w-full h-10 flex items-center justify-center gap-2 text-sm text-primary border border-dashed border-primary/40 rounded-xl hover:bg-primary-light transition-colors active:scale-[0.99] disabled:opacity-50"
                >
                  🤖 帮我推荐3家
                </button>
              )}
              <RoutePool
                stores={routePool}
                onRemove={handleRemoveFromPool}
                onPlanRoute={handlePoolPlan}
                planning={planning}
              />
            </div>
          )}

          {/* 路线详情 */}
          {activeTab === "route" && (
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
              onSave={handleSaveRoute}
              saveDisabled={saveDisabled}
            />
          )}

          {/* 我的路线 */}
          {activeTab === "saved" && (
            <SavedRoutes
              key={savedRoutesKey}
              onViewRoute={handleViewSaved}
            />
          )}
        </div>
      </div>
    </div>
  );
}
