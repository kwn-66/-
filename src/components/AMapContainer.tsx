"use client";

import { useEffect, useRef, useState } from "react";
import { useAMap } from "@/hooks/useAMap";

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
  const { loaded, loading, error, createMap } = useAMap();
  const [mapFailed, setMapFailed] = useState(false);

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

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* 地图容器 */}
      <div ref={containerRef} className="w-full h-full" />

      {/* 加载状态 */}
      {loading && (
        <div className="absolute inset-0 bg-secondary flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted">地图加载中...</p>
          </div>
        </div>
      )}

      {/* 错误状态 */}
      {(error || mapFailed) && (
        <div className="absolute inset-0 bg-secondary flex items-center justify-center">
          <div className="text-center px-6">
            <p className="text-sm text-muted">
              {error || "地图初始化失败，请检查 API Key 配置"}
            </p>
            <p className="text-xs text-muted mt-2">
              请在 .env.local 中填入高德地图 Key
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
