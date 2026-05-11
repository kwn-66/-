"use client";

import { useRef, useCallback } from "react";
import type { POIResult } from "@/types";

interface UseMarkersReturn {
  showMarkers: (map: AMap.Map, pois: POIResult[]) => void;
  clearMarkers: () => void;
}

export function useMarkers(): UseMarkersReturn {
  const markersRef = useRef<AMap.Marker[]>([]);
  const infoWindowRef = useRef<AMap.InfoWindow | null>(null);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }
  }, []);

  const showMarkers = useCallback(
    (map: AMap.Map, pois: POIResult[]) => {
      clearMarkers();

      if (pois.length === 0) return;

      const markers: AMap.Marker[] = [];
      const allPositions: [number, number][] = [];

      pois.forEach((poi, idx) => {
        const content = document.createElement("div");
        content.innerHTML = `
          <div style="
            width: 28px; height: 28px;
            background: #ff6b35;
            border: 2px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(255,107,53,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 13px;
            font-weight: 600;
          ">${idx + 1}</div>
        `;

        const marker = new window.AMap.Marker({
          position: poi.location,
          content,
          offset: { x: -14, y: -14 },
          zIndex: 90 + idx,
        });

        // 点击显示信息窗
        marker.on("click", () => {
          if (infoWindowRef.current) {
            infoWindowRef.current.close();
          }
          const info = new window.AMap.InfoWindow({
            content: `
              <div style="padding: 6px 10px; font-size: 13px;">
                <div style="font-weight: 600; color: #1a1a1a;">${idx + 1}. ${poi.name}</div>
                <div style="color: #999; font-size: 11px; margin-top: 2px;">${poi.address}</div>
              </div>
            `,
            offset: { x: 0, y: -34 },
          });
          info.open(map, poi.location);
          infoWindowRef.current = info;
        });

        marker.setMap(map);
        markers.push(marker);
        allPositions.push(poi.location);
      });

      markersRef.current = markers;

      // 自动调整视野，让所有标记可见
      if (allPositions.length > 0) {
        // 用 Polyline 临时占位来计算 fitView
        const tempPolyline = new window.AMap.Polyline({
          path: allPositions,
          map,
          strokeOpacity: 0,
        });
        map.setFitView([tempPolyline], false, [60, 40, 60, 80]);
        tempPolyline.setMap(null);
      }
    },
    [clearMarkers]
  );

  return { showMarkers, clearMarkers };
}
