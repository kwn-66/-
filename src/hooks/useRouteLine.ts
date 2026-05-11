"use client";

import { useRef, useCallback, useMemo } from "react";
import type { RoutePlan } from "@/types";
import {
  createInteractiveRoute,
  clearInteractiveRoutes,
  type HoverablePolyline,
} from "@/map/route-interaction";

export function useRouteLine() {
  const routesRef = useRef<HoverablePolyline[]>([]);
  const hoveredIdxRef = useRef<number | null>(null);
  const onHoverRef = useRef<((idx: number | null) => void) | null>(null);

  const setOnHover = useCallback((fn: (idx: number | null) => void) => {
    onHoverRef.current = fn;
  }, []);

  const clearLines = useCallback(() => {
    clearInteractiveRoutes(routesRef.current);
    routesRef.current = [];
    hoveredIdxRef.current = null;
  }, []);

  const drawRoute = useCallback(
    (map: AMap.Map, routePlan: RoutePlan) => {
      clearLines();

      if (!routePlan || routePlan.segments.length === 0) return;

      const routes = routePlan.segments
        .map((seg, idx) => {
          if (seg.path.length < 2) return null;
          return createInteractiveRoute(
            map,
            seg,
            idx,
            () => {
              hoveredIdxRef.current = idx;
              onHoverRef.current?.(idx);
            },
            () => {
              hoveredIdxRef.current = null;
              onHoverRef.current?.(null);
            }
          );
        })
        .filter((r): r is HoverablePolyline => r !== null);

      routesRef.current = routes;
    },
    [clearLines]
  );

  const hoveredIndex = hoveredIdxRef;

  return useMemo(
    () => ({
      drawRoute,
      clearLines,
      setOnHover,
      hoveredIndex,
    }),
    [drawRoute, clearLines, setOnHover]
  );
}
