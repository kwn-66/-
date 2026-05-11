"use client";

import { useRef, useCallback } from "react";
import type { RoutePlan } from "@/types";

/** 不同交通方式的路线颜色 */
const MODE_COLORS: Record<string, string> = {
  driving: "#2563eb",
  bicycling: "#16a34a",
  walking: "#f97316",
};

export function useRouteLine() {
  const polylinesRef = useRef<AMap.Polyline[]>([]);

  const clearLines = useCallback(() => {
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];
  }, []);

  const drawRoute = useCallback(
    (map: AMap.Map, routePlan: RoutePlan) => {
      clearLines();

      if (!routePlan || routePlan.segments.length === 0) return;

      routePlan.segments.forEach((seg, idx) => {
        if (seg.path.length < 2) return;

        const color = MODE_COLORS[seg.mode] || "#2563eb";
        const baseZIndex = 60 + idx;

        // 底层宽线（白色描边效果）
        const outline = new window.AMap.Polyline({
          path: seg.path,
          map,
          strokeColor: "#ffffff",
          strokeWeight: 7,
          strokeOpacity: 0.9,
          lineJoin: "round",
          lineCap: "round",
          zIndex: baseZIndex,
        });
        polylinesRef.current.push(outline);

        // 上层彩色路线
        const line = new window.AMap.Polyline({
          path: seg.path,
          map,
          strokeColor: color,
          strokeWeight: 4,
          strokeOpacity: 0.85,
          lineJoin: "round",
          lineCap: "round",
          zIndex: baseZIndex + 1,
        });
        polylinesRef.current.push(line);

        // 起点标记
        if (idx === 0) {
          const startMarker = new window.AMap.Marker({
            position: seg.from.location,
            content: `<div style="
              width: 12px; height: 12px;
              background: ${color};
              border: 2px solid #fff;
              border-radius: 50%;
              box-shadow: 0 1px 4px rgba(0,0,0,0.2);
            "></div>`,
            offset: { x: -6, y: -6 },
            zIndex: 50,
          });
          startMarker.setMap(map);
          polylinesRef.current.push(startMarker as unknown as AMap.Polyline);
        }
      });
    },
    [clearLines]
  );

  return { drawRoute, clearLines };
}
