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
import BottomSheet from "@/ui/BottomSheet";
import type { SheetState } from "@/ui/BottomSheet";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useMarkers } from "@/hooks/useMarkers";
import { useRouteLine } from "@/hooks/useRouteLine";
import { useRouteAnimation } from "@/hooks/useRouteAnimation";
import { searchAllShops, searchMultiCategories, searchGroupedByCategory, loadMoreForCategory } from "@/services/poi";
import { planSmartRoute, planMultiRoute, buildPlanFromOrder } from "@/route-engine/planner";
import { saveRoute as persistRoute } from "@/features/saved-routes/storage";
import { getAllCities } from "@/cities/registry";
import type {
  UserLocation,
  ShopInput as ShopInputType,
  RoutePlan,
  MultiRoutePlan,
  TransportPrefs,
  POIResult,
  PanelTab,
  SavedRoute,
  CityConfig,
  CategoryGroup,
} from "@/types";

const DEFAULT_PREFS: TransportPrefs = {
  walking: true,
  bicycling: true,
  driving: true,
  subway: true,
  bus: true,
};

export default function Home() {
  const [map, setMap] = useState<AMap.Map | null>(null);
  const { locating, city, setCity, getUserLocation, error: geoError } = useGeolocation();
  const { showMarkers, clearMarkers } = useMarkers();
  const { drawRoute, clearLines, setOnHover } = useRouteLine();
  const routeAnimation = useRouteAnimation();
  const userMarkerRef = useRef<AMap.Marker | null>(null);
  const allCities = useMemo(() => getAllCities(), []);

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
  const [multiPlan, setMultiPlan] = useState<MultiRoutePlan | null>(null);
  const [transportPrefs, setTransportPrefs] = useState<TransportPrefs>(DEFAULT_PREFS);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

  // ---- 浏览发现 ----
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(["all"]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [feedGroups, setFeedGroups] = useState<CategoryGroup[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [categoryPages, setCategoryPages] = useState<Record<string, number>>({});
  const [loadingMoreCat, setLoadingMoreCat] = useState<string | null>(null);
  const [routePool, setRoutePool] = useState<POIResult[]>([]);
  const [aiStoreCount, setAiStoreCount] = useState(5);

  // ---- 我的路线 ----
  const [savedRoutesKey, setSavedRoutesKey] = useState(0);

  // ---- 保存路线 ----
  const [saveDisabled, setSaveDisabled] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

  // ---- Bottom Sheet 状态 ----
  const [sheetState, setSheetState] = useState<SheetState>("collapsed");

  // 根据 sheet 状态调整地图可视区域
  const adjustMapPadding = useCallback(
    (st: SheetState) => {
      if (!map) return;
      if (st !== "collapsed") {
        const center = map.getCenter();
        map.setCenter([center.lng, center.lat - 0.003]);
      }
    },
    [map]
  );

  const handleSheetChange = useCallback(
    (st: SheetState) => {
      setSheetState(st);
      adjustMapPadding(st);
    },
    [adjustMapPadding]
  );

  const prefsEffective = useMemo(() => transportPrefs, [transportPrefs]);

  // ---- 页面加载自动定位 ----
  useEffect(() => {
    getUserLocation().then((result) => {
      setUserLocation(result.location);
      setCity(result.city);
    });
  }, [getUserLocation, setCity]);

  // ---- 切换城市时重置 ----
  const handleCityChange = useCallback((newCity: CityConfig) => {
    setCity(newCity);
    setShowCityPicker(false);
    setSelectedDistricts(["all"]);
    setSelectedCategories([]);
    setFeedGroups([]);
    setRoutePool([]);
    setRoutePlan(null);
    setFoundPOIs([]);
    clearMarkers();
    clearLines();
    routeAnimation.cleanup();
    if (map) {
      map.setCenter(newCity.center);
      map.setZoom(newCity.zoom);
      if (userMarkerRef.current) {
        userMarkerRef.current.setPosition(newCity.center);
      }
    }
  }, [map, setCity, clearMarkers, clearLines, routeAnimation]);

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
    const pos = city.center;
    const marker = new window.AMap.Marker({
      position: pos,
      content: markerContent,
      offset: { x: -8, y: -8 },
      zIndex: 100,
    });
    marker.setMap(mapInstance);
    userMarkerRef.current = marker;
  }, [city]);

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
    const result = await getUserLocation();
    setUserLocation(result.location);
    setCity(result.city);
    moveToUserLocation(result.location);
  }, [getUserLocation, setCity, moveToUserLocation]);

  // ---- 区域切换 → 聚焦地图 ----
  const handleDistrictChange = useCallback(
    (codes: string[]) => {
      setSelectedDistricts(codes);
      if (map) {
        const dist = city.districts.find((d) => d.code === codes[0]);
        if (dist) {
          map.setCenter(dist.center);
          map.setZoom(dist.zoom);
        }
      }
    },
    [map, city]
  );

  // ---- 分类区域变化 → 搜索 POI ----
  useEffect(() => {
    if (activeTab !== "discover") return;
    if (selectedCategories.length === 0) {
      setFeedGroups([]);
      return;
    }

    let cancelled = false;
    setFeedLoading(true);

    const district = selectedDistricts[0];
    const districtName =
      district && district !== "all"
        ? city.districts.find((d) => d.code === district)?.name
        : undefined;

    const cats = selectedCategories
      .map((id) => city.categories.find((c) => c.id === id))
      .filter(Boolean) as typeof city.categories;

    searchGroupedByCategory(cats, city.name, districtName).then((groups) => {
      if (cancelled) return;
      setFeedGroups(groups);
      setFeedLoading(false);
      // 重置分页计数
      const pages: Record<string, number> = {};
      groups.forEach((g) => { pages[g.categoryId] = 1; });
      setCategoryPages(pages);
    });

    return () => {
      cancelled = true;
    };
  }, [selectedCategories, selectedDistricts, activeTab, city]);

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

  // ---- 分页加载更多 ----
  const handleLoadMore = useCallback(
    async (catId: string) => {
      const cat = city.categories.find((c) => c.id === catId);
      if (!cat) return;

      const nextPage = (categoryPages[catId] || 1) + 1;
      setLoadingMoreCat(catId);

      const district = selectedDistricts[0];
      const districtName =
        district && district !== "all"
          ? city.districts.find((d) => d.code === district)?.name
          : undefined;

      const newPois = await loadMoreForCategory(cat, nextPage, city.name, districtName);
      setLoadingMoreCat(null);

      if (newPois.length === 0) return;

      setFeedGroups((prev) =>
        prev.map((g) =>
          g.categoryId === catId
            ? { ...g, pois: [...g.pois, ...newPois] }
            : g
        )
      );
      setCategoryPages((prev) => ({ ...prev, [catId]: nextPage }));
    },
    [categoryPages, city, selectedDistricts]
  );

  // ---- 通用路线规划 ----
  const doPlanRoute = useCallback(
    async (pois: POIResult[], generateMulti = false) => {
      setPlanning(true);
      clearMarkers();
      clearLines();
      routeAnimation.cleanup();
      setRoutePlan(null);
      setMultiPlan(null);

      if (pois.length === 0) {
        setPlanning(false);
        return;
      }

      if (generateMulti) {
        // AI 推荐：生成三套方案
        const mp = await planMultiRoute(userLocation, pois, transportPrefs);
        setMultiPlan(mp);
        setFoundPOIs(mp.plans[0].order);
        setRoutePlan(mp.plans[0]);
        if (map) showMarkers(map, mp.plans[0].order);
        if (map) drawRoute(map, mp.plans[0]);
        if (map) routeAnimation.init(map, mp.plans[0]);
      } else {
        // 手动选店：唯一最优路线
        const plan = await planSmartRoute(userLocation, pois, transportPrefs);
        setRoutePlan(plan);
        setFoundPOIs(plan.order);
        if (map) showMarkers(map, plan.order);
        if (map) drawRoute(map, plan);
        if (map) routeAnimation.init(map, plan);
      }

      setPlanning(false);
      setActiveTab("route");
      setSheetState("half");
    },
    [
      userLocation, transportPrefs, map,
      showMarkers, clearMarkers, clearLines, drawRoute, routeAnimation,
    ]
  );

  // ---- 方案切换 ----
  const handlePlanChange = useCallback(
    (index: number) => {
      if (!multiPlan || !map) return;
      const plan = multiPlan.plans[index];
      if (!plan) return;

      setMultiPlan({ ...multiPlan, currentIndex: index });
      setRoutePlan(plan);
      setFoundPOIs(plan.order);

      clearLines();
      routeAnimation.cleanup();
      drawRoute(map, plan);
      routeAnimation.init(map, plan);
    },
    [multiPlan, map, clearLines, drawRoute, routeAnimation]
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

    const results = await searchAllShops(validShops, city.name);
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

  // ---- AI 推荐：分类去重 + 店铺数量选择器 ----
  const handleAutoRecommend = useCallback(async () => {
    const count = Math.max(2, Math.min(10, aiStoreCount));
    if (feedGroups.length === 0) return;

    const picked: POIResult[] = [];
    const usedIds = new Set<string>();

    // 第一轮：每个分类至少选1家
    for (const group of feedGroups) {
      const match = group.pois.find((p) => !usedIds.has(p.id));
      if (match) {
        picked.push(match);
        usedIds.add(match.id);
      }
    }

    // 第二轮：剩余名额从余下的店中补齐
    const allPois = feedGroups.flatMap((g) => g.pois);
    for (let i = picked.length; i < count; i++) {
      const next = allPois.find((p) => !usedIds.has(p.id));
      if (next) {
        picked.push(next);
        usedIds.add(next.id);
      } else break;
    }

    if (picked.length < 2) return;
    setRoutePool(picked);
    await doPlanRoute(picked, true);
  }, [feedGroups, doPlanRoute, aiStoreCount]);

  // ---- 单店刷新：同分类替换 ----
  const handleRefreshStore = useCallback(
    async (index: number) => {
      if (!routePlan || !map) return;
      const current = routePlan.order[index];
      if (!current) return;

      // 在同一分类下搜索替代店铺
      const keywords = current.categoryName
        ? [current.categoryName]
        : [current.name.slice(0, 2)];
      const pois = await searchMultiCategories(keywords, city.name);

      // 过滤当前已在路线中的
      const existingIds = new Set(routePlan.order.map((p) => p.id));
      const candidates = pois.filter((p) => !existingIds.has(p.id));

      if (candidates.length === 0) return;

      // 取最近的替代店
      const replacement = candidates[0];
      const newOrder = routePlan.order.map((p, i) =>
        i === index ? replacement : p
      );

      // 重新生成三套方案
      clearMarkers();
      clearLines();
      routeAnimation.cleanup();
      setPlanning(true);

      const mp = await planMultiRoute(userLocation, newOrder, transportPrefs);
      setMultiPlan(mp);
      const currentPlan = mp.plans[0];
      setRoutePlan(currentPlan);
      setFoundPOIs(currentPlan.order);
      if (map) showMarkers(map, currentPlan.order);
      if (map) drawRoute(map, currentPlan);
      if (map) routeAnimation.init(map, currentPlan);

      setPlanning(false);
    },
    [routePlan, userLocation, transportPrefs, map, city.name]
  );

  // ---- 交通偏好变化 ----
  const handleTransportPrefsChange = useCallback(
    async (prefs: TransportPrefs) => {
      setTransportPrefs(prefs);
      if (foundPOIs.length === 0) return;

      clearLines();
      routeAnimation.cleanup();
      setPlanning(true);

      const mp = await planMultiRoute(userLocation, foundPOIs, prefs);
      setMultiPlan(mp);
      const currentPlan = mp.plans[mp.currentIndex] || mp.plans[0];
      setRoutePlan(currentPlan);

      if (map) drawRoute(map, currentPlan);
      if (map) routeAnimation.init(map, currentPlan);

      setPlanning(false);
    },
    [foundPOIs, userLocation, map, clearLines, drawRoute, routeAnimation]
  );

  // ---- 路线节点排序（手动模式：保留用户顺序，仅重算 segments） ----
  const handleMoveUp = useCallback(
    async (orderIndex: number) => {
      if (!routePlan || orderIndex <= 0) return;
      const newOrder = [...routePlan.order];
      [newOrder[orderIndex - 1], newOrder[orderIndex]] = [newOrder[orderIndex], newOrder[orderIndex - 1]];

      clearLines();
      routeAnimation.cleanup();
      setPlanning(true);

      // 直接用用户顺序构建路线，不跑 optimizeOrder
      const plan = await buildPlanFromOrder(userLocation, newOrder, transportPrefs);
      setRoutePlan(plan);
      setFoundPOIs(plan.order);
      setMultiPlan(null);
      if (map) drawRoute(map, plan);
      if (map) routeAnimation.init(map, plan);

      setPlanning(false);
    },
    [routePlan, userLocation, transportPrefs, map, clearLines, drawRoute, routeAnimation]
  );

  const handleMoveDown = useCallback(
    async (orderIndex: number) => {
      if (!routePlan || orderIndex >= routePlan.order.length - 1) return;
      const newOrder = [...routePlan.order];
      [newOrder[orderIndex], newOrder[orderIndex + 1]] = [newOrder[orderIndex + 1], newOrder[orderIndex]];

      clearLines();
      routeAnimation.cleanup();
      setPlanning(true);

      const plan = await buildPlanFromOrder(userLocation, newOrder, transportPrefs);
      setRoutePlan(plan);
      setFoundPOIs(plan.order);
      setMultiPlan(null);
      if (map) drawRoute(map, plan);
      if (map) routeAnimation.init(map, plan);

      setPlanning(false);
    },
    [routePlan, userLocation, transportPrefs, map, clearLines, drawRoute, routeAnimation]
  );

  // ---- 保存路线 ----
  const handleSaveRoute = useCallback(
    (title: string) => {
      if (!routePlan || foundPOIs.length === 0) return;
      const saved: SavedRoute = {
        id: `route_${Date.now()}`,
        title,
        createdAt: new Date().toISOString(),
        city: city.name,
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
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-wide">
              出游日记
            </h1>
            <button
              onClick={() => setShowCityPicker(!showCityPicker)}
              className="flex items-center gap-0.5 text-sm text-muted hover:text-primary transition-colors ml-1"
            >
              {city.name}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-muted mt-0.5">
            AI 城市出游路线规划
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

      {/* 城市选择器 */}
      {showCityPicker && (
        <div className="px-4 pb-2">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {allCities.map((c) => (
              <button
                key={c.code}
                onClick={() => handleCityChange(c)}
                className={`shrink-0 px-3 py-1.5 text-xs rounded-full border transition-all active:scale-95 ${
                  c.code === city.code
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-foreground border-border hover:border-primary/40"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
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
                districts={city.districts}
                selected={selectedDistricts}
                onChange={handleDistrictChange}
              />
              <CategoryCards
                categories={city.categories}
                selected={selectedCategories}
                onChange={setSelectedCategories}
              />
              {selectedCategories.length > 0 && (
                <StoreFeed
                  groups={feedGroups}
                  selected={routePool}
                  loading={feedLoading}
                  onToggle={handleTogglePool}
                  onLoadMore={handleLoadMore}
                  loadingMoreCat={loadingMoreCat}
                />
              )}
              {feedGroups.length > 0 && routePool.length === 0 && (
                <div className="space-y-2">
                  {/* 店铺数量选择器 */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">推荐店铺数量</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setAiStoreCount((c) => Math.max(2, c - 1))}
                        className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs"
                      >
                        −
                      </button>
                      <span className="text-sm font-medium w-6 text-center">
                        {aiStoreCount}
                      </span>
                      <button
                        onClick={() => setAiStoreCount((c) => Math.min(10, c + 1))}
                        className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleAutoRecommend}
                    disabled={planning}
                    className="w-full h-10 flex items-center justify-center gap-2 text-sm text-primary border border-dashed border-primary/40 rounded-xl hover:bg-primary-light transition-colors active:scale-[0.99] disabled:opacity-50"
                  >
                    🤖 帮我推荐 {aiStoreCount} 家
                  </button>
                </div>
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
          {activeTab === "route" && routePlan && (
            <BottomSheet
              state={sheetState}
              onStateChange={handleSheetChange}
              collapsedContent={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {routePlan.order.length} 个地点
                    </span>
                    <span className="text-xs text-muted">
                      {Math.ceil(routePlan.totalDuration / 60)}分钟
                    </span>
                  </div>
                  <span className="text-xs text-muted">
                    {(routePlan.totalDistance / 1000).toFixed(1)}km
                  </span>
                </div>
              }
              footer={
                <button
                  onClick={() => {
                    const today = new Date().toISOString().slice(0, 10);
                    handleSaveRoute(`${today} ${city.name}路线`);
                  }}
                  disabled={saveDisabled}
                  className="w-full h-9 flex items-center justify-center gap-1.5 text-sm text-white bg-primary rounded-lg active:scale-[0.99] disabled:opacity-50"
                >
                  保存路线
                </button>
              }
            >
              <RouteCard
                planning={planning}
                routePlan={routePlan}
                multiPlan={multiPlan}
                onPlanChange={handlePlanChange}
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
                onRefreshStore={handleRefreshStore}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
              />
            </BottomSheet>
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
