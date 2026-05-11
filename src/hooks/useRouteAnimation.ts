"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { RouteAnimator, type AnimatorState } from "@/animation/route-animator";
import type { RoutePlan } from "@/types";

export function useRouteAnimation() {
  const animatorRef = useRef<RouteAnimator | null>(null);
  const [animState, setAnimState] = useState<AnimatorState>({
    status: "idle",
    currentSegmentIndex: 0,
    progress: 0,
  });

  // 清理
  useEffect(() => {
    return () => {
      animatorRef.current?.cleanup();
    };
  }, []);

  const init = useCallback((map: AMap.Map, routePlan: RoutePlan) => {
    if (!animatorRef.current) {
      animatorRef.current = new RouteAnimator();
    }
    const paths = routePlan.segments.map((s) => s.path);
    animatorRef.current.init(map, paths, (state) => {
      setAnimState((prev) => {
        if (
          prev.status === state.status &&
          prev.currentSegmentIndex === state.currentSegmentIndex &&
          prev.progress === state.progress
        ) {
          return prev;
        }
        return state;
      });
    });
  }, []);

  const play = useCallback(() => animatorRef.current?.play(), []);
  const pause = useCallback(() => animatorRef.current?.pause(), []);
  const reset = useCallback(() => animatorRef.current?.reset(), []);
  const cleanup = useCallback(() => {
    animatorRef.current?.cleanup();
    setAnimState({ status: "idle", currentSegmentIndex: 0, progress: 0 });
  }, []);

  return { animState, init, play, pause, reset, cleanup };
}
