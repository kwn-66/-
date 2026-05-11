"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAMap } from "@/hooks/useAMap";
import { resetLoader } from "@/lib/amap";

/** 成都市中心坐标（天府广场） */
const CHENGDU_CENTER: [number, number] = [104.0657, 30.6573];
const DEFAULT_ZOOM = 12;

interface AMapContainerProps {
  className?: string;
  onMapReady?: (map: AMap.Map) => void;
}

export default function AMapContainer({
  className = "",
  onMapReady,
}: AMapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<AMap.Map | null>(null);
  const { loaded, loading, error, createMap, reload } = useAMap();
  const [mapFailed, setMapFailed] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!loaded || !containerRef.current || mapRef.current) return;

    try {
      const map = createMap(containerRef.current, {
        zoom: DEFAULT_ZOOM,
        center: CHENGDU_CENTER,
        resizeEnable: true,
        viewMode: "2D",
      });

      if (map) {
        mapRef.current = map;
        setMapFailed(false);
        onMapReady?.(map);
      } else {
        setMapFailed(true);
      }
    } catch {
      setMapFailed(true);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, [loaded, createMap, onMapReady]);

  const handleRetry = useCallback(() => {
    setRetrying(true);
    setMapFailed(false);
    resetLoader();
    reload();
    // 延迟重置 retrying 状态，让 reload 生效
    setTimeout(() => setRetrying(false), 1000);
  }, [reload]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* 地图容器 */}
      <div ref={containerRef} className="w-full h-full" />

      {/* 加载状态 */}
      {(loading || retrying) && (
        <div className="absolute inset-0 bg-[#f5f5f5] flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted">
              {retrying ? "正在重新加载..." : "地图加载中..."}
            </p>
          </div>
        </div>
      )}

      {/* 错误状态 */}
      {(error || mapFailed) && !loading && (
        <div className="absolute inset-0 bg-[#f5f5f5] flex items-center justify-center z-10">
          <div className="text-center px-8 max-w-xs">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#fee2e2] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <p className="text-sm font-medium text-foreground mb-1">地图加载失败</p>
            <p className="text-xs text-muted mb-4">
              {error || "地图初始化失败，请检查 API Key 配置"}
            </p>
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-primary text-white text-sm rounded-full active:scale-95 transition-transform"
            >
              重新加载
            </button>
            <p className="text-xs text-muted mt-3">
              如持续失败，请确认 Key 的域名白名单允许当前域名访问
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
