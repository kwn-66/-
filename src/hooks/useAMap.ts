"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { loadAMapSDK, isAMapReady } from "@/lib/amap";

export function useAMap() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current || isAMapReady()) {
      setLoaded(true);
      setLoading(false);
      loadedRef.current = true;
      return;
    }

    loadAMapSDK()
      .then(() => {
        loadedRef.current = true;
        setLoaded(true);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const createMap = useCallback(
    (
      container: string | HTMLElement,
      options: AMap.MapOptions
    ): AMap.Map | null => {
      if (!loaded || !window.AMap) return null;
      return new window.AMap.Map(container, options);
    },
    [loaded]
  );

  const createMarker = useCallback(
    (options: AMap.MarkerOptions): AMap.Marker | null => {
      if (!loaded || !window.AMap) return null;
      return new window.AMap.Marker(options);
    },
    [loaded]
  );

  const createPolyline = useCallback(
    (options: AMap.PolylineOptions): AMap.Polyline | null => {
      if (!loaded || !window.AMap) return null;
      return new window.AMap.Polyline(options);
    },
    [loaded]
  );

  const createInfoWindow = useCallback(
    (options?: AMap.InfoWindowOptions): AMap.InfoWindow | null => {
      if (!loaded || !window.AMap) return null;
      return new window.AMap.InfoWindow(options);
    },
    [loaded]
  );

  return {
    loaded,
    loading,
    error,
    createMap,
    createMarker,
    createPolyline,
    createInfoWindow,
  };
}
